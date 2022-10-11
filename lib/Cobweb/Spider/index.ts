import { anyToTransaction, isTransactionTypeValid, Transaction } from './Transction'

/**
 * 스파이더
 * 
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @param spiders 이 스피아더를 승인하는 스파이더
 */
export class Spider
{
    /**
     * 거래
     */
    public transaction: Transaction
    /**
     * 이 스피아더를 승인하는 스파이더
     */
    public spiders: string[]

    constructor(
        /**
         * 거래
         */
        transaction: Transaction, 
        /**
         * 이 스피아더를 승인하는 스파이더
         */
        spiders: string[] = [])
    {
        this.transaction = transaction
        this.spiders = spiders
    }
}

/**
 * 데이터가 스파이더인지 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns boolean
 */
export function isSpiderTypeValid(data: any): boolean
{
    if (data instanceof Object)
        if (data.spiders instanceof Array)
        {
            for (let i: number = 0; i < data.spiders.length; i ++)
                if (typeof data.spiders[i] !== 'string')
                    return false
                

            return isTransactionTypeValid(data.transaction)
        }

    return false
}

/**
 * 데이터를 스파이더로 변환합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns Spider | undefined
 */
export function anyToSpider(data: any): Spider | undefined
{
    if (isSpiderTypeValid(data))
        return new Spider(anyToTransaction(data.transaction)!, data.spiders)
}

export * from './Transction'