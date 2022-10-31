import { WebSocket } from 'ws';
/**
 * 마지막 스파이더 해시를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
export declare function getOmegas(
/**
 * 노드
 */
node: WebSocket, 
/**
 * 타임아웃
 */
time: number): Promise<string[] | undefined>;
