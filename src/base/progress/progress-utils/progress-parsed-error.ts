import type { TestHook } from "../../../user-land/test-collector";

export type ProgressErrorReport = {
  thrown: unknown;
  origin: "lifecycleHook" | "test" | "gest";
  hook?: TestHook;
};

export type ProgressErrorReportParsed = {
  thrown: unknown;
  origin: "lifecycleHook" | "test" | "gest";
  message: string;
  stack?: string;
  link?: string;
};
