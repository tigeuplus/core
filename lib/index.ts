import { anyToTransaction, isTransactionValid, Cobweb, Transaction, Spider, anyToSpiders, Transfer, anyToCommand, Command } from '@tigeuplus/class'
import { WebSocketServer, WebSocket, Server, RawData } from 'ws'
import * as path from 'path'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { ec } from 'elliptic'
import { IncomingMessage } from 'http'
import { scheduleJob } from 'node-schedule'
import { Json } from '@tigeuplus/utility'
import { getBalance, getNodes, getSpiders, getOmegas, getDeleted, getBalances } from './Get'
import { saveBalance } from './Save'
import { deleteBalance } from './Delete'

/**
 * 노드
 * 
 * @since v1.0.0
 * @param storage 저장 경로
 * @param timeout 타임아웃
 * @param port 포트
 * @param url 기존 피어 주소
 */
export class Node
{
    /**
     * 주소
     */
    public address: string
    /**
     * 개인키
     */
    public privatekey: string
    /**
     * 잔액
     */
    public balance: bigint
    /**
     * 코브웹
     */
    public cobweb: Cobweb
    /**
     * 웹소켓 서버
     */
    public server: WebSocketServer
    /**
     * 피어
     */
    public peers: { [ index: string ]: { websocket: WebSocket, address: string } }
    /**
     * 마지막으로 검증된 거래
     */
    public omegas: string[]
    /**
     * 저장 경로
     */
    public storage: string
    /**
     * 타임아웃
     */
    public timeout: number
    /**
     * 삭제된 거래
     */
    public deleted: string[]

    constructor(
        /**
         * 저장 경로
         */
        storage: string, 
        /**
         * 타임아웃
         */
        timeout: number = 1000, 
        /**
         * 포트
         */
        port: number = 6000, 
        /**
         * 주소
         */
        url?: string)
    {
        this.storage = storage
        this.timeout = timeout
        this.server = new Server({ port: port })
        this.peers = {}
        this.balance = 0n
        this.cobweb = new Cobweb()
        this.omegas = []
        this.deleted = []

        if (!existsSync(path.join(this.storage, 'wallet')))
            mkdirSync(path.join(this.storage, 'wallet'))
        
        if (!existsSync(path.join(this.storage, 'transactions')))
            mkdirSync(path.join(this.storage, 'transactions'))
            
        if (!existsSync(path.join(this.storage, 'balances')))
            mkdirSync(path.join(this.storage, 'balances'))
        
        if (existsSync(path.join(this.storage, 'wallet', '.key')))
        {
            this.privatekey = readFileSync(path.join(this.storage, 'wallet', '.key'), { encoding: 'utf8' })
            this.address = new ec('secp256k1').keyFromPrivate(this.privatekey, 'hex').getPublic('hex')
        }
        else
        {
            let EC: ec.KeyPair = new ec('secp256k1').genKeyPair()
            this.privatekey = EC.getPrivate('hex')
            this.address = EC.getPublic('hex')

            writeFileSync(path.join(this.storage, 'wallet', '.key'), this.privatekey, { encoding: 'utf8' })
        }

        this.server.on('connection', async (websocket: WebSocket, request: IncomingMessage): Promise<void> => this.onConnection(websocket, request))
        if (url)
        {
            let websocket: WebSocket = new WebSocket(url)
            websocket.on('open', async (): Promise<void> => this.init(websocket, url))
        }
        else
        {
            let transfer: Transfer = new Transfer('', this.address, 1000000000000n)
            let transaction: Transaction = new Transaction('', [ transfer ], [ '', '' ])

            this.cobweb.add(transaction)
            this.omegas = [ transaction.hash, transaction.hash ]
        }

        scheduleJob('3 * * * * *', async(): Promise<void> =>
        {
            this.deleted = []
            let spiders: { [ index: string ]: Spider } = anyToSpiders(Json.parse(Json.stringify(this.cobweb.spiders)))!
            for (let i: number = 0; Object.keys(spiders).length; i ++)
                if (spiders[Object.keys(spiders)[i]].spiders.length >= 100)
                {
                    let sum: number = 0
                    for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j ++)
                        if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]])
                            sum += spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length


                    if (sum >= 200)
                    {
                        for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j ++)
                            if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]])
                                for (let k: number = 0; spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets.length; k ++)
                                    if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets[k] !== Object.keys(spiders)[j])
                                        if (!spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].transaction.targets[k]])
                                            if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length === 0)
                                            {
                                                this.deleted.push(spiders[Object.keys(spiders)[i]].spiders[j])
                                                setTimeout((): void =>
                                                {
                                                    
                                                    for (let i: number = 0; i < this.deleted.length; i ++)
                                                        if (this.deleted[i] === spiders[Object.keys(spiders)[i]].spiders[j])
                                                            delete this.deleted[i]
                                                }, 60 * 5 * 1000)

                                                delete spiders[spiders[Object.keys(spiders)[i]].spiders[j]]
                                            }
                                            else
                                                for (let l: number = 0; l < spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length; l ++)
                                                    if (spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders[l]])
                                                        if (spiders[spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders[l]].spiders.length >= spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length)
                                                        {
                                                            this.deleted.push(spiders[Object.keys(spiders)[i]].spiders[j])
                                                            setTimeout((): void =>
                                                            {
                                                                
                                                                for (let i: number = 0; i < this.deleted.length; i ++)
                                                                    if (this.deleted[i] === spiders[Object.keys(spiders)[i]].spiders[j])
                                                                        delete this.deleted[i]
                                                            }, 60 * 5 * 1000)
            
                                                            delete spiders[spiders[Object.keys(spiders)[i]].spiders[j]]
                                                            break
                                                        }

                        let save: boolean = false
                        for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].transaction.transfers.length; j ++)
                        {
                            let from: string = spiders[Object.keys(spiders)[i]].transaction.transfers[j].from
                            let to: string = spiders[Object.keys(spiders)[i]].transaction.transfers[j].to

                            let balanceOfFrom: bigint = getBalance(from, this.storage)
                            let balanceOfTo: bigint = getBalance(to, this.storage)

                            let value: bigint = spiders[Object.keys(spiders)[i]].transaction.transfers[j].value
                            if ((balanceOfFrom - value) === 0n)
                                deleteBalance(from, this.storage)
                            else
                                saveBalance(from, (balanceOfFrom - value), this.storage)

                            saveBalance(to, (balanceOfTo + value), this.storage)
                            if (from === this.address || to === this.address)
                                save = true
                        }

                        if (save)
                            writeFileSync(path.join(__dirname, 'wallet', 'transactions', `${spiders[Object.keys(spiders)[i]].transaction.hash}}.json`), Json.stringify(spiders[Object.keys(spiders)[i]].transaction), { encoding: 'utf8' } )
                    }
                    
                    this.deleted.push(Object.keys(spiders)[i])
                    setTimeout((): void =>
                    {
                        
                        for (let i: number = 0; i < this.deleted.length; i ++)
                            if (this.deleted[i] === Object.keys(spiders)[i])
                                delete this.deleted[i]
                    }, 60 * 5 * 1000)

                    delete this.cobweb.spiders[Object.keys(spiders)[i]]
                }
        })
    }

    /**
     * 전송합니다
     * 
     * @since v1.0.0
     * @param transfers 전송 데이터
     */
    public send(
        /**
         * 전송 데이터
         */
        transfers: Transfer[]): void
    {
        let transaction: Transaction = new Transaction(transfers[0].from, transfers, this.calculateTargetSpiders())
        transaction = new Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, transaction.nonce, transaction.hash)

        if (this.isTransactionValid(transaction))
        {
            this.cobweb.add(transaction)
            this.omegas = transaction.targets
            
            this.broadcast(Json.stringify(new Command('Add_Transaction', transaction)))
        }
    }

    /**
     * 모든 피어에게 데이터를 전송합니다
     * 
     * @since v1.0.0
     * @param message 데이터
     */
    public broadcast(
        /**
         * 메시지
         */
        message: string): void
    {
        for (let i: number = 0; i < Object.keys(this.peers).length; i ++)
            this.peers[Object.keys(this.peers)[i]].websocket.send(message)
    }

    /**
     * 대상 스파이더를 계산합니댜
     * 
     * @since v1.0.0
     * @returns string[]
     */
    public calculateTargetSpiders(): string[]
    {
        let hash: string = this.omegas[Math.floor(Math.random() * this.omegas.length)]
        if (!this.cobweb.spiders[hash])
            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)]
            
        let spider: Spider = this.cobweb.spiders[hash]
        let targets: [ { [ index: string ]: number }, { [ index: string ]: number } ] = [ {}, {} ]
        for (;;)
        {
            if (this.isSpiderValid(spider))
            {
                let valid: boolean = false
                for (let i: number = 0; i < spider.transaction.targets.length; i ++)
                    if (this.cobweb.spiders[spider.transaction.targets[i]])
                        if (this.isSpiderValid(this.cobweb.spiders[spider.transaction.targets[i]]))
                        {
                            valid = true
                            break
                        }
    
                if (valid)
                {
                    valid = false
                    for (let i: number = 0; i < spider.spiders.length; i ++)
                        if (this.cobweb.spiders[spider.spiders[i]])
                            if (this.isSpiderValid(this.cobweb.spiders[spider.spiders[i]]))
                            {
                                valid = true
                                break
                            }
                    
                    if (valid)
                        break
                }
            }
            
            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)]
            spider = this.cobweb.spiders[hash]
        }

        for (let i: number = 0; i < 100; i ++)
            for (let j: number = 0; j < targets.length; j ++)
                for (;;)
                {
                    let k: string | undefined = undefined
                    if ((j === 0 && spider.transaction.targets.length !== 0) || (j === 1 && spider.spiders.length === 0))
                        k = spider.transaction.targets[Math.floor(Math.random() * spider.transaction.targets.length)]
                    else
                        k = spider.spiders[Math.floor(Math.random() * spider.spiders.length)]
                    
                    if (!k)
                    {
                        targets[j][hash] = (targets[j][hash] || 0) + 1
                        break
                    }

                    if (this.cobweb.spiders[k])
                        if (this.isSpiderValid(this.cobweb.spiders[k]))
                        {
                            targets[j][k] = (targets[j][k] || 0) + 1
                            break
                        }
                }

        let results: string[] = []
        for (let i: number = 0; i < 2; i ++)
            results.push(Object.keys(targets[i]).sort((a: string, b: string) => targets[i][b] - targets[i][a])[0])

        return results
    }

    private async onConnection(websocket: WebSocket, request: IncomingMessage): Promise<void>
    {
        websocket.on('close', (): void => this.onClose(request.headers.host!))
        websocket.on('message', async (data: RawData): Promise<void> => this.onMessage(websocket, `ws://${request.headers.host!}`, Json.parse(data.toString('utf8'))))
    }

    private async onMessage(websocket: WebSocket, url: string, data: any): Promise<void>
    {
        let command: Command | undefined = anyToCommand(data)
        if (command)
            switch (command.name)
            {
                case 'Add_Peer':
                    if (typeof command.data === 'string')
                        if (!this.peers[url])
                            this.peers[url] = { websocket: websocket, address: command.data }

                    break

                case 'Get_Peers':
                    let peers: { [ index: string ]: string } = {}
                    for (let i: number = 0; i < Object.keys(this.peers).length; i ++)
                        peers[Object.keys(this.peers)[i]] = this.peers[Object.keys(this.peers)[i]].address

                    return websocket.send(Json.stringify(new Command('Get_Peers_Result', peers)))

                case 'Get_Balances':
                    let balances: { [ index: string ]: bigint } = {}
                    let files: string[] = readdirSync(path.join(this.storage, 'balances'))
                    for (let i: number = 0; i < files.length; i ++)
                        balances[files[i].split('.')[0]] = Json.parse(readFileSync(path.join(this.storage, 'balances', files[i]), { encoding: 'utf8' }))

                    return websocket.send(Json.stringify(new Command('Get_Balances_Result', balances)))

                case 'Add_Transaction':
                    let transaction: Transaction | undefined = anyToTransaction(command.data)
                    if (transaction)
                        if (this.isTransactionValid(transaction))
                        {
                            this.cobweb.add(transaction)
                            this.omegas = transaction.targets
                        }

                    break

                case 'Get_omegas':
                    return websocket.send(Json.stringify(new Command('Get_omegas_Result', this.omegas)))

                case 'Get_Deleted':
                    return websocket.send(Json.stringify(new Command('Get_Deleted_Result', this.deleted)))
            }
    }

    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     * 
     * @since v1.0.0
     * @param transaction 거래
     * @returns boolean
     */
    public isTransactionValid(
        /**
         * 거래
         */
        transaction: Transaction): boolean
    {
        let deleted: string[] = Json.parse(Json.stringify(this.deleted))
        for (let i: number = 0; i < transaction.targets.length; i ++)
            if (!this.cobweb.spiders[transaction.targets[i]])
                if (!deleted.find((s: string) => s === transaction.targets[i]))
                    return false

        let value: bigint = 0n
        for (let i: number = 0; i < transaction.transfers.length; i ++)
            value += transaction.transfers[i].value

        if (value > getBalance(transaction.author, this.storage))
            return false

        return isTransactionValid(transaction)
    }

    /**
     * 거래를 검증합니다
     * 
     * @since v1.0.0
     * @param transaction 스파이더
     * @param repeat 반복
     * @returns boolean
     */
    public isSpiderValid(
        /**
         * 스파이더
         */
        spider: Spider): boolean
    {
        for (let i: number = 0; i < spider.transaction.targets.length; i ++)
        {
            let s: Spider | undefined = this.cobweb.spiders[spider.transaction.targets[i]]
            if (s)
                if (isTransactionValid(s.transaction))
                    return false
        }
        
        let value: bigint = 0n
        for (let i: number = 0; i < spider.transaction.transfers.length; i ++)
            value += spider.transaction.transfers[i].value

        if (value > getBalance(spider.transaction.author, this.storage))
            return false

        return isTransactionValid(spider.transaction)
    }

    private onClose(url: string): void
    {
        if (this.peers[url])
            delete this.peers[url]
    }

    private async init(websocket: WebSocket, url: string): Promise<void>
    {
        let peers: { [ index: string ]: string } | undefined = await getNodes(websocket, this.timeout)
        if (peers)
            await this.addPeer(websocket, url, peers)
        else
            throw new Error()

        let spiders: { [ index: string ]: Spider } | undefined = await getSpiders(websocket, this.address, this.timeout)
        if  (spiders)
            this.cobweb = new Cobweb(spiders)
        else
            throw new Error()

        let omegas: string[] | undefined = await getOmegas(websocket, this.timeout)
        if (omegas)
            this.omegas = omegas
        else    
            throw new Error()

        let deleted: string[] | undefined = await getDeleted(websocket, this.timeout)
        if (deleted)
            this.deleted = deleted
        else
            throw new Error()

        let balances: { [ index: string ]: bigint } | undefined = await getBalances(websocket, this.timeout)
        if (balances)
            for (let i: number = 0; i < Object.keys(balances).length; i ++)
            {    
                if (Object.keys(balances)[i] === this.address)
                    this.balance = balances[Object.keys(balances)[i]]

                writeFileSync(path.join(this.storage, 'balances', `${Object.keys(balances)[i]}.json`), Json.stringify(balances[Object.keys(balances)[i]]), { encoding: 'utf8' })
            }
        else
            throw new Error()
    }

    private addPeer(websocket: WebSocket, url: string, peers: { [ index: string ]: string }): Promise<void>
    {
        return new Promise((resolve: any, reject: any): void =>
        {
            for (let i: number = 0; i < Object.keys(peers).length; i ++)
                if (Object.keys(peers)[i] === url)
                    this.peers[Object.keys(peers)[i]] = { websocket: websocket, address: peers[Object.keys(peers)[i]] }
                else
                {
                    let ws: WebSocket = new WebSocket(Object.keys(peers)[i])
                    ws.send(Json.stringify(new Command('Add_Peer')))

                    this.peers[Object.keys(peers)[i]] = { websocket: ws, address: peers[Object.keys(peers)[i]] }
                }
        })
    }
}