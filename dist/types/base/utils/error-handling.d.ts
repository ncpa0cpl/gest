import type { ExpectError } from "../../user-land";
import type { SourceMap } from "../sourcemaps/reader";
export declare function _isExpectError(e: any): e is ExpectError;
export declare function _getErrorMessage(e: unknown): string;
export declare function _getErrorStack(e: unknown, sourceMap?: SourceMap): string;
