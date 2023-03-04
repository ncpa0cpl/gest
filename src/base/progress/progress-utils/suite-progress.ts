import type { TestHook } from "../../../user-land/test-collector";
import { SourceMapReader } from "../../sourcemaps/reader";
import { getCwd } from "../../utils/cwd";
import { Emitter } from "../../utils/emitter";
import { _getErrorMessage, _getErrorStack } from "../../utils/error-handling";
import path from "../../utils/path";
import type {
  ProgressErrorReport,
  ProgressErrorReportParsed,
} from "./progress-parsed-error";
import type { UnitFinishState, UnitProgressInitParams } from "./unit-progress";
import { UnitProgress } from "./unit-progress";

export interface SuiteProgressInitParams {
  filepath: string;
  bundle: string;
  map: string;
}

export interface SuiteUpdateParams {
  suite: symbol;
  parentUnitName?: string[];
  error?: ProgressErrorReport;
  skipped?: boolean;
}

export interface SuiteFinishState {
  testFilepath: string;
  errors: ProgressErrorReportParsed[];
  skipped?: boolean;
}

export type SuiteProgressEvents = {
  finished: (suite: SuiteFinishState, updates: UnitFinishState[]) => void;
};

export class SuiteProgress {
  readonly id = Symbol();
  readonly emitter = new Emitter<SuiteProgressEvents>();
  private readonly unitUpdates: UnitProgress[] = [];
  private readonly filepath!: string;

  readonly bundle!: string;
  readonly map!: string;

  private readonly state = {
    finished: false,
    errors: [] as Array<ProgressErrorReport>,
    skipped: false,
  };

  constructor(params: SuiteProgressInitParams) {
    Object.assign(this, params);
  }

  private getHookLink(sourceMap: SourceMapReader, hook: TestHook) {
    const hookLocation = sourceMap.getOriginalPosition(hook.line, hook.column);

    if (hookLocation == null) return undefined;

    return `${this.getSuiteFilepath()}:${hookLocation.line}:${
      hookLocation.column
    }`;
  }

  private parseErrors(sourceMap?: SourceMapReader) {
    const result: ProgressErrorReportParsed[] = [];
    for (const err of this.state.errors) {
      const message = _getErrorMessage(err.thrown);
      const stack = _getErrorStack(
        err.thrown,
        sourceMap,
        path.dirname(this.getSuiteFilepath(false))
      );

      result.push({
        origin: err.origin,
        thrown: err.thrown,
        message,
        stack,
        link:
          err.hook && sourceMap
            ? this.getHookLink(sourceMap, err.hook)
            : undefined,
      });
    }

    return result;
  }

  getSuiteFilepath(relative = true) {
    if (relative) {
      return "./" + path.relative(getCwd(), this.filepath);
    }

    return path.join(getCwd(), this.filepath);
  }

  addUnitUpdate(progressUpdate: UnitProgressInitParams) {
    const update = new UnitProgress(this, progressUpdate);
    this.unitUpdates.push(update);
  }

  addSuiteUpdate(progressUpdate: SuiteUpdateParams) {
    this.state.skipped = !!progressUpdate.skipped;

    if (progressUpdate.error) {
      this.state.errors.push(progressUpdate.error);
    }
  }

  async finish() {
    const sourceMap = await SourceMapReader.newFromMapFile(this.map);

    this.state.finished = true;

    this.emitter.emit(
      "finished",
      {
        errors: this.parseErrors(sourceMap),
        testFilepath: this.getSuiteFilepath(),
        skipped: this.state.skipped,
      },
      this.unitUpdates.map((u) => u.getFinishState(sourceMap))
    );
  }
}
