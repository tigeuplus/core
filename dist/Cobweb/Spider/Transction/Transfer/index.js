"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransferValid = exports.isTransferSignatureValid = exports.anyToTransfer = exports.isTransferTypeValid = exports.Transfer = void 0;
const elliptic_1 = require("elliptic");
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
}
class Transfer {
    from;
    to;
    value;
    memo;
    timestamp;
    signature;
    constructor(from, to, value, timestamp, memo, signature) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.memo = memo;
        this.timestamp = timestamp;
        this.signature = signature;
    }
}
exports.Transfer = Transfer;
function isTransferTypeValid(data) {
    if (data instanceof Object)
        return typeof data.from === 'string' && typeof data.to === 'string' && typeof data.value === 'bigint' && typeof data.memo === 'string' && typeof data.timestamp === 'number' && typeof data.signature === 'string';
    return false;
}
exports.isTransferTypeValid = isTransferTypeValid;
function anyToTransfer(data) {
    if (isTransferTypeValid(data))
        return new Transfer(data.from, data.to, data.value, data.timestamp, data.memo, data.signature);
}
exports.anyToTransfer = anyToTransfer;
function isTransferSignatureValid(transfer) {
    let signature = String(transfer.signature);
    transfer.signature = '';
    return new elliptic_1.ec('secp256k1').keyFromPublic(transfer.from, 'hex').verify(stringify(transfer), signature);
}
exports.isTransferSignatureValid = isTransferSignatureValid;
function isTransferValid(transfer) {
    if (isTransferSignatureValid(transfer))
        return true;
    return false;
}
exports.isTransferValid = isTransferValid;
//# sourceMappingURL=index.js.map