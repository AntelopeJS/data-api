import { MakeParameterAndPropertyDecorator } from '@ajs/core/beta/decorators';
import { HTTPResult, RequestContext, SetParameterProvider } from '@ajs/api/beta';
import { Database, Datum, Stream, Table, ValueProxy } from '@ajs/database/beta';
import { DataModel } from '@ajs/database-decorators/beta/model';
import { DataAPIMeta, FilterValue } from './metadata';
import { GetDataControllerMeta } from '.';
import { fromDatabase, lock, toPlainData, unlock, unlockrequest } from '@ajs/database-decorators/beta/modifiers/common';
import { Constructible } from '@ajs/database-decorators/beta/common';

export function assert(condition: any, err: string, errCode = 400): asserts condition {
  if (!condition) {
    throw new HTTPResult(errCode, err, 'text/plain');
  }
  return condition;
}

export namespace Parameters {
  export function GetOptionOverrides<T extends Record<string, any>>(reqCtx: RequestContext): T {
    return (<any>reqCtx).dataAPIEntry?.options ?? {};
  }

  export function ExtractFilters(reqCtx: RequestContext, meta: DataAPIMeta): Record<string, FilterValue> {
    const result: Record<string, FilterValue> = {};
    for (const filter of Object.keys(meta.filters)) {
      const filter_key = `filter_${filter}`;
      if (reqCtx.url.searchParams.has(filter_key)) {
        const searchVal = reqCtx.url.searchParams.get(filter_key)!;
        const match = searchVal.match(/([^:]+):(.*)/);
        result[filter] = match ? [match[2], match[1] as FilterValue[1]] : [searchVal, 'eq'];
      }
    }
    return result;
  }

  const converters = {
    number: (val: string) => parseFloat(val),
    int: (val: string) => parseInt(val),
    bool: (val: string) => (val === '0' ? false : true),
    string: (val: string) => val,
  };
  type ConvertersKey = keyof typeof converters;
  type GenericParams<T extends Record<string, any>> = {
    [K in keyof T]: ConvertersKey | `multi:${ConvertersKey}` | ((reqCtx: RequestContext, meta: DataAPIMeta) => any);
  };
  export function ExtractGeneric<T extends Record<string, any>>(
    reqCtx: RequestContext,
    meta: DataAPIMeta,
    dynamic: GenericParams<Partial<T>>,
  ) {
    const overrides = GetOptionOverrides<T>(reqCtx);
    const result: Partial<T> = { ...overrides };
    for (const key of Object.keys(dynamic)) {
      if (!(key in result)) {
        const extractor = dynamic[key];
        if (typeof extractor === 'string') {
          if (extractor.startsWith('multi:')) {
            const converter = converters[<ConvertersKey>extractor.substring(6)];
            result[key as keyof T] = reqCtx.url.searchParams
              .getAll(key)
              .map((searchVal) => converter(searchVal)) as any;
          } else {
            const searchVal = reqCtx.url.searchParams.get(key);
            if (searchVal !== null) {
              result[key as keyof T] = converters[<ConvertersKey>extractor](searchVal) as any;
            }
          }
        } else {
          result[key as keyof T] = extractor(reqCtx, meta);
        }
      }
    }
    return result;
  }

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

  export const List = MakeParameterAndPropertyDecorator((target, key, param) =>
    SetParameterProvider(target, key, param, function (this: unknown, context) {
      const meta = GetDataControllerMeta(this);
      const params = ExtractGeneric<ListParameters>(context, meta, {
        filters: ExtractFilters,
        offset: 'int',
        limit: 'int',
        sortKey: 'string',
        sortDirection: 'string',
      });

      assert(!params.sortKey || meta.fields[params.sortKey]?.sortable, 'Field is not sortable.');
      params.limit = params.limit ? Math.min(params.limit, params.maxPage ?? 100) : params.maxPage;

      return params;
    }),
  );

  export interface GetParameters {
    id: string;
    index?: string;
    noForeign?: string;
  }

  export const Get = MakeParameterAndPropertyDecorator((target, key, param) =>
    SetParameterProvider(target, key, param, function (this: unknown, context) {
      const params = ExtractGeneric<GetParameters>(context, GetDataControllerMeta(this), {
        id: 'string',
      });

      assert(params.id && typeof params.id === 'string', 'Missing id.');

      return params;
    }),
  );

  export interface NewParameters {
    noMandatory?: string;
  }

  export const New = MakeParameterAndPropertyDecorator((target, key, param) =>
    SetParameterProvider(target, key, param, function (this: unknown, context) {
      const params = ExtractGeneric<NewParameters>(context, GetDataControllerMeta(this), {});

      return params;
    }),
  );

  export interface EditParameters {
    id: string;
    index?: string;
    noMandatory?: string;
  }

  export const Edit = MakeParameterAndPropertyDecorator((target, key, param) =>
    SetParameterProvider(target, key, param, function (this: unknown, context) {
      const params = ExtractGeneric<EditParameters>(context, GetDataControllerMeta(this), {
        id: 'string',
      });

      assert(params.id && typeof params.id === 'string', 'Missing id.');

      return params;
    }),
  );

  export interface DeleteParameters {
    id: string[];
  }

  export const Delete = MakeParameterAndPropertyDecorator((target, key, param) =>
    SetParameterProvider(target, key, param, function (this: unknown, context) {
      const params = ExtractGeneric<DeleteParameters>(context, GetDataControllerMeta(this), {
        id: 'multi:string',
      });

      assert(params.id && Array.isArray(params.id) && params.id.length > 0, 'Missing id.');

      return params;
    }),
  );
}

export namespace Query {
  export function GetModel(obj: any, meta: DataAPIMeta): InstanceType<DataModel> & { constructor: DataModel } {
    assert(meta.modelKey, 'Missing model key.', 500);
    return obj[meta.modelKey];
  }

  export function Foreign(db: Database, meta: DataAPIMeta, query: Stream, pluck?: Set<string>): Stream;
  export function Foreign(db: Database, meta: DataAPIMeta, query: Datum, pluck?: Set<string>): Datum;
  export function Foreign(db: Database, meta: DataAPIMeta, query: Stream | Datum, pluck?: Set<string>): Stream | Datum {
    /**/
    if (query.lookup) {
      for (const [name, field] of Object.entries(meta.fields)) {
        if (!field.foreign || (pluck && !pluck.has(name))) {
          continue;
        }
        const [table, _tableClass, index, _multi, pluckField] = field.foreign;
        let other: Stream = db.table(table);
        if (pluckField) {
          other = other.pluck('_internal', ...pluckField);
        }
        query = query.lookup(other, name, index || '_id');
      }
      return query;
    } else {
      const oldForeign = (obj: ValueProxy.Proxy<Record<string, any>>) => {
        const changedFields: Record<string, any> = {};
        for (const [name, field] of Object.entries(meta.fields)) {
          if (!field.foreign || (pluck && !pluck.has(name))) {
            continue;
          }
          const [table, _tableClass, index, multi, pluckField] = field.foreign;
          if (multi) {
            changedFields[name] = (obj(name) as ValueProxy.Proxy<string[]>).default([]).map((val) => {
              let foreignObject: Datum = Get(db.table(table), val, index);
              if (pluckField) {
                foreignObject = foreignObject.pluck('_internal', ...pluckField);
              }
              return foreignObject.default(null);
            });
          } else {
            changedFields[name] = Get(db.table(table), obj(name) as ValueProxy.Proxy<string>, index).default(null);
          }
        }
        return obj.merge(changedFields);
      };
      if ('map' in query) {
        return query.map(oldForeign as ValueProxy.Proxy<Record<string, any>>);
      } else {
        return query.do(oldForeign as ValueProxy.Proxy<Record<string, any>>);
      }
    }
  }

  export async function ReadProperties(obj: any, meta: DataAPIMeta, dbData: any, onlyList?: boolean) {
    const instance: Record<string, any> = { ...obj };
    const res: Record<string, any> = {};
    for (const [key, field] of meta.readable.props) {
      if (onlyList && !field.listable) {
        continue;
      }
      instance[key] = dbData[field.dbName || key];
      res[key] = dbData[field.dbName || key];
    }
    instance.table = dbData;
    Object.setPrototypeOf(instance, meta.target.prototype);
    for (const [key, field] of meta.readable.getters) {
      if (onlyList && !field.listable) {
        continue;
      }
      const val = field.desc?.get?.apply(instance);
      res[key] = await (typeof val === 'function' ? val() : val);
    }
    return res;
  }

  export async function WriteProperties(
    obj: any,
    meta: DataAPIMeta,
    bodyData: Record<string, any>,
    existingDBData?: Record<string, any>,
  ) {
    const instance: Record<string, any> = { ...obj };
    const dbData: Record<string, any> = existingDBData || {};
    Object.setPrototypeOf(dbData, meta.tableClass.prototype);
    if (!existingDBData) {
      for (const [key, value] of Object.entries(new meta.target())) {
        if (value !== undefined) {
          instance[key] = value;
          if (key in meta.fields) {
            dbData[meta.fields[key].dbName || key] = value;
          }
        }
      }
    }
    for (const [key, field] of meta.writable.props) {
      instance[key] = bodyData[key];
      dbData[field.dbName || key] = bodyData[key];
    }
    instance.table = dbData;
    Object.setPrototypeOf(instance, meta.target.prototype);
    for (const [key, field] of meta.writable.setters) {
      field.desc?.set?.apply(instance, [bodyData[key]]);
    }
    return dbData;
  }

  export function Get(table: Table, id: string | ValueProxy.Proxy<string>, index?: string) {
    return index ? table.getAll(index, id).nth(0) : table.get(id);
  }

  export function List<T extends Record<string, any>>(
    obj: any,
    meta: DataAPIMeta,
    request: Stream<T>,
    reqCtx: RequestContext,
    sorting?: [string, 'asc' | 'desc' | undefined],
    filters?: Record<string, FilterValue>,
  ): [sorted: Stream<T>, total: Datum<number>] {
    let tmpRequest = request;
    const shouldSort = sorting && meta.fields[sorting[0]]?.sortable;
    if (shouldSort && shouldSort.indexed) {
      tmpRequest = tmpRequest.orderBy(sorting[0] as keyof T, sorting[1] ?? 'asc', false);
    }
    const filterList = Object.entries(meta.filters).filter(([name]) => filters && name in filters);
    if (filterList.length > 0) {
      // TODO: rework for modifier-affected fields (unlockrequest)
      tmpRequest = filterList.reduce(
        (req, [name, filter]) =>
          req.filter((row) =>
            filter(
              Object.assign(reqCtx, { this: obj }),
              Validation.UnlockRequest(obj, meta, row, name),
              name,
              filters![name][0],
              filters![name][1],
              row as ValueProxy.Proxy<Record<string, any>>,
            ),
          ),
        tmpRequest,
      );
    }
    if (shouldSort && !shouldSort.indexed) {
      tmpRequest = tmpRequest.orderBy(sorting[0] as keyof T, sorting[1] ?? 'asc', true);
    }
    return [tmpRequest, tmpRequest.count()];
  }

  export function Delete(table: Table, id: string | string[]) {
    return Array.isArray(id) ? table.getAll(undefined!, ...id).delete() : table.get(id).delete();
  }
}

export namespace Validation {
  export function MandatoryFields(meta: DataAPIMeta, obj: any, type: string) {
    const missing = Object.entries(meta.fields)
      .filter(([name, field]) => field.mandatory?.has(type) && !(name in obj))
      .map(([name]) => name);
    assert(missing.length === 0, `Missing mandatory fields: ${missing.join(', ')}`);
  }

  export function ValidateTypes(meta: DataAPIMeta, obj: Record<string, any>) {
    const invalid = Object.entries(meta.fields)
      .filter(([name, field]) => field.validator && name in obj && !field.validator(obj[name]))
      .map(([name]) => name);
    assert(invalid.length === 0, `Invalid field type(s): ${invalid.join(', ')}`);
  }

  export function Lock(obj: any, meta: DataAPIMeta, data: any) {
    for (const [modifier, field] of meta.modifierKeys.entries()) {
      const key = obj[field];
      lock(data, modifier, undefined, key);
    }
  }

  export function Unlock(obj: any, meta: DataAPIMeta, dbData: any) {
    for (const [name, field] of Object.entries(meta.fields)) {
      if (field.foreign && typeof dbData[name] === 'object' && field.foreign[1]) {
        dbData[name] = fromDatabase(dbData[name], field.foreign[1]);
      }
    }
    for (const [modifier, field] of meta.modifierKeys.entries()) {
      const key = obj[field];
      unlock(dbData, modifier, undefined, key);
      for (const [foreign, fieldData] of Object.entries(meta.fields)) {
        if (fieldData.foreign && typeof dbData[foreign] === 'object') {
          unlock(dbData[foreign], modifier, undefined, key);
        }
      }
    }
  }

  export function UnlockRequest<T extends {}, K extends keyof T>(
    obj: any,
    meta: DataAPIMeta,
    row: ValueProxy.Proxy<T>,
    field: K,
  ): ValueProxy.Proxy<T[K]> {
    const modifiers = Array.from(meta.modifierKeys.entries()).map(([modifier, field]) => ({
      modifier,
      args: [obj[field]],
    }));
    return unlockrequest(meta.tableClass as Constructible<T>, row, field, modifiers);
  }

  export function ClearInternal(meta: DataAPIMeta, obj: Record<string, any> | Array<Record<string, any>>) {
    const results = Array.isArray(obj) ? obj : [obj];

    const foreignFields = Object.entries(meta.fields).filter(([, field]) => field.foreign);
    for (const entry of results) {
      delete entry._internal;
      for (const [name, { foreign }] of foreignFields) {
        if (foreign && entry[name] && typeof entry[name] === 'object') {
          entry[name] = toPlainData(entry[name]);
          if (foreign?.[4]) {
            const result: Record<string, unknown> = {};
            for (const key of foreign[4]) {
              result[key] = entry[name][key];
            }
            entry[name] = result;
          }
        }
      }
    }
  }
}
