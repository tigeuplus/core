export declare class Transfer {
    from: string;
    to: string;
    value: bigint;
    memo: string;
    timestamp: number;
    signature: string;
    constructor(from: string, to: string, value: bigint, timestamp: number, memo: string, signature: string);
}
export declare function isTransferTypeValid(data: any): boolean;
export declare function anyToTransfer(data: any): Transfer | undefined;
export declare function isTransferSignatureValid(transfer: Transfer): boolean;
export declare function isTransferValid(transfer: Transfer): boolean;
