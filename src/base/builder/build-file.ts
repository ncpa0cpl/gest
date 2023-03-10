import { Command } from "../command/command";
import { btoa } from "../utils/base64";
import type { ConfigFacade } from "../utils/config";
import { getDirname } from "../utils/get-dirname";
import path from "../utils/path";
import type {
  BSMJsonValue,
  BSMValue,
  BuildScriptMessage,
} from "./build-script-message";

export async function _buildFile(params: {
  input: string;
  output: string;
  mainSetup?: string;
  fileSetup?: string;
  globals?: ConfigFacade["globals"];
}) {
  const { input, output, mainSetup, fileSetup, globals } = params;

  const msg: BuildScriptMessage = {
    input,
    output,
    globals: {
      ...Object.fromEntries(
        Object.entries(globals ?? {}).map(([k, v]) => {
          if (typeof v !== "object")
            return [k, { kind: "value", value: v } satisfies BSMValue];
          else
            return [
              k,
              {
                kind: "json",
                value: { json: JSON.stringify(v) },
              } satisfies BSMJsonValue,
            ];
        })
      ),
      console: {
        kind: "identifier",
        value: "__gest_console",
      },
      print: {
        kind: "identifier",
        value: "__gest_console.print",
      },
    },
    setup: {
      main: mainSetup,
      secondary: fileSetup,
    },
  };

  const args = [
    path.join(getDirname(import.meta.url), "esbuild-script.mjs"),
    btoa(JSON.stringify(msg)),
  ];

  const cmd = new Command("node", ...args);

  await cmd.runSync();
}
