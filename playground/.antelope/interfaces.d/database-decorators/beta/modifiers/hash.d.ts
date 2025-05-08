import { MixinSymbol, OneWayModifier } from './common';
type Options = {
  /** Hashing algorithm (for supported algorithms refer to {@link createHash}) */
  algorithm?: string;
};
/**
 * Hash modifier. enables the use of {@link Hashed} on table fields.
 *
 * Hashed fields only contain a hash of the inserted value.
 * Because of this, you lose the ability to query the information directly.
 * You can test equality using {@link testHash}
 */
export declare class HashModifier extends OneWayModifier<
  string | undefined,
  [],
  {
    salt?: string;
  },
  Options
> {
  readonly autolock = true;
  lock(locked_value: string | undefined, value: unknown): string | undefined;
  [MixinSymbol]: {
    new (): {
      /**
       * Test a value against the stored hash.
       *
       * @param field - Name of the field to test against.
       * @param value - Value to hash and test.
       *
       * @returns Whether the new value is identical to the original or not.
       */
      testHash<This extends {}, F extends keyof This>(this: This, field: F, value: This[F]): unknown;
    };
  };
}
/**
 * Mark a Database Table class field as being hashed.
 *
 * @note The Table class MUST incorporate the {@link HashModifier} mixin.
 *
 * @param options Hash options.
 */
export declare const Hashed: (options?: Options | undefined) => import('@ajs/core/beta/decorators').PropertyDecorator;
export {};
