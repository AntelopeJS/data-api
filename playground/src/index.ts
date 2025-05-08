import { Logging } from '@ajs/logging/beta';
import { InitializeDatabaseFromSchema } from '@ajs/database-decorators/beta';
import { databaseName } from './utils';
import './db/user';
import './data-api/user';

export function construct(config: unknown): void {
  // Set things up when module is loaded
  Logging.Debug('DATA-API module playground initialized with config:' + JSON.stringify(config));
}

export async function start(): Promise<void> {
  await InitializeDatabaseFromSchema(databaseName, 'default');
}

export function destroy(): void {}

export function stop(): void {}
