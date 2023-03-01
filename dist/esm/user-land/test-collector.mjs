var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/user-land/test-collector.ts
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
  static addIt(it) {
    _TestCollector.current.its.push(it);
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
export {
  TestCollector
};
