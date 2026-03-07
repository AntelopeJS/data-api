import { type RequestContext } from "@ajs/api/beta";
import { type Datum, type SchemaInstance, Stream, type Table, type ValueProxy } from "@ajs/database/beta";
import type { DataModel } from "@ajs/database-decorators/beta/model";
import type { DataAPIMeta, FilterValue } from "./metadata";
export declare namespace Parameters {
    export function GetOptionOverrides<T extends Record<string, any>>(reqCtx: RequestContext): T;
    export function ExtractFilters(reqCtx: RequestContext, meta: DataAPIMeta): Record<string, FilterValue>;
    const converters: {
        number: (val: string) => number;
        int: (val: string) => number;
        bool: (val: string) => boolean;
        string: (val: string) => string;
    };
    type ConvertersKey = keyof typeof converters;
    type GenericParams<T extends Record<string, any>> = {
        [K in keyof T]: ConvertersKey | `multi:${ConvertersKey}` | ((reqCtx: RequestContext, meta: DataAPIMeta) => any);
    };
    export function ExtractGeneric<T extends Record<string, any>>(reqCtx: RequestContext, meta: DataAPIMeta, dynamic: GenericParams<Partial<T>>): Partial<T>;
    export interface ListParameters {
        filters?: Record<string, FilterValue>;
        offset?: number;
        limit?: number;
        sortKey?: string;
        sortDirection?: "asc" | "desc";
        maxPage?: number;
        noForeign?: boolean;
        noPluck?: boolean;
        pluckMode?: string;
    }
    export const List: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").ParameterDecorator;
    export interface GetParameters {
        id: string;
        index?: string;
        noForeign?: string;
    }
    export const Get: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").ParameterDecorator;
    export interface NewParameters {
        noMandatory?: string;
    }
    export const New: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").ParameterDecorator;
    export interface EditParameters {
        id: string;
        index?: string;
        noMandatory?: string;
    }
    export const Edit: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").ParameterDecorator;
    export interface DeleteParameters {
        id: string[];
    }
    export const Delete: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").ParameterDecorator;
    export {};
}
export declare namespace Query {
    function GetModel(obj: any, meta: DataAPIMeta): InstanceType<DataModel> & {
        constructor: DataModel;
    };
    function Foreign(db: SchemaInstance<any>, meta: DataAPIMeta, query: Stream<any>, pluck?: Set<string>): Stream<any>;
    function Foreign(db: SchemaInstance<any>, meta: DataAPIMeta, query: Datum<any>, pluck?: Set<string>): Datum<any>;
    function ReadProperties(obj: any, meta: DataAPIMeta, dbData: any, action?: string, onlyList?: boolean): Promise<Record<string, any>>;
    function WriteProperties(obj: any, meta: DataAPIMeta, bodyData: Record<string, any>, action?: string, existingDBData?: Record<string, any>): Promise<Record<string, any>>;
    function Get(table: Table<any>, id: string | ValueProxy<string>, index?: string): Datum<any>;
    function List<T extends Record<string, any>>(obj: any, meta: DataAPIMeta, request: Table<T>, reqCtx: RequestContext, sorting?: [string, "asc" | "desc" | undefined], filters?: Record<string, FilterValue>): [sorted: Stream<T>, total: Datum<number>];
    function Delete(table: Table<any>, id: string | string[]): import("@ajs/database/beta").Query<number>;
}
export declare namespace Validation {
    function MandatoryFields(meta: DataAPIMeta, obj: any, type: string): void;
    function ValidateTypes(meta: DataAPIMeta, obj: Record<string, any>): Promise<void>;
    function Lock(obj: any, meta: DataAPIMeta, data: any): void;
    function Unlock(obj: any, meta: DataAPIMeta, dbData: any): void;
    function UnlockRequest<T extends {}, K extends keyof T>(obj: any, meta: DataAPIMeta, row: ValueProxy<T>, field: K): ValueProxy<T[K]>;
    function ClearInternal(meta: DataAPIMeta, obj: Record<string, any> | Array<Record<string, any>>): void;
}
