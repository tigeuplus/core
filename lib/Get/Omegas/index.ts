import { Command, anyToCommand } from '@tigeuplus/class'
import { WebSocket } from 'ws'
import { Json } from '@tigeuplus/utility'

/**
 * 마지막 스파이더 해시를 조회합니다
 * 
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
export function getOmegas(
    /**
     * 노드
     */
    node: WebSocket, 
    /**
     * 타임아웃
     */
    time: number): Promise<string[] | undefined>
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
            let omegas: string[] | undefined
            let command: Command | undefined = anyToCommand(message)
            if (command)
                switch (command.name)
                {
                    case 'Get_omegas_Result':
                        if (command.data instanceof Array)
                            if (command.data.length === 2)
                            {
                                let succes: boolean = true
                                for (let i: number = 0; i < command.data.length; i ++)
                                    if (typeof command.data[i] !== 'string')
                                    {
                                        succes = false
                                        break
                                    }

                                if (succes)
                                    omegas = [ command.data[0], command.data[1] ]
                            }

                            break
                }

            if (stop)
                return resolve()

            if (omegas)
                return resolve(omegas)

                node.once('message', onMessage)
        })

        node.once('message', onMessage)
        node.send(Json.stringify(new Command('Get_omegas')))
    })
}