import * as express from 'express'
import { Wallet, calculateTransferSignature, Transfer, Transaction, calculateTransactionNonce, calculateTransactionHash } from '@tigeuplus/core'

let wallet: Wallet = new Wallet(__dirname)
let app: express.Express = express.default()
app.use(express.json())

app.get('/address', (req: express.Request, res: express.Response) =>
{
    return res.status(200).send({ result: 'success', message: wallet.address })
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
            let transfer: Transfer = new Transfer(wallet.address, address, BigInt(value), (memo || ''))
            transfer = new Transfer(transfer.from, address, BigInt(value), transfer.memo, transfer.timestamp, calculateTransferSignature(transfer, wallet.privatekey))

            let transaction: Transaction = new Transaction(transfer.from, [ transfer ], wallet.calculateTargetSpiders())
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
    return res.status(200).json({ status: 'success', message: `${String(wallet.balance)}` })
})

app.post('/balance', (req: express.Request, res: express.Response) =>
{
    let address: any = req.body.address
    if (address)
        return res.status(200).send({ status: 'success', message: `${String(wallet.getBalance(String(address)))}` })
    
    return res.status(200).send({ status: 'fail' })
})

app.listen(3002, () => console.log('3000'))