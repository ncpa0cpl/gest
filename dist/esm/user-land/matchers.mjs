var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/user-land/matchers.ts
import { _getLineFromError } from "./utils/parse-error.mjs";
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
Matchers.add("toBe", (testedValue, [expectedValue]) => {
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
Matchers.add("toEqual", (testedValue, [expectedValue]) => {
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
Matchers.add("toBeUndefined", (testedValue) => {
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
Matchers.add("toBeDefined", (testedValue) => {
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
Matchers.add("toBeOfType", (testedValue, [expectedType]) => {
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
Matchers.add("toMatchRegex", (testedValue, [regex]) => {
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
Matchers.add("toMatch", (testedValue, [expectedValue]) => {
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
Matchers.add("toContain", (testedValue, values) => {
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
Matchers.add("toContainEqual", (testedValue, values) => {
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
Matchers.add("toContainMatch", (testedValue, values) => {
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
Matchers.add("toContainOnly", (testedValue, expectedValues) => {
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
Matchers.add("toContainOnlyEqual", (testedValue, expectedValues) => {
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
Matchers.add("toContainOnlyMatch", (testedValue, expectedValues) => {
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
Matchers.add("toThrow", (fn, [toBeThrown]) => {
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
Matchers.add("toReject", async (fn, [toBeThrown]) => {
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
  /** Matches any non-nullish value. */
  anything() {
    class AnythingMatcher extends CustomMatch {
      check(value) {
        return value != null;
      }
    }
    return new AnythingMatcher();
  },
  /** Matches any value of the specified type. */
  type(expectedType) {
    class TypeMatcher extends CustomMatch {
      check(value) {
        return typeof value === expectedType;
      }
    }
    return new TypeMatcher();
  },
  /** Matches any value that's an instance of the specified class. */
  instanceOf(expectedClass) {
    class InstanceOfMatcher extends CustomMatch {
      check(value) {
        return value instanceof expectedClass;
      }
    }
    return new InstanceOfMatcher();
  },
  /** Matches any string that contains the specified substring. */
  stringContaining(expectedString) {
    class StringContainingMatcher extends CustomMatch {
      check(value) {
        return typeof value === "string" && value.includes(expectedString);
      }
    }
    return new StringContainingMatcher();
  },
  /**
   * Matches any string that matches specified regular
   * expression.
   */
  stringMatchingRegex(expectedRegex) {
    class StringMatchingRegexMatcher extends CustomMatch {
      check(value) {
        return typeof value === "string" && expectedRegex.test(value);
      }
    }
    return new StringMatchingRegexMatcher();
  },
  /**
   * Matches any value that is strictly equal to the specified
   * value. (equivalent to `toBe()`)
   */
  exactly(expectedValue) {
    class ExactlyMatcher extends CustomMatch {
      check(value) {
        return value === expectedValue;
      }
    }
    return new ExactlyMatcher();
  },
  /**
   * Matches any value that is equal to the specified value,
   * using deep comparison. (equivalent to `toEqual()`)
   */
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
  Matchers,
  match
};
