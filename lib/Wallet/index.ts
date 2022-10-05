import { anyToTransaction, isSpiderTypeValid, isTransactionValid, Cobweb, Transaction, Spider, anyToSpiders, Transfer } from '../Cobweb'
import { WebSocketServer, WebSocket, Server, RawData } from 'ws'
import * as path from 'path'
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
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

export class Wallet
{
    public address: string
    public privatekey: string
    public balance: bigint
    public cobweb: Cobweb
    public server: WebSocketServer
    public peers: { [ index: string ]: { websocket: WebSocket, address: string } }
    public storage: string
    public timeout: number

    constructor(storage: string, timeout: number, port?: number, url?: string)
    {
        this.storage = storage
        this.timeout = timeout
        this.server = new Server({ port: (port || 6001) })
        this.peers = {}
        this.balance = 0n
        this.cobweb = new Cobweb()

        try
        {
            this.privatekey = readFileSync(path.join(this.storage, 'wallet', '.key'), { encoding: 'utf8' })
            this.address = new ec('secp256k1').keyFromPrivate(this.privatekey, 'hex').getPublic('hex')
        }
        catch (error: any)
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

        scheduleJob('3 * * * * *', async(): Promise<void> =>
        {
            let spiders: { [ index: string ]: Spider } = anyToSpiders(parse(stringify(this.cobweb.spiders)))!
            for (let i: number = 0; Object.keys(spiders).length; i ++)
                if (spiders[Object.keys(spiders)[i]].approvals.length >= 100)
                {
                    for (let j: number = 0; j < spiders[Object.keys(spiders)[i]].approvals.length; j ++)
                    {
                        delete this.cobweb.spiders[Object.keys(spiders)[i]]
                        if (spiders[spiders[Object.keys(spiders)[i]].approvals[j].hash].approvals.length === 0)
                            delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].approvals[j].hash]
                        else
                            for (let k: number = 0; k < spiders[Object.keys(spiders)[i]].approvals.length; k ++)
                                if (spiders[Object.keys(spiders)[i]].approvals[k].hash !== spiders[Object.keys(spiders)[i]].approvals[j].hash)
                                    if ((spiders[spiders[Object.keys(spiders)[i]].approvals[j].hash].approvals.length - spiders[spiders[Object.keys(spiders)[i]].approvals[k].hash].approvals.length) >= 10)
                                    {
                                        delete this.cobweb.spiders[spiders[Object.keys(spiders)[i]].approvals[j].hash]
                                        break
                                    }
                    }

                    delete this.cobweb.spiders[Object.keys(spiders)[i]]
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
                    }
                }
                        
        })
    }

    public deleteBalance(address: string): void
    {
        try
        {
            unlinkSync(path.join(this.storage, 'snapshots', `${address}.json`))
        }
        catch (error: any)
        {}
    }

    public saveBalance(address: string, balance: bigint): void
    {
        writeFileSync(path.join(this.storage, 'snapshots', `${address}.json`), stringify(balance), { encoding: 'utf8' })
    }

    public getBalance(address: string): bigint
    {
        try
        {
            return parse(stringify(readFileSync(path.join(this.storage, 'snapshots', `${address}.json`), { encoding: 'utf8' })))
        }
        catch (erro: any)
        {}

        return 0n
    }

    public send(transfers: Transfer[]): void
    {
        this.broadcast(stringify(new Command('Add_Transaction', new Transaction(this.address, transfers, this.calculateApprovalTransaction()))))
    }

    public broadcast(message: string): void
    {
        for (let i: number = 0; i < Object.keys(this.peers).length; i ++)
            this.peers[Object.keys(this.peers)[i]].websocket.send(message)
    }

    public calculateApprovalTransaction(): [ { hash: string, confidence: number }, { hash: string, confidence: number } ]
    {
        let confidences: { [ index: string ]: number } = {}
        for (let i: number = 0; i < 100; i ++)
        {
            let spiders: string[] =  Object.keys(this.cobweb.spiders).sort((a: string, b: string) => this.cobweb.spiders[b].approvals.length - this.cobweb.spiders[a].approvals.length)

            let candidates: [ string[], string[] ] = [ [], [] ]
            candidates[1] = spiders
            for (let j: number = 0; j < (Math.floor(spiders.length / 9) + 1); j ++)
                candidates[0][j] = spiders[j]
    
            let transactions: string[] = []
            for (; transactions.length === 1;)
            {
                let j: number = Math.floor(Math.random() * candidates[Math.min(transactions.length, 1)].length)
                if (isTransactionValid(this.cobweb.spiders[candidates[Math.min(transactions.length, 1)][j]].transaction))
                    transactions.push(candidates[Math.min(transactions.length, 1)][i])
            }

            for (let j: number = 0; j < transactions.length; j ++)
                if (confidences[transactions[j]])
                    confidences[transactions[j]] += 1
                else
                    confidences[transactions[j]] = 1
        }

        let ascending: string[] = Object.keys(confidences).sort((a: string, b: string) => confidences[b] - confidences[a])
        return [ { hash: ascending[0], confidence: confidences[ascending[0]] }, { hash: ascending[1], confidence: confidences[ascending[1]] } ]
    }

    public async onConnection(websocket: WebSocket, request: IncomingMessage): Promise<void>
    {
        websocket.on('close', (): void => this.onClose(request.headers.host!))
        websocket.on('message', async (data: RawData): Promise<void> => this.onMessage(websocket, `ws://${request.headers.host!}`, parse(data.toString('utf8'))))
    }

    public async onMessage(websocket: WebSocket, url: string, data: any): Promise<void>
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
                        if (this.isTransactionValid(transaction))
                            this.cobweb.add(transaction)

                    break
            }
    }

    public isTransactionValid(transaction: Transaction): boolean
    {
        for (let i: number = 0; i < transaction.approvals.length; i ++)
            if (!this.cobweb.spiders[transaction.approvals[i].hash])
                return false


        return isTransactionValid(transaction)
    }

    public onClose(url: string): void
    {
        if (this.peers[url])
            delete this.peers[url]
    }

    public async init(websocket: WebSocket, url: string): Promise<void>
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

    public getBalances(websocket: WebSocket): Promise<{ [ index: string ]: bigint } | undefined>
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
                if (stop)
                    return resolve()

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

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Balances')))
        })
    }

    public getSpiders(websocket: WebSocket): Promise<{ [ index: string ]: Spider } | undefined>
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
                if (stop)
                    return resolve()

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

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Spiders', this.address)))
        })
    }

    public addPeer(websocket: WebSocket, url: string, peers: { [ index: string ]: string }): Promise<void>
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

    public getPeers(websocket: WebSocket): Promise<{ [ index: string ]: string } | undefined>
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
                if (stop)
                    return resolve()

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

                websocket.once('message', onMessage)
            })

            websocket.once('message', onMessage)
            websocket.send(stringify(new Command('Get_Peers')))
        })
    }
}