import { WebSocket } from 'ws';
/**
 * 삭제된 스파이더를 가져옵니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
export declare function getDeleted(
/**
 * 노드
 */
node: WebSocket, 
/**
 * 타임아웃
 */
time: number): Promise<string[] | undefined>;
