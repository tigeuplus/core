import { WebSocket } from 'ws';
/**
 * 모든 노드 주소를 조회합니다
 *
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: string } | undefined>
 */
export declare function getNodes(
/**
 * 노드
 */
node: WebSocket, 
/**
 * 타임아웃
 */
time: number): Promise<{
    [index: string]: string;
} | undefined>;
