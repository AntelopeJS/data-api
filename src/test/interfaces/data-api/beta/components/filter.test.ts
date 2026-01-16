import { expect } from 'chai';
import { Database, DeleteDatabase } from '@ajs/database/beta';
import {
  Table,
  Index,
  RegisterTable,
  InitializeDatabase,
  BasicDataModel,
  StaticModel,
} from '@ajs/database-decorators/beta';
import { Controller } from '@ajs/api/beta';
import { DataController, DefaultRoutes, RegisterDataController } from '@ajs.local/data-api/beta';
import { Access, AccessMode, Filter, Listable, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { listRequest } from '../utils';
import path from 'node:path';

const currentTestName = path.basename(__filename).replace(/\.test\.(ts|js)$/, '');
const tableName = `items-${currentTestName}`;
const databaseName = `test-data-api-${currentTestName}`;

@RegisterTable(tableName)
class Item extends Table {
  @Index({ primary: true })
  declare _id: string;

  declare name: string;
  declare price: number;
}

class ItemModel extends BasicDataModel(Item, tableName) {}

@RegisterDataController()
class _FilterTestAPI extends DataController(Item, { list: DefaultRoutes.List }, Controller(`/${currentTestName}`)) {
  @ModelReference()
  @StaticModel(ItemModel, databaseName)
  declare itemModel: ItemModel;

  @Listable()
  @Access(AccessMode.ReadOnly)
  declare _id: string;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Filter()
  declare name: string;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Filter()
  declare price: number;
}

const defaultDataset: Partial<Item>[] = [
  { name: 'Item A', price: 100 },
  { name: 'Item B', price: 200 },
  { name: 'Item C', price: 50 },
];

describe('Filter Comparison Mode Validation', () => {
  before(async () => {
    const itemModel = new ItemModel(Database(databaseName));
    await InitializeDatabase(databaseName, { [tableName]: ItemModel });
    await itemModel.insert(defaultDataset);
  });

  after(async () => await DeleteDatabase(databaseName));

  it('should return 400 for invalid comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_name: 'invalid:test' });
    expect(response.status).to.equal(400);
    const text = await response.text();
    expect(text).to.include('Invalid comparison mode');
    expect(text).to.include('invalid');
    expect(text).to.include('eq, ne, gt, ge, lt, le');
  });

  it('should return 400 for another invalid comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_price: 'contains:50' });
    expect(response.status).to.equal(400);
    const text = await response.text();
    expect(text).to.include('Invalid comparison mode');
    expect(text).to.include('contains');
  });

  it('should accept valid eq comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_name: 'eq:Item A' });
    expect(response.status).to.equal(200);
    const data = (await response.json()) as { results: Item[]; total: number };
    expect(data.results).to.have.length(1);
    expect(data.results[0].name).to.equal('Item A');
  });

  it('should accept valid ne comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_name: 'ne:Item A' });
    expect(response.status).to.equal(200);
    const data = (await response.json()) as { results: Item[]; total: number };
    expect(data.results).to.have.length(2);
    for (const item of data.results) {
      expect(item.name).to.not.equal('Item A');
    }
  });

  it('should accept valid gt comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_price: 'gt:100' });
    expect(response.status).to.equal(200);
  });

  it('should accept valid ge comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_price: 'ge:100' });
    expect(response.status).to.equal(200);
  });

  it('should accept valid lt comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_price: 'lt:100' });
    expect(response.status).to.equal(200);
  });

  it('should accept valid le comparison mode', async () => {
    const response = await listRequest(currentTestName, { filter_price: 'le:100' });
    expect(response.status).to.equal(200);
  });

  it('should default to eq when no mode specified', async () => {
    const response = await listRequest(currentTestName, { filter_name: 'Item B' });
    expect(response.status).to.equal(200);
    const data = (await response.json()) as { results: Item[]; total: number };
    expect(data.results).to.have.length(1);
    expect(data.results[0].name).to.equal('Item B');
  });
});
