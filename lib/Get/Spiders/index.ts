import { Command, anyToCommand, Spider, isSpiderTypeValid } from '@tigeuplus/class'
import { WebSocket } from 'ws'
import { Json } from '@tigeuplus/utility'

/**
 * 모든 스파이더를 조회합니다
 * 
 * @since v1.0..0
 * @param node 노드
 * @param address 주소
 * @param time 타임아웃
 * @returns Promise<{ [ index: string ]: Spider } | undefined>
 */
export function getSpiders(
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
    time: number): Promise<{ [ index: string ]: Spider } | undefined>
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
            let spiders: { [ index: string ]: string } | undefined
            let command: Command | undefined = anyToCommand(message)
            if (command)
                switch (command.name)
                {
                    case 'Get_Spiders_Result':
                        if (command.data instanceof Object)
                        {
                            let success: boolean = true
                            for (let i: number = 0; i < Object.keys(command.data).length; i ++)
                                if (!isSpiderTypeValid(command.data[Object.keys(command.data)[i]]))
                                {
                                    success = false
                                    break
                                }

                            if (success)
                                spiders = command.data
                        }

                        break
                }

            if (spiders)
                return resolve(spiders)

            
            if (stop)
                return resolve()

                node.once('message', onMessage)
        })

        node.once('message', onMessage)
        node.send(Json.stringify(new Command('Get_Spiders', address)))
    })
}