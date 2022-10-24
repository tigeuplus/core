import { Transfer } from './Transfer';
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
export declare class Transaction {
    /**
     * 해시
     */
    hash: string;
    /**
     * 전송자
     */
    author: string;
    /**
     * 대상
     */
    targets: string[];
    /**
     * 전송 데이터
     */
    transfers: Transfer[];
    /**
     * 문제 답
     */
    nonce: number;
    /**
     * 생성된 시간
     */
    timestamp: number;
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
    timestamp?: number, 
    /**
     * 문제 답
     */
    nonce?: number, 
    /**
     * 해시
     */
    hash?: string);
}
/**
 * 데이터가 거래인지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export declare function isTransactionTypeValid(data: any): boolean;
/**
 * 데이터를 거래로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Transaction | undefined
 */
export declare function anyToTransaction(data: any): Transaction | undefined;
/**
 * 거래의 해시를 계산합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns string
 */
export declare function calculateTransactionHash(
/**
 * 거래
 */
transaction: Transaction): string;
/**
 * 거래 문제의 답을 계산합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns number
 */
export declare function calculateTransactionNonce(
/**
 * 거래
 */
transaction: Transaction): number;
/**
 * 거래의 전송 데이터들을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export declare function isTransactionTransfersValid(
/**
 * 거래
 */
transaction: Transaction): boolean;
/**
 * 거래의 해시를 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export declare function isTransactionHashValid(
/**
 * 거래
 */
transaction: Transaction): boolean;
/**
 * 거래 문제의 답을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export declare function isTransactionNonceValid(
/**
 * 거래
 */
transaction: Transaction): boolean;
/**
 * 거래를 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
export declare function isTransactionValid(
/**
 * 거래
 */
transaction: Transaction): boolean;
/**
 * 거래 타겟 수을 검증합니다
 *
 * @since v1.0.0-beta
 * @param transaction 거래
 * @returns boolean
 */
export declare function isTransactionTargetsValid(
/**
 * 거래
 */
transaction: Transaction): boolean;
export * from './Transfer';
