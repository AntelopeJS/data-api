import { expect } from 'chai';
import { Table, Index } from '@ajs/database-decorators/beta';
import { Controller } from '@ajs/api/beta';
import { DataController, DefaultRoutes, RegisterDataController } from '@ajs.local/data-api/beta';
import {
  Access,
  AccessMode,
  Listable,
  Sortable,
  Mandatory,
  Validator,
  ModelReference,
} from '@ajs.local/data-api/beta/metadata';

class TestTable extends Table {
  @Index({ primary: true })
  declare _id: string;

  declare name: string;
  declare email: string;
  declare age: number;
  declare isActive: boolean;
  declare createdAt: Date;
}

describe('Data API Index', () => {
  it('creates data controller with table class', async () => await testCreateDataControllerWithTableClass());
  it('creates data controller with all default routes', async () => await testCreateDataControllerWithAllRoutes());
  it('creates data controller with custom fields', async () => await testCreateDataControllerWithCustomFields());
  it('extends base data controller', async () => await testInheritance());
  it('adds custom endpoints to controller', async () => await testCustomEndpoints());
  it('configures route options', async () => await testRouteOptions());
  it('verifies default routes properties', async () => await testDefaultRoutesProperties());
  it('applies options to routes', async () => await testWithOptions());
});

async function testCreateDataControllerWithTableClass() {
  @RegisterDataController()
  class TestDataAPI extends DataController(TestTable, { get: DefaultRoutes.Get }, Controller('/test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new TestDataAPI();
  expect(instance).to.be.instanceOf(TestDataAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testCreateDataControllerWithAllRoutes() {
  @RegisterDataController()
  class TestDataAPIWithAllRoutes extends DataController(TestTable, DefaultRoutes.All, Controller('/test-all')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare email: string;
  }

  const instance = new TestDataAPIWithAllRoutes();
  expect(instance).to.be.instanceOf(TestDataAPIWithAllRoutes);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testCreateDataControllerWithCustomFields() {
  @RegisterDataController()
  class TestDataAPIWithCustomFields extends DataController(TestTable, DefaultRoutes.All, Controller('/users')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Validator((value: unknown) => typeof value === 'string' && value.includes('@'))
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare createdAt: Date;
  }

  const instance = new TestDataAPIWithCustomFields();
  expect(instance).to.be.instanceOf(TestDataAPIWithCustomFields);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testInheritance() {
  @RegisterDataController()
  class BaseDataAPI extends DataController(
    TestTable,
    { get: DefaultRoutes.Get, list: DefaultRoutes.List },
    Controller('/base'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;
  }

  @RegisterDataController()
  class ExtendedDataAPI extends DataController(
    TestTable,
    { ...DefaultRoutes.All, custom: { func: async () => 'custom', args: [], method: 'get' } },
    Controller('/extended'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const baseInstance = new BaseDataAPI();
  const extendedInstance = new ExtendedDataAPI();

  expect(baseInstance).to.be.instanceOf(BaseDataAPI);
  expect(extendedInstance).to.be.instanceOf(ExtendedDataAPI);
  expect(baseInstance.tableModel).to.not.equal(undefined);
  expect(extendedInstance.tableModel).to.not.equal(undefined);
}

async function testCustomEndpoints() {
  @RegisterDataController()
  class CustomEndpointsAPI extends DataController(
    TestTable,
    {
      get: DefaultRoutes.Get,
      list: DefaultRoutes.List,
      custom: {
        func: async () => 'custom result',
        args: [],
        method: 'get',
        endpoint: 'custom',
      },
    },
    Controller('/custom-endpoints'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new CustomEndpointsAPI();
  expect(instance).to.be.instanceOf(CustomEndpointsAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testRouteOptions() {
  @RegisterDataController()
  class RouteOptionsAPI extends DataController(
    TestTable,
    {
      get: {
        ...DefaultRoutes.Get,
        endpoint: 'fetch/:id',
        options: { noForeign: 'true' },
      },
      list: {
        ...DefaultRoutes.List,
        options: {
          limit: 20,
          maxPage: 50,
          noForeign: true,
          pluckMode: 'detailed',
        },
      },
    },
    Controller('/route-options'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new RouteOptionsAPI();
  expect(instance).to.be.instanceOf(RouteOptionsAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testDefaultRoutesProperties() {
  expect(DefaultRoutes.Get.method).to.equal('get');
  expect(DefaultRoutes.Get.args).to.be.an('array');
  expect(DefaultRoutes.Get.func).to.be.a('function');

  expect(DefaultRoutes.List.method).to.equal('get');
  expect(DefaultRoutes.List.args).to.be.an('array');
  expect(DefaultRoutes.List.func).to.be.a('function');

  expect(DefaultRoutes.New.method).to.equal('post');
  expect(DefaultRoutes.New.args).to.be.an('array');
  expect(DefaultRoutes.New.func).to.be.a('function');

  expect(DefaultRoutes.Edit.method).to.equal('put');
  expect(DefaultRoutes.Edit.args).to.be.an('array');
  expect(DefaultRoutes.Edit.func).to.be.a('function');

  expect(DefaultRoutes.Delete.method).to.equal('delete');
  expect(DefaultRoutes.Delete.args).to.be.an('array');
  expect(DefaultRoutes.Delete.func).to.be.a('function');
}

async function testWithOptions() {
  const callback = DefaultRoutes.Get;
  const options = { noForeign: 'true' };
  const endpoint = 'custom/:id';

  const result = DefaultRoutes.WithOptions(callback, options, endpoint);

  expect(result.options).to.deep.equal(options);
  expect(result.endpoint).to.equal(endpoint);
  expect(result.callback).to.equal(callback);

  const callbackWithOptions = {
    ...DefaultRoutes.Get,
    options: { limit: 20 },
  };
  const newOptions = { noForeign: 'true' };

  const result2 = DefaultRoutes.WithOptions(callbackWithOptions, newOptions);

  expect(result2.options).to.deep.equal({ limit: 20, noForeign: 'true' });
}
