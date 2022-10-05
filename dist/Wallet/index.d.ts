/// <reference types="node" />
import { Cobweb, Transaction, Spider, Transfer } from '../Cobweb';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
export declare class Wallet {
    address: string;
    privatekey: string;
    balance: bigint;
    cobweb: Cobweb;
    server: WebSocketServer;
    peers: {
        [index: string]: {
            websocket: WebSocket;
            address: string;
        };
    };
    storage: string;
    timeout: number;
    constructor(storage: string, timeout: number, port?: number, url?: string);
    deleteBalance(address: string): void;
    saveBalance(address: string, balance: bigint): void;
    getBalance(address: string): bigint;
    send(transfers: Transfer[]): void;
    broadcast(message: string): void;
    calculateApprovalTransaction(): [{
        hash: string;
        confidence: number;
    }, {
        hash: string;
        confidence: number;
    }];
    onConnection(websocket: WebSocket, request: IncomingMessage): Promise<void>;
    onMessage(websocket: WebSocket, url: string, data: any): Promise<void>;
    isTransactionValid(transaction: Transaction): boolean;
    onClose(url: string): void;
    init(websocket: WebSocket, url: string): Promise<void>;
    getBalances(websocket: WebSocket): Promise<{
        [index: string]: bigint;
    } | undefined>;
    getSpiders(websocket: WebSocket): Promise<{
        [index: string]: Spider;
    } | undefined>;
    addPeer(websocket: WebSocket, url: string, peers: {
        [index: string]: string;
    }): Promise<void>;
    getPeers(websocket: WebSocket): Promise<{
        [index: string]: string;
    } | undefined>;
}
