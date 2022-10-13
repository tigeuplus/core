import { anyToTransaction, isSpiderTypeValid, isTransactionValid, Cobweb, Transaction, Spider, anyToSpiders, Transfer } from '../Cobweb'
import { WebSocketServer, WebSocket, Server, RawData } from 'ws'
import * as path from 'path'
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { ec } from 'elliptic'
import { anyToCommand, Command } from './Command'
import { IncomingMessage } from 'http'
import { scheduleJob } from 'node-schedule'

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

function parse(data: any): any
{
    return JSON.parse(data, (key: string, value: any) =>
    {
        if (typeof value === 'string' && /^\d+n$/.test(value)) 
            return BigInt(value.slice(0, value.length - 1))

        return value
    })
}

/**
 * 지갑
 * 
 * @since v1.0.0-alpha
 * @param storage 저장 경로
 * @param timeout 타임아웃
 * @param port 포트
 * @param url 기존 피어 주소
 */
export class Wallet
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
    public omegas: [ string, string ]
    /**
     * 저장 경로
     */
    public storage: string
    /**
     * 타임아웃
     */
    public timeout: number

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
        this.omegas = [ '', '' ]

        mkdirSync(path.join(this.storage, 'wallet'))
        mkdirSync(path.join(this.storage, 'transactions'))
        mkdirSync(path.join(this.storage, 'snapshots'))
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
            let spiders: { [ index: string ]: Spider } = anyToSpiders(parse(stringify(this.cobweb.spiders)))!
            for (let i: number = 0; Object.keys(spiders).length; i ++)
                if (spiders[Object.keys(spiders)[i]].spiders.length >= 100)
                {
                    for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].spiders.length; j ++)
                    {
                        delete this.cobweb.spiders[Object.keys(spiders)[i]]
                        if (spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length === 0)
                            delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].spiders[j]]
                        else
                            for (let k: number = 0; k < spiders[Object.keys(spiders)[i]].spiders.length; k ++)
                                if (spiders[Object.keys(spiders)[i]].spiders[k] !== spiders[Object.keys(spiders)[i]].spiders[j])
                                    if ((spiders[spiders[Object.keys(spiders)[i]].spiders[j]].spiders.length - spiders[spiders[Object.keys(spiders)[i]].spiders[k]].spiders.length) >= 10)
                                    {
                                        delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].spiders[j]]
                                        break
                                    }
                    }

                    let save: boolean = false
                    for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].transaction.transfers.length; j ++)
                    {
                        let from: string = spiders[Object.keys(spiders)[i]].transaction.transfers[j].from
                        let to: string = spiders[Object.keys(spiders)[i]].transaction.transfers[j].to

                        let balanceOfFrom: bigint = this.getBalance(from)
                        let balanceOfTo: bigint = this.getBalance(to)

                        let value: bigint = spiders[Object.keys(spiders)[i]].transaction.transfers[j].value
                        if ((balanceOfFrom - value) === 0n)
                            this.deleteBalance(from)
                        else
                            this.saveBalance(from, (balanceOfFrom - value))

                        this.saveBalance(to, (balanceOfTo + value))

                        if (from === this.address || to === this.address)
                            save = true
                    }

                    if (save)
                        writeFileSync(path.join(__dirname, 'wallet', 'transactions', `${spiders[Object.keys(spiders)[i]].transaction.hash}}.json`), stringify(spiders[Object.keys(spiders)[i]].transaction), { encoding: 'utf8' } )

                    
                    delete this.cobweb.spiders[Object.keys(spiders)[i]]
                }
                        
        })
    }

    private deleteBalance(address: string): void
    {
        try
        {
            unlinkSync(path.join(this.storage, 'snapshots', `${address}.json`))
        }
        catch (error: any)
        {}
    }

    private saveBalance(address: string, balance: bigint): void
    {
        writeFileSync(path.join(this.storage, 'snapshots', `${address}.json`), stringify(balance), { encoding: 'utf8' })
    }

    /**
     * 잔액을 가져옵니다
     * 
     * @since v1.0.0-alpha
     * @param address 주소
     * @returns bigint
     */
    public getBalance(
        /**
         * 주소
         */
        address: string): bigint
    {
        try
        {
            return parse(stringify(readFileSync(path.join(this.storage, 'snapshots', `${address}.json`), { encoding: 'utf8' })))
        }
        catch (erro: any)
        {}

        return 0n
    }

    /**
     * 전송합니다
     * 
     * @since v1.0.0-alpha
     * @param transfers 전송 데이터
     */
    public send(
        /**
         * 전송 데이터
         */
        transfers: Transfer[]): void
    {
        let transaction: Transaction = new Transaction(transfers[0].from, transfers, this.calculateTargetSpider())
        transaction = new Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, transaction.nonce, transaction.hash)

        this.broadcast(stringify(new Command('Add_Transaction', transaction)))
    }

    /**
     * 모든 피어에게 데이터를 전송합니다
     * 
     * @since v1.0.0-alpha
     * @param message 데이터
     */
    public broadcast(message: string): void
    {
        for (let i: number = 0; i < Object.keys(this.peers).length; i ++)
            this.peers[Object.keys(this.peers)[i]].websocket.send(message)
    }

    /**
     * 대상 스파이더를 계산합니댜
     * 
     * @since v1.0.0-alpha
     * @returns [ string, string ]
     */
    public calculateTargetSpider(): [ string, string ]
    {
        let hash: string = this.omegas[Math.floor(Math.random() * this.omegas.length)]
        if (!this.cobweb.spiders[hash])
        hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)]
            
        let spider: Spider = this.cobweb.spiders[hash]
        let targets: [ { [ index: string ]: number }, { [ index: string ]: number } ] = [ {}, {} ]
        for (;;)
        {
            let valid: boolean = false
            for (let i: number = 0; i < spider.transaction.targets.length; i ++)
                if (this.cobweb.spiders[spider.transaction.targets[i]])
                {
                    valid = true
                    break
                }

            if (valid)
            {
                valid = false
                for (let i: number = 0; i < spider.spiders.length; i ++)
                    if (this.cobweb.spiders[spider.spiders[i]])
                    {
                        valid = true
                        break
                    }
                
                if (!valid)
                    break
            }

            hash = Object.keys(this.cobweb.spiders)[Math.floor(Math.random() * Object.keys(this.cobweb.spiders).length)]
            spider = this.cobweb.spiders[hash]
        }

        for (let i: number = 0; i < 100; i ++)
            for (let j: number = 0; j < targets.length; j ++)
            {
                let k: string
                if (j === 0 || (j === 1 && spider.spiders.length === 0))
                    k = spider.transaction.targets[Math.floor(Math.random() * spider.transaction.targets.length)]
                else
                    k = spider.spiders[Math.floor(Math.random() * spider.spiders.length)]

                if (this.cobweb.spiders[k])
                    if (this.isTransactionValid(this.cobweb.spiders[k].transaction, true))
                    {
                        targets[j][k] = (targets[j][k] || 0) + 1
                        break
                    }
            }

        let results: string[] = []
        for (let i: number = 0; i < 2; i ++)
            results.push(Object.keys(targets[i]).sort((a: string, b: string) => targets[i][b] - targets[i][a])[0])

        return [ results[0], results[1] ]
    }

    // /**
    //  * 대상 거래를 계산합니다
    //  * 
    //  * @since v1.0.0-alpha
    //  * @returns [ string, string ]
    //  */
    // public calculateTargetTransaction(): [ string, string ]
    // {
    //     let spiders: [ { [ index: string ]: number }, { [ index: string ]: number } ] = [ {}, {} ]
    //     for (let i: number = 0; i < 2; i ++)
    //     {
    //         let spider: Spider | undefined = this.cobweb.spiders[this.omegas[i]]
    //         if (spider)
    //             for (let j: number = 0; j < 100; j ++)
    //             {
    //                 for (;;)
    //                 {
    //                     let k: number = Math.floor(Math.random() * spider.transaction.targets.length)
    //                     if (this.cobweb.spiders[spider.spiders[k]])
    //                         if (this.isTransactionValid(this.cobweb.spiders[spider.spiders[k]].transaction))
    //                         {
    //                             spiders[0][spider.spiders[k]] = (spiders[0][spider.spiders[k]] || 0) + 1
    //                             break
    //                         }
    //                 }

    //                 for (;;)
    //                 {
    //                     let k: number = Math.floor(Math.random() * spider.spiders.length)
    //                     if (this.cobweb.spiders[spider.spiders[k]])
    //                         if (this.isTransactionValid(this.cobweb.spiders[spider.spiders[k]].transaction))
    //                         {
    //                             spiders[1][spider.spiders[k]] = (spiders[1][spider.spiders[k]] || 0) + 1
    //                             break
    //                         }
    //                 }
    //             }
    //     }

    //     let ascending: [ string[], string[] ] = [ Object.keys(spiders[0]).sort((a: string, b: string) => spiders[0][b] - spiders[0][a]), Object.keys(spiders[1]).sort((a: string, b: string) => spiders[1][b] - spiders[1][a])]
    //     return [ ascending[0][0], ascending[1][0] ]
    // }

    private async onConnection(websocket: WebSocket, request: IncomingMessage): Promise<void>
    {
        websocket.on('close', (): void => this.onClose(request.headers.host!))
        websocket.on('message', async (data: RawData): Promise<void> => this.onMessage(websocket, `ws://${request.headers.host!}`, parse(data.toString('utf8'))))
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

                    return websocket.send(stringify(new Command('Get_Peers_Result', peers)))

                case 'Get_Balances':
                    let balances: { [ index: string ]: bigint } = {}
                    let files: string[] = readdirSync(path.join(this.storage, 'balances'))
                    for (let i: number = 0; i < files.length; i ++)
                        balances[files[i].split('.')[0]] = parse(readFileSync(path.join(this.storage, 'balances', files[i]), { encoding: 'utf8' }))

                    return websocket.send(stringify(new Command('Get_Balances_Result', balances)))

                case 'Add_Transaction':
                    let transaction: Transaction | undefined = anyToTransaction(command.data)
                    if (transaction)
                        if (this.isTransactionTypeValid(transaction))
                            this.cobweb.add(transaction)

                    break

                case 'Get_omegas':
                    return websocket.send(stringify(new Command('Get_omegas_Result', this.omegas)))
            }
    }

    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     * 
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    public isTransactionTypeValid(transaction: Transaction): boolean
    {
        for (let i: number = 0; i < transaction.targets.length; i ++)
            if (!this.cobweb.spiders[transaction.targets[i]])
                return false
    
        return isTransactionValid(transaction)
    }

    /**
     * 거래를 검증합니다
     * 
     * @since v1.0.0-alpha.2
     * @param transaction 거래
     * @param spider 기존 스파이더 여부
     * @returns boolean
     */
    public isTransactionValid(transaction: Transaction, spider: boolean = false): boolean
    {
        if (spider)
            for (let i: number = 0; i < transaction.targets.length; i ++)
            {
                let t: Transaction | undefined = this.cobweb.spiders[transaction.targets[i]]?.transaction
                if (t)
                    if (!this.isTransactionValid(t, true))
                        return false
            }
        else
            for (let i: number = 0; i < transaction.targets.length; i ++)
            {
                let t: Transaction | undefined = this.cobweb.spiders[transaction.targets[i]]?.transaction
                if (!t)
                    return false
                else
                    if (!this.isTransactionValid(t, true))
                        return false
            }  

        return isTransactionValid(transaction)
    }

    private onClose(url: string): void
    {
        if (this.peers[url])
            delete this.peers[url]
    }

    private async init(websocket: WebSocket, url: string): Promise<void>
    {
        let peers: { [ index: string ]: string } | undefined = await this.getPeers(websocket)
        if (!peers)
            throw new Error()

        await this.addPeer(websocket, url, peers)
        let spiders: { [ index: string ]: Spider } | undefined = await this.getSpiders(websocket)
        if (!spiders)
            throw new Error()

        this.cobweb = new Cobweb(spiders)
        let balances: { [ index: string ]: bigint } | undefined = await this.getBalances(websocket)
        if (!balances)
            throw new Error()

        for (let i: number = 0; i < Object.keys(balances).length; i ++)
        {    
            if (Object.keys(balances)[i] === this.address)
                this.balance = balances[Object.keys(balances)[i]]

            writeFileSync(path.join(this.storage, 'balances', `${Object.keys(balances)[i]}.json`), stringify(balances[Object.keys(balances)[i]]), { encoding: 'utf8' })
        }
    }
    
    private getomegas(websocket: WebSocket): Promise<[ string, string ] | undefined>
    {
        return new Promise((resolve: any, reject: any): void =>
        {
            let stop: boolean = false
            let timeout: NodeJS.Timeout = setTimeout((): void =>
            {
                stop = true
            }, this.timeout)

            let onMessage: ((message: any) => void) = ((message: any): void =>
            {
                let omegas: [ string, string ] | undefined
                let command: Command | undefined = anyToCommand(message)
                if (command)
                    switch (command.name)
                    {
                        case 'Get_omegas_Result':
                            if (command.data instanceof Array)
                                if (command.data.length === 2)
                                {
                                    let succes: boolean = true
                                    for (let i: number = 0; i < command.data.length; i ++)
                                        if (typeof command.data[i] !== 'string')
                                        {
                                            succes = false
                                            break
                                        }
    
                                    if (succes)
                                        omegas = [ command.data[0], command.data[1] ]
                                }
                    }

                if (stop)
                    return resolve()

                if (omegas)
                    return resolve(omegas)

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_omegas')))
        })
    }

    private getBalances(websocket: WebSocket): Promise<{ [ index: string ]: bigint } | undefined>
    {
        return new Promise((resolve: any, reject: any): void =>
        {
            let stop: boolean = false
            let timeout: NodeJS.Timeout = setTimeout((): void =>
            {
                stop = true
            }, this.timeout)

            let onMessage: ((message: any) => void) = ((message: any): void =>
            {
                let balances: { [ index: string ]: bigint } | undefined
                let command: Command | undefined = anyToCommand(message)
                if (command)
                    switch (command.name)
                    {
                        case 'Get_Balances_Result':
                            if (command.data instanceof Object)
                            {
                                let success: boolean = true
                                for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                    if (typeof command.data[Object.keys(command.data)[i]] !== 'bigint')
                                    {
                                        success = false
                                        break
                                    }

                                if (success)
                                    balances = command.data
                            }


                            break
                    }

                if (balances)
                    return resolve(balances)

                
                if (stop)
                    return resolve()

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Balances')))
        })
    }

    private getSpiders(websocket: WebSocket): Promise<{ [ index: string ]: Spider } | undefined>
    {
        return new Promise((resolve: any, reject: any): void =>
        {
            let stop: boolean = false
            let timeout: NodeJS.Timeout = setTimeout((): void =>
            {
                stop = true
            }, this.timeout)

            let onMessage: ((message: any) => void) = ((message: any): void =>
            {
                let spiders: { [ index: string ]: string } | undefined
                let command: Command | undefined = anyToCommand(message)
                if (command)
                    switch (command.name)
                    {
                        case 'Get_Spiders_Result':
                            if (command.data instanceof Object)
                            {
                                let success: boolean = true
                                for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                    if (!isSpiderTypeValid(command.data[Object.keys(command.data)[i]]))
                                    {
                                        success = false
                                        break
                                    }

                                if (success)
                                    spiders = command.data
                            }

                            break
                    }

                if (spiders)
                    return resolve(spiders)

                
                if (stop)
                    return resolve()

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Spiders', this.address)))
        })
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
                    ws.send(stringify(new Command('Add_Peer')))

                    this.peers[Object.keys(peers)[i]] = { websocket: ws, address: peers[Object.keys(peers)[i]] }
                }
        })
    }

    private getPeers(websocket: WebSocket): Promise<{ [ index: string ]: string } | undefined>
    {
        return new Promise((resolve: any, reject: any): void =>
        {
            let stop: boolean = false
            let timeout: NodeJS.Timeout = setTimeout((): void =>
            {
                stop = true
            }, this.timeout)

            let onMessage: ((message: any) => void) = ((message: any): void =>
            {
                let peers: { [ index: string ]: string } | undefined
                let command: Command | undefined = anyToCommand(message)
                if (command)
                    switch (command.name)
                    {
                        case 'Get_Peers_Result':
                            if (command.data instanceof Object)
                            {
                                let success: boolean = true
                                for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                    if (typeof command.data[Object.keys(command.data)[i]] !== 'string')
                                    {
                                        success = false
                                        break
                                    }

                                if (success)
                                    peers = command.data
                            }

                            break
                    }

                if (peers)
                    return resolve(peers)

                
                if (stop)
                    return resolve()

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Peers')))
        })
    }
}

export * from './Command'