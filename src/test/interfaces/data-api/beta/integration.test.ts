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

describe('Data API Integration Tests', () => {
  it('performs complete CRUD operations', async () => await testCompleteCRUDOperationsWorkflow());
  it('validates field data', async () => await testFieldValidationCorrectly());
  it('manages foreign key relationships', async () => await testForeignKeyRelationships());
  it('creates custom list endpoints', async () => await testCustomListEndpoints());
  it('extends base controllers', async () => await testInheritance());
});

async function testCompleteCRUDOperationsWorkflow() {
  @RegisterDataController()
  class CompleteCRUDAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/complete-crud')) {
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
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadWrite)
    declare age: number;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare isActive: boolean;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare createdAt: Date;
  }

  const instance = new CompleteCRUDAPI();
  expect(instance).to.be.instanceOf(CompleteCRUDAPI);
  expect(instance.tableModel).to.not.equal(undefined);
}

async function testFieldValidationCorrectly() {
  @RegisterDataController()
  class ValidationTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/validation-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Validator((value: unknown) => typeof value === 'string' && value.length >= 3)
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Validator((value: unknown) => typeof value === 'string' && value.includes('@'))
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable()
    @Validator((value: unknown) => typeof value === 'number' && value >= 0)
    @Access(AccessMode.ReadWrite)
    declare age: number;

    @Listable()
    @Validator((value: unknown) => typeof value === 'boolean')
    @Access(AccessMode.ReadWrite)
    declare isActive: boolean;
  }

  const instance = new ValidationTestAPI();
  expect(instance).to.be.instanceOf(ValidationTestAPI);
}

async function testForeignKeyRelationships() {
  @RegisterDataController()
  class ForeignKeyTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/foreign-key-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

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

  const instance = new ForeignKeyTestAPI();
  expect(instance).to.be.instanceOf(ForeignKeyTestAPI);
}

async function testCustomListEndpoints() {
  @RegisterDataController()
  class CustomListTestAPI extends DataController(
    TestTable,
    {
      list: DefaultRoutes.List,
      list2: DefaultRoutes.WithOptions(DefaultRoutes.List, { pluckMode: 'list2' }),
      list3: DefaultRoutes.WithOptions(DefaultRoutes.List, { pluckMode: 'detailed' }),
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

    @Listable()
    @Listable(true, 'list2')
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable(true, 'list2')
    @Access(AccessMode.ReadWrite)
    declare description: string;

    @Listable(true, 'detailed')
    @Access(AccessMode.ReadWrite)
    declare metadata: string;
  }

  const instance = new CustomListTestAPI();
  expect(instance).to.be.instanceOf(CustomListTestAPI);
}

async function testInheritance() {
  @RegisterDataController()
  class BaseDataAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/base')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadOnly)
    declare createdAt: Date;
  }

  @RegisterDataController()
  class ExtendedDataAPI extends BaseDataAPI {
    @Listable()
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable()
    @Sortable()
    @Access(AccessMode.ReadWrite)
    declare age: number;
  }

  const baseInstance = new BaseDataAPI();
  const extendedInstance = new ExtendedDataAPI();

  expect(baseInstance).to.be.instanceOf(BaseDataAPI);
  expect(extendedInstance).to.be.instanceOf(ExtendedDataAPI);
  expect(extendedInstance).to.be.instanceOf(BaseDataAPI);
}
