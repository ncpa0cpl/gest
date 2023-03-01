export declare function _readFile(path: string): Promise<string>;
export declare function _deleteFile(path: string): Promise<void>;
export declare function _readdir(dir: string): Promise<string[]>;
export declare function _walkFiles(dir: string, onFile: (root: string, name: string) => void): Promise<void>;
