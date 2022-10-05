import { Transfer } from './Transfer';
export declare class Transaction {
    hash: string;
    author: string;
    targets: [string, string];
    transfers: Transfer[];
    nonce: number;
    constructor(author: string, transfers: Transfer[], targets: [string, string], nonce?: number, hash?: string);
}
export declare function isTransactionTypeValid(data: any): boolean;
export declare function anyToTransaction(data: any): Transaction | undefined;
export declare function calculateTransactionHash(transaction: Transaction): string;
export declare function calculateTransactionNonce(transaction: Transaction): number;
export declare function isTransactionTransfersValid(transaction: Transaction): boolean;
export declare function isTransactionHashValid(transaction: Transaction): boolean;
export declare function isTransactionNonceValid(transaction: Transaction): boolean;
export declare function isTransactionValid(transaction: Transaction): boolean;
export { isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransfer, Transfer } from './Transfer';
