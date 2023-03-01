export declare class Base64VLQ {
    char_to_integer: Record<string, number>;
    integer_to_char: Record<number, string>;
    constructor();
    decode(string: string): [number, number, number, number, number | undefined];
    encode(value: number | number[]): string;
    encode_integer(num: number): string;
}
