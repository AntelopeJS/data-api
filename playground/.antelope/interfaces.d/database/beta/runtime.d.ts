export type QueryArg =
  | {
      type: 'value';
      value: any;
    }
  | {
      type: 'query';
      value: QueryBuilderContext;
      queryType: string;
    }
  | {
      type: 'func';
      value: QueryArg;
      args: number[];
    }
  | {
      type: 'array';
      value: QueryArg[];
    }
  | {
      type: 'object';
      value: Record<string, QueryArg>;
    }
  | {
      type: 'var';
      value: string;
    };
export type QueryBuilderContext = {
  id: string;
  args: QueryArg[];
  opts?: Record<string, any>;
}[];
export declare const runQuery: (query: QueryBuilderContext) => Promise<any>;
export declare const readCursor: (reqId: number, query: QueryBuilderContext) => Promise<IteratorResult<any, void>>;
export declare const closeCursor: (reqId: number) => Promise<void>;
