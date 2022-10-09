/**
 * 전송 데이터
 *
 * @since v1.0.0-alpha
 * @param from 전송자
 * @param to 수신자
 * @param value 수량
 * @param timestamp 생성된 시간
 * @param memo 메모
 * @param signature 서명
*/
export declare class Transfer {
    /**
     * 수신자
     */
    from: string;
    /**
     * 전송자
     */
    to: string;
    /**
     * 수량
     */
    value: bigint;
    /**
     * 메모
     */
    memo: string;
    /**
     * 생성된 시간
     */
    timestamp: number;
    /**
     * 서명
     */
    signature: string;
    constructor(
    /**
     * 전송자
     */
    from: string, 
    /**
     * 수신자
     */
    to: string, 
    /**
     * 수량
     */
    value: bigint, 
    /**
     * 메모
     * */
    memo?: string, 
    /**
     * 생성된 시간
     */
    timestamp?: number, 
    /**
     * 서명
     */
    signature?: string);
}
/**
 * 전송 데이터를 서명합니다
 *
 * @since v1.0.0-alpha.2
 * @param transfer 전송 데이터
 * @param privatekey 개인키
 * @return string | undefined
*/
export declare function calculateTransferSignature(
/**
 * 전송 데이터
 */
transfer: Transfer, 
/**
 * 개인키
 */
privatekey: string): string | undefined;
/**
 * 데이터가 전송 데이터인지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export declare function isTransferTypeValid(data: any): boolean;
/**
 * 데이터를 전송 데이터로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Transfer | undefined
 */
export declare function anyToTransfer(data: any): Transfer | undefined;
/**
 * 전송 데이터의 서명을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
export declare function isTransferSignatureValid(
/**
 * 전송 데이터
 */
transfer: Transfer): boolean;
/**
 * 전송 데이터가 올바른지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
export declare function isTransferValid(
/**
 * 전송 데이터
 */
transfer: Transfer): boolean;
