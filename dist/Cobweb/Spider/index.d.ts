import { Transaction } from './Transction';
/**
 * 스파이더
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @param targets 대상
 */
export declare class Spider {
    /**
     * 거래
     */
    transaction: Transaction;
    /**
     * 대상
     */
    targets: string[];
    constructor(
    /**
     * 거래
     */
    transaction: Transaction, 
    /**
     * 대상
     */
    targets?: string[]);
}
/**
 * 데이터가 스파이더인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export declare function isSpiderTypeValid(data: any): boolean;
/**
 * 데이터를 스파이더로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Spider | undefined
 */
export declare function anyToSpider(data: any): Spider | undefined;
export * from './Transction';
