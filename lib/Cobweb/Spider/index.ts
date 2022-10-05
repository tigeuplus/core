import { anyToTransaction, isTransactionTypeValid, Transaction } from './Transction'

export class Spider
{
    public transaction: Transaction
    public targets: string[]

    constructor(transaction: Transaction, targets?: string[])
    {
        this.transaction = transaction
        this.targets = (targets || [])
    }
}

export function isSpiderTypeValid(data: any): boolean
{
    if (data instanceof Object)
        if (data.targets instanceof Array)
        {
            for (let i: number = 0; i < data.targets.length; i ++)
                if (typeof data.targets[i] !== 'string')
                    return false
                

            return isTransactionTypeValid(data.transaction)
        }

    return false
}

export function anyToSpider(data: any): Spider | undefined
{
    if (isSpiderTypeValid(data))
        return new Spider(anyToTransaction(data.transaction)!, data.targets)
}

export { isTransactionHashValid, isTransactionNonceValid, isTransactionTransfersValid, isTransactionTypeValid, isTransactionValid, isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransaction, anyToTransfer, Transaction, Transfer, calculateTransactionHash, calculateTransactionNonce } from './Transction'