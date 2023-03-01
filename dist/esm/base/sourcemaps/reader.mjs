// src/base/sourcemaps/reader.ts
import { Base64VLQ } from "./vlq.mjs";
var SourceMapReader = class {
  constructor(map) {
    this.map = map;
  }
  converter = new Base64VLQ();
  getLineN(text, n) {
    let line = 0;
    let lineStart = 0;
    while (line !== n) {
      lineStart = text.indexOf("\n", lineStart) + 1;
      line++;
    }
    if (line > 0 && lineStart === 0) {
      return "";
    }
    let lineEnd = text.indexOf("\n", lineStart + 1);
    if (lineEnd === -1) {
      lineEnd = text.length;
    }
    return text.slice(lineStart, lineEnd);
  }
  getOriginalPosition(outLine, outColumn) {
    outLine -= 1;
    outColumn -= 1;
    const vlqs = this.map.mappings.split(";").map((line) => line.split(","));
    const state = [0, 0, 0, 0, 0];
    if (vlqs.length <= outLine)
      return null;
    for (const [index, line] of vlqs.entries()) {
      state[0] = 0;
      for (const [_, segment] of line.entries()) {
        if (!segment)
          continue;
        const segmentCords = this.converter.decode(segment);
        const prevState = [...state];
        state[0] += segmentCords[0];
        if (segmentCords.length > 1) {
          state[1] += segmentCords[1];
          state[2] += segmentCords[2];
          state[3] += segmentCords[3];
          if (segmentCords[4] !== void 0)
            state[4] += segmentCords[4];
          if (index === outLine) {
            if (prevState[0] < outColumn && outColumn <= state[0]) {
              return {
                file: this.map.sources[state[1]],
                line: state[2] + 1,
                column: outColumn + state[3] - state[0] + 1
              };
            }
          }
        }
      }
      if (index === outLine) {
        return {
          file: this.map.sources[state[1]],
          line: state[2] + 1,
          // back to 1 based
          column: 1
        };
      }
    }
    return null;
  }
};
export {
  SourceMapReader
};
