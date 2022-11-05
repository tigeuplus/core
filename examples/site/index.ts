import * as express from 'express'
import { Node } from '@tigeuplus/core'
import { calculateTransferSignature, Transfer, Transaction, calculateTransactionNonce, calculateTransactionHash } from '@tigeuplus/class'
import { existsSync, readFileSync } from 'fs'
import * as path from 'path'

let node: Node = new Node(__dirname)
let app: express.Express = express.default()
app.use(express.json())

app.get('/address', (req: express.Request, res: express.Response) =>
{
    return res.status(200).send({ result: 'success', message: node.address })
})

app.post('/send', (req: express.Request, res: express.Response) =>
{
    let address: any = req.body.address
    let value: any = req.body.value
    let memo: any = req.body.memo

    if (address && value)
    {
        try
        {
            let transfer: Transfer = new Transfer(node.address, address, BigInt(value), (memo || ''))
            transfer = new Transfer(transfer.from, address, BigInt(value), transfer.memo, transfer.timestamp, calculateTransferSignature(transfer, node.privatekey))

            let transaction: Transaction = new Transaction(transfer.from, [ transfer ], node.calculateTargetSpiders())
            transaction = new Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, calculateTransactionNonce(transaction), calculateTransactionHash(transaction))

            wallet.send([ transfer ])
            return res.status(200).send({ status: 'success' })
        }
        catch (error: any) {}
    }
    
    return res.status(200).send({ status: 'fail' })
})

app.get('/balance', (req: express.Request, res: express.Response) =>
{
    return res.status(200).json({ status: 'success', message: `${String(node.balance)}` })
})

app.post('/balance', (req: express.Request, res: express.Response) =>
{
    let address: any = req.body.address
    if (address)
        return res.status(200).send({ status: 'success', message: `${String(getBalance(String(address)))}` })
    
    return res.status(200).send({ status: 'fail' })
})

function getBalance(address: string): bigint
{
    try
    {
        if (existsSync(path.join(node.storage, 'balances', `${address}.json`)))
            return BigInt(readFileSync(path.join(node.storage, 'balances', `${address}.json`), { encoding: 'utf8' }))
    }
    catch (error: any) {}

    return 0n
}

app.listen(3002, () => console.log('3000'))