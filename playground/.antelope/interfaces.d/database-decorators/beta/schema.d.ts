import { ClassDecorator } from '@ajs/core/beta/decorators';
import { Table } from './table';
export declare const DEFAULT_SCHEMA: unique symbol;
export type DatabaseSchema = Record<string, Table>;
export declare const RegisterTable: (tableName: string, schemaName?: string) => ClassDecorator<typeof Table>;
export declare const GetTablesFromSchema: (schemaName: string) => DatabaseSchema;
export declare function InitializeDatabaseFromSchema(
  databaseName: string,
  schemaName: string,
): Promise<import('./database').InitInfo>;
