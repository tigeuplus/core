import { anyToTransaction, isTransactionTypeValid, Transaction } from './Transction'

export class Spider
{
    public transaction: Transaction
    public approvals: { hash: string, confidence: number }[]

    constructor(transaction: Transaction, approvals?: { hash: string, confidence: number }[])
    {
        this.transaction = transaction
        this.approvals = (approvals || [])
    }
}

export function isSpiderTypeValid(data: any): boolean
{
    if (data instanceof Object)
        if (data.approvals instanceof Array)
        {
            for (let i: number = 0; i < data.approvals.length; i ++)
                if (data.approvals[i] instanceof Object)
                    if (typeof data.approvals[i].hash !== 'string' || typeof data.approvals[i].confidence !== 'number')
                        return false
                else
                    return false
                

            return isTransactionTypeValid(data.transaction)
        }

    return false
}

export function anyToSpider(data: any): Spider | undefined
{
    if (isSpiderTypeValid(data))
        return new Spider(anyToTransaction(data.transaction)!, data.approvals)
}

export { isTransactionHashValid, isTransactionNonceValid, isTransactionTransfersValid, isTransactionTypeValid, isTransactionValid, isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransaction, anyToTransfer, Transaction, Transfer, calculateTransactionHash, calculateTransactionNonce } from './Transction'