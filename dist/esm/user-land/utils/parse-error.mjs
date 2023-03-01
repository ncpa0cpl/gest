// src/user-land/utils/parse-error.ts
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
export {
  _getLineFromError,
  _toNumber
};
