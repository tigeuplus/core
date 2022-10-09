"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransferValid = exports.isTransferSignatureValid = exports.anyToTransfer = exports.isTransferTypeValid = exports.calculateTransferSignature = exports.Transfer = void 0;
const elliptic_1 = require("elliptic");
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
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
class Transfer {
    /**
     * 수신자
     */
    from;
    /**
     * 전송자
     */
    to;
    /**
     * 수량
     */
    value;
    /**
     * 메모
     */
    memo;
    /**
     * 생성된 시간
     */
    timestamp;
    /**
     * 서명
     */
    signature;
    constructor(
    /**
     * 전송자
     */
    from, 
    /**
     * 수신자
     */
    to, 
    /**
     * 수량
     */
    value, 
    /**
     * 메모
     * */
    memo = '', 
    /**
     * 생성된 시간
     */
    timestamp = new Date().getTime(), 
    /**
     * 서명
     */
    signature = '') {
        this.from = from;
        this.to = to;
        this.value = value;
        this.memo = memo;
        this.timestamp = timestamp;
        this.signature = signature;
    }
}
exports.Transfer = Transfer;
/**
 * 전송 데이터를 서명합니다
 *
 * @since v1.0.0-alpha.2
 * @param transfer 전송 데이터
 * @param privatekey 개인키
 * @return string | undefined
*/
function calculateTransferSignature(
/**
 * 전송 데이터
 */
transfer, 
/**
 * 개인키
 */
privatekey) {
    try {
        transfer.signature = '';
        return stringify(new elliptic_1.ec('secp256k1').keyFromPrivate(privatekey).sign(stringify(transfer)));
    }
    catch (error) { }
}
exports.calculateTransferSignature = calculateTransferSignature;
/**
 * 데이터가 전송 데이터인지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
function isTransferTypeValid(data) {
    if (data instanceof Object)
        return typeof data.from === 'string' && typeof data.to === 'string' && typeof data.value === 'bigint' && typeof data.memo === 'string' && typeof data.timestamp === 'number' && typeof data.signature === 'string';
    return false;
}
exports.isTransferTypeValid = isTransferTypeValid;
/**
 * 데이터를 전송 데이터로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Transfer | undefined
 */
function anyToTransfer(data) {
    if (isTransferTypeValid(data))
        return new Transfer(data.from, data.to, data.value, data.timestamp, data.memo, data.signature);
}
exports.anyToTransfer = anyToTransfer;
/**
 * 전송 데이터의 서명을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
function isTransferSignatureValid(
/**
 * 전송 데이터
 */
transfer) {
    let signature = String(transfer.signature);
    transfer.signature = '';
    return new elliptic_1.ec('secp256k1').keyFromPublic(transfer.from, 'hex').verify(stringify(transfer), signature);
}
exports.isTransferSignatureValid = isTransferSignatureValid;
/**
 * 전송 데이터가 올바른지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param transfer 전송 데이터
 * @returns boolean
 */
function isTransferValid(
/**
 * 전송 데이터
 */
transfer) {
    if (isTransferSignatureValid(transfer))
        return true;
    return false;
}
exports.isTransferValid = isTransferValid;
//# sourceMappingURL=index.js.map