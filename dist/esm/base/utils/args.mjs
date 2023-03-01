// src/base/utils/args.ts
function _getArgValue(args, ...argNames) {
  for (const argName of argNames) {
    const argIndex = args.indexOf(argName);
    if (argIndex === -1) {
      continue;
    }
    const argValue = args[argIndex + 1];
    if (argValue === void 0) {
      continue;
    }
    return argValue;
  }
  return void 0;
}
export {
  _getArgValue
};
