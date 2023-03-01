import { OutputBuffer } from "termx-markup";
import type { It, Test, TestHook } from "../user-land/test-collector";
export type TestUnit = {
    dirname: string;
    basename: string;
    filename: string;
    testFile: string;
    setupFile?: string;
};
export type TestUnitInfo = {
    sourceFile: string;
    bundleFile: string;
    mapFile: string;
};
export type RunnerTestOutputs = {
    err: OutputBuffer;
    info: OutputBuffer;
};
export type TestRunnerOptions = {
    verbose?: boolean;
    testNamePattern?: string;
    testFilePattern?: string;
};
export declare class TestRunner {
    private testFileQueue;
    private mainSetup?;
    private options;
    private get verbose();
    success: boolean;
    mainOutput: OutputBuffer;
    testErrorOutputs: OutputBuffer[];
    constructor(testFileQueue: TestUnit[], mainSetup?: string | undefined);
    makePath(parentList: string[]): string;
    private testNameMatches;
    private testFileMatches;
    private getSourceMapFileContent;
    getLocationFromMap(info: TestUnitInfo, line: number, column: number): Promise<{
        file: string | undefined;
        line: number;
        column: number;
    } | null>;
    runHook(hook: TestHook, info: TestUnitInfo, output: RunnerTestOutputs): Promise<void>;
    runTestCase(testCase: It, info: TestUnitInfo, parentList: string[], output: RunnerTestOutputs): Promise<boolean>;
    runTest(test: Test, info: TestUnitInfo, parentList: string[] | undefined, output: RunnerTestOutputs): Promise<boolean>;
    nextUnit(): Promise<boolean>;
    start(): Promise<void>;
    setOptions(options: TestRunnerOptions): this;
}
