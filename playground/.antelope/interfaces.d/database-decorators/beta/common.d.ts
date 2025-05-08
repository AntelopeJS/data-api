export type Constructible<T = {}, A extends any[] = any[]> = {
  new (...args: A): T;
};
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U1>
    ? Array<DeepPartial<U1>>
    : T[K] extends ReadonlyArray<infer U2>
      ? ReadonlyArray<DeepPartial<U2>>
      : DeepPartial<T[K]>;
};
/**
 * Table class Metadata.
 */
export declare class DatumStaticMetadata {
  static key: symbol;
  readonly indexes: Record<string, Array<string>>;
  primary: string;
  generator?: (cl: any) => any;
  addIndex(key: string, group: string): void;
}
export declare function getMetadata<T, U extends {}>(
  target: U,
  meta: Constructible<T, [U]> & {
    key: symbol;
  },
  inherit?: boolean,
): T;
