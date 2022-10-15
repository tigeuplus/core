import { Cobweb, Transaction, Spider, Transfer } from '../Cobweb';
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
    /**
     * 마지막으로 검증된 거래
     */
    omegas: string[];
    /**
     * 저장 경로
     */
    storage: string;
    /**
     * 타임아웃
     */
    timeout: number;
    /**
     * 삭제된 거래
     */
    deleted: string[];
    constructor(
    /**
     * 저장 경로
     */
    storage: string, 
    /**
     * 타임아웃
     */
    timeout?: number, 
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
    broadcast(
    /**
     * 메시지
     */
    message: string): void;
    /**
     * 대상 스파이더를 계산합니댜
     *
     * @since v1.0.0-alpha
     * @returns string[]
     */
    calculateTargetSpiders(): string[];
    private onConnection;
    private onMessage;
    /**
     * 거래의 기본 네트워크 요청 조건을 검증합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 거래
     * @returns boolean
     */
    isTransactionValid(
    /**
     * 거래
     */
    transaction: Transaction): boolean;
    /**
     * 거래를 검증합니다
     *
     * @since v1.0.0-alpha
     * @param transaction 스파이더
     * @param repeat 반복
     * @returns boolean
     */
    isSpiderValid(
    /**
     * 스파이더
     */
    spider: Spider): boolean;
    private onClose;
    private init;
    private getDeleted;
    private getOmegas;
    private getBalances;
    private getSpiders;
    private addPeer;
    private getPeers;
}
export * from './Command';
