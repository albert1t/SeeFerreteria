declare module 'csv-parser' {
  import { Transform } from 'stream';

  interface CsvParserOptions {
    separator?: string;
    quote?: string;
    escape?: string;
    newline?: string;
    headers?: string[] | boolean;
    mapHeaders?: (args: { header: string; index: number }) => string | null;
    mapValues?: (args: { header: string; index: number; value: any }) => any;
    skipLines?: number;
    maxRowBytes?: number;
  }

  function csvParser(options?: CsvParserOptions): Transform;

  export default csvParser;
}
