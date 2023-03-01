export declare class NoLogError extends Error {
    static isError(err: unknown): err is Error;
    constructor(originalError: unknown, message: string);
}
