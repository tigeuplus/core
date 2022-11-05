import { Command, anyToCommand } from '@tigeuplus/class'
import { WebSocket } from 'ws'
import { Json } from '@tigeuplus/utility'

/**
 * 모든 밸런스를 조회합니다
 * 
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: bigint } | undefined>
 */
export function getBalances(
    /**
     * 노드
     */
    node: WebSocket,
    /**
     * 타임아웃
     */
    time: number): Promise<{ [ index: string ]: bigint } | undefined>
{
    return new Promise((resolve: any, reject: any): void =>
    {
        let stop: boolean = false
        let timeout: NodeJS.Timeout = setTimeout((): void =>
        {
            stop = true
        }, time)

        let onMessage: ((message: any) => void) = ((message: any): void =>
        {
            let balances: { [ index: string ]: bigint } | undefined
            let command: Command | undefined = anyToCommand(message)
            if (command)
                switch (command.name)
                {
                    case 'Get_Balances_Result':
                        if (command.data instanceof Object)
                        {
                            let success: boolean = true
                            for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                if (typeof command.data[Object.keys(command.data)[i]] !== 'bigint')
                                {
                                    success = false
                                    break
                                }

                            if (success)
                                balances = command.data
                        }


                        break
                }

            if (balances)
                return resolve(balances)

            
            if (stop)
                return resolve()

                node.once('message', onMessage)
        })

        node.once('message', onMessage)
        node.send(Json.stringify(new Command('Get_Balances')))
    })
}