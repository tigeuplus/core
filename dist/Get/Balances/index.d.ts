import { WebSocket } from 'ws';
/**
 * 모든 밸런스를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: bigint } | undefined>
 */
export declare function getBalances(
/**
 * 노드
 */
node: WebSocket, 
/**
 * 타임아웃
 */
time: number): Promise<{
    [index: string]: bigint;
} | undefined>;
