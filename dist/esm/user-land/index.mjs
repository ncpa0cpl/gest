var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/user-land/index.ts
var _TestCollector = class {
  static addBeforeAll(hook) {
    _TestCollector.current.beforeAll.push(hook);
  }
  static addBeforeEach(hook) {
    _TestCollector.current.beforeEach.push(hook);
  }
  static addAfterEach(hook) {
    _TestCollector.current.afterEach.push(hook);
  }
  static addAfterAll(hook) {
    _TestCollector.current.afterAll.push(hook);
  }
  static addIt(it2) {
    _TestCollector.current.its.push(it2);
  }
  static collectSubTest(name, line, column, fn) {
    const parentTest = _TestCollector.current;
    const test = _TestCollector.current = {
      name,
      line,
      column,
      afterAll: [],
      afterEach: [],
      beforeAll: [],
      beforeEach: [],
      its: [],
      subTests: []
    };
    fn();
    if (parentTest) {
      parentTest.subTests.push(_TestCollector.current);
      _TestCollector.current = parentTest;
    }
    return test;
  }
};
var TestCollector = _TestCollector;
__publicField(TestCollector, "current");
var _toNumber = (value, def) => {
  if (value === void 0) {
    return def;
  }
  try {
    const n = Number(value);
    if (isNaN(n)) {
      return def;
    }
    return n;
  } catch (e) {
    return def;
  }
};
var _getLineFromError = (error) => {
  const stack = error.stack;
  const secondLine = stack?.split("\n")[1];
  const [line, column] = secondLine?.split(":").splice(-2) ?? [];
  return [_toNumber(line, 0), _toNumber(column, 0)];
};
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
var _Matchers = class {
  static add(name, matcher) {
    this.matchers.set(name, matcher);
  }
  static get(name) {
    const m = this.matchers.get(name);
    if (!m) {
      throw new Error(`Invalid matcher: '${name}'`);
    }
    return m;
  }
  static proxy(testedValue, handleMatcherResult, negate = false) {
    return new Proxy(
      {},
      {
        get(_, matcherName) {
          if (matcherName === "not") {
            return _Matchers.proxy(testedValue, handleMatcherResult, true);
          }
          const matcher = _Matchers.get(matcherName);
          return (...args) => {
            const [line, column] = _getLineFromError(new Error());
            const calledFrom = {
              line,
              column
            };
            const r = matcher(testedValue, args);
            if (r instanceof Promise) {
              return handleMatcherResult.async(r, negate, calledFrom);
            } else {
              return handleMatcherResult.sync(r, negate, calledFrom);
            }
          };
        },
        has(_, p) {
          return _Matchers.matchers.has(p);
        },
        ownKeys() {
          return [..._Matchers.matchers.keys()];
        }
      }
    );
  }
};
var Matchers = _Matchers;
__publicField(Matchers, "matchers", /* @__PURE__ */ new Map());
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
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (!a || !b || typeof a !== "object" && typeof b !== "object") {
    return a === b;
  }
  if (a.prototype !== b.prototype) {
    return false;
  }
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }
  return keys.every((k) => deepEqual(a[k], b[k]));
}
var CustomMatch = class {
  static isCustomMatch(value) {
    return typeof value === "object" && value !== null && value instanceof CustomMatch;
  }
};
function matchValues(a, b) {
  if (CustomMatch.isCustomMatch(b)) {
    return b.check(a);
  }
  if (a === b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (!a || !b || typeof a !== "object" && typeof b !== "object") {
    return a === b;
  }
  const keys = Object.keys(b);
  if (keys.length > Object.keys(a).length) {
    return false;
  }
  return keys.every((k) => deepEqual(a[k], b[k], matchValues));
}
defineMatcher("toBe", (testedValue, [expectedValue]) => {
  if (testedValue !== expectedValue) {
    return {
      failed: true,
      reason: `Equality test has failed.

Expected: ${testedValue}
Received: ${expectedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toEqual", (testedValue, [expectedValue]) => {
  if (!deepEqual(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: `Deep equality test has failed.

Expected: ${testedValue}
Received: ${expectedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toBeUndefined", (testedValue) => {
  if (testedValue != null) {
    return {
      failed: true,
      reason: `Expected value to be undefined, but received ${testedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toBeDefined", (testedValue) => {
  if (testedValue == null) {
    return {
      failed: true,
      reason: `Expected value to be defined, but received ${testedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toBeOfType", (testedValue, [expectedType]) => {
  if (typeof testedValue !== expectedType) {
    return {
      failed: true,
      reason: `Expected value to be of type ${expectedType}, but received ${testedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toMatchRegex", (testedValue, [regex]) => {
  if (typeof testedValue !== "string") {
    return {
      failed: true,
      reason: `Expected value to be a string, but received ${typeof testedValue}`
    };
  }
  if (!regex.test(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to match regex ${regex}, but received ${testedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toMatch", (testedValue, [expectedValue]) => {
  if (!matchValues(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: `Expected value to match object ${expectedValue}, but received ${testedValue}`
    };
  }
  return {
    failed: false
  };
});
defineMatcher("toContain", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of values) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toContainEqual", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of values) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toContainMatch", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of values) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}, but received ${testedValue}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toContainOnly", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of expectedValues) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`
      };
    }
  }
  for (const value of testedValue) {
    if (!expectedValues.some((v) => value === v)) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toContainOnlyEqual", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of expectedValues) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`
      };
    }
  }
  for (const value of testedValue) {
    if (!expectedValues.some((v) => deepEqual(value, v))) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toContainOnlyMatch", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: `Expected value to be an array, but received ${typeof testedValue}`
    };
  }
  for (const value of expectedValues) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: `Expected array to contain value ${value}`
      };
    }
  }
  for (const value of testedValue) {
    if (!expectedValues.some((v) => matchValues(value, v))) {
      return {
        failed: true,
        reason: `Expected array to contain matching values but received ${value}`
      };
    }
  }
  return {
    failed: false
  };
});
defineMatcher("toThrow", (fn, [toBeThrown]) => {
  if (typeof fn !== "function") {
    return {
      failed: true,
      reason: `Expected value to be a function, but received ${typeof fn}`
    };
  }
  const onErr = (e) => {
    if (toBeThrown === void 0) {
      return {
        failed: true,
        reason: `Expected function to throw ${toBeThrown}, but received ${e}`
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: `Expected function to throw ${toBeThrown}, but received ${e}`
      };
    }
  };
  try {
    const result = fn();
    if (result === "object" && fn === null && fn instanceof Promise) {
      return result.catch(onErr);
    }
  } catch (e) {
    return onErr(e);
  }
  return {
    failed: false
  };
});
defineMatcher("toReject", async (fn, [toBeThrown]) => {
  if (fn !== "object" || fn === null || !(fn instanceof Promise)) {
    return {
      failed: true,
      reason: `Expected value to be a promise, but received ${typeof fn}`
    };
  }
  try {
    await fn;
  } catch (e) {
    if (toBeThrown === void 0) {
      return {
        failed: true,
        reason: `Expected promise to reject ${toBeThrown}, but received ${e}`
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: `Expected promise to reject ${toBeThrown}, but received ${e}`
      };
    }
  }
  return {
    failed: false
  };
});
var match = {
  anything() {
    class AnythingMatcher extends CustomMatch {
      check(value) {
        return value != null;
      }
    }
    return new AnythingMatcher();
  },
  type(expectedType) {
    class TypeMatcher extends CustomMatch {
      check(value) {
        return typeof value === expectedType;
      }
    }
    return new TypeMatcher();
  },
  instanceOf(expectedClass) {
    class InstanceOfMatcher extends CustomMatch {
      check(value) {
        return value instanceof expectedClass;
      }
    }
    return new InstanceOfMatcher();
  },
  stringContaining(expectedString) {
    class StringContainingMatcher extends CustomMatch {
      check(value) {
        return typeof value === "string" && value.includes(expectedString);
      }
    }
    return new StringContainingMatcher();
  },
  stringMatchingRegex(expectedRegex) {
    class StringMatchingRegexMatcher extends CustomMatch {
      check(value) {
        return typeof value === "string" && expectedRegex.test(value);
      }
    }
    return new StringMatchingRegexMatcher();
  },
  exactly(expectedValue) {
    class ExactlyMatcher extends CustomMatch {
      check(value) {
        return value === expectedValue;
      }
    }
    return new ExactlyMatcher();
  },
  equal(expectedValue) {
    class EqualToMatcher extends CustomMatch {
      check(value) {
        return deepEqual(value, expectedValue);
      }
    }
    return new EqualToMatcher();
  }
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
