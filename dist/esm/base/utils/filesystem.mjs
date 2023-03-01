// src/base/utils/filesystem.ts
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { _async } from "./async.mjs";
import path from "./path.mjs";
async function _readFile(path2) {
  return _async((p) => {
    const encoding = "utf-8";
    const file = Gio.File.new_for_path(path2.toString());
    file.load_contents_async(null, (_, result) => {
      try {
        const [success, contents] = file.load_contents_finish(result);
        if (success) {
          const decoder = new TextDecoder(encoding);
          p.resolve(decoder.decode(contents));
        } else {
          p.reject(new Error("Could not read file."));
        }
      } catch (error) {
        p.reject(error);
      }
    });
  });
}
async function _deleteFile(path2) {
  return _async((p) => {
    const file = Gio.File.new_for_path(path2);
    file.delete_async(GLib.PRIORITY_DEFAULT, null, (_, result) => {
      try {
        if (!file.delete_finish(result)) {
          throw new Error(`Failed to delete file: ${path2}`);
        }
        p.resolve(void 0);
      } catch (error) {
        p.reject(error);
      }
    });
  });
}
async function _readdir(dir) {
  const file = Gio.File.new_for_path(dir);
  const enumerator = await _async((p2) => {
    file.enumerate_children_async(
      "*",
      Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          const enumerator2 = file.enumerate_children_finish(result);
          p2.resolve(enumerator2);
        } catch (error) {
          p2.reject(error);
        }
      }
    );
  });
  const getNextBatch = () => _async((p3) => {
    enumerator.next_files_async(
      50,
      // max results
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          p3.resolve(enumerator.next_files_finish(result));
        } catch (e) {
          p3.reject(e);
        }
      }
    );
  });
  const allFile = [];
  let nextBatch = [];
  while ((nextBatch = await getNextBatch()).length > 0) {
    allFile.push(...nextBatch.map((f) => f.get_name()));
  }
  return allFile;
}
async function _walkFiles(dir, onFile) {
  const file = Gio.File.new_for_path(dir);
  const enumerator = await _async((p2) => {
    file.enumerate_children_async(
      "*",
      Gio.FileQueryInfoFlags.NONE,
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          const enumerator2 = file.enumerate_children_finish(result);
          p2.resolve(enumerator2);
        } catch (error) {
          p2.reject(error);
        }
      }
    );
  });
  const getNextBatch = () => _async((p3) => {
    enumerator.next_files_async(
      50,
      // max results
      GLib.PRIORITY_DEFAULT,
      null,
      (_, result) => {
        try {
          p3.resolve(enumerator.next_files_finish(result));
        } catch (e) {
          p3.reject(e);
        }
      }
    );
  });
  let nextBatch = [];
  while ((nextBatch = await getNextBatch()).length > 0) {
    for (const child of nextBatch) {
      const isDir = child.get_file_type() === Gio.FileType.DIRECTORY;
      if (!isDir) {
        onFile(dir, child.get_name());
      } else {
        await _walkFiles(path.join(dir, child.get_name()), onFile);
      }
    }
  }
}
export {
  _deleteFile,
  _readFile,
  _readdir,
  _walkFiles
};
