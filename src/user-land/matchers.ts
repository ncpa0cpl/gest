import { _getLineFromError } from "./utils/parse-error";

export interface ExpectMatchers {
  /**
   * Negates the matcher. The test will pass if expectation
   * fails.
   */
  not: Omit<ExpectMatchers, "not">;
  /**
   * Compares the tested value to the expected value using strict
   * equality.
   */
  toBe(expected: any): void;
  /**
   * Compares the tested value to the expected value using deep
   * equality.
   */
  toEqual(expected: any): void;
  /**
   * Check if the tested value is specifically `null` or
   * `undefined`.
   */
  toBeUndefined(): void;
  /**
   * Check if the tested value is defined. `null` and `undefined`
   * values will fail this expectation.
   */
  toBeDefined(): void;
  /** Check if the tested value is of the specified type. */
  toBeOfType(expected: string): void;
  /**
   * Check if the tested value matches with the specified value,
   * the specified values can be a custom match (for example
   * `match.anything()`).
   *
   * Matching also does not care about additional properties on
   * the tested objects.
   *
   * Matching is deep, so it will work even with nested objects.
   */
  toMatch(expected: any): void;
  /**
   * Check if the tested value is a string that matches the
   * specified regular expression.
   */
  toMatchRegex(expected: RegExp): void;
  /**
   * Check if the tested value is an array that contains the
   * specified values. Each value must be strictly equal to the
   * tested value.
   */
  toContain(...expected: any[]): void;
  /**
   * Check if the tested value is an array that contains the
   * specified values. Each value is deeply compared to the
   * tested value.
   */
  toContainEqual(...expected: any[]): void;
  /**
   * Check if the tested value is an array that contains the
   * specified values. Each value is matched with the tested
   * value.
   */
  toContainMatch(...expected: any[]): void;
  /**
   * Check if the tested value is an array contains the specified
   * values, and only those values. Each value must be strictly
   * equal to the tested value.
   */
  toContainOnly(...expected: any[]): void;
  /**
   * Check if the tested value is an array contains the specified
   * values, and only those values. Each value is deeply compared
   * to the tested value.
   */
  toContainOnlyEqual(...expected: any[]): void;
  /**
   * Check if the tested value is an array contains the specified
   * values, and only those values. Each value is matched with
   * the tested value.
   */
  toContainOnlyMatch(...expected: any[]): void;
  /**
   * Check if the tested value is a function that throws when
   * called.
   *
   * By default test will pass if the function throws anything,
   * if a parameter is specified, the test will pass only if the
   * thrown value is strictly equal to the specified value.
   *
   * If the tested fuinction is async, this matcher will return a
   * promise that should be awaited.
   */
  toThrow(thorwn?: any): void | Promise<void>;
  /**
   * Check if the tested value is a promise that rejects with the
   * specified value.
   *
   * If no value is specified, the test will pass if the promise
   * rejects to any value, otherwise the test will pass only if
   * the rejected value is strictly equal to the specified
   * value.
   *
   * This matcher should always be awaited.
   */
  toReject(expected: Promise<any>): Promise<void>;
}

export type MatcherResult =
  | {
      failed: false;
    }
  | {
      failed: true;
      reason: string;
      expected: string;
      received: string;
      diff?: string;
    };

export type Matcher = (
  testedValue: any,
  matcherArgs: any[]
) => MatcherResult | Promise<MatcherResult>;

export type CalledFrom = {
  line: number;
  column: number;
};

export type MatcherResultHandlers = {
  sync: (
    result: MatcherResult,
    negate: boolean,
    celledFrom: CalledFrom
  ) => void;
  async: (
    result: Promise<MatcherResult>,
    negate: boolean,
    celledFrom: CalledFrom
  ) => Promise<void>;
};

export class Matchers {
  private static matchers = new Map<string, Matcher>();

  static add(name: string, matcher: Matcher) {
    this.matchers.set(name, matcher);
  }

  static get(name: string): Matcher {
    const m = this.matchers.get(name);

    if (!m) {
      throw new Error(`Invalid matcher: '${name}'`);
    }

    return m;
  }

  static proxy(
    testedValue: any,
    handleMatcherResult: MatcherResultHandlers,
    negate = false
  ): ExpectMatchers {
    return new Proxy(
      {},
      {
        get(_, matcherName) {
          if (matcherName === "not") {
            return Matchers.proxy(testedValue, handleMatcherResult, true);
          }

          const matcher = Matchers.get(matcherName as string);

          return (...args: any[]) => {
            // Get line where this function was called
            const [line, column] = _getLineFromError(new Error());

            const calledFrom = {
              line,
              column,
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
          return Matchers.matchers.has(p as string);
        },
        ownKeys() {
          return [...Matchers.matchers.keys()];
        },
      }
    ) as any;
  }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== "object" && typeof b !== "object")) {
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

abstract class CustomMatch {
  static isCustomMatch(value: any): value is CustomMatch {
    return (
      typeof value === "object" &&
      value !== null &&
      value instanceof CustomMatch
    );
  }

  abstract check(value: any): boolean;
}

function matchValues(a: any, b: any): boolean {
  if (CustomMatch.isCustomMatch(b)) {
    return b.check(a);
  }

  if (a === b) {
    return true;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== "object" && typeof b !== "object")) {
    return a === b;
  }

  const keys = Object.keys(b);
  if (keys.length > Object.keys(a).length) {
    return false;
  }

  // @ts-ignore
  return keys.every((k) => deepEqual(a[k], b[k], matchValues));
}

function getPresentationForValue(v: unknown): string {
  switch (typeof v) {
    case "string":
      return `"${v}"`;
    case "number":
    case "boolean":
    case "bigint":
    case "undefined":
      return String(v);
    case "symbol":
      return v.toString();
    case "function":
      return v.name ? `[Function: ${v.name}]` : "[Function]";
    case "object":
      if (v === null) {
        return "null";
      }
      if (Array.isArray(v)) {
        return "Array<...>";
      }
      if (Object.getPrototypeOf(v) !== Object.prototype) {
        return `[Object: ${v.constructor.name}]`;
      }
      return "Object";
  }
}

Matchers.add("toBe", (testedValue, [expectedValue]) => {
  if (testedValue !== expectedValue) {
    return {
      failed: true,
      reason: "Equality test has failed.",
      received: getPresentationForValue(testedValue),
      expected: getPresentationForValue(expectedValue),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toEqual", (testedValue, [expectedValue]) => {
  if (!deepEqual(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: "Deep equality test has failed.",
      received: getPresentationForValue(testedValue),
      expected: getPresentationForValue(expectedValue),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toBeUndefined", (testedValue) => {
  if (testedValue != null) {
    return {
      failed: true,
      reason: "Expected value to be undefined.",
      received: getPresentationForValue(testedValue),
      expected: getPresentationForValue(undefined),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toBeDefined", (testedValue) => {
  if (testedValue == null) {
    return {
      failed: true,
      reason: "Expected value to be defined.",
      received: getPresentationForValue(testedValue),
      expected: "Any",
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toBeOfType", (testedValue, [expectedType]) => {
  if (typeof testedValue !== expectedType) {
    return {
      failed: true,
      reason: "Expected value to be of different type.",
      received: getPresentationForValue(testedValue),
      expected: "typeof " + getPresentationForValue(expectedType),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toMatchRegex", (testedValue, [regex]) => {
  if (typeof testedValue !== "string") {
    return {
      failed: true,
      reason: "Expected value to be a string.",
      received: getPresentationForValue(testedValue),
      expected: "String",
    };
  }

  if (!regex.test(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to match regex.",
      received: getPresentationForValue(testedValue),
      expected: regex.toString(),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toMatch", (testedValue, [expectedValue]) => {
  if (!matchValues(testedValue, expectedValue)) {
    return {
      failed: true,
      reason: "Expected value to match.",
      received: getPresentationForValue(testedValue),
      expected: getPresentationForValue(expectedValue),
    };
  }

  return {
    failed: false,
  };
});

Matchers.add("toContain", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of values) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: "Expected array to contain a certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toContainEqual", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of values) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: "Expected array to contain a certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toContainMatch", (testedValue, values) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of values) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: "Expected array to contain certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toContainOnly", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.includes(value)) {
      return {
        failed: true,
        reason: "Expected array to contain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => value === v)) {
      return {
        failed: true,
        reason: "Expected array to not contain anything but a certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toContainOnlyEqual", (testedValue, expectedValues) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.some((v) => deepEqual(v, value))) {
      return {
        failed: true,
        reason: "Expected array to contain certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => deepEqual(value, v))) {
      return {
        failed: true,
        reason: "Expected array to contain only certain values.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toContainOnlyMatch", (testedValue, expectedValues: any[]) => {
  if (!Array.isArray(testedValue)) {
    return {
      failed: true,
      reason: "Expected value to be an array.",
      received: getPresentationForValue(testedValue),
      expected: "Array",
    };
  }

  for (const value of expectedValues) {
    if (!testedValue.some((v) => matchValues(v, value))) {
      return {
        failed: true,
        reason: "Expected array to contain certain value.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  for (const value of testedValue) {
    if (!expectedValues.some((v) => matchValues(value, v))) {
      return {
        failed: true,
        reason: "Expected array to contain only certain values.",
        received: getPresentationForValue(testedValue),
        expected: getPresentationForValue(value),
      };
    }
  }

  return {
    failed: false,
  };
});

Matchers.add("toThrow", (fn, [toBeThrown]) => {
  if (typeof fn !== "function") {
    return {
      failed: true,
      reason: "Expected value to be a function.",
      received: getPresentationForValue(fn),
      expected: "Function",
    };
  }

  const onErr = (e: any) => {
    if (toBeThrown === undefined) {
      return {
        failed: false,
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: "Expected function to throw a specific value.",
        received: getPresentationForValue(e),
        expected: getPresentationForValue(toBeThrown),
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
    failed: false,
  };
});

Matchers.add("toReject", async (fn, [toBeThrown]) => {
  if (fn !== "object" || fn === null || !(fn instanceof Promise)) {
    return {
      failed: true,
      reason: "Expected value to be a promise.",
      received: getPresentationForValue(fn),
      expected: "Promise",
    };
  }

  try {
    await fn;
  } catch (e) {
    if (toBeThrown === undefined) {
      return {
        failed: false,
      };
    }
    if (e !== toBeThrown) {
      return {
        failed: true,
        reason: "Expected promise to reject a certain value.",
        received: getPresentationForValue(e),
        expected: getPresentationForValue(toBeThrown),
      };
    }
  }

  return {
    failed: false,
  };
});

export const match = {
  /** Matches any non-nullish value. */
  anything(): CustomMatch {
    class AnythingMatcher extends CustomMatch {
      check(value: any) {
        return value != null;
      }
    }

    return new AnythingMatcher();
  },
  /** Matches any value of the specified type. */
  type(expectedType: string): CustomMatch {
    class TypeMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === expectedType;
      }
    }

    return new TypeMatcher();
  },
  /** Matches any value that's an instance of the specified class. */
  instanceOf(expectedClass: any): CustomMatch {
    class InstanceOfMatcher extends CustomMatch {
      check(value: any) {
        return value instanceof expectedClass;
      }
    }

    return new InstanceOfMatcher();
  },
  /** Matches any string that contains the specified substring. */
  stringContaining(expectedString: string): CustomMatch {
    class StringContainingMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === "string" && value.includes(expectedString);
      }
    }

    return new StringContainingMatcher();
  },
  /**
   * Matches any string that matches specified regular
   * expression.
   */
  stringMatchingRegex(expectedRegex: RegExp): CustomMatch {
    class StringMatchingRegexMatcher extends CustomMatch {
      check(value: any) {
        return typeof value === "string" && expectedRegex.test(value);
      }
    }

    return new StringMatchingRegexMatcher();
  },
  /**
   * Matches any value that is strictly equal to the specified
   * value. (equivalent to `toBe()`)
   */
  exactly(expectedValue: any): CustomMatch {
    class ExactlyMatcher extends CustomMatch {
      check(value: any) {
        return value === expectedValue;
      }
    }

    return new ExactlyMatcher();
  },
  /**
   * Matches any value that is equal to the specified value,
   * using deep comparison. (equivalent to `toEqual()`)
   */
  equal(expectedValue: any): CustomMatch {
    class EqualToMatcher extends CustomMatch {
      check(value: any) {
        return deepEqual(value, expectedValue);
      }
    }

    return new EqualToMatcher();
  },
};
