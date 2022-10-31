import * as path from 'path'
import { Json } from '@tigeuplus/utility'
import { writeFileSync } from 'fs'

/**
 * 잔액을 저장합니다
 * 
 * @since v1.0.0
 * @param address 주소
 * @param balance 잔액
 * @param storage 경로
 */
export function saveBalance(
    /**
     * 주소
     */
    address: string, 
    /**
     * 잔액
     */
    balance: bigint, 
    /**
     * 경로
     */
    storage: string): void
{
    writeFileSync(path.join(storage, 'balances', `${address}.json`), new Json().stringify(balance), { encoding: 'utf8' })
}