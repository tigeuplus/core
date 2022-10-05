"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTransactionNonce = exports.calculateTransactionHash = exports.Transfer = exports.Transaction = exports.anyToTransfer = exports.anyToTransaction = exports.isTransferValid = exports.isTransferTypeValid = exports.isTransferSignatureValid = exports.isTransactionValid = exports.isTransactionTypeValid = exports.isTransactionTransfersValid = exports.isTransactionNonceValid = exports.isTransactionHashValid = exports.anyToSpider = exports.isSpiderTypeValid = exports.Spider = void 0;
const Transction_1 = require("./Transction");
class Spider {
    transaction;
    approvals;
    constructor(transaction, approvals) {
        this.transaction = transaction;
        this.approvals = (approvals || []);
    }
}
exports.Spider = Spider;
function isSpiderTypeValid(data) {
    if (data instanceof Object)
        if (data.approvals instanceof Array) {
            for (let i = 0; i < data.approvals.length; i++)
                if (data.approvals[i] instanceof Object)
                    if (typeof data.approvals[i].hash !== 'string' || typeof data.approvals[i].confidence !== 'number')
                        return false;
                    else
                        return false;
            return (0, Transction_1.isTransactionTypeValid)(data.transaction);
        }
    return false;
}
exports.isSpiderTypeValid = isSpiderTypeValid;
function anyToSpider(data) {
    if (isSpiderTypeValid(data))
        return new Spider((0, Transction_1.anyToTransaction)(data.transaction), data.approvals);
}
exports.anyToSpider = anyToSpider;
var Transction_2 = require("./Transction");
Object.defineProperty(exports, "isTransactionHashValid", { enumerable: true, get: function () { return Transction_2.isTransactionHashValid; } });
Object.defineProperty(exports, "isTransactionNonceValid", { enumerable: true, get: function () { return Transction_2.isTransactionNonceValid; } });
Object.defineProperty(exports, "isTransactionTransfersValid", { enumerable: true, get: function () { return Transction_2.isTransactionTransfersValid; } });
Object.defineProperty(exports, "isTransactionTypeValid", { enumerable: true, get: function () { return Transction_2.isTransactionTypeValid; } });
Object.defineProperty(exports, "isTransactionValid", { enumerable: true, get: function () { return Transction_2.isTransactionValid; } });
Object.defineProperty(exports, "isTransferSignatureValid", { enumerable: true, get: function () { return Transction_2.isTransferSignatureValid; } });
Object.defineProperty(exports, "isTransferTypeValid", { enumerable: true, get: function () { return Transction_2.isTransferTypeValid; } });
Object.defineProperty(exports, "isTransferValid", { enumerable: true, get: function () { return Transction_2.isTransferValid; } });
Object.defineProperty(exports, "anyToTransaction", { enumerable: true, get: function () { return Transction_2.anyToTransaction; } });
Object.defineProperty(exports, "anyToTransfer", { enumerable: true, get: function () { return Transction_2.anyToTransfer; } });
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return Transction_2.Transaction; } });
Object.defineProperty(exports, "Transfer", { enumerable: true, get: function () { return Transction_2.Transfer; } });
Object.defineProperty(exports, "calculateTransactionHash", { enumerable: true, get: function () { return Transction_2.calculateTransactionHash; } });
Object.defineProperty(exports, "calculateTransactionNonce", { enumerable: true, get: function () { return Transction_2.calculateTransactionNonce; } });
//# sourceMappingURL=index.js.map