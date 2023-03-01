// src/user-land/index.ts
import { Matchers } from "./matchers.mjs";
import { TestCollector } from "./test-collector.mjs";
import { _getLineFromError } from "./utils/parse-error.mjs";
import { match } from "./matchers.mjs";
var describe = (name, fn) => {
  const [line, column] = _getLineFromError(new Error());
  return TestCollector.collectSubTest(name, line, column, fn);
};
var it = (name, fn) => {
  const [line, column] = _getLineFromError(new Error());
  TestCollector.addIt({
    name,
    line,
    column,
    callback: fn
  });
};
var beforeAll = (fn) => {
  const [line, column] = _getLineFromError(new Error());
  TestCollector.addBeforeAll({
    callback: fn,
    line,
    column
  });
};
var afterAll = (fn) => {
  const [line, column] = _getLineFromError(new Error());
  TestCollector.addAfterAll({
    callback: fn,
    line,
    column
  });
};
var beforeEach = (fn) => {
  const [line, column] = _getLineFromError(new Error());
  TestCollector.addBeforeEach({
    callback: fn,
    line,
    column
  });
};
var afterEach = (fn) => {
  const [line, column] = _getLineFromError(new Error());
  TestCollector.addAfterEach({
    callback: fn,
    line,
    column
  });
};
var ExpectError = class extends Error {
  timeoutId;
  line;
  column;
  constructor(message, calledFrom) {
    super(message);
    this.name = "ExpectError";
    this.line = calledFrom.line;
    this.column = calledFrom.column;
    this.detectUnhandled();
  }
  detectUnhandled() {
    this.timeoutId = setTimeout(() => {
      console.error(
        `An expect error was not handled. This is most likely due to an async matcher not being awaited.

Error: ${this.message}`
      );
    }, 100);
  }
  handle() {
    clearTimeout(this.timeoutId);
  }
};
var expect = (value) => {
  const handlers = {
    sync(result, negate, calledFrom) {
      if (result.failed && !negate) {
        throw new ExpectError(result.reason, calledFrom);
      } else if (!result.failed && negate) {
        throw new ExpectError(
          "Matcher was expected to fail, but it passed.",
          calledFrom
        );
      }
    },
    async async(result, negate, calledFrom) {
      const awaitedResult = await result;
      return this.sync(awaitedResult, negate, calledFrom);
    }
  };
  return Matchers.proxy(value, handlers);
};
var defineMatcher = (matcherName, matcher) => {
  Matchers.add(matcherName, matcher);
};
export {
  ExpectError,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  defineMatcher,
  describe,
  expect,
  it,
  match
};
