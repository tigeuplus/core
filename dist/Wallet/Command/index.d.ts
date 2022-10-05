export declare class Command {
    name: string;
    data: any;
    constructor(name: string, data?: any);
}
export declare function isCommandTypeValid(data: any): boolean;
export declare function anyToCommand(data: any): Command | undefined;
