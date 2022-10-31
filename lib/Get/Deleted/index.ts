import { Command, anyToCommand } from '@tigeuplus/class'
import { WebSocket } from 'ws'
import { Json } from '@tigeuplus/utility'

/**
 * 삭제된 스파이더를 가져옵니다
 * 
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<string[] | undefined>
 */
export function getDeleted(
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
            let deleted: string[] | undefined
            let command: Command | undefined = anyToCommand(message)
            if (command)
                switch (command.name)
                {
                    case 'Get_omegas_Result':
                        if (command.data instanceof Array)
                        {
                            let succes: boolean = true
                            for (let i: number = 0; i < command.data.length; i ++)
                                if (typeof command.data[i] !== 'string')
                                {
                                    succes = false
                                    break
                                }

                            if (succes)
                                deleted = command.data
                        }

                        break
                }

            if (stop)
                return resolve()

            if (deleted)
                return resolve(deleted)

                node.once('message', onMessage)
        })

        node.once('message', onMessage)
        node.send(new Json().stringify(new Command('Get_Deleted')))
    })
}