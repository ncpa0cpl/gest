// src/base/utils/cwd.ts
var _cwd = null;
function setCwd(uri) {
  _cwd = uri;
}
function getCwd() {
  if (_cwd === null) {
    throw new Error("CWD is not set");
  }
  return _cwd;
}
export {
  getCwd,
  setCwd
};
