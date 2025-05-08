import { RequestContext } from '@ajs/api/beta';
import { Database, Datum, Stream, Table, ValueProxy } from '@ajs/database/beta';
import { DataModel } from '@ajs/database-decorators/beta/model';
import { DataAPIMeta, FilterValue } from './metadata';
export declare function assert(condition: any, err: string, errCode?: number): asserts condition;
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
        sortDirection?: 'asc' | 'desc';
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
    function Foreign(db: Database, meta: DataAPIMeta, obj: ValueProxy.Proxy<Record<string, any>>, pluck?: Set<string>): ValueProxy.Proxy<Record<string, any>>;
    function ReadProperties(obj: any, meta: DataAPIMeta, dbData: any, onlyList?: boolean): Promise<Record<string, any>>;
    function WriteProperties(obj: any, meta: DataAPIMeta, bodyData: Record<string, any>, existingDBData?: Record<string, any>): Promise<Record<string, any>>;
    function Get(table: Table, id: string | ValueProxy.Proxy<string>, index?: string): import("@ajs/database/beta").SingleSelection<any>;
    function List<T extends Record<string, any>>(obj: any, meta: DataAPIMeta, request: Stream<T>, reqCtx: RequestContext, sorting?: [string, 'asc' | 'desc' | undefined], filters?: Record<string, FilterValue>): [sorted: Stream<T>, total: Datum<number>];
    function Delete(table: Table, id: string | string[]): import("@ajs/database/beta").Query<import("@ajs/database/beta").Result.Write<any>>;
}
export declare namespace Validation {
    function MandatoryFields(meta: DataAPIMeta, obj: any, type: string): void;
    function ValidateTypes(meta: DataAPIMeta, obj: Record<string, any>): void;
    function ClearInternal(meta: DataAPIMeta, obj: Record<string, any> | Array<Record<string, any>>): void;
}
