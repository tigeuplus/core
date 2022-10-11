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
exports.anyToSpiders = exports.isSpidersTypeValid = exports.Cobweb = void 0;
const Spider_1 = require("./Spider");
/**
 * 코브웹
 *
 * @since v1.0.0-alpha
 * @param spiders 스파이더
 */
class Cobweb {
    /**
     * 스파이더
     */
    spiders;
    constructor(
    /**
     * 스파이더
     */
    spiders) {
        this.spiders = (spiders || {});
    }
    /**
     * 새로운 거래를 추가합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    add(transaction) {
        for (let i = 0; i < transaction.targets.length; i++)
            if (!this.spiders[transaction.targets[i]])
                return false;
        for (let i = 0; i < transaction.targets.length; i++)
            if (!(this.spiders[transaction.targets[i]].spiders instanceof Array))
                return false;
        for (let i = 0; i < transaction.targets.length; i++)
            this.spiders[transaction.targets[i]].spiders.push(transaction.targets[i]);
        this.spiders[transaction.hash] = new Spider_1.Spider(transaction);
        return true;
    }
}
exports.Cobweb = Cobweb;
/**
 * 데이터가 스파이더인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
function isSpidersTypeValid(data) {
    if (data instanceof Object) {
        for (let i = 0; i < Object.keys(data).length; i++)
            if (!(0, Spider_1.isSpiderTypeValid)(data[Object.keys(data)[i]]))
                return false;
        return true;
    }
    return false;
}
exports.isSpidersTypeValid = isSpidersTypeValid;
/**
 * 데이터를 스파이더로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns { [ index: string ]: Spider } | undefined
 */
function anyToSpiders(data) {
    if (isSpidersTypeValid(data)) {
        let spiders = {};
        for (let i = 0; i < Object.keys(data).length; i++)
            spiders[Object.keys(data)[i]] = (0, Spider_1.anyToSpider)(data[Object.keys(data)[i]]);
        return spiders;
    }
}
exports.anyToSpiders = anyToSpiders;
__exportStar(require("./Spider"), exports);
//# sourceMappingURL=index.js.map