export declare class Command {
    private command;
    private options;
    private rawOptions;
    constructor(command: string, ...options: string[]);
    private readOutput;
    private sanitizeOptions;
    private uint8ArrayToString;
    private getFullCommand;
    runSync(): string;
    run(): Promise<string>;
}
