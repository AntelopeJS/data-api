import { Class } from '@ajs/core/beta/decorators';
import { RequestContext } from '@ajs/api/beta';
import { ValueProxy } from '@ajs/database/beta';
import { DataControllerCallbackWithOptions } from '.';
import { ContainerModifier } from '@ajs/database-decorators/beta/modifiers/common';
import { Table } from '@ajs/database-decorators/beta';
/**
 * Field access mode enum.
 */
export declare enum AccessMode {
    ReadOnly = 1,
    WriteOnly = 2,
    ReadWrite = 3
}
/**
 * DataAPI Metadata field information.
 */
export interface FieldData {
    /**
     * Field name in-database.
     */
    dbName?: string;
    /**
     * Field access mode.
     *
     * @see {@link AccessMode}
     */
    mode?: AccessMode;
    /**
     * DB Fields that should be selected for this field.
     */
    listable?: Record<string, string[]>;
    /**
     * Set of api methods for which the field must be set.
     */
    mandatory?: Set<string>;
    /**
     * Whether the DataAPI can be sorted using this field.
     */
    sortable?: {
        indexed?: boolean;
    };
    /**
     * Foreign key reference.
     */
    foreign?: [table: string, tableClass?: Class<Table>, index?: string, multi?: true, pluck?: string[]];
    /**
     * Value validator callback.
     */
    validator?: (value: unknown) => boolean | Promise<boolean>;
    /**
     * Field property descriptor.
     */
    desc?: PropertyDescriptor;
    /**
     * Whether or not an `eq` filter with this field name can use an indexed lookup.
     */
    indexable?: boolean;
}
type Comparison = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
export type FilterValue = [value: string, mode: Comparison];
/**
 * Filter callback.
 */
export type FilterFunction<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>> = (context: RequestContext & {
    this: T;
}, proxy: ValueProxy.Proxy<any>, key: string, value: FilterValue[0], mode: FilterValue[1], row: ValueProxy.Proxy<U>) => ValueProxy.ProxyOrVal<boolean>;
/**
 * Metadata Class containing the DataAPI information.
 */
export declare class DataAPIMeta {
    readonly target: Class;
    /**
     * Key symbol.
     */
    static key: symbol;
    readonly filters: Record<string, FilterFunction<any>>;
    /**
     * Fields information.
     */
    readonly fields: Record<string, FieldData>;
    /**
     * Fields to pluck in listing endpoints.
     */
    readonly pluck: Record<string, Set<string>>;
    /**
     * Key of the DataAPI class containing a database table instance.
     */
    modelKey?: string;
    /**
     * Keys of the DataAPI class containing database modifier keys.
     */
    modifierKeys: Map<typeof ContainerModifier<any>, string>;
    /**
     * Schema name where the table is registered.
     */
    schemaName: string;
    /**
     * Database Schema class.
     */
    tableClass: Class;
    /**
     * Database Schema table name.
     */
    tableName: string;
    /**
     * Readable fields.
     */
    readonly readable: Record<'getters' | 'props', [string, FieldData][]>;
    /**
     * Writeable fields.
     */
    readonly writable: Record<'setters' | 'props', [string, FieldData][]>;
    /**
     * Registered DataAPI endpoints.
     */
    readonly endpoints: Record<string, DataControllerCallbackWithOptions>;
    constructor(target: Class);
    inherit(parent: DataAPIMeta): void;
    private field;
    private recomputeListable;
    private recomputeAccess;
    /**
     * Sets the access mode of the given field.
     *
     * @param name Field name
     * @param mode Access mode
     */
    setMode(name: string, mode: AccessMode): this;
    /**
     * Sets whether a field should be included in list endpoints.
     *
     * @param name Field name
     * @param requiredFields Boolean or table field list
     * @param mode List mode (default: 'list')
     */
    setListable(name: string, requiredFields: boolean | string[], mode?: string): this;
    /**
     * Sets whether or not this field must be present in requests for the given method.
     *
     * @param name Field name
     * @param modes DataAPI methods
     */
    setMandatory(name: string, modes: string[]): this;
    /**
     * Sets whether or not this field can be used to sort in list endpoints.
     *
     * @param name Field name
     * @param active Sortable
     * @param noIndex Ignore database indexes
     * @returns
     */
    setSortable(name: string, active: boolean, noIndex?: boolean): this;
    /**
     * Declares a field to be a foreign key.
     *
     * @param name Field name
     * @param table Other table
     * @param index Other table index
     * @param multi Index is a multi index
     */
    setForeign(name: string, table: string | Class<Table>, index?: string, multi?: boolean, pluck?: string[]): this;
    /**
     * Set the validation function of a field.
     *
     * @param name Field name
     * @param validator Value validator callback
     */
    setValidator(name: string, validator?: (value: unknown) => boolean | Promise<boolean>): this;
    /**
     * Updates the known field descriptor of this field.
     *
     * @param name Field name
     * @param desc Field descriptor
     */
    setDescriptor(name: string, desc?: PropertyDescriptor): this;
    /**
     * Creates a filter.
     *
     * @param name Filter name
     * @param func Filter callback
     * @param index
     */
    setFilter(name: string, func: FilterFunction<Record<string, any>, Record<string, any>>, useIndex?: boolean): this;
    /**
     * Sets the key containing the database table instance.
     *
     * @param name Field name
     */
    setModelKey(name: string): this;
    /**
     * Sets the key containing the key for the given database modifier.
     *
     * @param name Field name
     * @param modifierClass Modifier
     */
    setModifierKey(name: string, modifierClass: typeof ContainerModifier<any>): this;
    /**
     * Adds the given endpoint to the DataAPI
     *
     * @param key field name
     * @param endpoint callback information
     */
    addEndpoint(key: string, endpoint?: DataControllerCallbackWithOptions): void;
}
/**
 * Sets the access mode of a DataAPI field.
 *
 * @param mode Access mode
 */
export declare const Access: (mode: AccessMode) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Sets the listable state of a DataAPI field.
 *
 * Listable fields will be included in list method calls.
 *
 * Listable getters must specificy the list of in-database field names they use.
 *
 * @param requiredFields Boolean or table field list
 */
export declare const Listable: (requiredFields?: boolean | string[] | undefined, mode?: string | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Declares a field to be mandatory in calls to the given methods.
 *
 * @param modes DataAPI methods (ex: `new`, `edit`)
 */
export declare const Mandatory: (...args: string[]) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Declares a field as being optional.
 *
 * This must be used on fields with no other decorators.
 */
export declare const Optional: () => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Declares a field to be useable as the sorting key.
 *
 * @param options Options
 */
export declare const Sortable: (options?: {
    noIndex?: boolean;
} | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Declares a field to be a foreign key.
 *
 * @param table Other table
 * @param index Other table index
 * @param multi Index is a multi index
 */
export declare const Foreign: (table: string | Class<Table>, index?: string | undefined, multi?: boolean | undefined, pluck?: string[] | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Set the validation function of a field.
 *
 * @param validator Value validator callback
 */
export declare const Validator: (validator: (val: unknown) => boolean | Promise<boolean>) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
type ComparisonOperation = (proxy: ValueProxy.Proxy<string>, val: string) => ValueProxy.ProxyOrVal<boolean>;
export declare const comparisonOperations: Record<Comparison, ComparisonOperation>;
/**
 * Creates a field filter.
 *
 * @param func Custom filter function
 */
export declare const Filter: <T extends Record<string, any>>(func?: FilterFunction<T, T>, useIndex?: boolean) => (target: T, propertyKey: string | symbol) => void;
/**
 * Sets which field will contain the reference to the database model instance.
 */
export declare const ModelReference: () => import("@ajs/core/beta/decorators").PropertyDecorator;
/**
 * Sets which field will contain the key for the given database modifier.
 *
 * @param modifierClass Modifier
 */
export declare const ModifierKey: (modifierClass: typeof ContainerModifier<any>) => import("@ajs/core/beta/decorators").PropertyDecorator;
export {};
