import * as DatabaseDev from '@ajs/database/beta';
import { Constructible } from '../common';
export declare const MixinSymbol: unique symbol;
export type MixinType<T> = T extends {
  [MixinSymbol]: infer A;
}
  ? A
  : never;
export declare class Modifier<Meta extends {} = {}, Options extends {} = {}> {
  protected meta: Meta;
  protected options: Options;
}
export declare class OneWayModifier<
  LockedType,
  Args extends any[] = [],
  Meta extends {} = {},
  Options extends {} = {},
> extends Modifier<Meta, Options> {
  lock(locked_value: LockedType | undefined, value: unknown, ...args: Args): LockedType;
  test(locked_value: LockedType, value: unknown, ...args: Args): boolean;
}
type ProxyOrValArray<T extends any[]> = {
  [K in keyof T]: DatabaseDev.ValueProxy.ProxyOrVal<T[K]>;
};
export declare class TwoWayModifier<
  LockedType,
  Args extends any[] = [],
  Meta extends {} = {},
  Options extends {} = {},
> extends OneWayModifier<LockedType, Args, Meta, Options> {
  unlock(locked_value: LockedType, ...args: Args): unknown;
  unlockrequest(
    data: DatabaseDev.ValueProxy.Proxy<LockedType>,
    meta: DatabaseDev.ValueProxy.Proxy<Meta>,
    ...args: ProxyOrValArray<Args>
  ): DatabaseDev.ValueProxy.Proxy<unknown>;
}
export declare class ContainerModifier<Meta extends {} = {}, Options extends {} = {}> extends TwoWayModifier<
  Record<string, unknown>,
  [key: string],
  Meta,
  Options
> {
  lock(
    locked_value: Record<string, unknown> | undefined,
    value: unknown,
    key: string,
  ): {
    [x: string]: unknown;
  };
  unlock(locked_value: Record<string, unknown>, key: string): unknown;
  unlockrequest(
    data: DatabaseDev.ValueProxy.Proxy<Record<string, unknown>>,
    meta: DatabaseDev.ValueProxy.Proxy<Meta>,
    key: DatabaseDev.ValueProxy.ProxyOrVal<string>,
  ): DatabaseDev.ValueProxy.Proxy<unknown>;
}
interface InternalType {
  meta: Record<string, object>;
  data: Record<string, any>;
}
export declare class ModifiersStaticMetadata {
  static key: symbol;
  [key: string]: Array<{
    id: string;
    modifier: Modifier;
    metaRef: {
      _ref: any;
    };
  }>;
}
export declare class ModifiersDynamicMetadata {
  static key: symbol;
  staticMeta: ModifiersStaticMetadata;
  floating: Record<string, any>;
  fields: Record<string, Record<string, any[]>>;
  constructor(target: any);
  canGet(field: string): boolean;
  get(field: string, internal: InternalType): any;
  canSet(field: string): boolean;
  set(field: string, internal: InternalType, value: unknown): void;
}
export declare function fromPlainData<T extends Constructible>(
  rawObject: Record<string, any>,
  TableClass: T,
): InstanceType<T>;
export declare function toPlainData<
  T extends {
    constructor: any;
  },
>(object: T): Record<string, any>;
export declare function fromDatabase<T extends Constructible>(rawObject: any, TableClass: T): InstanceType<T>;
export declare function toDatabase<
  T extends {
    constructor: any;
  },
>(object: T): Record<string, any>;
type ExtractModifierOptions<T> = T extends Modifier<any, infer Options> ? Options : undefined;
type ExtractModifierArgs<T> = T extends OneWayModifier<any, infer Args> ? Args : [];
export declare function attachModifier<T extends Constructible, M extends Constructible<Modifier>>(
  TableClass: T,
  Modifier: M,
  field: keyof InstanceType<T>,
  options: ExtractModifierOptions<InstanceType<M>>,
): void;
export declare function getModifiedFields<
  T extends {
    constructor: any;
  },
  M extends Constructible<Modifier>,
>(object: T, Modifier: M): (keyof T)[];
export declare function unlock<
  T extends {
    constructor: any;
  },
  M extends Constructible<Modifier>,
>(object: T, Modifier: M, fields: Array<keyof T> | undefined, ...args: ExtractModifierArgs<InstanceType<M>>): void;
type ModifierWithProxyArgs = {
  modifier: Constructible<TwoWayModifier<any, any[]>>;
  args: DatabaseDev.ValueProxy.ProxyOrVal[];
};
export declare function unlockrequest<T extends {}, K extends keyof T>(
  table: Constructible<T>,
  object: DatabaseDev.ValueProxy.Proxy<T>,
  field: K,
  modifiers: ModifierWithProxyArgs[],
): DatabaseDev.ValueProxy.Proxy<T[K]>;
export declare function lock<
  T extends {
    constructor: any;
  },
  M extends Constructible<Modifier>,
>(object: T, Modifier: M, fields: Array<keyof T> | undefined, ...args: ExtractModifierArgs<InstanceType<M>> | []): void;
export declare function testValue<
  T extends {
    constructor: any;
  },
  K extends keyof T,
>(object: T, field: K, value: T[K]): unknown;
export {};
