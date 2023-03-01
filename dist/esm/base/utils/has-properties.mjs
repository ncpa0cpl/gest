// src/base/utils/has-properties.ts
function _hasProperties(o, ...p) {
  for (const key of p) {
    if (!Object.prototype.hasOwnProperty.call(o, key))
      return false;
  }
  return true;
}
export {
  _hasProperties
};
