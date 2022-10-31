import { existsSync, unlinkSync } from 'fs'
import * as path from 'path'

/**
 * 잔액을 삭제합니다
 * 
 * @since v1.0.0
 * @param address 주소
 * @param storage 경로
 */
export function deleteBalance(
    /**
     * 주소
     */
    address: string, 
    /**
     * 경로
     */
    storage: string): void
{
    try
    {
        if (existsSync(path.join(storage, 'balances', `${address}.json`)))
            unlinkSync(path.join(storage, 'balances', `${address}.json`))
    }
    catch (error: any)
    {}
}