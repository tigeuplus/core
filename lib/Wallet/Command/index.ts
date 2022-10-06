/**
 * 명령
 * 
 * @since v1.0.0-alpha
 * @param name 이름
 * @param data 데이터
 */
export class Command
{
    public name: string
    public data: any
    
    constructor(
        /**
         * 이름
         */
        name: string, 
        /**
         * 데이터
         */
        data?: any)
    {
        this.name = name
        this.data = data
    }
}

/**
 * 데이터가 명령인지 검증합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns boolean
 */
export function isCommandTypeValid(data: any): boolean
{
    if (data instanceof Object)
        return typeof data.name === 'string'

    return false
}

/**
 * 데이터를 명령으로 변환합니다
 * 
 * @since v1.0.0-alpha
 * @param data 
 * @returns Command | undefined
 */
export function anyToCommand(data: any): Command | undefined
{
    if (isCommandTypeValid(data))
        return new Command(data.name, data.data)
}