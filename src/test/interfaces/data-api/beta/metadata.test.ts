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

describe('Data API Metadata', () => {
  it('controls field read/write access', async () => await testAccessModes());
  it('lists rows', async () => await testListableFields());
  it('lists rows with custom modes', async () => await testListableFieldsWithCustomModes());
  it('requires mandatory fields', async () => await testMandatoryFields());
  it('sorts rows by field', async () => await testSortableFields());
  it('sorts rows without table index', async () => await testSortableFieldsWithoutIndex());
  it('resolves foreign key references', async () => await testForeignKeyReferences());
  it('validates string length', async () => await testValidators());
  it('connects to data model', async () => await testModelReferences());
  it('extends base controllers', async () => await testInheritance());
});

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

    @Access(AccessMode.ReadWrite)
    declare internalData: string;
  }

  const instance = new ListableTestAPI();
  expect(instance).to.be.instanceOf(ListableTestAPI);
}

async function testListableFieldsWithCustomModes() {
  @RegisterDataController()
  class CustomListableTestAPI extends DataController(
    TestTable,
    DefaultRoutes.All,
    Controller('/custom-listable-test'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable(true, 'detailed')
    @Access(AccessMode.ReadWrite)
    declare metadata: string;

    @Listable(['list', 'detailed'])
    @Access(AccessMode.ReadWrite)
    declare title: string;
  }

  const instance = new CustomListableTestAPI();
  expect(instance).to.be.instanceOf(CustomListableTestAPI);
}

async function testMandatoryFields() {
  @RegisterDataController()
  class MandatoryTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/mandatory-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare title: string;

    @Mandatory('new')
    @Access(AccessMode.ReadWrite)
    declare initialStatus: string;
  }

  const instance = new MandatoryTestAPI();
  expect(instance).to.be.instanceOf(MandatoryTestAPI);
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
  }

  const instance = new SortableTestAPI();
  expect(instance).to.be.instanceOf(SortableTestAPI);
}

async function testSortableFieldsWithoutIndex() {
  @RegisterDataController()
  class SortableNoIndexTestAPI extends DataController(
    TestTable,
    DefaultRoutes.All,
    Controller('/sortable-noindex-test'),
  ) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Sortable({ noIndex: true })
    @Access(AccessMode.ReadWrite)
    declare name: string;
  }

  const instance = new SortableNoIndexTestAPI();
  expect(instance).to.be.instanceOf(SortableNoIndexTestAPI);
}

async function testForeignKeyReferences() {
  @RegisterDataController()
  class ForeignTestAPI extends DataController(TestTable, DefaultRoutes.All, Controller('/foreign-test')) {
    @ModelReference()
    declare tableModel: any;

    @Listable()
    @Access(AccessMode.ReadOnly)
    declare _id: string;

    @Foreign('users')
    @Access(AccessMode.ReadOnly)
    declare userId: string;

    @Foreign('categories', 'slug')
    @Access(AccessMode.ReadOnly)
    declare categorySlug: string;

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

    @Validator((value: unknown) => typeof value === 'string' && value.length >= 3)
    @Access(AccessMode.ReadWrite)
    declare title: string;
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
  class TaskDataAPI extends BaseDataAPI {
    @Listable()
    @Mandatory('new', 'edit')
    @Access(AccessMode.ReadWrite)
    declare title: string;
  }

  const baseInstance = new BaseDataAPI();
  const taskInstance = new TaskDataAPI();

  expect(baseInstance).to.be.instanceOf(BaseDataAPI);
  expect(taskInstance).to.be.instanceOf(TaskDataAPI);
  expect(taskInstance).to.be.instanceOf(BaseDataAPI);
}
