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
     * 저장 경로
     */
    storage: string;
    /**
     * 타임아웃
     */
    timeout: number;
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
    /**
     * 잔액을 삭제합니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     */
    deleteBalance(
    /**
     * 주소
     */
    address: string): void;
    /**
     * 잔액을 저장합니다
     *
     * @since v1.0.0-alpha
     * @param address 주소
     * @param balance 잔액
     */
    saveBalance(
    /**
     * 주소
     */
    address: string, 
    /**
     * 잔액
     */
    balance: bigint): void;
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
    isTransactionTypeValid(transaction: Transaction): boolean;
    isTransactionValid(transaction: Transaction, spider?: boolean): boolean;
    private onClose;
    private init;
    /**
     * 모든 잔액을 가져옵니다
     *
     * @since v1.0.0-alpha
     * @param websocket
     * @returns Promise<{ [ index: string ]: bigint } | undefined>
     */
    getBalances(
    /**
     * 웹소켓
     */
    websocket: WebSocket): Promise<{
        [index: string]: bigint;
    } | undefined>;
    /**
     * 모든 스파이더를 가져옵니댜
     *
     * @since v1.0.0-alpha
     * @param websocket
     * @returns Promise<{ [ index: string ]: Spider} | undefined>
     */
    getSpiders(
    /**
     * 웹소켓
     */
    websocket: WebSocket): Promise<{
        [index: string]: Spider;
    } | undefined>;
    /**
     * 피어를 추가합니다
     *
     * @since v1.0.0-alpha
     * @param websocket 웹소켓
     * @param url 주소
     * @param peers 피어 리스트
     */
    addPeer(
    /**
     * 웹소켓
     */
    websocket: WebSocket, 
    /**
     * 주소
     */
    url: string, 
    /**
     * 피어 리스트
     */
    peers: {
        [index: string]: string;
    }): Promise<void>;
    /**
     * 모든 피어를 가져갑니다
     *
     * @since v1.0.0-alpha
     * @param websocket 웹소켓
     * @returns Promise<{ [ index: string ]: string | undefined }>
     */
    getPeers(
    /**
     * 웹소켓
     */
    websocket: WebSocket): Promise<{
        [index: string]: string;
    } | undefined>;
}
