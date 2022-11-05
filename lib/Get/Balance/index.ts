import { existsSync, readFileSync } from 'fs'
import * as path from 'path'
import { Json } from '@tigeuplus/utility'

/**
 * 잔액을 가져옵니다
 * 
 * @since v1.0.0
 * @param address 주소
 * @param storage 경로
 * @returns bigint    
 */
export function getBalance(
    /**
     * 주소
     */
    address: string,
    /**
     * 경로
     */
    storage: string): bigint
{
    try
    {
        if (existsSync(path.join(storage, 'balances', `${address}.json`)))
            return Json.parse(Json.stringify(readFileSync(path.join(storage, 'balances', `${address}.json`), { encoding: 'utf8' })))
    }
    catch (erro: any)
    {}

    return 0n
}