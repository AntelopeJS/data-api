import { Class } from '@ajs/core/beta/decorators';
import { RequestContext } from '@ajs/api/beta';
import { ValueProxy } from '@ajs/database/beta';
import { DataControllerCallbackWithOptions } from '.';
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
     * Whether or not the DataAPI can be sorted using this field.
     */
    sortable?: {
        indexed?: boolean;
    };
    /**
     * Foreign key reference.
     */
    foreign?: [table: string, index?: string, multi?: true];
    /**
     * Value validator callback.
     */
    validator?: (value: unknown) => boolean;
    /**
     * Field property descriptor.
     */
    desc?: PropertyDescriptor;
}
type Comparison = 'eq' | 'ne' | 'gt' | 'ge' | 'lt' | 'le';
export type FilterValue = [value: any, mode: Comparison];
/**
 * Filter callback.
 */
export type FilterFunction<T extends Record<string, any>, U = any> = (context: RequestContext & {
    this: T;
}, row: ValueProxy.Proxy<U>, key: string, ...args: FilterValue) => ValueProxy.ProxyOrVal<boolean>;
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
     * Sets whether or not a field should be included in list endpoints.
     *
     * @param name Field name
     * @param requiredFields Boolean or table field list
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
    setForeign(name: string, table: string, index?: string, multi?: boolean): this;
    /**
     * Set the validation function of a field.
     *
     * @param name Field name
     * @param validator Value validator callback
     */
    setValidator(name: string, validator?: (value: unknown) => boolean): this;
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
     */
    setFilter(name: string, func: FilterFunction<Record<string, any>, Record<string, any>>): this;
    /**
     * Sets the key containing the database table instance.
     *
     * @param name Field name
     */
    setModelKey(name: string): this;
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
export declare const Foreign: (table: string, index?: string | undefined, multi?: boolean | undefined) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Set the validation function of a field.
 *
 * @param validator Value validator callback
 */
export declare const Validator: (validator: (val: unknown) => boolean) => import("@ajs/core/beta/decorators").PropertyDecorator & import("@ajs/core/beta/decorators").MethodDecorator;
/**
 * Creates a field filter.
 *
 * @param func Custom filter function
 */
export declare const Filter: <T extends Record<string, any>>(func?: FilterFunction<T, T>) => (target: T, propertyKey: string | symbol) => void;
/**
 * Sets which field will contain the reference to the database model instance.
 */
export declare const ModelReference: () => import("@ajs/core/beta/decorators").PropertyDecorator;
export {};
