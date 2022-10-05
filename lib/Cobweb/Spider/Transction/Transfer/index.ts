import { ec } from 'elliptic'

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

export class Transfer
{
    public from: string
    public to: string
    public value: bigint
    public memo: string
    public timestamp: number
    public signature: string

    constructor(from: string, to: string, value: bigint, timestamp: number, memo: string, signature: string)
    {
        this.from = from
        this.to = to
        this.value = value
        this.memo = memo
        this.timestamp = timestamp
        this.signature = signature
    }
}

export function isTransferTypeValid(data: any): boolean
{
    if (data instanceof Object)
        return typeof data.from === 'string' && typeof data.to === 'string' && typeof data.value === 'bigint' && typeof data.memo === 'string' && typeof data.timestamp === 'number' && typeof data.signature === 'string'

    return false
}

export function anyToTransfer(data: any): Transfer | undefined
{
    if (isTransferTypeValid(data))
        return new Transfer(data.from, data.to, data.value, data.timestamp, data.memo, data.signature)
}

export function isTransferSignatureValid(transfer: Transfer): boolean
{
    let signature: string = String(transfer.signature)
    transfer.signature = ''

    return new ec('secp256k1').keyFromPublic(transfer.from, 'hex').verify(stringify(transfer), signature)
}

export function isTransferValid(transfer: Transfer): boolean
{
    if (isTransferSignatureValid(transfer))
        return true

    return false
}