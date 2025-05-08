import { Table } from './table';
export type Status = 'created' | 'unchanged';
export interface InitInfo {
  /** Database creation status. */
  databaseStatus: Status;
  /** Tables creation status. */
  tablesStatus: Record<string, Status>;
  /** Pre-existing tables that are no longer used. */
  oldTables: string[];
}
/**
 * Initializes a database with the given name and tables.
 *
 * @param databaseName Database name
 * @param tables Table class list
 * @returns Initialization result
 */
export declare function InitializeDatabase(databaseName: string, tables: Record<string, Table>): Promise<InitInfo>;
