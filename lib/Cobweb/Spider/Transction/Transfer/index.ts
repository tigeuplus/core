import { ec } from 'elliptic'

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

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
export class Transfer
{
    /**
     * 수신자
     */
    public from: string
    /**
     * 전송자
     */
    public to: string
    /**
     * 수량
     */
    public value: bigint
    /**
     * 메모
     */
    public memo: string
    /**
     * 생성된 시간
     */
    public timestamp: number
    /**
     * 서명
     */
    public signature: string

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
        memo: string = '',
        /**
         * 생성된 시간
         */
        timestamp: number = new Date().getTime(),
        /**
         * 서명 
         */ 
        signature: string = '')
    {
        this.from = from
        this.to = to
        this.value = value
        this.memo = memo
        this.timestamp = timestamp
        this.signature = signature
    }
}

/**
 * 전송 데이터를 서명합니다
 * 
 * @since v1.0.0-alpha.2
 * @param transfer 전송 데이터
 * @param privatekey 개인키
 * @return string | undefined
*/
export function calculateTransferSignature(
    /**
     * 전송 데이터
     */
    transfer: Transfer, 
    /**
     * 개인키
     */
    privatekey: string): string | undefined
{
    try
    {
        transfer.signature = ''
        return stringify(new ec('secp256k1').keyFromPrivate(privatekey).sign(stringify(transfer)))
    }
    catch (error: any) {}
}

/**
 * 데이터가 전송 데이터인지 확인합니다
 * 
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export function isTransferTypeValid(data: any): boolean
{
    if (data instanceof Object)
        return typeof data.from === 'string' && typeof data.to === 'string' && typeof data.value === 'bigint' && typeof data.memo === 'string' && typeof data.timestamp === 'number' && typeof data.signature === 'string'

    return false
}

/**
 * 데이터를 전송 데이터로 변환합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns Transfer | undefined
 */
export function anyToTransfer(data: any): Transfer | undefined
{
    if (isTransferTypeValid(data))
        return new Transfer(data.from, data.to, data.value, data.timestamp, data.memo, data.signature)
}

/**
 * 전송 데이터의 서명을 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
export function isTransferSignatureValid(
    /**
     * 전송 데이터
     */
    transfer: Transfer): boolean
{
    let signature: string = String(transfer.signature)
    transfer.signature = ''

    return new ec('secp256k1').keyFromPublic(transfer.from, 'hex').verify(stringify(transfer), signature)
}

/**
 * 전송 데이터의 수량이 양수인지 확인합니다.
 * 
 * @since v1.0.0-beta
 * @param transfer 전송 데이터
 * @returns boolean
 */
export function isTransfersValueValid(
    /**
     * 전송 데이터
     */
    transfer: Transfer): boolean
{
    return transfer.value > 0n
}

/**
 * 전송 데이터가 올바른지 확인합니다
 * 
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
export function isTransferValid(
    /**
     * 전송 데이터
     */
    transfer: Transfer): boolean
{
    return isTransferTypeValid(transfer) && isTransferSignatureValid(transfer) && isTransfersValueValid(transfer)
}