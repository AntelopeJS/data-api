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
import { Listable, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { getFunctionName, listRequest } from '../utils';

@RegisterTable('products')
class Product extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare reference: string;

  declare name: string;
  declare description: string;
  declare price: number;
  declare addedAt: Date;
  declare internalNotes: string;
  declare metadata: string;
}
class ProductModel extends BasicDataModel(Product, 'products') {}
const database_name = 'test-data-api-listable';

const defaultProductDataset: Partial<Product>[] = [
  {
    name: 'OneSung X',
    description: 'Smartphone with a 6.7-inch display based on an Tensilica Xtensa LX6 chip.',
    price: 929.99,
    reference: 'OS-X',
    addedAt: new Date('2025-06-15'),
    internalNotes: 'This should not be visible in lists',
    metadata: 'idk what to put here',
  },
  {
    name: 'Kine Earth Max',
    description: "AI powered shoes, adjusting the sole's flexibility based on the ground",
    price: 129.99,
    reference: 'KE-MAX',
    addedAt: new Date('1900-01-01'),
    internalNotes: 'This should not be visible in lists either',
    metadata: "seriously, no idea what to put here. At least there's a string",
  },
  {
    name: 'Pocket Potato',
    description: 'A potato that fits in your pocket',
    price: 1.99,
    reference: 'PP-1',
    addedAt: new Date('3000-12-31'),
    internalNotes: 'Again, not visible in lists',
    metadata: 'still does not matter',
  },
];

describe('Field Listable', () => {
  it('default listing', async () => await defaultListing());
  it('list only detailed fields', async () => await listOnlyDetailedFields());
  it('list only 2 rows per page', async () => await listOnly2RowsPerPage());
  it('list from 2nd page', async () => await listFrom2ndPage());
  it('list only 2 first pages', async () => await listOnly2FirstPages());
  it('list only 2nd page', async () => await listOnly2ndPage());
  it('sorting by string (name), ascending', async () => await sortByNameAscending());
  it('sorting by string (name), descending', async () => await sortByNameDescending());
  it('sorting by number (price), ascending', async () => await sortByPriceAscending());
  it('sorting by number (price), descending', async () => await sortByPriceDescending());
  it('sorting by date (addedAt), ascending', async () => await sortByAddedAtAscending());
  it('sorting by date (addedAt), descending', async () => await sortByAddedAtDescending());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, product: Partial<Product>[]) {
  @RegisterDataController()
  class _ListableTestAPI extends DataController(Product, DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(ProductModel, database_name)
    declare productModel: ProductModel;

    @Listable()
    declare id: string;

    @Listable()
    declare name: string;

    @Listable()
    declare price: number;

    @Listable()
    declare reference: string;

    declare internalNotes: string;

    @Listable(true, 'detailed')
    declare metadata: string;

    @Listable(['list', 'detailed'])
    declare description: string;
  }
  const productModel = new ProductModel(Database(database_name));
  await InitializeDatabase(database_name, { product: ProductModel });
  const insertResults = await productModel.insert(product);
  return { ids: insertResults.generated_keys!, productModel };
}

async function defaultListing() {
  const { ids } = await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName());
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const products = data.results;
  expect(products[0].id).to.equal(ids[0]);
  expect(products[0].name).to.equal(defaultProductDataset[0].name);
  expect(products[0].price).to.equal(defaultProductDataset[0].price);
  expect(products[0].reference).to.equal(defaultProductDataset[0].reference);
  expect(products[0].metadata).to.equal(defaultProductDataset[0].metadata);
  expect(products[0].description).to.equal(defaultProductDataset[0].description);
  expect(products[0].internalNotes).to.equal(undefined);
}

async function listOnlyDetailedFields() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { pluckMode: 'detailed' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const product = data.results[0];
  expect(product.metadata).to.equal(defaultProductDataset[0].metadata);
}

async function listOnly2RowsPerPage() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { limit: '2' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(2);
  expect(data.total).to.equal(defaultProductDataset.length);
  expect(data.limit).to.equal(2);
  expect(data.offset).to.equal(0);
}

async function listFrom2ndPage() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { offset: '2' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(1);
  expect(data.total).to.equal(defaultProductDataset.length);
  expect(data.offset).to.equal(2);
}

async function listOnly2FirstPages() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { maxPage: '2' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);
  expect(data.total).to.equal(defaultProductDataset.length);
}

async function listOnly2ndPage() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { offset: '2', limit: '1' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, any>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(1);
  expect(data.total).to.equal(defaultProductDataset.length);
  expect(data.offset).to.equal(2);
  expect(data.limit).to.equal(1);
}

function getSortedField(dataset: Partial<Product>[], field: keyof Product, direction: 'asc' | 'desc') {
  const mappedField = dataset.map((product) => product[field]);

  const filteredField = mappedField.filter((v): v is string | number | Date => v !== undefined && v !== null);

  filteredField.sort((a, b) => {
    if (a instanceof Date && b instanceof Date) {
      return direction === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a;
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    }
    return 0;
  });

  return filteredField;
}

async function sortByNameAscending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'name', sortDirection: 'asc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedNames = data.results.map((product: any) => product.name);
  const expectedNames = getSortedField(defaultProductDataset, 'name', 'asc');
  expect(sortedNames).to.deep.equal(expectedNames);
}

async function sortByNameDescending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'name', sortDirection: 'desc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedNames = data.results.map((product: any) => product.name);
  const expectedNames = getSortedField(defaultProductDataset, 'name', 'desc');
  expect(sortedNames).to.deep.equal(expectedNames);
}

async function sortByPriceAscending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'price', sortDirection: 'asc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedPrices = data.results.map((product: any) => product.price);
  const expectedPrices = getSortedField(defaultProductDataset, 'price', 'asc');
  expect(sortedPrices).to.deep.equal(expectedPrices);
}

async function sortByPriceDescending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'price', sortDirection: 'desc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedPrices = data.results.map((product: any) => product.price);
  const expectedPrices = getSortedField(defaultProductDataset, 'price', 'desc');
  expect(sortedPrices).to.deep.equal(expectedPrices);
}

async function sortByAddedAtAscending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'addedAt', sortDirection: 'asc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedDates = data.results.map((product: any) => new Date(product.addedAt).getTime());
  const expectedDates = getSortedField(defaultProductDataset, 'addedAt', 'asc')
    .filter((value): value is Date => value instanceof Date)
    .map((date: Date) => date.getTime());
  expect(sortedDates).to.deep.equal(expectedDates);
}

async function sortByAddedAtDescending() {
  await _createDataController(getFunctionName(), defaultProductDataset);

  const response = await listRequest(getFunctionName(), { sortKey: 'addedAt', sortDirection: 'desc' });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as {
    results: Record<string, unknown>[];
    total: number;
    offset: number;
    limit: number;
  };
  expect(data.results).to.have.length(defaultProductDataset.length);

  const sortedDates = data.results.map((product: any) => new Date(product.addedAt).getTime());
  const expectedDates = getSortedField(defaultProductDataset, 'addedAt', 'desc')
    .filter((value): value is Date => value instanceof Date)
    .map((date: Date) => date.getTime());
  expect(sortedDates).to.deep.equal(expectedDates);
}
