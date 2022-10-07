export class Command
{
    public name: string
    public data: any
    
    constructor(name: string, data?: any)
    {
        this.name = name
        this.data = data
    }
}

export function isCommandTypeValid(data: any): boolean
{
    if (data instanceof Object)
        return typeof data.name === 'string'

    return false
}

export function anyToCommand(data: any): Command | undefined
{
    if (isCommandTypeValid(data))
        return new Command(data.name, data.data)
}