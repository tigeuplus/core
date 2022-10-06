import { Spider, Transaction, isSpiderTypeValid, anyToSpider } from './Spider'

/**
 * 코브웹
 * 
 * @since v1.0.0-alpha
 * @param spiders 스파이더
 */
export class Cobweb
{
    /**
     * 스파이더
     */
    public spiders: { [ index: string ]: Spider }

    constructor(
        /**
         * 스파이더
         */
        spiders?: { [ index: string ]: Spider })
    {
        this.spiders = (spiders || {})
    }

    /**
     * 새로운 거래를 추가합니다
     * 
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
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


/**
 * 데이터가 스파이더인지 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns boolean
 */
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

/**
 * 데이터를 스파이더로 변환합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns { [ index: string ]: Spider } | undefined
 */
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

export * from './Spider'