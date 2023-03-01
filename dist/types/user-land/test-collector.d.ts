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
export declare class TestCollector {
    private static current;
    static addBeforeAll(hook: TestHook): void;
    static addBeforeEach(hook: TestHook): void;
    static addAfterEach(hook: TestHook): void;
    static addAfterAll(hook: TestHook): void;
    static addIt(it: It): void;
    static collectSubTest(name: string, line: number, column: number, fn: () => void): {
        name: string;
        line: number;
        column: number;
        afterAll: never[];
        afterEach: never[];
        beforeAll: never[];
        beforeEach: never[];
        its: never[];
        subTests: never[];
    };
}
