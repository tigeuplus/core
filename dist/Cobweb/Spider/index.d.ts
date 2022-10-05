import { Transaction } from './Transction';
export declare class Spider {
    transaction: Transaction;
    approvals: {
        hash: string;
        confidence: number;
    }[];
    constructor(transaction: Transaction, approvals?: {
        hash: string;
        confidence: number;
    }[]);
}
export declare function isSpiderTypeValid(data: any): boolean;
export declare function anyToSpider(data: any): Spider | undefined;
export { isTransactionHashValid, isTransactionNonceValid, isTransactionTransfersValid, isTransactionTypeValid, isTransactionValid, isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransaction, anyToTransfer, Transaction, Transfer, calculateTransactionHash, calculateTransactionNonce } from './Transction';
