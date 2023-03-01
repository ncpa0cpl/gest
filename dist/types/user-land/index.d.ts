export type It = {
    name: string;
    line: number;
    column: number;
    callback: () => any;
};
export type TestHook = {
    callback: () => any;
    line: number;
    column: number;
};
export type Test = {
    name: string;
    line: number;
    column: number;
    beforeAll: Array<TestHook>;
    beforeEach: Array<TestHook>;
    afterEach: Array<TestHook>;
    afterAll: Array<TestHook>;
    subTests: Test[];
    its: Array<It>;
};
export type MatcherResult = {
    failed: false;
} | {
    failed: true;
    reason: string;
};
export type Matcher = (testedValue: any, matcherArgs: any[]) => MatcherResult | Promise<MatcherResult>;
type CalledFrom = {
    line: number;
    column: number;
};
export type MatcherResultHandlers = {
    sync: (result: MatcherResult, negate: boolean, celledFrom: CalledFrom) => void;
    async: (result: Promise<MatcherResult>, negate: boolean, celledFrom: CalledFrom) => Promise<void>;
};
export declare const describe: (name: string, fn: () => void) => Test;
export declare const it: (name: string, fn: () => any) => void;
export declare const beforeAll: (fn: () => void) => void;
export declare const afterAll: (fn: () => void) => void;
export declare const beforeEach: (fn: () => void) => void;
export declare const afterEach: (fn: () => void) => void;
export declare class ExpectError extends Error {
    private timeoutId?;
    line: number;
    column: number;
    constructor(message: string, calledFrom: CalledFrom);
    private detectUnhandled;
    handle(): void;
}
export declare const expect: (value: any) => any;
export declare const defineMatcher: (matcherName: string, matcher: Matcher) => void;
declare abstract class CustomMatch {
    static isCustomMatch(value: any): value is CustomMatch;
    abstract check(value: any): boolean;
}
export declare const match: {
    anything(): CustomMatch;
    type(expectedType: string): CustomMatch;
    instanceOf(expectedClass: any): CustomMatch;
    stringContaining(expectedString: string): CustomMatch;
    stringMatchingRegex(expectedRegex: RegExp): CustomMatch;
    exactly(expectedValue: any): CustomMatch;
    equal(expectedValue: any): CustomMatch;
};
export {};
