import { type ControllerClass, type RequestContext } from "@ajs/api/beta";
import { type Class, type ParameterDecorator } from "@ajs/core/beta/decorators";
import { Parameters } from "./components";
import { DataAPIMeta } from "./metadata";
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
export type ExtractCallback<T> = T extends DataControllerCallbackWithOptions ? T["callback"]["func"] : T extends DataControllerCallback ? T["func"] : never;
export type DataControllerDef = {
    [name: string]: DataControllerCallback | DataControllerCallbackWithOptions;
};
export type ExtractDefCallbacks<T extends {}> = {
    [K in keyof T]: ExtractCallback<T[K]>;
};
declare abstract class TableHolder<C extends Class> {
    table: InstanceType<C>;
}
export declare function DataController<C extends Class, P extends DataControllerDef = DataControllerDef, Base extends ControllerClass = ControllerClass>(tableClass: C, def: P, base: Base): Class<ExtractDefCallbacks<P> & TableHolder<C>> & Base;
export declare const RegisterDataController: () => import("@ajs/core/beta/decorators").ClassDecorator<Class<any, any[]>>;
export declare function GetDataControllerMeta(thisObj: any): DataAPIMeta;
export declare namespace DefaultRoutes {
    const Get: {
        func: (_reqCtx: RequestContext, params: Parameters.GetParameters) => Promise<Record<string, any>>;
        args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
        method: string;
    };
    const List: {
        func: (reqCtx: RequestContext, params: Parameters.ListParameters) => Promise<{
            results: Record<string, any>[];
            total: number;
            offset: number;
            limit: number;
        }>;
        args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
        method: string;
    };
    const New: {
        func: (_reqCtx: RequestContext, params: Parameters.NewParameters, body: Buffer) => Promise<string[]>;
        args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
        method: string;
    };
    const Edit: {
        func: (_reqCtx: RequestContext, params: Parameters.EditParameters, body: Buffer) => Promise<void>;
        args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
        method: string;
    };
    const Delete: {
        func: (_reqCtx: RequestContext, params: Parameters.DeleteParameters) => Promise<number>;
        args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
        method: string;
    };
    const All: {
        readonly get: {
            func: (_reqCtx: RequestContext, params: Parameters.GetParameters) => Promise<Record<string, any>>;
            args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
            method: string;
        };
        readonly list: {
            func: (reqCtx: RequestContext, params: Parameters.ListParameters) => Promise<{
                results: Record<string, any>[];
                total: number;
                offset: number;
                limit: number;
            }>;
            args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
            method: string;
        };
        readonly new: {
            func: (_reqCtx: RequestContext, params: Parameters.NewParameters, body: Buffer) => Promise<string[]>;
            args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
            method: string;
        };
        readonly edit: {
            func: (_reqCtx: RequestContext, params: Parameters.EditParameters, body: Buffer) => Promise<void>;
            args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
            method: string;
        };
        readonly delete: {
            func: (_reqCtx: RequestContext, params: Parameters.DeleteParameters) => Promise<number>;
            args: (import("@ajs/core/beta/decorators").PropertyDecorator & ParameterDecorator)[];
            method: string;
        };
    };
    function WithOptions<O>(callback: DataControllerCallback<O> | DataControllerCallbackWithOptions<O>, options?: Partial<O>, endpoint?: string): DataControllerCallbackWithOptions<O>;
}
export {};
