import * as DatabaseDev from '@ajs/database/beta';
import { Constructible, DeepPartial } from './common';
import { Class } from '@ajs/core/beta/decorators';
import { Database } from '@ajs/database/beta';
import { RequestContext } from '@ajs/api/beta';
export type DataModel<T = any> = {
  new (database: DatabaseDev.Database): {
    readonly database: DatabaseDev.Database;
    readonly table: DatabaseDev.Table<T>;
  };
  fromDatabase(obj: any): T | undefined;
  fromPlainData(obj: any): T;
};
/**
 * Utility Class factory to create a basic Data Model with 1 table.
 *
 * @param dataType Database Table class
 * @param tableName Table name in Database
 */
export declare function BasicDataModel<T extends {}, Name extends string>(
  dataType: Constructible<T>,
  tableName: Name,
): {
  new (database: DatabaseDev.Database<{ [K in Name]: T }>): {
    /**
     * AQL Table reference.
     */
    readonly table: DatabaseDev.Table<T>;
    readonly database: DatabaseDev.Database<{ [K in Name]: T }>;
    /**
     * Get a single element from the table using its primary key.
     *
     * @param id Primary key value
     * @returns Table class instance
     */
    get(id: string): Promise<Awaited<T> | undefined>;
    /**
     * Get multiple elements from the table using a given index.
     *
     * @param index Index name
     * @param keys Index value(s)
     * @returns Array of Table class instances.
     */
    getBy(index: keyof T, ...keys: any[]): Promise<T[]>;
    /**
     * Get all the elements from the table.
     *
     * @returns Array of Table class instances.
     */
    getAll(): Promise<T[]>;
    /**
     * Insert some data into the table.
     *
     * @param obj Table class instance or plain data
     * @param options Insert options
     * @returns Insert result
     */
    insert(
      obj: DeepPartial<T> | Array<DeepPartial<T>>,
      options?: DatabaseDev.Options.Insert,
    ): Promise<DatabaseDev.Result.Write<T>>;
    /**
     * Updates a single element in the table.
     *
     * @param id Primary key value
     * @param obj Table class instance or plain data
     * @param options Update options
     * @returns Update result
     */
    update(id: string, obj: DeepPartial<T>, options?: DatabaseDev.Options.Update): Promise<DatabaseDev.Result.Write<T>>;
    /**
     * Updates a single element in the table.
     *
     * @param id Primary key value
     * @param obj Table class instance or plain data
     * @param options Update options
     * @returns Update result
     */
    update(obj: DeepPartial<T>, options?: DatabaseDev.Options.Update): Promise<DatabaseDev.Result.Write<T>>;
    /**
     * Delete an element from the table.
     *
     * @param id Primary key value
     * @returns Delete result
     */
    delete(id: string): Promise<DatabaseDev.Result.Write<T | null>>;
  };
  /**
   * Converts some plain data into an instance of the Table class.
   *
   * @param obj Plain data object containing the table fields
   * @returns Table class instance
   */
  fromPlainData(obj: any): T;
  /**
   * Converts an object acquired from the database into a Table class instance.
   *
   * @param obj Object resulting from a database get
   * @returns Table class instance
   */
  fromDatabase(obj: any): T | undefined;
  /**
   * Converts a Table class instance into an object fit to be inserted in the database.
   *
   * @param obj Table class instance
   * @returns Database-ready data
   */
  toDatabase(obj: any): Record<string, any>;
};
export declare function GetModel<M extends InstanceType<DataModel>>(cl: Class<M>, databaseName: string): M;
export declare const StaticModel: (
  cl: Class<{
    readonly database: DatabaseDev.Database;
    readonly table: DatabaseDev.Table<any>;
  }>,
  databaseName: string,
) => import('@ajs/core/beta/decorators').PropertyDecorator & import('@ajs/core/beta/decorators').ParameterDecorator;
export declare const DynamicModel: (
  cl: Class<{
    readonly database: DatabaseDev.Database;
    readonly table: DatabaseDev.Table<any>;
  }>,
  callback: (ctx: RequestContext) => string,
) => import('@ajs/core/beta/decorators').PropertyDecorator & import('@ajs/core/beta/decorators').ParameterDecorator;
