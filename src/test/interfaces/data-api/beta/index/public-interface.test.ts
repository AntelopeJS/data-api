import { expect } from 'chai';
import { DefaultRoutes } from '@ajs.local/data-api/beta';
import * as dataApiInterface from '@ajs.local/data-api/beta';
import * as dataApiMetadata from '@ajs.local/data-api/beta/metadata';

interface ExportContract {
  exports: Record<string, unknown>;
  requiredKeys: string[];
}

interface RouteCallbackLike {
  args: unknown[];
  func: (...args: unknown[]) => unknown;
  method: string;
}

interface RouteWithOptionsLike<TOptions extends Record<string, string>> {
  callback: RouteCallbackLike;
  endpoint?: string;
  options?: Partial<TOptions>;
}

interface RouteOptions {
  pluckMode: string;
}

const DEFAULT_ROUTE_KEYS = ['get', 'list', 'new', 'edit', 'delete'];
const DATA_API_REQUIRED_EXPORTS = ['DataController', 'DefaultRoutes', 'GetDataControllerMeta', 'RegisterDataController'];
const DATA_API_METADATA_REQUIRED_EXPORTS = [
  'Access',
  'AccessMode',
  'DataAPIMeta',
  'Filter',
  'Foreign',
  'Listable',
  'Mandatory',
  'ModelReference',
  'ModifierKey',
  'Optional',
  'Sortable',
  'Validator',
];

function validateRequiredExports(contract: ExportContract): void {
  contract.requiredKeys.forEach((key) => {
    expect(contract.exports).to.have.property(key);
  });
}

function validateDefaultRoutesShape(): void {
  DEFAULT_ROUTE_KEYS.forEach((routeKey) => {
    const route = DefaultRoutes.All[routeKey as keyof typeof DefaultRoutes.All] as RouteCallbackLike;
    expect(route).to.be.an('object');
    expect(route.args).to.be.an('array');
    expect(route.func).to.be.a('function');
    expect(route.method).to.be.a('string');
  });
}

function validateWithOptionsContract(): void {
  const callback = DefaultRoutes.WithOptions(
    DefaultRoutes.List,
    { pluckMode: 'detailed' },
    'customDetailedList',
  ) as RouteWithOptionsLike<RouteOptions>;

  expect(callback.endpoint).to.equal('customDetailedList');
  expect(callback.callback).to.equal(DefaultRoutes.List);
  expect(callback.options).to.deep.equal({ pluckMode: 'detailed' });
}

describe('Public Interface Contract', () => {
  it('exports expected members from the main interface', () => {
    validateRequiredExports({
      exports: dataApiInterface,
      requiredKeys: DATA_API_REQUIRED_EXPORTS,
    });
  });

  it('exports expected members from metadata interface', () => {
    validateRequiredExports({
      exports: dataApiMetadata,
      requiredKeys: DATA_API_METADATA_REQUIRED_EXPORTS,
    });
  });

  it('exposes all default routes with callback contract', () => {
    validateDefaultRoutesShape();
  });

  it('keeps route option wrapping contract stable', () => {
    validateWithOptionsContract();
  });

  it('keeps access mode enum stable', () => {
    expect(dataApiMetadata.AccessMode.ReadOnly).to.equal(1);
    expect(dataApiMetadata.AccessMode.WriteOnly).to.equal(2);
    expect(dataApiMetadata.AccessMode.ReadWrite).to.equal(3);
  });
});
