import { createHash } from 'crypto'
import { anyToTransfer, isTransferTypeValid, isTransferValid, Transfer } from './Transfer'
let hexToBinary: any = require('hex-to-binary')

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

/**
 * 거래 데이터
 * 
 * @since v1.0.0-alpha
 * @param hash 해시
 * @param author 전송자
 * @param targets 대상
 * @param transfers 전송 데이터
 * @param nonce 문제 답
 * @param timestamp 생성된 시간
 */
export class Transaction
{
    /**
     * 해시
     */
    public hash: string
    /**
     * 전송자
     */
    public author: string
    /**
     * 대상
     */
    public targets: string[]
    /**
     * 전송 데이터
     */
    public transfers: Transfer[]
    /**
     * 문제 답
     */
    public nonce: number
    /**
     * 생성된 시간
     */
    public timestamp: number

    constructor(
        /**
         * 전송자
         */
        author: string, 
        /**
         * 거래 데이터
         */
        transfers: Transfer[], 
        /**
         * 대상
         */
        targets: string[], 
        /**
         * 생성된 시간
         */
        timestamp: number = new Date().getTime(), 
        /**
         * 문제 답
         */ 
        nonce: number = 0, 
        /**
         * 해시
         */
        hash: string = '')
    {
        this.author = author
        this.transfers = transfers
        this.timestamp = timestamp
        this.targets = targets
        this.nonce = nonce
        this.hash = hash
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

/**
 * 데이터가 거래인지 확인합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns boolean
 */
export function isTransactionTypeValid(data: any): boolean
{
    if (data instanceof Object)
        if (data.targets instanceof Array)
        {
            for (let i: number = 0; i < data.targets.length; i ++)
                if (typeof data.targets[i] !== 'string')
                    return false

            if (data.transfers instanceof Array)
            {
                for (let i: number = 0; i < data.transfers.length; i ++)
                    if (!isTransferTypeValid(data.transfers[i]))
                        return false

                return typeof data.author === 'string' && data.hash === 'string' && data.timestamp === 'number' && isTransferTypeValid(data) && typeof data.nonce === 'number'
            }
        }

    return false
}

/**
 * 데이터를 거래로 변환합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns Transaction | undefined
 */
export function anyToTransaction(data: any): Transaction | undefined
{
    if (isTransactionTypeValid(data))
    {
        let transfers: Transfer[] = []
        for (let i: number = 0; i < data.transfers.length; i ++)
            transfers.push(anyToTransfer(data.transfers[i])!)
            
        return new Transaction(data.author, transfers, data.targets, data.timestamp, data.nonce, data.hash)
    }
}

/**
 * 거래의 해시를 계산합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns string
 */
export function calculateTransactionHash(
    /**
     * 거래
     */
    transaction: Transaction): string
{
    transaction.hash = ''
    return createHash('sha256').update(stringify(transaction)).digest('hex')
}

/**
 * 거래 문제의 답을 계산합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns number
 */
export function calculateTransactionNonce(
    /**
     * 거래
     */
    transaction: Transaction): number
{
    transaction.nonce = 2
    for (;; transaction.nonce ++)
        if (isPrime(transaction.nonce))
            if (hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20)))
                return transaction.nonce
}

/**
 * 거래의 전송 데이터들을 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래 
 * @returns boolean
 */
export function isTransactionTransfersValid(
    /**
     * 거래
     */
    transaction: Transaction): boolean
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

/** 
 * 거래의 해시를 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export function isTransactionHashValid(
    /**
     * 거래
     */
    transaction: Transaction): boolean
{
    return transaction.hash === calculateTransactionHash(transaction)
}

/**
 * 거래 문제의 답을 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export function isTransactionNonceValid(
    /**
     * 거래
     */
    transaction: Transaction): boolean
{
    return hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20))
}

/**
 * 거래를 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export function isTransactionValid(
    /** 
     * 거래
     */
    transaction: Transaction): boolean
{
    return isTransactionHashValid(transaction) && isTransactionNonceValid(transaction) && isTransactionTransfersValid(transaction) && isTransactionTargetsValid(transaction)
}

/**
 * 거래 타겟을 검증합니다
 * 
 * @since v1.0.0-beta
 * @param transaction 거래
 * @returns boolean
 */
export function isTransactionTargetsValid(
    /**
     * 거래
     */
    transaction: Transaction
): boolean
{
    return transaction.targets.length === 2
}

export * from './Transfer'