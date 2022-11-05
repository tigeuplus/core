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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const utility_1 = require("@tigeuplus/utility");
/**
 * 잔액을 가져옵니다
 *
 * @since v1.0.0
 * @param address 주소
 * @param storage 경로
 * @returns bigint
 */
function getBalance(
/**
 * 주소
 */
address, 
/**
 * 경로
 */
storage) {
    try {
        if ((0, fs_1.existsSync)(path.join(storage, 'balances', `${address}.json`)))
            return utility_1.Json.parse(utility_1.Json.stringify((0, fs_1.readFileSync)(path.join(storage, 'balances', `${address}.json`), { encoding: 'utf8' })));
    }
    catch (erro) { }
    return 0n;
}
exports.getBalance = getBalance;
//# sourceMappingURL=index.js.map