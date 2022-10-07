import { Cobweb, Transaction, Transfer } from '../Cobweb';
import { WebSocketServer, WebSocket } from 'ws';
/**
 * 지갑
 *
 * @since v1.0.0-alpha
 * @param storage 저장 경로
 * @param timeout 타임아웃
 * @param port 포트
 * @param url 기존 피어 주소
 */
export declare class Wallet {
    /**
     * 주소
     */
    address: string;
    /**
     * 개인키
     */
    privatekey: string;
    /**
     * 잔액
     */
    balance: bigint;
    /**
     * 코브웹
     */
    cobweb: Cobweb;
    /**
     * 웹소켓 서버
     */
    server: WebSocketServer;
    /**
     * 피어
     */
    peers: {
        [index: string]: {
            websocket: WebSocket;
            address: string;
        };
    };
    private storage;
    private timeout;
    constructor(
    /**
     * 저장 경로
     */
    storage: string, 
    /**
     * 타임아웃
     */
    timeout: number, 
    /**
     * 포트
     */
    port?: number, 
    /**
     * 주소
     */
    url?: string);
    private deleteBalance;
    private saveBalance;
    /**
     * 잔액을 가져옵니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     * @returns bigint
     */
    getBalance(
    /**
     * 주소
     */
    address: string): bigint;
    /**
     * 전송합니다
     *
     * @since v1.0.0-alpha
     * @param transfers 전송 데이터
     */
    send(
    /**
     * 전송 데이터
     */
    transfers: Transfer[]): void;
    /**
     * 모든 피어에게 데이터를 전송합니다
     *
     * @since v1.0.0-alpha
     * @param message 데이터
     */
    broadcast(message: string): void;
    /**
     * 대상 거래를 계산합니다
     *
     * @since v1.0.0-alpha
     * @returns [ string, string ]
     */
    calculateTargetTransaction(): [string, string];
    private onConnection;
    private onMessage;
    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    isTransactionTypeValid(transaction: Transaction): boolean;
    /**
     * 거래를 검증합니다
     *
     * @since v1.0.0-alpha.2
     * @param transaction 거래
     * @param spider 기존 스파이더 여부
     * @returns boolean
     */
    isTransactionValid(transaction: Transaction, spider?: boolean): boolean;
    private onClose;
    private init;
    private getBalances;
    private getSpiders;
    private addPeer;
    private getPeers;
}