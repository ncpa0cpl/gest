// src/base/utils/error-handling.ts
import { SourceMapReader } from "../sourcemaps/reader.mjs";
function _isExpectError(e) {
  return e && typeof e === "object" && e.name === "ExpectError";
}
function _getErrorMessage(e) {
  if (typeof e === "string")
    return e;
  if (typeof e === "object" && !!e && e instanceof Error)
    return e.message;
  return String(e);
}
function _getErrorStack(e, sourceMap) {
  if (typeof e === "object" && !!e && e instanceof Error) {
    const stack = e.stack;
    if (stack) {
      if (!sourceMap)
        return stack;
      const lines = stack.split("\n");
      const result = [];
      const sourceMapReader = new SourceMapReader(sourceMap);
      for (const line of lines) {
        if (!line.includes("bundled.js")) {
          result.push(line);
          continue;
        }
        const match = line.match(/(.*):(\d+):(\d+)$/);
        if (match) {
          const [, , line2, column] = match;
          const mapped = sourceMapReader.getOriginalPosition(+line2, +column);
          if (mapped) {
            result.push(`${mapped.file}:${mapped.line}:${mapped.column}`);
          } else {
            result.push(line2);
          }
        } else {
          result.push(line);
        }
      }
      return result.join("\n");
    }
  }
  return "";
}
export {
  _getErrorMessage,
  _getErrorStack,
  _isExpectError
};
