// src/base/builder/build-file.ts
import { Command } from "../command/command.mjs";
import { getDirname } from "../utils/get-dirname.mjs";
import path from "../utils/path.mjs";
async function _buildFile(params) {
  const { input, output, mainSetup, fileSetup } = params;
  const args = [
    path.join(getDirname(import.meta.url), "test-builder.mjs"),
    input,
    output
  ];
  if (mainSetup) {
    args.push(mainSetup);
  }
  if (fileSetup) {
    args.push(fileSetup);
  }
  const cmd = new Command("node", ...args);
  await cmd.runSync();
}
export {
  _buildFile
};
