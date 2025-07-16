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
  Foreign,
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

class _UserTable extends Table {
  @Index({ primary: true })
  declare _id: string;

  declare name: string;
  declare email: string;
}

describe('Data API Components', () => {
  it('creates data controller with basic fields', async () => await testCreateDataControllerWithBasicFields());
  it('controls field read/write access', async () => await testAccessModes());
  it('lists rows', async () => await testListableFields());
  it('sorts rows by field', async () => await testSortableFields());
  it('requires mandatory fields', async () => await testMandatoryFields());
  it('resolves foreign key references', async () => await testForeignKeyReferences());
  it('validates field values', async () => await testValidators());
  it('connects to data model', async () => await testModelReferences());
  it('creates custom list endpoints', async () => await testCustomListEndpoints());
});

async function testCreateDataControllerWithBasicFields() {
  @RegisterDataController()
  class TestDataAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/test')) {
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

  const instance = new TestDataAPI();
  expect(instance).to.be.instanceOf(TestDataAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testAccessModes() {
  @RegisterDataController()
  class AccessTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/access-test')) {
    @ModelReference()
    declare tableModel: any;

    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Access(AccessMode.WriteOnly)
    declare password: string;

    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new AccessTestAPI();
  expect(instance).to.be.instanceOf(AccessTestAPI);
}

async function testListableFields() {
  @RegisterDataController()
  class ListableTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/listable-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable(true, 'detailed')
    @Access(AccessMode.ReadWrite)
    declare description: string;

    @Access(AccessMode.ReadWrite)
    declare internalData: string;
  }

  const instance = new ListableTestAPI();
  expect(instance).to.be.instanceOf(ListableTestAPI);
}

async function testSortableFields() {
  @RegisterDataController()
  class SortableTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/sortable-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Sortable({ noIndex: true })
    @Access(AccessMode.ReadWrite)
    declare email: string;
  }

  const instance = new SortableTestAPI();
  expect(instance).to.be.instanceOf(SortableTestAPI);
}

async function testMandatoryFields() {
  @RegisterDataController()
  class MandatoryTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/mandatory-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Mandatory('new')
    @Access(AccessMode.ReadWrite)
    declare email: string;
  }

  const instance = new MandatoryTestAPI();
  expect(instance).to.be.instanceOf(MandatoryTestAPI);
}

async function testForeignKeyReferences() {
  @RegisterDataController()
  class ForeignTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/foreign-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Foreign('users')
    @Access(AccessMode.ReadOnly)
    declare userId: string;

    @Listable()
    @Foreign('categories', 'slug')
    @Access(AccessMode.ReadOnly)
    declare categorySlug: string;

    @Listable()
    @Foreign('tags', undefined, true)
    @Access(AccessMode.ReadOnly)
    declare tagIds: string[];
  }

  const instance = new ForeignTestAPI();
  expect(instance).to.be.instanceOf(ForeignTestAPI);
}

async function testValidators() {
  @RegisterDataController()
  class ValidatorTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/validator-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Validator((value: unknown) => typeof value === 'string' && value.length >= 3)
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Validator((value: unknown) => typeof value === 'string' && value.includes('@'))
    @Access(AccessMode.ReadWrite)
    declare email: string;
  }

  const instance = new ValidatorTestAPI();
  expect(instance).to.be.instanceOf(ValidatorTestAPI);
}

async function testModelReferences() {
  @RegisterDataController()
  class ModelReferenceTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/model-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new ModelReferenceTestAPI();
  expect(instance).to.be.instanceOf(ModelReferenceTestAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testCustomListEndpoints() {
  @RegisterDataController()
  class CustomListTestAPI extends DataController(
    TestTable,
    {
      list: DefaultRoutes.List,
      list2: DefaultRoutes.WithOptions(DefaultRoutes.List, { pluckMode: 'list2' }),
    },
    Controller('/custom-list-test'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Listable(true, 'list2')
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable(true, 'list2')
    @Access(AccessMode.ReadWrite)
    declare description: string;
  }

  const instance = new CustomListTestAPI();
  expect(instance).to.be.instanceOf(CustomListTestAPI);
}
