"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransactionTargetsValid = exports.isTransactionValid = exports.isTransactionNonceValid = exports.isTransactionHashValid = exports.isTransactionTransfersValid = exports.calculateTransactionNonce = exports.calculateTransactionHash = exports.anyToTransaction = exports.isTransactionTypeValid = exports.Transaction = void 0;
const crypto_1 = require("crypto");
const Transfer_1 = require("./Transfer");
let hexToBinary = require('hex-to-binary');
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
}
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
class Transaction {
    /**
     * 해시
     */
    hash;
    /**
     * 전송자
     */
    author;
    /**
     * 대상
     */
    targets;
    /**
     * 전송 데이터
     */
    transfers;
    /**
     * 문제 답
     */
    nonce;
    /**
     * 생성된 시간
     */
    timestamp;
    constructor(
    /**
     * 전송자
     */
    author, 
    /**
     * 거래 데이터
     */
    transfers, 
    /**
     * 대상
     */
    targets, 
    /**
     * 생성된 시간
     */
    timestamp = new Date().getTime(), 
    /**
     * 문제 답
     */
    nonce = 0, 
    /**
     * 해시
     */
    hash = '') {
        this.author = author;
        this.transfers = transfers;
        this.timestamp = timestamp;
        this.targets = targets;
        this.nonce = nonce;
        this.hash = hash;
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
/**
 * 데이터가 거래인지 확인합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
function isTransactionTypeValid(data) {
    if (data instanceof Object)
        if (data.targets instanceof Array) {
            for (let i = 0; i < data.targets.length; i++)
                if (typeof data.targets[i] !== 'string')
                    return false;
            if (data.transfers instanceof Array) {
                for (let i = 0; i < data.transfers.length; i++)
                    if (!(0, Transfer_1.isTransferTypeValid)(data.transfers[i]))
                        return false;
                return typeof data.author === 'string' && data.hash === 'string' && data.timestamp === 'number' && (0, Transfer_1.isTransferTypeValid)(data) && typeof data.nonce === 'number';
            }
        }
    return false;
}
exports.isTransactionTypeValid = isTransactionTypeValid;
/**
 * 데이터를 거래로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Transaction | undefined
 */
function anyToTransaction(data) {
    if (isTransactionTypeValid(data)) {
        let transfers = [];
        for (let i = 0; i < data.transfers.length; i++)
            transfers.push((0, Transfer_1.anyToTransfer)(data.transfers[i]));
        return new Transaction(data.author, transfers, data.targets, data.timestamp, data.nonce, data.hash);
    }
}
exports.anyToTransaction = anyToTransaction;
/**
 * 거래의 해시를 계산합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns string
 */
function calculateTransactionHash(
/**
 * 거래
 */
transaction) {
    transaction.hash = '';
    return (0, crypto_1.createHash)('sha256').update(stringify(transaction)).digest('hex');
}
exports.calculateTransactionHash = calculateTransactionHash;
/**
 * 거래 문제의 답을 계산합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns number
 */
function calculateTransactionNonce(
/**
 * 거래
 */
transaction) {
    transaction.nonce = 2;
    for (;; transaction.nonce++)
        if (isPrime(transaction.nonce))
            if (hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20)))
                return transaction.nonce;
}
exports.calculateTransactionNonce = calculateTransactionNonce;
/**
 * 거래의 전송 데이터들을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
function isTransactionTransfersValid(
/**
 * 거래
 */
transaction) {
    for (let i = 0; i < transaction.transfers.length; i++) {
        if (transaction.author !== transaction.transfers[i].from)
            return false;
        if (!(0, Transfer_1.isTransferValid)(transaction.transfers[i]))
            return false;
    }
    return true;
}
exports.isTransactionTransfersValid = isTransactionTransfersValid;
/**
 * 거래의 해시를 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
function isTransactionHashValid(
/**
 * 거래
 */
transaction) {
    return transaction.hash === calculateTransactionHash(transaction);
}
exports.isTransactionHashValid = isTransactionHashValid;
/**
 * 거래 문제의 답을 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
function isTransactionNonceValid(
/**
 * 거래
 */
transaction) {
    return hexToBinary(calculateTransactionHash(transaction)).startsWith('0'.repeat(20));
}
exports.isTransactionNonceValid = isTransactionNonceValid;
/**
 * 거래를 검증합니다
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @returns boolean
 */
function isTransactionValid(
/**
 * 거래
 */
transaction) {
    return isTransactionHashValid(transaction) && isTransactionNonceValid(transaction) && isTransactionTransfersValid(transaction) && isTransactionTargetsValid(transaction);
}
exports.isTransactionValid = isTransactionValid;
/**
 * 거래 타겟 수을 검증합니다
 *
 * @since v1.0.0-beta
 * @param transaction 거래
 * @returns boolean
 */
function isTransactionTargetsValid(
/**
 * 거래
 */
transaction) {
    return transaction.targets.length === 2;
}
exports.isTransactionTargetsValid = isTransactionTargetsValid;
__exportStar(require("./Transfer"), exports);
//# sourceMappingURL=index.js.map