import { GetMetadata } from '@ajs/core/beta';
import { Class, MakeMethodAndPropertyDecorator, MakePropertyDecorator } from '@ajs/core/beta/decorators';
import { RequestContext } from '@ajs/api/beta';
import { ValueProxy } from '@ajs/database/beta';
import { DataControllerCallbackWithOptions } from '.';
import { ContainerModifier } from '@ajs/database-decorators/beta/modifiers/common';

/**
 * Field access mode enum.
 */
export enum AccessMode {
  ReadOnly = 1,
  WriteOnly = 2,
  ReadWrite = 3,
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
  sortable?: { indexed?: boolean };

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
export type FilterValue = [value: string, mode: Comparison];

/**
 * Filter callback.
 */
export type FilterFunction<T extends Record<string, any>, U extends Record<string, any> = Record<string, any>> = (
  context: RequestContext & { this: T },
  proxy: ValueProxy.Proxy<any>,
  key: string,
  value: FilterValue[0],
  mode: FilterValue[1],
  row: ValueProxy.Proxy<U>,
) => ValueProxy.ProxyOrVal<boolean>;

/**
 * Metadata Class containing the DataAPI information.
 */
export class DataAPIMeta {
  /**
   * Key symbol.
   */
  public static key = Symbol();

  public readonly filters: Record<string, FilterFunction<any>> = {};

  /**
   * Fields information.
   */
  public readonly fields: Record<string, FieldData> = {};

  /**
   * Fields to pluck in listing endpoints.
   */
  public readonly pluck: Record<string, Set<string>> = {};

  /**
   * Key of the DataAPI class containing a database table instance.
   */
  public modelKey?: string;

  /**
   * Keys of the DataAPI class containing database modifier keys.
   */
  public modifierKeys = new Map<typeof ContainerModifier<any>, string>();

  /**
   * Database Schema class.
   */
  public tableClass!: Class;

  /**
   * Database Schema table name.
   */
  public tableName!: string;

  /**
   * Readable fields.
   */
  public readonly readable: Record<'getters' | 'props', [string, FieldData][]> = {
    getters: [],
    props: [],
  };

  /**
   * Writeable fields.
   */
  public readonly writable: Record<'setters' | 'props', [string, FieldData][]> = {
    setters: [],
    props: [],
  };

  /**
   * Registered DataAPI endpoints.
   */
  public readonly endpoints: Record<string, DataControllerCallbackWithOptions> = {};

  constructor(public readonly target: Class) {}

  public inherit(parent: DataAPIMeta) {
    const merge = (src: Record<string, any>, dst: Record<string, any>) => {
      for (const key in src) {
        if (!(key in dst)) {
          dst[key] = src[key];
        } else if (Array.isArray(dst[key])) {
          dst[key].push(...src[key]);
        }
      }
    };
    merge(parent.filters, this.filters);
    merge(parent.fields, this.fields);
    for (const [key, list] of Object.entries(parent.pluck)) {
      this.pluck[key] = new Set(list);
    }
    if (!('modelKey' in this)) {
      this.modelKey = parent.modelKey;
    }
    for (const key of parent.modifierKeys.keys()) {
      if (!this.modifierKeys.has(key)) {
        this.modifierKeys.set(key, parent.modifierKeys.get(key)!);
      }
    }
    merge(parent.readable, this.readable);
    merge(parent.writable, this.writable);
    merge(parent.endpoints, this.endpoints);
    this.tableClass = parent.tableClass;
    this.tableName = parent.tableName;
  }

  private field(name: string) {
    if (!(name in this.fields)) {
      this.fields[name] = {};
    }
    return this.fields[name];
  }

  private recomputeListable() {
    Object.values(this.pluck).forEach((set) => set.clear());
    for (const [_, field] of Object.entries(this.fields)) {
      if (field.listable) {
        for (const [mode, names] of Object.entries(field.listable)) {
          if (!(mode in this.pluck)) {
            this.pluck[mode] = new Set();
          }
          names.forEach((name) => this.pluck[mode].add(name));
        }
      }
    }
  }

  private recomputeAccess() {
    this.readable.getters.splice(0, this.readable.getters.length);
    this.readable.props.splice(0, this.readable.props.length);
    this.writable.setters.splice(0, this.writable.setters.length);
    this.writable.props.splice(0, this.writable.props.length);
    for (const [key, field] of Object.entries(this.fields)) {
      if (!field.mode) {
        continue;
      }
      if (field.mode & AccessMode.ReadOnly) {
        if (field.desc?.get) {
          this.readable.getters.push([key, field]);
        } else {
          this.readable.props.push([key, field]);
        }
      }
      if (field.mode & AccessMode.WriteOnly) {
        if (field.desc?.set) {
          this.writable.setters.push([key, field]);
        } else {
          this.writable.props.push([key, field]);
        }
      }
    }
  }

  /**
   * Sets the access mode of the given field.
   *
   * @param name Field name
   * @param mode Access mode
   */
  public setMode(name: string, mode: AccessMode) {
    this.field(name).mode = mode;
    this.recomputeAccess();
    return this;
  }

  /**
   * Sets whether a field should be included in list endpoints.
   *
   * @param name Field name
   * @param requiredFields Boolean or table field list
   * @param mode List mode (default: 'list')
   */
  public setListable(name: string, requiredFields: boolean | string[], mode = 'list') {
    const field = this.field(name);
    const names = typeof requiredFields === 'boolean' ? (requiredFields ? [name] : []) : requiredFields;
    if (!field.listable) {
      field.listable = {};
    }
    field.listable[mode] = names;
    this.recomputeListable();
    return this;
  }

  /**
   * Sets whether or not this field must be present in requests for the given method.
   *
   * @param name Field name
   * @param modes DataAPI methods
   */
  public setMandatory(name: string, modes: string[]) {
    this.field(name).mandatory = new Set(modes);
    return this;
  }

  /**
   * Sets whether or not this field can be used to sort in list endpoints.
   *
   * @param name Field name
   * @param active Sortable
   * @param noIndex Ignore database indexes
   * @returns
   */
  public setSortable(name: string, active: boolean, noIndex?: boolean) {
    this.field(name).sortable = active ? { indexed: !noIndex } : undefined;
    return this;
  }

  /**
   * Declares a field to be a foreign key.
   *
   * @param name Field name
   * @param table Other table
   * @param index Other table index
   * @param multi Index is a multi index
   */
  public setForeign(name: string, table: string, index?: string, multi?: boolean) {
    this.field(name).foreign = [table, index, multi || undefined];
    return this;
  }

  /**
   * Set the validation function of a field.
   *
   * @param name Field name
   * @param validator Value validator callback
   */
  public setValidator(name: string, validator?: (value: unknown) => boolean) {
    this.field(name).validator = validator;
    return this;
  }

  /**
   * Updates the known field descriptor of this field.
   *
   * @param name Field name
   * @param desc Field descriptor
   */
  public setDescriptor(name: string, desc?: PropertyDescriptor) {
    this.field(name).desc = desc;
    return this;
  }

  /**
   * Creates a filter.
   *
   * @param name Filter name
   * @param func Filter callback
   */
  public setFilter(name: string, func: FilterFunction<Record<string, any>, Record<string, any>>) {
    this.filters[name] = func;
    return this;
  }

  /**
   * Sets the key containing the database table instance.
   *
   * @param name Field name
   */
  public setModelKey(name: string) {
    this.modelKey = name;
    return this;
  }

  /**
   * Sets the key containing the key for the given database modifier.
   *
   * @param name Field name
   * @param modifierClass Modifier
   */
  public setModifierKey(name: string, modifierClass: typeof ContainerModifier<any>) {
    this.modifierKeys.set(modifierClass, name);
    return this;
  }

  /**
   * Adds the given endpoint to the DataAPI
   *
   * @param key field name
   * @param endpoint callback information
   */
  public addEndpoint(key: string, endpoint?: DataControllerCallbackWithOptions) {
    if (!endpoint) {
      delete this.endpoints[key];
    } else {
      this.endpoints[key] = endpoint;
    }
  }
}

/**
 * Sets the access mode of a DataAPI field.
 *
 * @param mode Access mode
 */
export const Access = MakeMethodAndPropertyDecorator((target, key, desc, mode: AccessMode) => {
  GetMetadata(target.constructor, DataAPIMeta)
    .setDescriptor(key as string, desc)
    .setMode(key as string, mode);
});

/**
 * Sets the listable state of a DataAPI field.
 *
 * Listable fields will be included in list method calls.
 *
 * Listable getters must specificy the list of in-database field names they use.
 *
 * @param requiredFields Boolean or table field list
 */
export const Listable = MakeMethodAndPropertyDecorator(
  (target, key, desc, requiredFields?: boolean | string[], mode?: string) => {
    GetMetadata(target.constructor, DataAPIMeta)
      .setDescriptor(key as string, desc)
      .setListable(key as string, typeof requiredFields !== 'undefined' ? requiredFields : true, mode);
  },
);

/**
 * Declares a field to be mandatory in calls to the given methods.
 *
 * @param modes DataAPI methods (ex: `new`, `edit`)
 */
export const Mandatory = MakeMethodAndPropertyDecorator((target, key, desc, ...modes: string[]) => {
  GetMetadata(target.constructor, DataAPIMeta)
    .setDescriptor(key as string, desc)
    .setMandatory(key as string, modes);
});

/**
 * Declares a field as being optional.
 *
 * This must be used on fields with no other decorators.
 */
export const Optional = MakeMethodAndPropertyDecorator((target, key, desc) => {
  GetMetadata(target.constructor, DataAPIMeta)
    .setDescriptor(key as string, desc)
    .setMandatory(key as string, []);
});

/**
 * Declares a field to be useable as the sorting key.
 *
 * @param options Options
 */
export const Sortable = MakeMethodAndPropertyDecorator((target, key, desc, options?: { noIndex?: boolean }) => {
  GetMetadata(target.constructor, DataAPIMeta)
    .setDescriptor(key as string, desc)
    .setSortable(key as string, true, options?.noIndex ?? false);
});

/**
 * Declares a field to be a foreign key.
 *
 * @param table Other table
 * @param index Other table index
 * @param multi Index is a multi index
 */
export const Foreign = MakeMethodAndPropertyDecorator(
  (target, key, desc, table: string, index?: string, multi?: boolean) => {
    GetMetadata(target.constructor, DataAPIMeta)
      .setDescriptor(key as string, desc)
      .setForeign(key as string, table, index, multi);
  },
);

/**
 * Set the validation function of a field.
 *
 * @param validator Value validator callback
 */
export const Validator = MakeMethodAndPropertyDecorator((target, key, desc, validator: (val: unknown) => boolean) => {
  GetMetadata(target.constructor, DataAPIMeta)
    .setDescriptor(key as string, desc)
    .setValidator(key as string, validator);
});

/**
 * Creates a field filter.
 *
 * @param func Custom filter function
 */
export const Filter: <T extends Record<string, any>>(
  func?: FilterFunction<T, T>,
) => (target: T, propertyKey: string | symbol) => void = MakePropertyDecorator((target, key, func?: any) => {
  GetMetadata(key ? target.constructor : target, DataAPIMeta).setFilter(
    key as string,
    func ||
      ((_context, proxy: ValueProxy.Proxy<string>, _key, val: string, mode) => {
        switch (mode) {
          case 'ne':
            return proxy.ne(val);
          case 'gt':
            return proxy.gt(val);
          case 'ge':
            return proxy.ge(val);
          case 'lt':
            return proxy.lt(val);
          case 'le':
            return proxy.le(val);
          default:
            return proxy.eq(val);
        }
      }),
  );
});

/**
 * Sets which field will contain the reference to the database model instance.
 */
export const ModelReference = MakePropertyDecorator((target, key) => {
  GetMetadata(target.constructor, DataAPIMeta).setModelKey(key as string);
});

/**
 * Sets which field will contain the key for the given database modifier.
 *
 * @param modifierClass Modifier
 */
export const ModifierKey = MakePropertyDecorator((target, key, modifierClass: typeof ContainerModifier<any>) => {
  GetMetadata(target.constructor, DataAPIMeta).setModifierKey(key as string, modifierClass);
});
