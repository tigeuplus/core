import { Spider } from '@tigeuplus/class';
import { WebSocket } from 'ws';
/**
 * 모든 스파이더를 조회합니다
 *
 * @since v1.0..0
 * @param node 노드
 * @param address 주소
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: Spider } | undefined>
 */
export declare function getSpiders(
/**
 * 노드
 */
node: WebSocket, 
/**
 * 주소
 */
address: string, 
/**
 * 타임아웃
 */
time: number): Promise<{
    [index: string]: Spider;
} | undefined>;
