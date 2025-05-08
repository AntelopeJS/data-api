import { MixinType, MixinSymbol } from './modifiers/common';
import { ClassDecorator } from '@ajs/core/beta/decorators';
import { Constructible } from './common';
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export declare const TableMetaSymbol: unique symbol;
export declare const TableRefSymbol: unique symbol;
export type ExtractTableMeta<T> = T extends { [TableMetaSymbol]: infer Meta } ? (Meta extends {} ? Meta : never) : {};
export interface TableClass<Base = {}, Args extends any[] = [], Meta extends {} | undefined = undefined> {
  new (...args: Args): Base &
    (Meta extends {}
      ? {
          [TableMetaSymbol]: Meta;
        }
      : {});
  with<
    This extends TableClass,
    T extends Constructible<{
      [MixinSymbol]: Constructible;
    }>[] = [],
  >(
    this: This,
    ...other: T
  ): TableClass<
    InstanceType<This> & UnionToIntersection<InstanceType<MixinType<InstanceType<T[number]>>>>,
    ConstructorParameters<This>,
    ExtractTableMeta<InstanceType<This>> | ExtractTableMeta<InstanceType<T[number]>>
  >;
}
/**
 * Database Table superclass
 */
export declare class Table {
  /**
   * Supplement the superclass with Modifier mixins.
   *
   * @param others List of Modifier mixin classes
   * @returns New superclass
   */
  static with<
    This extends typeof Table,
    T extends Constructible<{
      [MixinSymbol]: Constructible;
    }>[] = [],
  >(
    this: This,
    ...others: T
  ): TableClass<
    InstanceType<This> & UnionToIntersection<InstanceType<MixinType<InstanceType<T[number]>>>>,
    ConstructorParameters<This>,
    ExtractTableMeta<InstanceType<This>> | ExtractTableMeta<InstanceType<T[number]>>
  >;
}
/**
 * Database Table Index decorator.
 *
 * Available options:
 * - `primary`: This field is the primary key for the table.
 * - `group`: Index name for multi-field indexes.
 *
 * @param options Options
 */
export declare const Index: (
  options?:
    | {
        primary?: boolean | undefined;
        group?: string | undefined;
      }
    | undefined,
) => import('@ajs/core/beta/decorators').PropertyDecorator;
type AwaitableArray<T> = Promise<T | T[]> | T | T[];
/**
 * Database Table class decorator to create default data on table creation.
 *
 * @param generator Data generator
 */
export declare const Fixture: <T extends typeof Table>(
  generator: (p: T) => AwaitableArray<InstanceType<T>>,
) => ClassDecorator<T>;
export {};
