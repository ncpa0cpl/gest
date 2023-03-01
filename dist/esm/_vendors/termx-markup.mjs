var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/termx-markup/dist/esm/index.mjs
var esm_exports = {};
__export(esm_exports, {
  MarkupFormatter: () => MarkupFormatter,
  Output: () => Output,
  OutputBuffer: () => OutputBuffer,
  default: () => src_default,
  html: () => html,
  parseMarkup: () => parseMarkup,
  raw: () => raw
});

// node_modules/termx-markup/dist/esm/colors/termx-colors.mjs
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var TermxColors = class {
  static parseRgbArgs(args) {
    if (args.length === 1) {
      const arg = args[0];
      if (typeof arg === "string") {
        if (arg.startsWith("rgb(")) {
          const rgb = arg.slice(4, -1).split(",");
          return {
            r: Number(rgb[0]),
            g: Number(rgb[1]),
            b: Number(rgb[2])
          };
        } else if (arg.startsWith("#")) {
          const rgb = arg.slice(1).split("");
          return {
            r: parseInt(rgb[0] + rgb[1], 16),
            g: parseInt(rgb[2] + rgb[3], 16),
            b: parseInt(rgb[4] + rgb[5], 16)
          };
        }
      } else if (typeof arg === "object") {
        return arg;
      }
    } else if (args.length === 3) {
      return { r: args[0], g: args[1], b: args[2] };
    }
    throw new Error("Invalid rgb arguments");
  }
  static get(color) {
    if (color in this.predefinedColors) {
      return this.predefinedColors[color];
    } else {
      return this.rgb(color);
    }
  }
  static define(name, ...color) {
    if (name in this.predefinedColors) {
      throw new Error(`Color ${name} is already defined.`);
    }
    Object.assign(this.predefinedColors, { [name]: this.rgb(...color) });
  }
  /** @abstract */
  static rgb(...args) {
    return "";
  }
};
__publicField(TermxColors, "predefinedColors", {});

// node_modules/termx-markup/dist/esm/colors/termx-bg-color.mjs
var __defProp3 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => {
  __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var escape = "\x1B";
var TermxBgColor = class extends TermxColors {
  static rgb(...args) {
    const rgb = this.parseRgbArgs(args);
    return `${escape}[48;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }
};
__publicField2(TermxBgColor, "predefinedColors", {
  unset: `${escape}[0m`,
  red: `${escape}[41m`,
  green: `${escape}[42m`,
  yellow: `${escape}[43m`,
  blue: `${escape}[44m`,
  magenta: `${escape}[45m`,
  cyan: `${escape}[46m`,
  white: `${escape}[47m`,
  lightRed: `${escape}[101m`,
  lightGreen: `${escape}[102m`,
  lightYellow: `${escape}[103m`,
  lightBlue: `${escape}[104m`,
  lightMagenta: `${escape}[105m`,
  lightCyan: `${escape}[106m`,
  lightWhite: `${escape}[107m`
});

// node_modules/termx-markup/dist/esm/colors/termx-font-colors.mjs
var __defProp4 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => {
  __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var escape2 = "\x1B";
var TermxFontColor = class extends TermxColors {
  static rgb(...args) {
    const rgb = this.parseRgbArgs(args);
    return `${escape2}[38;2;${rgb.r};${rgb.g};${rgb.b}m`;
  }
};
__publicField3(TermxFontColor, "predefinedColors", {
  unset: `${escape2}[0m`,
  red: `${escape2}[31m`,
  green: `${escape2}[32m`,
  yellow: `${escape2}[33m`,
  blue: `${escape2}[34m`,
  magenta: `${escape2}[35m`,
  cyan: `${escape2}[36m`,
  white: `${escape2}[37m`,
  lightRed: `${escape2}[91m`,
  lightGreen: `${escape2}[92m`,
  lightYellow: `${escape2}[93m`,
  lightBlue: `${escape2}[94m`,
  lightMagenta: `${escape2}[95m`,
  lightCyan: `${escape2}[96m`,
  lightWhite: `${escape2}[97m`
});

// node_modules/termx-markup/dist/esm/html-tag.mjs
function html(...args) {
  const b = args[0];
  let c = "", a = 0, d = 0;
  for (c = b[0], a = 1, d = args.length; a < d; a++) {
    if (typeof args[a] === "object" && args[a] !== null && args[a].name === "RawHtml") {
      c += args[a].toString() + b[a];
    } else {
      c += sanitizeHtml(args[a].toString()) + b[a];
    }
  }
  return c;
}
function raw(html2) {
  return new RawHtml(html2);
}
function sanitizeHtml(html2) {
  return html2.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function desanitizeHtml(html2) {
  return html2.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
var RawHtml = class {
  constructor(html2) {
    this.html = html2;
  }
  name = "RawHtml";
  toString() {
    return this.html;
  }
};

// node_modules/termx-markup/dist/esm/markup-parser.mjs
var MarkupParserError = class extends Error {
  constructor(parsedMarkup, position, message) {
    super("Invalid Markup. " + message);
    this.parsedMarkup = parsedMarkup;
    this.position = position;
  }
  getPositionCords() {
    let lineIndex = 0;
    let columnIndex = 0;
    for (let i = 0; i < this.position; i++) {
      if (this.parsedMarkup[i] === "\n") {
        lineIndex++;
        columnIndex = 0;
      } else {
        columnIndex++;
      }
    }
    return [lineIndex, columnIndex];
  }
  getStack() {
    return this.stack ?? "";
  }
  getPositionPatch() {
    const [lineIndex, columnIndex] = this.getPositionCords();
    const lines = this.parsedMarkup.split("\n");
    const patchLine = lines[lineIndex];
    const highlightLine = " ".repeat(columnIndex) + "^";
    let result = "";
    if (lineIndex > 1) {
      result += lines[lineIndex - 2] + "\n";
    }
    if (lineIndex > 0) {
      result += lines[lineIndex - 1] + "\n";
    }
    result += patchLine + "\n" + highlightLine;
    return result;
  }
  toString() {
    return `${this.message}

${this.getPositionPatch()}

${this.getStack()}`;
  }
};
var MarkupNodeBuilder = class {
  constructor(parent) {
    this.parent = parent;
  }
  o = {
    textNode: false,
    tag: "",
    attributes: [],
    content: []
  };
  content = [];
  lastStringContent = "";
  addChild() {
    if (this.lastStringContent.length) {
      this.content.push(this.lastStringContent);
      this.lastStringContent = "";
    }
    const child = new MarkupNodeBuilder(this);
    this.content.push(child);
    return child;
  }
  addChar(char) {
    this.lastStringContent += char;
  }
  serialize() {
    for (let i = 0; i < this.content.length; i++) {
      const c = this.content[i];
      if (typeof c === "string") {
        this.o.content.push(c);
      } else {
        this.o.content.push(c.serialize());
      }
    }
    if (this.lastStringContent.length) {
      this.o.content.push(this.lastStringContent);
    }
    return this.o;
  }
};
var MarkupBuilder = class {
  /** MArkup node that is currently being built. */
  node = new MarkupNodeBuilder();
  constructor() {
    this.node.o.textNode = true;
  }
  addChildNode() {
    this.node = this.node.addChild();
  }
  moveUp() {
    this.node = this.node.parent;
  }
  isTopLevel() {
    return this.node.parent === void 0;
  }
  serialize() {
    if (this.node.content.length === 1 && this.node.o.tag === "" && typeof this.node.content[0] !== "string") {
      return this.node.content[0].serialize();
    }
    return this.node.serialize();
  }
};
var IS_IN_TAG = 1;
var IS_IN_ATTRIBUTE = 2;
var IS_IN_ATTRIBUTE_QUOTE = 4;
var IS_ESCAPED = 8;
var IS_CLOSING_TAG = 16;
var IS_TAG_NAME_READ = 32;
var NOT_IS_IN_TAG = ~IS_IN_TAG;
var NOT_IS_IN_ATTRIBUTE = ~IS_IN_ATTRIBUTE;
var NOT_IS_IN_ATTRIBUTE_QUOTE = ~IS_IN_ATTRIBUTE_QUOTE;
var NOT_IS_ESCAPED = ~IS_ESCAPED;
var NOT_IS_CLOSING_TAG = ~IS_CLOSING_TAG;
var NOT_IS_TAG_NAME_READ = ~IS_TAG_NAME_READ;
function parseMarkup(markupStr) {
  const markup = new MarkupBuilder();
  let currentAttributeName = "";
  let currentAttributeValue = "";
  let closeTagName = "";
  let state = 0;
  for (let i = 0; i < markupStr.length; i++) {
    const char = markupStr[i];
    switch (state) {
      case 0: {
        switch (char) {
          case "<": {
            state = state | IS_IN_TAG;
            if (markupStr[i + 1] === "/") {
              state = state | IS_CLOSING_TAG;
              i++;
            } else {
              markup.addChildNode();
            }
            continue;
          }
          case "\\": {
            state = state | IS_ESCAPED;
            continue;
          }
        }
        markup.node.addChar(char);
        break;
      }
      case 8: {
        markup.node.addChar(char);
        state = state & NOT_IS_ESCAPED;
        break;
      }
      case 1: {
        switch (char) {
          case "\n": {
            if (markup.node.o.tag.length > 0) {
              state = state | IS_TAG_NAME_READ;
            }
            continue;
          }
          case " ": {
            if (markup.node.o.tag.length > 0) {
              state = state | IS_TAG_NAME_READ;
            }
            continue;
          }
          case ">": {
            if (markup.node.o.tag.length === 0) {
              throw new MarkupParserError(markupStr, i, "No tag name found.");
            }
            state = state & NOT_IS_IN_TAG;
            continue;
          }
          case "/": {
            if (markupStr[i + 1] === ">") {
              state = state & NOT_IS_IN_TAG;
              i++;
              markup.moveUp();
            } else {
              throw new MarkupParserError(
                markupStr,
                i,
                "Invalid character encountered."
              );
            }
            continue;
          }
          case "=": {
            throw new MarkupParserError(
              markupStr,
              i - markup.node.o.tag.length,
              "No tag name found."
            );
          }
        }
        markup.node.o.tag += char;
        break;
      }
      case 33: {
        switch (char) {
          case "\n": {
            continue;
          }
          case " ": {
            continue;
          }
          case ">": {
            state = state & NOT_IS_IN_TAG & NOT_IS_TAG_NAME_READ;
            continue;
          }
          case "/": {
            if (markupStr[i + 1] === ">") {
              state = state & NOT_IS_IN_TAG & NOT_IS_TAG_NAME_READ;
              i++;
              markup.moveUp();
            } else {
              throw new MarkupParserError(
                markupStr,
                i,
                "Invalid character encountered."
              );
            }
            continue;
          }
          case "=": {
            throw new MarkupParserError(
              markupStr,
              i,
              "Invalid character encountered."
            );
          }
        }
        state = state | IS_IN_ATTRIBUTE;
        currentAttributeName += char;
        break;
      }
      case 17: {
        switch (char) {
          case "\n": {
            continue;
          }
          case " ": {
            continue;
          }
          case ">": {
            state = state & NOT_IS_IN_TAG & NOT_IS_CLOSING_TAG;
            if (closeTagName !== markup.node.o.tag) {
              throw new MarkupParserError(
                markupStr,
                i,
                `Closing tag does not match opening tag, expected '${markup.node.o.tag}' but found '${closeTagName}'.`
              );
            }
            closeTagName = "";
            markup.moveUp();
            continue;
          }
        }
        closeTagName += char;
        break;
      }
      case 35: {
        switch (char) {
          case "=": {
            state = state & NOT_IS_IN_ATTRIBUTE;
            if (markupStr[i + 1] === '"') {
              state = state | IS_IN_ATTRIBUTE_QUOTE;
              i += 1;
            } else {
              throw new MarkupParserError(
                markupStr,
                i + 1,
                "Attribute values must be enclosed in double quotes."
              );
            }
            continue;
          }
          case "\n": {
            state = state & NOT_IS_IN_ATTRIBUTE;
            markup.node.o.attributes.push([currentAttributeName, true]);
            currentAttributeName = "";
            continue;
          }
          case " ": {
            state = state & NOT_IS_IN_ATTRIBUTE;
            markup.node.o.attributes.push([currentAttributeName, true]);
            currentAttributeName = "";
            continue;
          }
          case ">": {
            state = state & NOT_IS_IN_TAG & NOT_IS_IN_ATTRIBUTE & NOT_IS_TAG_NAME_READ;
            markup.node.o.attributes.push([currentAttributeName, true]);
            currentAttributeName = "";
            continue;
          }
        }
        currentAttributeName += char;
        break;
      }
      case 37: {
        switch (char) {
          case '"': {
            state = state & NOT_IS_IN_ATTRIBUTE_QUOTE;
            markup.node.o.attributes.push([
              currentAttributeName,
              currentAttributeValue
            ]);
            currentAttributeName = "";
            currentAttributeValue = "";
            continue;
          }
          case "\\": {
            state = state | IS_ESCAPED;
            continue;
          }
        }
        currentAttributeValue += char;
        break;
      }
      case 45: {
        currentAttributeValue += char;
        state = state & NOT_IS_ESCAPED;
        break;
      }
    }
  }
  if (!markup.isTopLevel()) {
    throw new MarkupParserError(
      markupStr,
      markupStr.length - 1,
      `Closing tag is missing. Expected a close tag for '${markup.node.o.tag}' before the end of the document.`
    );
  }
  return markup.serialize();
}

// node_modules/termx-markup/dist/esm/formatter/left-pad.mjs
var leftPad = (str, length, char = " ") => {
  char = char[0] ?? " ";
  const pad = char.repeat(length);
  const lines = str.split("\n");
  return lines.map((line) => `${pad}${line}`).join("\n");
};

// node_modules/termx-markup/dist/esm/formatter/scope-tracker.mjs
var __defProp5 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => {
  __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _ScopeTracker = class {
  static get currentScope() {
    return this._currentScope;
  }
  static enterScope(scope) {
    const s = scope;
    this.scopeStack.push(s);
    this._currentScope = s;
  }
  static exitScope() {
    this.scopeStack.pop();
    this._currentScope = this.scopeStack[this.scopeStack.length - 1] ?? {};
  }
  static traverseUp(callback) {
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      callback(this.scopeStack[i]);
    }
  }
};
var ScopeTracker = _ScopeTracker;
__publicField4(ScopeTracker, "scopeStack", [
  {
    tag: ""
  }
]);
__publicField4(ScopeTracker, "_currentScope", _ScopeTracker.scopeStack[0]);

// node_modules/termx-markup/dist/esm/formatter/formatter.mjs
var escape3 = "\x1B";
var Bold = `${escape3}[1m`;
var Dimmed = `${escape3}[2m`;
var Italic = `${escape3}[3m`;
var Underscore = `${escape3}[4m`;
var Blink = `${escape3}[5m`;
var Inverted = `${escape3}[7m`;
var StrikeThrough = `${escape3}[9m`;
var MarkupFormatter = class {
  static defineColor(name, ...args) {
    TermxBgColor.define(name, ...args);
    TermxFontColor.define(name, ...args);
  }
  static format(markup) {
    const node = parseMarkup(markup);
    return TermxFontColor.get("unset") + desanitizeHtml(this.formatMarkup(node));
  }
  static formatMarkup(node) {
    let result = "";
    switch (node.tag) {
      case "li":
      case "pre":
      case "line":
      case "span": {
        ScopeTracker.enterScope(this.createScope(node));
        result += this.scopeToAnsi(ScopeTracker.currentScope) + this.join(
          node.content.map(
            (content) => this.mapContents(content, node.tag === "pre")
          )
        );
        ScopeTracker.exitScope();
        result += TermxFontColor.get("unset");
        if (node.tag === "line") {
          result += "\n";
        }
        result += this.scopeToAnsi(ScopeTracker.currentScope);
        return result;
      }
      case "ol":
      case "ul": {
        const prefix = this.getListElementPrefix(node);
        const padding = this.getListPadding();
        ScopeTracker.enterScope(this.createScope(node));
        result += this.scopeToAnsi(ScopeTracker.currentScope) + this.join(
          node.content.filter((c) => typeof c !== "string" || c.trim().length).map((content, i) => {
            if (typeof content === "string" || content.tag !== "li") {
              throw new Error(
                `Invalid element inside <${node.tag}>. Each child of <${node.tag}> must be a <li> element.`
              );
            }
            const { contentPad, firstLineOffset } = this.getContentPad(
              node,
              i + 1
            );
            const r = prefix(i) + leftPad(this.mapContents(content), contentPad).substring(
              firstLineOffset
            );
            return leftPad(r, padding) + "\n";
          })
        );
        ScopeTracker.exitScope();
        result += TermxFontColor.get("unset") + this.scopeToAnsi(ScopeTracker.currentScope);
        return result;
      }
      case "pad": {
        ScopeTracker.enterScope(this.createScope(node));
        const paddingAttr = this.getAttribute(node, "size") ?? 0;
        const content = this.scopeToAnsi(ScopeTracker.currentScope) + this.join(node.content.map((content2) => this.mapContents(content2)));
        result += leftPad(content, Number(paddingAttr));
        ScopeTracker.exitScope();
        result += TermxFontColor.get("unset") + this.scopeToAnsi(ScopeTracker.currentScope);
        return result;
      }
      case "br": {
        return result + "\n";
      }
      case "s": {
        return result + " ";
      }
      case "": {
        result += this.join(
          node.content.map((content) => this.mapContents(content))
        );
        return result;
      }
    }
    throw new Error(`Invalid tag: <${node.tag}>`);
  }
  static join(strings) {
    let result = "";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
    }
    return result;
  }
  static getAttribute(node, name) {
    for (const [key, value] of node.attributes) {
      if (key === name) {
        return as(value, "string");
      }
    }
  }
  static mapContents(content, pre) {
    if (typeof content === "string") {
      if (pre) {
        return content;
      }
      return content.replaceAll("\n", "").trim();
    }
    return this.formatMarkup(content);
  }
  static getListPadding() {
    let p = 0;
    ScopeTracker.traverseUp((scope) => {
      if (scope.tag === "ol" || scope.tag === "ul") {
        p += 1;
      }
    });
    if (p === 0) {
      return 0;
    }
    return (p - 1) * 2;
  }
  static getContentPad(node, line) {
    if (node.tag === "ul") {
      return {
        contentPad: 2,
        firstLineOffset: 2
      };
    }
    const maxDigitPrefix = node.content.length.toString().length;
    const contentPad = node.content.length.toString().length + 2;
    return {
      contentPad,
      firstLineOffset: contentPad - (maxDigitPrefix - line.toString().length)
    };
  }
  static getListElementPrefix(node) {
    if (node.tag === "ol") {
      return (index) => `${index + 1}. `;
    }
    const type = this.getAttribute(node, "type") ?? "bullet";
    const symbol = (() => {
      switch (type) {
        case "bullet":
          return String.fromCharCode(9679);
        case "circle":
          return String.fromCharCode(9675);
        case "square":
          return String.fromCharCode(9633);
        default:
          throw new Error(`Invalid list type: ${type}`);
      }
    })();
    return () => `${symbol} `;
  }
  static scopeToAnsi(scope) {
    let result = "";
    if (scope.noInherit) {
      result += TermxFontColor.get("unset");
    }
    if (scope.color) {
      result += TermxFontColor.get(scope.color);
    }
    if (scope.bg) {
      result += TermxBgColor.get(scope.bg);
    }
    if (scope.bold) {
      result += Bold;
    }
    if (scope.dimmed) {
      result += Dimmed;
    }
    if (scope.italic) {
      result += Italic;
    }
    if (scope.underscore) {
      result += Underscore;
    }
    if (scope.blink) {
      result += Blink;
    }
    if (scope.inverted) {
      result += Inverted;
    }
    if (scope.strikethrough) {
      result += StrikeThrough;
    }
    return result;
  }
  static createScope(node) {
    const noInherit = node.attributes.some(
      ([key, value]) => key === "no-inherit" && (value === true || value === "true")
    );
    const scope = noInherit ? { noInherit: true } : { ...ScopeTracker.currentScope, noInherit: false };
    if (node.tag) {
      scope.tag = node.tag;
    }
    for (const [name, value] of node.attributes) {
      switch (name) {
        case "color":
          scope.color = as(value, "string");
          break;
        case "bg":
          scope.bg = as(value, "string");
          break;
        case "bold":
          scope.bold = value === true || value === "true";
          break;
        case "dim":
          scope.dimmed = value === true || value === "true";
          break;
        case "italic":
          scope.italic = value === true || value === "true";
          break;
        case "underscore":
          scope.underscore = value === true || value === "true";
          break;
        case "blink":
          scope.blink = value === true || value === "true";
          break;
        case "invert":
          scope.inverted = value === true || value === "true";
          break;
        case "strike":
          scope.strikethrough = value === true || value === "true";
          break;
      }
    }
    return scope;
  }
};
function as(value, as2) {
  if (typeof value === as2) {
    return value;
  }
  throw new Error(`Invalid attribute type: ${typeof value} (expected ${as2})`);
}

// node_modules/termx-markup/dist/esm/output.mjs
var __defProp6 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => {
  __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _Output = class {
  /** Formats the given markup and prints it to the console. */
  static print(...markup) {
    _Output.globalOutput.print(...markup);
  }
  /**
   * Formats the given markup and prints it to the console, and
   * adds a new line character at the start of each markup
   * string.
   */
  static println(...markup) {
    _Output.globalOutput.println(...markup);
  }
  /**
   * Sets the default print function for the current environment.
   *
   * Setting a new default print function will not affect any
   * existing Output instances.
   */
  static setDefaultPrintMethod(printFn) {
    _Output.defaultPrintFn = printFn;
    _Output.globalOutput = new _Output(printFn);
  }
  _printFn;
  /**
   * Creates a new Output instance.
   *
   * @param printFn The print function to use for printing to the
   *   console.
   */
  constructor(printFn) {
    if (printFn) {
      this._printFn = printFn;
    } else {
      if (_Output.defaultPrintFn) {
        this._printFn = _Output.defaultPrintFn;
      } else if (typeof print === "function") {
        this._printFn = print;
      } else if (typeof console !== "undefined" && console.log) {
        this._printFn = (v) => console.log(v);
      } else {
        throw new Error(
          "Unable to detect print function for current environment."
        );
      }
    }
  }
  printError(e) {
    if (e != null) {
      this._printFn(e.toString() + "\n");
      if (typeof e === "object" && e.stack) {
        this._printFn(e.stack + "\n");
      }
    }
  }
  parseMarkupLines(markup) {
    const result = [];
    for (const m of markup) {
      result.push(MarkupFormatter.format(m));
    }
    return result;
  }
  /** Formats the given markup and prints it to the console. */
  print(...markup) {
    try {
      const lines = this.parseMarkupLines(markup);
      for (const line of lines) {
        this._printFn(line);
      }
    } catch (e) {
      this._printFn(
        TermxFontColor.get("red") + "Failed to format/print given markup." + TermxFontColor.get("unset") + "\n"
      );
      this.printError(e);
    }
  }
  /**
   * Formats the given markup and prints it to the console, and
   * adds a new line character at the end of each given markup
   * string.
   */
  println(...markup) {
    try {
      const lines = this.parseMarkupLines(markup);
      for (const line of lines) {
        this._printFn(line + "\n");
      }
    } catch (e) {
      this._printFn(
        TermxFontColor.get("red") + "Failed to format/print given markup." + TermxFontColor.get("unset") + "\n"
      );
      this.printError(e);
    }
  }
};
var Output = _Output;
__publicField5(Output, "defaultPrintFn");
__publicField5(Output, "globalOutput");
try {
  Output["globalOutput"] = new Output();
} catch (e) {
}
var _OutputBuffer = class {
  /**
   * Creates a new OutputBuffer instance.
   *
   * @param output The Output instance to use for printing the
   *   buffer to the console. If not specified, the global Output
   *   instance will be used.
   */
  constructor(output = Output) {
    this.output = output;
  }
  /**
   * Formats the given markup and adds it to the current buffer.
   *
   * Once the buffer is flushed, the markup will be printed to
   * the console.
   */
  static print(markup) {
    _OutputBuffer.globalOutputBuffer.print(markup);
  }
  /**
   * Formats the given markup and adds it to the current buffer,
   * and adds a new line character at the start of each markup
   * string.
   *
   * Once the buffer is flushed, the markup will be printed to
   * the console.
   */
  static println(markup) {
    _OutputBuffer.globalOutputBuffer.println(markup);
  }
  buffer = [];
  /**
   * Formats the given markup and adds it to the current buffer.
   *
   * Once the buffer is flushed, the markup will be printed to
   * the console.
   */
  print(...markup) {
    this.buffer.push(
      ...markup.map((m) => ({ type: "print", markup: m }))
    );
  }
  /**
   * Formats the given markup and adds it to the current buffer,
   * and adds a new line character at the start of each markup
   * string.
   *
   * Once the buffer is flushed, the markup will be printed to
   * the console.
   */
  println(...markup) {
    this.buffer.push(
      ...markup.map((m) => ({ type: "println", markup: m }))
    );
  }
  /**
   * Flushes the current buffer, printing all markup to the
   * console.
   */
  flush() {
    for (const { type, markup } of this.buffer) {
      switch (type) {
        case "print":
          this.output.print(markup);
          break;
        case "println":
          this.output.println(markup);
          break;
      }
    }
    this.buffer = [];
  }
  /**
   * Pipes the content of the current buffer to the provided
   * OutputBuffer instance and returns that OutputBuffer.
   */
  pipe(output) {
    if (this.buffer.length === 0)
      return output;
    output.buffer.push(...this.buffer);
    this.buffer = [];
    return output;
  }
  /**
   * Works like pipe(), but in the reverse direction. (i.e.
   * `output` -> `this` instead of `this` -> `output` )
   *
   * Pipes the content of the provided OutputBuffer instance to
   * the current buffer and returns the current OutputBuffer.
   */
  pipeReverse(output) {
    if (output.buffer.length === 0)
      return this;
    this.buffer.push(...output.buffer);
    output.buffer = [];
    return this;
  }
};
var OutputBuffer = _OutputBuffer;
__publicField5(OutputBuffer, "globalOutputBuffer", new _OutputBuffer());

// node_modules/termx-markup/dist/esm/index.mjs
var src_default = {
  MarkupFormatter,
  html,
  raw,
  Output,
  OutputBuffer,
  parseMarkup
};

// node_modules/@ncpa0cpl/nodepack/vendor-proxy.mjs
var vendor_proxy_default = src_default ?? esm_exports;
export {
  MarkupFormatter,
  Output,
  OutputBuffer,
  vendor_proxy_default as default,
  html,
  parseMarkup,
  raw
};
