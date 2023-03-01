// src/base/utils/no-log-err.ts
var NoLogError = class extends Error {
  static isError(err) {
    return typeof err === "object" && !!err && err instanceof Error;
  }
  constructor(originalError, message) {
    super(NoLogError.isError(originalError) ? originalError.message : message);
    this.name = "NoLogError";
  }
};
export {
  NoLogError
};
