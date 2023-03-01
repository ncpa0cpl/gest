export type SourceMap = {
    version: number;
    sources: string[];
    sourcesContent: string[];
    mappings: string;
    names: string[];
};
export declare class SourceMapReader {
    private map;
    private converter;
    constructor(map: SourceMap);
    protected getLineN(text: string, n: number): string;
    getOriginalPosition(outLine: number, outColumn: number): {
        file: string | undefined;
        line: number;
        column: number;
    } | null;
}
