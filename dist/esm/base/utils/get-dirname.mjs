// src/base/utils/get-dirname.ts
import GLib from "gi://GLib";
import path from "./path.mjs";
var getDirname = (metaUri) => {
  const uri = GLib.uri_parse(metaUri, GLib.UriFlags.NONE);
  if (uri === null) {
    throw new Error(`Invalid URI: ${metaUri}`);
  }
  const filename = GLib.uri_unescape_string(uri.get_path(), null);
  if (filename === null) {
    throw new Error(`Invalid URI: ${metaUri}`);
  }
  return path.dirname(filename);
};
export {
  getDirname
};
