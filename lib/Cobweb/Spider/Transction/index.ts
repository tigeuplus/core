import { createHash } from 'crypto'
import { anyToTransfer, isTransferTypeValid, isTransferValid, Transfer } from './Transfer'
let hexToBinary: any = require('hex-to-binary')

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

export class Transaction
{
    public hash: string
    public author: string
    public approvals: [ { hash: string, confidence: number }, { hash: string, confidence: number } ]
    public transfers: Transfer[]
    public nonce: number

    constructor(author: string, transfers: Transfer[], approvals: [ { hash: string, confidence: number }, { hash: string, confidence: number } ], nonce?: number, hash?: string)
    {
        this.author = author
        this.transfers = transfers
        this.approvals = approvals
        this.nonce = (nonce || calculateTransactionNonce(this))
        this.hash = (hash || calculateTransactionHash(this))
    }
}

function isPrime(num: number): boolean
{
    if (num === 1) 
        return false
    else if (num === 2)
        return true

    for (let i: number = 2; i <= Math.sqrt(num); i ++)
        if ((i % i) === 0)
            return false

    return true
}

export function isTransactionTypeValid(data: any): boolean
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

            if (data.transfers instanceof Array)
            {
                for (let i: number = 0; i < data.transfers.length; i ++)
                    if (!isTransferTypeValid(data.transfers[i]))
                        return false

                return typeof data.author === 'string' && data.hash === 'string' && isTransferTypeValid(data) && typeof data.nonce === 'number'
            }
        }

    return false
}

export function anyToTransaction(data: any): Transaction | undefined
{
    if (isTransactionTypeValid(data))
    {
        let transfers: Transfer[] = []
        for (let i: number = 0; i < data.transfers.length; i ++)
            transfers.push(anyToTransfer(data.transfers[i])!)
            
        return new Transaction(data.author, transfers, data.approvals, data.nonce, data.hash)
    }
}

export function calculateTransactionHash(transaction: Transaction): string
{
    transaction.hash = ''
    return createHash('sha256').update(stringify(transaction)).digest('hex')
}

export function calculateTransactionNonce(transaction: Transaction): number
{
    transaction.nonce = 2
    for (;; transaction.nonce ++)
        if (isPrime(transaction.nonce))
            if (hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20)))
                return transaction.nonce
}

export function isTransactionTransfersValid(transaction: Transaction): boolean
{
    for (let i: number = 0; i < transaction.transfers.length; i ++)
    {
        if (transaction.author !== transaction.transfers[i].from)
            return false
        
        if (!isTransferValid(transaction.transfers[i]))
            return false
    }

    return true
}

export function isTransactionHashValid(transaction: Transaction): boolean
{
    return transaction.hash === calculateTransactionHash(transaction)
}

export function isTransactionNonceValid(transaction: Transaction): boolean
{
    return transaction.nonce === calculateTransactionNonce(transaction)
}

export function isTransactionValid(transaction: Transaction): boolean
{
    return isTransactionHashValid(transaction) && isTransactionNonceValid(transaction) && isTransactionTransfersValid(transaction)
}

export { isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransfer, Transfer } from'./Transfer'