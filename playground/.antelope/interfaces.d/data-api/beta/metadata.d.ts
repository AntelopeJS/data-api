import { Class } from '@ajs/core/beta/decorators';
import { RequestContext } from '@ajs/api/beta';
import { ValueProxy } from '@ajs/database/beta';
import { DataControllerCallbackWithOptions } from '.';
export declare enum AccessMode {
    ReadOnly = 1,
    WriteOnly = 2,
    ReadWrite = 3
}
export interface FieldData {
    dbName?: string;
    mode?: AccessMode;
    listable?: Record<string, string[]>;
    mandatory?: Set<string>;
    sortable?: {
        indexed?: boolean;
    };
    foreign?: [table: string, index?: string, multi?: true];
    validator?: (value: unknown) => boolean;
    desc?: PropertyDescriptor;
}
type Comparison = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
export type FilterValue = [value: any, mode: Comparison];
export type FilterFunction<T extends Record<string, any>, U = any> = (context: RequestContext & {
    this: T;
}, row: ValueProxy.Proxy<U>, key: string, ...args: FilterValue) => ValueProxy.ProxyOrVal<boolean>;
export declare class DataAPIMeta {
    readonly target: Class;
    static key: symbol;
    readonly filters: Record<string, FilterFunction<any>>;
    readonly fields: Record<string, FieldData>;
    readonly pluck: Record<string, Set<string>>;
    modelKey?: string;
    readonly readable: Record<'getters' | 'props', [string, FieldData][]>;
    readonly writable: Record<'setters' | 'props', [string, FieldData][]>;
    readonly endpoints: Record<string, DataControllerCallbackWithOptions>;
    constructor(target: Class);
    inherit(parent: DataAPIMeta): void;
    private field;
    private recomputeListable;
    private recomputeAccess;
    setMode(name: string, mode: AccessMode): this;
    setListable(name: string, requiredFields: boolean | string[], mode?: string): this;
    setMandatory(name: string, modes: string[]): this;
    setSortable(name: string, active: boolean, noIndex?: boolean): this;
    setForeign(name: string, table: string, index?: string, multi?: boolean): this;
    setValidator(name: string, validator?: (value: unknown) => boolean): this;
    setDescriptor(name: string, desc?: PropertyDescriptor): this;
    setFilter(name: string, func: FilterFunction<Record<string, any>, Record<string, any>>): this;
    setModelKey(name: string): this;
    addEndpoint(key: string, endpoint?: DataControllerCallbackWithOptions): void;
}
export declare const Access: (mode: AccessMode) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Listable: (requiredFields?: boolean | string[] | undefined, mode?: string | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Mandatory: (...args: string[]) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Optional: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Sortable: (options?: {
    noIndex?: boolean;
} | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Foreign: (table: string, index?: string | undefined, multi?: boolean | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Validator: (validator: (val: unknown) => boolean) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
export declare const Filter: <T extends Record<string, any>>(func?: FilterFunction<T, T>) => (target: T, propertyKey: string | symbol) => void;
export declare const ModelReference: () => import("@ajs/core/beta/decorators").PropertyDecorator;
export {};
