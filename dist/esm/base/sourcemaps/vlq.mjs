// src/base/sourcemaps/vlq.ts
var Base64VLQ = class {
  char_to_integer = {};
  integer_to_char = {};
  constructor() {
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("").forEach((char, i) => {
      this.char_to_integer[char] = i;
      this.integer_to_char[i] = char;
    });
  }
  decode(string) {
    const result = [];
    let shift = 0;
    let value = 0;
    for (let i = 0; i < string.length; i += 1) {
      const char = string[i];
      let integer = this.char_to_integer[char];
      if (integer === void 0) {
        throw new Error(`Invalid character (${string[i]})`);
      }
      const has_continuation_bit = integer & 32;
      integer &= 31;
      value += integer << shift;
      if (has_continuation_bit) {
        shift += 5;
      } else {
        const should_negate = value & 1;
        value >>>= 1;
        if (should_negate) {
          result.push(value === 0 ? -2147483648 : -value);
        } else {
          result.push(value);
        }
        value = shift = 0;
      }
    }
    return result;
  }
  encode(value) {
    if (typeof value === "number") {
      return this.encode_integer(value);
    }
    let result = "";
    for (let i = 0; i < value.length; i += 1) {
      const char = value[i];
      result += this.encode_integer(char);
    }
    return result;
  }
  encode_integer(num) {
    let result = "";
    if (num < 0) {
      num = -num << 1 | 1;
    } else {
      num <<= 1;
    }
    do {
      let clamped = num & 31;
      num >>>= 5;
      if (num > 0) {
        clamped |= 32;
      }
      result += this.integer_to_char[clamped];
    } while (num > 0);
    return result;
  }
};
export {
  Base64VLQ
};
