import { CreateDatabaseSchemaInstance } from "@antelopejs/interface-database-decorators";
import { schemaName } from "./utils";
import "./db/user";
import "./data-api/user";

export function construct(): void {}

export async function start(): Promise<void> {
  await CreateDatabaseSchemaInstance(schemaName, "default");
}

export function destroy(): void {}

export function stop(): void {}
