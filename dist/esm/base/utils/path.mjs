// src/base/utils/path.ts
var path;
((path2) => {
  const SEPARATOR_CHAR = "/";
  function __assertPath(path3) {
    if (typeof path3 !== "string") {
      throw new TypeError(
        "Path must be a string. Received " + JSON.stringify(path3)
      );
    }
  }
  function __normalizeStringPosix(path3, allowAboveRoot) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for (let i = 0; i <= path3.length; ++i) {
      if (i < path3.length)
        code = path3.charCodeAt(i);
      else if (code === 47)
        break;
      else
        code = 47;
      if (code === 47) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (lastSlash !== i - 1 && dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf(SEPARATOR_CHAR);
              if (lastSlashIndex !== res.length - 1) {
                if (lastSlashIndex === -1) {
                  res = "";
                  lastSegmentLength = 0;
                } else {
                  res = res.slice(0, lastSlashIndex);
                  lastSegmentLength = res.length - 1 - res.lastIndexOf(SEPARATOR_CHAR);
                }
                lastSlash = i;
                dots = 0;
                continue;
              }
            } else if (res.length === 2 || res.length === 1) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            if (res.length > 0)
              res += "/..";
            else
              res = "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0)
            res += SEPARATOR_CHAR + path3.slice(lastSlash + 1, i);
          else
            res = path3.slice(lastSlash + 1, i);
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === 46 && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  function __format(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) {
      return base;
    }
    if (dir === pathObject.root) {
      return dir + base;
    }
    return dir + sep3 + base;
  }
  function resolve2(...args) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    let cwd;
    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      let path3;
      if (i >= 0)
        path3 = args[i];
      else {
        if (cwd === void 0)
          cwd = process.cwd();
        path3 = cwd;
      }
      __assertPath(path3);
      if (path3.length === 0) {
        continue;
      }
      resolvedPath = path3 + SEPARATOR_CHAR + resolvedPath;
      resolvedAbsolute = path3.charCodeAt(0) === 47;
    }
    resolvedPath = __normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return SEPARATOR_CHAR + resolvedPath;
      else
        return SEPARATOR_CHAR;
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return ".";
    }
  }
  path2.resolve = resolve2;
  function normalize2(path3) {
    __assertPath(path3);
    if (path3.length === 0)
      return ".";
    const isAbsolute3 = path3.charCodeAt(0) === 47;
    const trailingSeparator = path3.charCodeAt(path3.length - 1) === 47;
    path3 = __normalizeStringPosix(path3, !isAbsolute3);
    if (path3.length === 0 && !isAbsolute3)
      path3 = ".";
    if (path3.length > 0 && trailingSeparator)
      path3 += SEPARATOR_CHAR;
    if (isAbsolute3)
      return SEPARATOR_CHAR + path3;
    return path3;
  }
  path2.normalize = normalize2;
  function isAbsolute2(path3) {
    __assertPath(path3);
    return path3.length > 0 && path3.charCodeAt(0) === 47;
  }
  path2.isAbsolute = isAbsolute2;
  function join2(...args) {
    if (args.length === 0)
      return ".";
    let joined;
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      __assertPath(arg);
      if (arg.length > 0) {
        if (joined === void 0)
          joined = arg;
        else
          joined += SEPARATOR_CHAR + arg;
      }
    }
    if (joined === void 0)
      return ".";
    return path2.posix.normalize(joined);
  }
  path2.join = join2;
  function relative2(from, to) {
    __assertPath(from);
    __assertPath(to);
    if (from === to)
      return "";
    from = path2.posix.resolve(from);
    to = path2.posix.resolve(to);
    if (from === to)
      return "";
    let fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47)
        break;
    }
    const fromEnd = from.length;
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47)
        break;
    }
    const toEnd = to.length;
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47) {
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47) {
            lastCommonSep = i;
          } else if (i === 0) {
            lastCommonSep = 0;
          }
        }
        break;
      }
      const fromCode = from.charCodeAt(fromStart + i);
      const toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47)
        lastCommonSep = i;
    }
    let out = "";
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47) {
        if (out.length === 0)
          out += "..";
        else
          out += "/..";
      }
    }
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47)
        ++toStart;
      return to.slice(toStart);
    }
  }
  path2.relative = relative2;
  function dirname2(path3) {
    __assertPath(path3);
    if (path3.length === 0)
      return ".";
    let code = path3.charCodeAt(0);
    const hasRoot = code === 47;
    let end = -1;
    let matchedSlash = true;
    for (let i = path3.length - 1; i >= 1; --i) {
      code = path3.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    if (end === -1)
      return hasRoot ? SEPARATOR_CHAR : ".";
    if (hasRoot && end === 1)
      return "//";
    return path3.slice(0, end);
  }
  path2.dirname = dirname2;
  function basename2(path3, ext) {
    if (ext !== void 0 && typeof ext !== "string")
      throw new TypeError('"ext" argument must be a string');
    __assertPath(path3);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== void 0 && ext.length > 0 && ext.length <= path3.length) {
      if (ext.length === path3.length && ext === path3)
        return "";
      let extIdx = ext.length - 1;
      let firstNonSlashEnd = -1;
      for (i = path3.length - 1; i >= 0; --i) {
        const code = path3.charCodeAt(i);
        if (code === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                end = i;
              }
            } else {
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }
      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path3.length;
      return path3.slice(start, end);
    } else {
      for (i = path3.length - 1; i >= 0; --i) {
        if (path3.charCodeAt(i) === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1)
        return "";
      return path3.slice(start, end);
    }
  }
  path2.basename = basename2;
  function extname2(path3) {
    __assertPath(path3);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for (let i = path3.length - 1; i >= 0; --i) {
      const code = path3.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46) {
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
    preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return "";
    }
    return path3.slice(startDot, end);
  }
  path2.extname = extname2;
  function format2(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
      throw new TypeError(
        'The "pathObject" argument must be of type Object. Received type ' + typeof pathObject
      );
    }
    return __format(SEPARATOR_CHAR, pathObject);
  }
  path2.format = format2;
  function parse2(path3) {
    __assertPath(path3);
    const ret = { root: "", dir: "", base: "", ext: "", name: "" };
    if (path3.length === 0)
      return ret;
    let code = path3.charCodeAt(0);
    const isAbsolute3 = code === 47;
    let start;
    if (isAbsolute3) {
      ret.root = SEPARATOR_CHAR;
      start = 1;
    } else {
      start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path3.length - 1;
    let preDotState = 0;
    for (; i >= start; --i) {
      code = path3.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46) {
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
    preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute3)
          ret.base = ret.name = path3.slice(1, end);
        else
          ret.base = ret.name = path3.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute3) {
        ret.name = path3.slice(1, startDot);
        ret.base = path3.slice(1, end);
      } else {
        ret.name = path3.slice(startPart, startDot);
        ret.base = path3.slice(startPart, end);
      }
      ret.ext = path3.slice(startDot, end);
    }
    if (startPart > 0)
      ret.dir = path3.slice(0, startPart - 1);
    else if (isAbsolute3)
      ret.dir = SEPARATOR_CHAR;
    return ret;
  }
  path2.parse = parse2;
  path2.sep = SEPARATOR_CHAR;
  path2.delimiter = ":";
  path2.win32 = null;
  path2.posix = path2;
})(path || (path = {}));
var path_default = path;
var resolve = path.resolve;
var normalize = path.normalize;
var isAbsolute = path.isAbsolute;
var join = path.join;
var relative = path.relative;
var dirname = path.dirname;
var basename = path.basename;
var extname = path.extname;
var format = path.format;
var parse = path.parse;
var sep = path.sep;
var delimiter = path.delimiter;
var win32 = path.win32;
var posix = path.posix;
export {
  basename,
  path_default as default,
  delimiter,
  dirname,
  extname,
  format,
  isAbsolute,
  join,
  normalize,
  parse,
  posix,
  relative,
  resolve,
  sep,
  win32
};
