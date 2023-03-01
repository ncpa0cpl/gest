// src/base/command/command.ts
import GLib from "gi://GLib";
var Command = class {
  constructor(command, ...options) {
    this.command = command;
    this.rawOptions = options;
    this.options = this.sanitizeOptions(options);
  }
  options;
  rawOptions;
  readOutput(stream, lineBuffer, reject) {
    stream.read_line_async(0, null, (stream2, res) => {
      try {
        if (stream2) {
          const line = stream2.read_line_finish_utf8(res)[0];
          if (line !== null) {
            lineBuffer.push(line);
            this.readOutput(stream2, lineBuffer, reject);
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  sanitizeOptions(options) {
    return options.map((option) => {
      if (option.includes(" ") && !option.startsWith('"') && !option.endsWith('"')) {
        return option.replace(/\s/g, "\\ ");
      }
      return option;
    });
  }
  uint8ArrayToString(bytes) {
    let result = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    return result;
  }
  getFullCommand() {
    return this.command + " " + this.options.join(" ");
  }
  runSync() {
    const [, stdout, stderr, status] = GLib.spawn_command_line_sync(
      this.getFullCommand()
    );
    if (status !== 0) {
      throw new Error(stderr ? this.uint8ArrayToString(stderr) : "");
    }
    return stdout ? this.uint8ArrayToString(stdout) : "";
  }
  async run() {
    const [, pid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
      null,
      [this.command, ...this.rawOptions],
      null,
      GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,
      null
    );
    if (stdin)
      GLib.close(stdin);
    if (!pid)
      throw new Error("Failed to run command");
    if (!stdout)
      throw new Error("Failed to get stdout");
    if (!stderr)
      throw new Error("Failed to get stderr");
    return new Promise((resolve, reject) => {
      GLib.child_watch_add(GLib.PRIORITY_DEFAULT_IDLE, pid, (pid2, status) => {
        GLib.spawn_close_pid(pid2);
        if (status === 0) {
          resolve("");
        } else {
          reject(new Error("Command failed"));
        }
      });
    });
  }
};
export {
  Command
};
