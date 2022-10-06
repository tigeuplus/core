/**
 * 명령
 *
 * @since v1.0.0-alpha
 * @param name 이름
 * @param data 데이터
 */
export declare class Command {
    name: string;
    data: any;
    constructor(
    /**
     * 이름
     */
    name: string, 
    /**
     * 데이터
     */
    data?: any);
}
/**
 * 데이터가 명령인지 검증합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns boolean
 */
export declare function isCommandTypeValid(data: any): boolean;
/**
 * 데이터를 명령으로 변환합니다
 *
 * @since v1.0.0-alpha
 * @param data
 * @returns Command | undefined
 */
export declare function anyToCommand(data: any): Command | undefined;
