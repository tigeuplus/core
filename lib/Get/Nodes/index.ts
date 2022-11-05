import { Command, anyToCommand } from '@tigeuplus/class'
import { WebSocket } from 'ws'
import { Json } from '@tigeuplus/utility'

/**
 * 모든 노드 주소를 조회합니다
 * 
 * @since v1.0.0
 * @param node 노드
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: string } | undefined>
 */
export function getNodes(
    /**
     * 노드
     */
    node: WebSocket, 
    /**
     * 타임아웃
     */
    time: number): Promise<{ [ index: string ]: string } | undefined>
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
            let nodes: { [ index: string ]: string } | undefined
            let command: Command | undefined = anyToCommand(message)
            if (command)
                switch (command.name)
                {
                    case 'Get_nodes_Result':
                        if (command.data instanceof Object)
                        {
                            let success: boolean = true
                            for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                if (typeof command.data[Object.keys(command.data)[i]] !== 'string')
                                {
                                    success = false
                                    break
                                }

                            if (success)
                                nodes = command.data
                        }

                        break
                }

            if (nodes)
                return resolve(nodes)

            
            if (stop)
                return resolve()

                node.once('message', onMessage)
        })

        node.once('message', onMessage)
        node.send(Json.stringify(new Command('Get_nodes')))
    })
}