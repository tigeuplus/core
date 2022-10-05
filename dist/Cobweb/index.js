"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTransactionNonce = exports.calculateTransactionHash = exports.Transfer = exports.Spider = exports.Transaction = exports.anyToTransfer = exports.anyToSpider = exports.anyToTransaction = exports.isTransferValid = exports.isTransferTypeValid = exports.isTransferSignatureValid = exports.isTransactionValid = exports.isTransactionTypeValid = exports.isTransactionTransfersValid = exports.isSpiderTypeValid = exports.isTransactionNonceValid = exports.isTransactionHashValid = exports.anyToSpiders = exports.isSpidersTypeValid = exports.Cobweb = void 0;
const Spider_1 = require("./Spider");
function stringify(data) {
    return JSON.stringify(data, (key, value) => typeof value === 'bigint' ? `${value.toString()}n` : value);
}
function parse(data) {
    return JSON.parse(data, (key, value) => {
        if (typeof value === 'string' && /^\d+n$/.test(value))
            return BigInt(value.slice(0, value.length - 1));
        return value;
    });
}
class Cobweb {
    spiders;
    constructor(spiders) {
        this.spiders = (spiders || {});
    }
    add(transaction) {
        for (let i = 0; i < transaction.targets.length; i++)
            if (!this.spiders[transaction.targets[i]])
                return false;
        for (let i = 0; i < transaction.targets.length; i++)
            if (!(this.spiders[transaction.targets[i]].targets instanceof Array))
                return false;
        for (let i = 0; i < transaction.targets.length; i++)
            this.spiders[transaction.targets[i]].targets.push(transaction.targets[i]);
        this.spiders[transaction.hash] = new Spider_1.Spider(transaction);
        return true;
    }
}
exports.Cobweb = Cobweb;
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
function anyToSpiders(data) {
    if (isSpidersTypeValid(data)) {
        let spiders = {};
        for (let i = 0; i < Object.keys(data).length; i++)
            spiders[Object.keys(data)[i]] = (0, Spider_1.anyToSpider)(data[Object.keys(data)[i]]);
        return spiders;
    }
}
exports.anyToSpiders = anyToSpiders;
var Spider_2 = require("./Spider");
Object.defineProperty(exports, "isTransactionHashValid", { enumerable: true, get: function () { return Spider_2.isTransactionHashValid; } });
Object.defineProperty(exports, "isTransactionNonceValid", { enumerable: true, get: function () { return Spider_2.isTransactionNonceValid; } });
Object.defineProperty(exports, "isSpiderTypeValid", { enumerable: true, get: function () { return Spider_2.isSpiderTypeValid; } });
Object.defineProperty(exports, "isTransactionTransfersValid", { enumerable: true, get: function () { return Spider_2.isTransactionTransfersValid; } });
Object.defineProperty(exports, "isTransactionTypeValid", { enumerable: true, get: function () { return Spider_2.isTransactionTypeValid; } });
Object.defineProperty(exports, "isTransactionValid", { enumerable: true, get: function () { return Spider_2.isTransactionValid; } });
Object.defineProperty(exports, "isTransferSignatureValid", { enumerable: true, get: function () { return Spider_2.isTransferSignatureValid; } });
Object.defineProperty(exports, "isTransferTypeValid", { enumerable: true, get: function () { return Spider_2.isTransferTypeValid; } });
Object.defineProperty(exports, "isTransferValid", { enumerable: true, get: function () { return Spider_2.isTransferValid; } });
Object.defineProperty(exports, "anyToTransaction", { enumerable: true, get: function () { return Spider_2.anyToTransaction; } });
Object.defineProperty(exports, "anyToSpider", { enumerable: true, get: function () { return Spider_2.anyToSpider; } });
Object.defineProperty(exports, "anyToTransfer", { enumerable: true, get: function () { return Spider_2.anyToTransfer; } });
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return Spider_2.Transaction; } });
Object.defineProperty(exports, "Spider", { enumerable: true, get: function () { return Spider_2.Spider; } });
Object.defineProperty(exports, "Transfer", { enumerable: true, get: function () { return Spider_2.Transfer; } });
Object.defineProperty(exports, "calculateTransactionHash", { enumerable: true, get: function () { return Spider_2.calculateTransactionHash; } });
Object.defineProperty(exports, "calculateTransactionNonce", { enumerable: true, get: function () { return Spider_2.calculateTransactionNonce; } });
//# sourceMappingURL=index.js.map