import type { CalledFrom, Matcher } from "./matchers";
import type { Test } from "./test-collector";
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
export declare const expect: (value: any) => import("./matchers").ExpectMatchers;
export declare const defineMatcher: (matcherName: string, matcher: Matcher) => void;
export { match } from "./matchers";
export type { ExpectMatchers } from "./matchers";
