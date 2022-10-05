import { Spider, Transaction, isSpiderTypeValid, anyToSpider } from './Spider'

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

export class Cobweb
{
    public spiders: { [ index: string ]: Spider }

    constructor(spiders?: { [ index: string ]: Spider })
    {
        this.spiders = (spiders || {})
    }

    public add(transaction: Transaction): boolean
    {
        for (let i: number = 0; i < transaction.targets.length; i ++)
            if (!this.spiders[transaction.targets[i]])
                return false

        for (let i: number = 0; i < transaction.targets.length; i ++)
            if (!(this.spiders[transaction.targets[i]].targets instanceof Array))
                return false
    
        for (let i: number = 0; i < transaction.targets.length; i ++)
            this.spiders[transaction.targets[i]].targets!.push(transaction.targets[i])

        this.spiders[transaction.hash] = new Spider(transaction)
        return true
    }
}

export function isSpidersTypeValid(data: any): boolean
{
    if (data instanceof Object)
    {
        for (let i: number = 0; i < Object.keys(data).length; i ++)
            if (!isSpiderTypeValid(data[Object.keys(data)[i]]))
                return false

        return true
    }

    return false
}

export function anyToSpiders(data: any): { [ index: string ]: Spider } | undefined
{
    if (isSpidersTypeValid(data))
    {
        let spiders: { [ index: string ]: Spider } = {}
        for (let i: number = 0; i < Object.keys(data).length; i ++)
            spiders[Object.keys(data)[i]] = anyToSpider(data[Object.keys(data)[i]])!

        return spiders
    }
}

export { isTransactionHashValid, isTransactionNonceValid, isSpiderTypeValid, isTransactionTransfersValid, isTransactionTypeValid, isTransactionValid, isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransaction, anyToSpider, anyToTransfer, Transaction, Spider, Transfer, calculateTransactionHash, calculateTransactionNonce } from './Spider'