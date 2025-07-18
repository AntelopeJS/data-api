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
import { Validator, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { getFunctionName, newRequest } from '../utils';

@RegisterTable('products')
class Product extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare sku: string;

  declare name: string;
  declare price: number;
  declare email: string;
  declare birthDate: Date;
  declare status: string;
  declare tags: string[];
}
class ProductModel extends BasicDataModel(Product, 'products') {}
const database_name = 'test-data-api-validator';
let database: Database;

let validProductData = {
  name: 'Valid Product',
  price: 29.99,
  email: 'test@example.com',
  birthDate: new Date('1990-01-01'),
  status: 'active',
  tags: ['electronics', 'gadgets'],
};

describe('Field Validator', () => {
  it('validate correct parameters', async () => await validateCorrectParameters());
  // it('validate incorrect date parameter', async () => await validateIncorrectDateParameter());
  // it('validate incorrect regex parameter', async () => await validateIncorrectEmailParameter());
  // it('validate incorrect string parameter', async () => await validateIncorrectStringParameter());
  // it('validate incorrect number parameter', async () => await validateIncorrectNumberParameter());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, product?: Partial<Product>) {
  @RegisterDataController()
  class _ValidatorTestAPI extends DataController(Product, DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(ProductModel, database_name)
    declare productModel: ProductModel;

    declare _id: string;

    @Validator((value) => typeof value === 'string' && value.length >= 3)
    declare name: string;

    @Validator((value) => typeof value === 'number' && value >= 0)
    declare price: number;

    @Validator((value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    })
    declare email: string;

    @Validator((value) => typeof value === 'string' && !isNaN(Date.parse(value)))
    declare birthDate: Date;

    @Validator((value) => ['active', 'inactive', 'pending'].includes(value as string))
    declare status: string;

    @Validator((value) => Array.isArray(value) && value.every((tag) => typeof tag === 'string' && tag.length > 0))
    declare tags: string[];
  }
  database = Database(database_name);
  const productModel = new ProductModel(database);
  await InitializeDatabase(database_name, { product: ProductModel });

  if (product) {
    const insertResult = await productModel.insert(product);
    return { id: insertResult.generated_keys![0], productModel };
  }
  return { productModel };
}

async function validateCorrectParameters() {
  await _createDataController(getFunctionName());
  const response = await newRequest(getFunctionName(), validProductData);
  expect(response.status).to.equal(200);
  const result = await response.json();
  expect(result).to.be.an('array');
  expect(result).to.have.length(1);
}
