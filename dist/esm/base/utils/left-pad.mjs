// src/base/utils/left-pad.ts
function _leftPad(str, len, char = " ") {
  const pad = char.repeat(len);
  return pad + str.replaceAll("\n", "\n" + pad);
}
export {
  _leftPad
};
