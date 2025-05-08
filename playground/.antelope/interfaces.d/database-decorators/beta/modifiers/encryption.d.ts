import * as DatabaseDev from '@ajs/database/beta';
import { MixinSymbol, TwoWayModifier } from './common';
type Options = {
  /** Encryption algorithm (for supported algorithms refer to {@link createCipheriv}) */
  algorithm?: string;
  /** Encryption key. */
  secretKey: string;
  /** Initialization Vector size. */
  ivSize?: number;
};
type Meta = {
  iv: string;
  authTag?: string;
};
/**
 * Encryption modifier. enables the use of {@link Encrypted} on table fields.
 *
 * These fields are stored encrypted in the database.
 */
export declare class EncryptionModifier extends TwoWayModifier<string, [], Meta, Options> {
  lock(locked_value: string | undefined, value: unknown): string;
  unlock(locked_value: string): any;
  unlockrequest(data: DatabaseDev.ValueProxy.Proxy<string>): DatabaseDev.ValueProxy.Proxy<unknown>;
  [MixinSymbol]: {
    new (): {};
  };
}
/**
 * Mark a Database Table class field as being encrypted.
 *
 * @note The Table class MUST incorporate the {@link EncryptionModifier} mixin.
 *
 * @param options Encryption options.
 */
export declare const Encrypted: (options: Options) => import('@ajs/core/beta/decorators').PropertyDecorator;
export {};
