import { Spider, Transaction } from './Spider';
/**
 * 코브웹
 *
 * @since v1.0.0-alpha
 * @param spiders 스파이더
 */
export declare class Cobweb {
    /**
     * 스파이더
     */
    spiders: {
        [index: string]: Spider;
    };
    constructor(
    /**
     * 스파이더
     */
    spiders?: {
        [index: string]: Spider;
    });
    /**
     * 새로운 거래를 추가합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    add(transaction: Transaction): boolean;
}
/**
 * 데이터가 스파이더인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export declare function isSpidersTypeValid(data: any): boolean;
/**
 * 데이터를 스파이더로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns { [ index: string ]: Spider } | undefined
 */
export declare function anyToSpiders(data: any): {
    [index: string]: Spider;
} | undefined;
export * from './Spider';
