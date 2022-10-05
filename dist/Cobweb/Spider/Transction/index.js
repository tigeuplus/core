"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = exports.anyToTransfer = exports.isTransferValid = exports.isTransferTypeValid = exports.isTransferSignatureValid = exports.isTransactionValid = exports.isTransactionNonceValid = exports.isTransactionHashValid = exports.isTransactionTransfersValid = exports.calculateTransactionNonce = exports.calculateTransactionHash = exports.anyToTransaction = exports.isTransactionTypeValid = exports.Transaction = void 0;
const crypto_1 = require("crypto");
const Transfer_1 = require("./Transfer");
let hexToBinary = require('hex-to-binary');
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
}
class Transaction {
    hash;
    author;
    approvals;
    transfers;
    nonce;
    constructor(author, transfers, approvals, nonce, hash) {
        this.author = author;
        this.transfers = transfers;
        this.approvals = approvals;
        this.nonce = (nonce || calculateTransactionNonce(this));
        this.hash = (hash || calculateTransactionHash(this));
    }
}
exports.Transaction = Transaction;
function isPrime(num) {
    if (num === 1)
        return false;
    else if (num === 2)
        return true;
    for (let i = 2; i <= Math.sqrt(num); i++)
        if ((i % i) === 0)
            return false;
    return true;
}
function isTransactionTypeValid(data) {
    if (data instanceof Object)
        if (data.approvals instanceof Array) {
            for (let i = 0; i < data.approvals.length; i++)
                if (data.approvals[i] instanceof Object)
                    if (typeof data.approvals[i].hash !== 'string' || typeof data.approvals[i].confidence !== 'number')
                        return false;
                    else
                        return false;
            if (data.transfers instanceof Array) {
                for (let i = 0; i < data.transfers.length; i++)
                    if (!(0, Transfer_1.isTransferTypeValid)(data.transfers[i]))
                        return false;
                return typeof data.author === 'string' && data.hash === 'string' && (0, Transfer_1.isTransferTypeValid)(data) && typeof data.nonce === 'number';
            }
        }
    return false;
}
exports.isTransactionTypeValid = isTransactionTypeValid;
function anyToTransaction(data) {
    if (isTransactionTypeValid(data)) {
        let transfers = [];
        for (let i = 0; i < data.transfers.length; i++)
            transfers.push((0, Transfer_1.anyToTransfer)(data.transfers[i]));
        return new Transaction(data.author, transfers, data.approvals, data.nonce, data.hash);
    }
}
exports.anyToTransaction = anyToTransaction;
function calculateTransactionHash(transaction) {
    transaction.hash = '';
    return (0, crypto_1.createHash)('sha256').update(stringify(transaction)).digest('hex');
}
exports.calculateTransactionHash = calculateTransactionHash;
function calculateTransactionNonce(transaction) {
    transaction.nonce = 2;
    for (;; transaction.nonce++)
        if (isPrime(transaction.nonce))
            if (hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20)))
                return transaction.nonce;
}
exports.calculateTransactionNonce = calculateTransactionNonce;
function isTransactionTransfersValid(transaction) {
    for (let i = 0; i < transaction.transfers.length; i++) {
        if (transaction.author !== transaction.transfers[i].from)
            return false;
        if (!(0, Transfer_1.isTransferValid)(transaction.transfers[i]))
            return false;
    }
    return true;
}
exports.isTransactionTransfersValid = isTransactionTransfersValid;
function isTransactionHashValid(transaction) {
    return transaction.hash === calculateTransactionHash(transaction);
}
exports.isTransactionHashValid = isTransactionHashValid;
function isTransactionNonceValid(transaction) {
    return transaction.nonce === calculateTransactionNonce(transaction);
}
exports.isTransactionNonceValid = isTransactionNonceValid;
function isTransactionValid(transaction) {
    return isTransactionHashValid(transaction) && isTransactionNonceValid(transaction) && isTransactionTransfersValid(transaction);
}
exports.isTransactionValid = isTransactionValid;
var Transfer_2 = require("./Transfer");
Object.defineProperty(exports, "isTransferSignatureValid", { enumerable: true, get: function () { return Transfer_2.isTransferSignatureValid; } });
Object.defineProperty(exports, "isTransferTypeValid", { enumerable: true, get: function () { return Transfer_2.isTransferTypeValid; } });
Object.defineProperty(exports, "isTransferValid", { enumerable: true, get: function () { return Transfer_2.isTransferValid; } });
Object.defineProperty(exports, "anyToTransfer", { enumerable: true, get: function () { return Transfer_2.anyToTransfer; } });
Object.defineProperty(exports, "Transfer", { enumerable: true, get: function () { return Transfer_2.Transfer; } });
//# sourceMappingURL=index.js.map