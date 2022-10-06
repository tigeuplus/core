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
exports.anyToSpider = exports.isSpiderTypeValid = exports.Spider = void 0;
const Transction_1 = require("./Transction");
/**
 * 스파이더
 *
 * @since v1.0.0-alpha
 * @param transaction 거래
 * @param targets 대상
 */
class Spider {
    /**
     * 거래
     */
    transaction;
    /**
     * 대상
     */
    targets;
    constructor(
    /**
     * 거래
     */
    transaction, 
    /**
     * 대상
     */
    targets = []) {
        this.transaction = transaction;
        this.targets = targets;
    }
}
exports.Spider = Spider;
/**
 * 데이터가 스파이더인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
function isSpiderTypeValid(data) {
    if (data instanceof Object)
        if (data.targets instanceof Array) {
            for (let i = 0; i < data.targets.length; i++)
                if (typeof data.targets[i] !== 'string')
                    return false;
            return (0, Transction_1.isTransactionTypeValid)(data.transaction);
        }
    return false;
}
exports.isSpiderTypeValid = isSpiderTypeValid;
/**
 * 데이터를 스파이더로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Spider | undefined
 */
function anyToSpider(data) {
    if (isSpiderTypeValid(data))
        return new Spider((0, Transction_1.anyToTransaction)(data.transaction), data.targets);
}
exports.anyToSpider = anyToSpider;
__exportStar(require("./Transction"), exports);
//# sourceMappingURL=index.js.map