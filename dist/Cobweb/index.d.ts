import { Spider, Transaction } from './Spider';
export declare class Cobweb {
    spiders: {
        [index: string]: Spider;
    };
    constructor(spiders?: {
        [index: string]: Spider;
    });
    add(transaction: Transaction): boolean;
}
export declare function isSpidersTypeValid(data: any): boolean;
export declare function anyToSpiders(data: any): {
    [index: string]: Spider;
} | undefined;
export { isTransactionHashValid, isTransactionNonceValid, isSpiderTypeValid, isTransactionTransfersValid, isTransactionTypeValid, isTransactionValid, isTransferSignatureValid, isTransferTypeValid, isTransferValid, anyToTransaction, anyToSpider, anyToTransfer, Transaction, Spider, Transfer, calculateTransactionHash, calculateTransactionNonce } from './Spider';
