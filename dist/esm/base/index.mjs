// src/base/index.ts
import Gtk from "gi://Gtk?version=3.0";
import system from "system";
import { html, MarkupFormatter, Output } from "../_vendors/termx-markup.mjs";
import { Command } from "./command/command.mjs";
import { TestRunner } from "./test-runner.mjs";
import { _getArgValue } from "./utils/args.mjs";
import { getCwd, setCwd } from "./utils/cwd.mjs";
import { _getErrorMessage } from "./utils/error-handling.mjs";
import { _readdir, _readFile, _walkFiles } from "./utils/filesystem.mjs";
import { _hasProperties } from "./utils/has-properties.mjs";
import path from "./utils/path.mjs";
var exitCode = 0;
async function loadConfig() {
  const files = await _readdir(getCwd());
  if (files.includes("gest.config.json")) {
    const configText = await _readFile(path.join(getCwd(), "gest.config.json"));
    const config = JSON.parse(configText);
    let isValid = false;
    if (typeof config === "object") {
      if (_hasProperties(config, "testDirectory", "parallel")) {
        if (typeof config.testDirectory === "string" && typeof config.parallel === "number") {
          isValid = true;
        }
      }
      if (_hasProperties(config, "setup")) {
        if (typeof config.setup !== "string") {
          isValid = false;
        }
      }
    }
    if (isValid) {
      return config;
    } else {
      Output.print(
        // prettier-ignore
        html`<span color="yellow">Invalid config file. Using default config instead.</span>`
      );
    }
  }
}
async function main() {
  try {
    const pargs = imports.system.programArgs;
    if (pargs.includes("--help") || pargs.includes("-h")) {
      Output.print(html`
        <line bold>gest</line>
        <line>A simple test runner for Gnome JavaScript</line>
        <br />
        <line>Usage: gest [options]</line>
        <br />
        <line>Options:</line>
        <line>  -h, --help</line>
        <line>  -v, --verbose</line>
        <line>  -t, --testNamePattern [regex]</line>
        <line>  -p, --testPathPattern [regex]</line>
      `);
      return;
    }
    const testNamePattern = _getArgValue(pargs, "-t", "--testNamePattern");
    const testFilePattern = _getArgValue(pargs, "-p", "--testPathPattern");
    const options = {
      verbose: pargs.includes("--verbose") || pargs.includes("-v"),
      testNamePattern,
      testFilePattern
    };
    const config = await loadConfig();
    const testsDir = config?.testDirectory ?? "./__tests__";
    const parallel = config?.parallel ?? 4;
    const testFileMatcher = /.*\.test\.(m|c){0,1}(ts|js|tsx|jsx)$/;
    const setupFileMatcher = /.*\.setup\.(m|c){0,1}js$/;
    const testFiles = [];
    await _walkFiles(testsDir, (root, name) => {
      if (testFileMatcher.test(name)) {
        testFiles.push({
          dirname: root,
          filename: name,
          basename: name.replace(/\.test\.(m|c){0,1}(ts|js|tsx|jsx)$/, ""),
          testFile: path.join(root, name)
        });
      }
    });
    await _walkFiles(testsDir, (root, name) => {
      if (setupFileMatcher.test(name)) {
        const basename = name.replace(
          /\.setup\.(m|c){0,1}(ts|js|tsx|jsx)$/,
          ""
        );
        const unit = testFiles.find(
          (unit2) => unit2.basename === basename && unit2.dirname === root
        );
        if (unit) {
          unit.setupFile = path.join(root, name);
        }
      }
    });
    const testRunners = Array.from(
      { length: parallel },
      () => new TestRunner(testFiles, config?.setup).setOptions(options)
    );
    await Promise.all(testRunners.map((runner) => runner.start()));
    if (testRunners.some((runner) => !runner.success)) {
      exitCode = 1;
      print("");
      for (const runner of testRunners) {
        for (const errOutput of runner.testErrorOutputs) {
          errOutput.flush();
        }
      }
      Output.println(html`<br /><span color="red">Tests have failed.</span>`);
    } else {
      Output.println(
        html`<br /><span color="green">All tests have passed.</span>`
      );
    }
  } catch (e) {
    Output.print(html`<span color="red">${_getErrorMessage(e)}</span>`);
    exitCode = 1;
  } finally {
    Gtk.main_quit();
  }
}
try {
  setCwd(new Command("pwd").runSync().trim());
  Output.setDefaultPrintMethod(print);
  MarkupFormatter.defineColor("customBlack", "#1b1c26");
  setTimeout(() => main());
  Gtk.main();
  system.exit(exitCode);
} catch (e) {
  print(String(e));
  system.exit(1);
}
