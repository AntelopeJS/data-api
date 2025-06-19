import { GetMetadata } from '@ajs/core/beta';
import { Class, MakeClassDecorator, ParameterDecorator } from '@ajs/core/beta/decorators';
import { Route, RawBody, RequestContext, Context, ControllerClass, RegisterRoute, ControllerMeta } from '@ajs/api/beta';
import { Datum, ValueProxy } from '@ajs/database/beta';
import { DEFAULT_SCHEMA, GetTablesFromSchema } from '@ajs/database-decorators/beta/schema';
import { DataAPIMeta } from './metadata';
import { assert, Parameters, Query, Validation } from './components';
import assert_ from 'assert';

export type DataControllerCallback<O = any> = {
  args: (ParameterDecorator | ParameterDecorator[])[];
  method: string;
  func: (ctx: any, opts: O, ...args: any[]) => any;
};

export type DataControllerCallbackWithOptions<O = any> = {
  endpoint?: string;
  options?: Partial<O>;
  callback: DataControllerCallback<O>;
};

export type ExtractCallback<T> = T extends DataControllerCallbackWithOptions
  ? T['callback']['func']
  : T extends DataControllerCallback
  ? T['func']
  : never;

export type DataControllerDef = {
  [name: string]: DataControllerCallback | DataControllerCallbackWithOptions;
};

export type ExtractDefCallbacks<T extends {}> = {
  [K in keyof T]: ExtractCallback<T[K]>;
};

abstract class TableHolder<C extends Class> {
  table!: InstanceType<C>;
}

export function DataController<
  C extends Class,
  P extends DataControllerDef = DataControllerDef,
  Base extends ControllerClass = ControllerClass,
>(tableClass: C, def: P, base: Base, schemaName?: string): Class<ExtractDefCallbacks<P> & TableHolder<C>> & Base {
  const c = class extends base {
    table!: InstanceType<C>;
  };
  const meta = GetMetadata(c, DataAPIMeta);

  const databaseSchema = GetTablesFromSchema(schemaName || String(DEFAULT_SCHEMA));
  assert_(databaseSchema, 'Non-existent Database Schema');

  const tableName = Object.entries(databaseSchema)
    .filter(([, table]) => table === tableClass)
    .map(([name]) => name)[0];
  assert_(tableName, 'Unregistered Database Table');

  meta.tableClass = tableClass;
  meta.tableName = tableName;

  for (const [key, val] of Object.entries(def)) {
    const entry = 'func' in val ? { endpoint: key, callback: val } : { endpoint: key, ...val };
    meta.addEndpoint(key, entry);
    // TODO?: should this go in addEndpoint?
    c.prototype[key] = entry.callback.func;
  }
  return c as any;
}

export const RegisterDataController = MakeClassDecorator((target) => {
  const meta = GetMetadata(target, DataAPIMeta);
  for (const [key, entry] of Object.entries(meta.endpoints)) {
    for (let i = 0; i < entry.callback.args.length; ++i) {
      const arg = entry.callback.args[i];
      if (Array.isArray(arg)) {
        arg.forEach((step) => step(target.prototype, key, i));
      } else {
        arg(target.prototype, key, i);
      }
    }
    const meta = GetMetadata(<any>target, ControllerMeta);
    const fullLocation = `${meta.location}/${entry.endpoint ?? key}`.replace(/\/+/g, '/');
    RegisterRoute({
      callback: (ctx) => {
        ctx.dataAPIEntry = entry;
      },
      location: fullLocation,
      method: entry.callback.method,
      mode: 'prefix',
      parameters: [{ provider: (ctx) => ctx, modifiers: [] }],
      properties: meta.computed_props,
      proto: target.prototype,
    });
    Route('handler', entry.callback.method, entry.endpoint)(target.prototype, key, {
      value: entry.callback.func,
    });
  }
});

export function GetDataControllerMeta(thisObj: any): DataAPIMeta {
  return GetMetadata(Object.getPrototypeOf(thisObj).constructor, DataAPIMeta, true);
}

export namespace DefaultRoutes {
  class Methods {
    async get(reqCtx: RequestContext, params: Parameters.GetParameters) {
      const meta = GetDataControllerMeta(this);

      const model = Query.GetModel(this, meta);
      let query = Query.Get(model.table, params.id, params.index) as Datum;

      if (!params.noForeign) {
        query = query.do((val) => Query.Foreign(model.database, meta, val as ValueProxy.Proxy<Record<string, any>>));
      }

      const dbResult = model.constructor.fromDatabase(await query);
      assert(dbResult, 'Not Found', 404);

      const results = await Query.ReadProperties(this, meta, dbResult);

      Validation.ClearInternal(meta, results);

      return results;
    }

    async list(reqCtx: RequestContext, params: Parameters.ListParameters) {
      const meta = GetDataControllerMeta(this);

      const model = Query.GetModel(this, meta);
      const sort = params?.sortKey
        ? ([params.sortKey, params.sortDirection] as [string, 'asc' | 'desc' | undefined])
        : undefined;
      let [query, queryTotal] = Query.List(this, meta, model.table, reqCtx, sort, params?.filters);

      const pluck: Set<string> | undefined = meta.pluck[params.pluckMode ?? 'list'];

      if (!params.noForeign) {
        query = query.map((val) =>
          Query.Foreign(
            model.database,
            meta,
            val as ValueProxy.Proxy<Record<string, any>>,
            params.noPluck ? undefined : pluck,
          ),
        );
      }

      const offset = params.offset || 0;
      const limit = params.limit || 10;
      let queryPaged = query.slice(offset, limit);

      if (!params.noPluck && pluck) {
        queryPaged = queryPaged.pluck('_internal', ...pluck);
      }

      const [dbResult, dbTotal] = await Promise.all([queryPaged, queryTotal]);

      const results = await Promise.all(
        dbResult.map((entry) => Query.ReadProperties(this, meta, model.constructor.fromDatabase(entry))),
      );

      Validation.ClearInternal(meta, results);

      return {
        results,
        total: dbTotal,
        offset,
        limit,
      };
    }

    async new(reqCtx: RequestContext, params: Parameters.NewParameters, body: Buffer) {
      const meta = GetDataControllerMeta(this);

      const data = JSON.parse(body.toString());
      if (!params.noMandatory) {
        Validation.MandatoryFields(meta, data, 'new');
      }
      Validation.ValidateTypes(meta, data);

      const dbData = await Query.WriteProperties(this, meta, data);

      const model = Query.GetModel(this, meta);
      const dbResult = await model.table.insert(dbData);

      return dbResult.generated_keys;
    }

    async edit(reqCtx: RequestContext, params: Parameters.EditParameters, body: Buffer) {
      const meta = GetDataControllerMeta(this);

      const data = JSON.parse(body.toString());
      if (!params.noMandatory) {
        Validation.MandatoryFields(meta, data, 'edit');
      }
      Validation.ValidateTypes(meta, data);

      const model = Query.GetModel(this, meta);

      const queryPrevious = Query.Get(model.table, params.id, params.index);
      const dbResultPrevious = await queryPrevious;

      const dbData = await Query.WriteProperties(this, meta, data, dbResultPrevious);

      await model.table.get(params.id).update(dbData);
    }

    async delete(reqCtx: RequestContext, params: Parameters.DeleteParameters) {
      const meta = GetDataControllerMeta(this);

      const model = Query.GetModel(this, meta);

      const query = Query.Delete(model.table, params.id);
      // Promise.all(ids.map(id => table.get(id).delete().then(() => true).catch(() => false)));

      const dbResult = await query;
      return dbResult;
    }
  }

  export const Get = { func: Methods.prototype.get, args: [Context(), Parameters.Get()], method: 'get' };
  export const List = { func: Methods.prototype.list, args: [Context(), Parameters.List()], method: 'get' };
  export const New = { func: Methods.prototype.new, args: [Context(), Parameters.New(), RawBody()], method: 'post' };
  export const Edit = {
    func: Methods.prototype.edit,
    args: [Context(), Parameters.Edit(), RawBody()],
    method: 'put',
  };
  export const Delete = {
    func: Methods.prototype.delete,
    args: [Context(), Parameters.Delete()],
    method: 'delete',
  };

  export const All = {
    get: Get,
    list: List,
    new: New,
    edit: Edit,
    delete: Delete,
  } as const;

  export function WithOptions<O>(
    callback: DataControllerCallback<O> | DataControllerCallbackWithOptions<O>,
    options?: Partial<O>,
    endpoint?: string,
  ): DataControllerCallbackWithOptions<O> {
    if ('func' in callback) {
      return {
        endpoint,
        options,
        callback,
      };
    } else {
      return {
        endpoint: endpoint ?? callback.endpoint,
        options: { ...(callback.options ?? {}), ...(options ?? {}) },
        callback: callback.callback,
      };
    }
  }
}
