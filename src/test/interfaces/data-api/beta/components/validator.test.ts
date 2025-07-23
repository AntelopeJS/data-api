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
import { Validator, ModelReference, AccessMode, Access } from '@ajs.local/data-api/beta/metadata';
import { editRequest, getFunctionName, newRequest, validateObject } from '../utils';
import path from 'node:path';

const productTableName = 'products';
const database_name = `test-data-api-${path.basename(__filename).replace(/\.test\.(ts|js)$/, '')}`;

@RegisterTable(productTableName)
class Product extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare sku: string;

  declare name: string;
  declare price: number;
  declare email: string;
  declare birthDate: Date;
  declare status: string;
  declare tags: string[];
}
class ProductModel extends BasicDataModel(Product, productTableName) {}

const validProductData: Record<string, Partial<Product>> = {
  default: {
    name: 'Valid Product',
    price: 29.99,
    email: 'test@example.com',
    birthDate: new Date('1990-01-01'),
    status: 'active',
    tags: ['electronics', 'gadgets'],
  },
  alternative: {
    name: 'Valid Product',
    price: 29.99,
    email: 'test@example.com',
    birthDate: new Date('1990-01-01'),
    status: 'active',
    tags: ['electronics', 'gadgets'],
  },
};

describe('Field Validator', () => {
  it('validate correct parameters on new', async () => await validateCorrectParametersOnNew());
  it('validate incorrect date parameter on new', async () => await validateIncorrectDateParameterOnNew());
  it('validate incorrect regex parameter on new', async () => await validateIncorrectEmailParameterOnNew());
  it('validate incorrect string parameter on new', async () => await validateIncorrectStringParameterOnNew());
  it('validate incorrect number parameter on new', async () => await validateIncorrectNumberParameterOnNew());
  it('validate correct parameters on edit', async () => await validateCorrectParametersOnEdit());
  it('validate incorrect date parameter on edit', async () => await validateIncorrectDateParameterOnEdit());
  it('validate incorrect regex parameter on edit', async () => await validateIncorrectEmailParameterOnEdit());
  it('validate incorrect string parameter on edit', async () => await validateIncorrectStringParameterOnEdit());
  it('validate incorrect number parameter on edit', async () => await validateIncorrectNumberParameterOnEdit());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, route: any, product?: Partial<Product>) {
  @RegisterDataController()
  class _ValidatorTestAPI extends DataController(Product, route, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(ProductModel, database_name)
    declare productModel: ProductModel;

    declare _id: string;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => typeof value === 'string' && value.length >= 3)
    declare name: string;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => typeof value === 'number' && value >= 0)
    declare price: number;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    })
    declare email: string;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => typeof value === 'string' && !isNaN(Date.parse(value)))
    declare birthDate: Date;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => ['active', 'inactive', 'pending'].includes(value as string))
    declare status: string;

    @Access(AccessMode.ReadWrite)
    @Validator((value) => Array.isArray(value) && value.every((tag) => typeof tag === 'string' && tag.length > 0))
    declare tags: string[];
  }
  const productModel = new ProductModel(Database(database_name));
  await InitializeDatabase(database_name, { products: ProductModel });

  if (product) {
    const insertResult = await productModel.insert(product);
    return { id: insertResult.generated_keys![0], productModel };
  }
  return { productModel };
}

function createIncorrectValidator(
  fieldName: string,
  invalidValue: any,
  requestFunction: (testName: string, data: any, id?: Record<string, string>) => Promise<Response>,
  route: any,
  testDataset: Partial<Product>,
  createDataset?: Partial<Product>,
) {
  return async () => {
    const { id, productModel: _productModel } = await _createDataController(getFunctionName(), route, createDataset);

    const invalidData = { ...testDataset, [fieldName]: invalidValue };
    const response = await requestFunction(getFunctionName(), invalidData, id ? { id } : {});
    expect(response.status).to.equal(400);

    const error = await response.text();
    expect(error).to.include(fieldName);
  };
}

function createCorrectValidator(
  requestFunction: (testName: string, data: any, id?: Record<string, string>) => Promise<Response>,
  route: any,
  testDataset: Partial<Product>,
  createDataset?: Partial<Product>,
) {
  return async () => {
    const { id, productModel } = await _createDataController(getFunctionName(), route, createDataset);

    const response = await requestFunction(getFunctionName(), testDataset, id ? { id } : {});
    expect(response.status).to.equal(200);

    let product_fetched: Product | undefined;
    if (id) {
      product_fetched = await productModel.get(id);
    } else {
      const result = (await response.json()) as string[];
      expect(result).to.be.an('array');
      expect(result).to.have.length(1);
      expect(result[0]).to.be.an('string');
      product_fetched = await productModel.get(result[0]);
    }
    expect(product_fetched).to.not.equal(undefined);
    if (product_fetched) {
      await validateObject(product_fetched, testDataset, ['email', 'name', 'price', 'status', 'tags']);
    }
  };
}

function createIncorrectValidatorEdit(
  fieldName: string,
  invalidValue: any,
  requestFunction: (testName: string, data: any) => Promise<Response>,
) {
  return createIncorrectValidator(
    fieldName,
    invalidValue,
    requestFunction,
    { edit: DefaultRoutes.Edit },
    validProductData.alternative,
    validProductData.default,
  );
}

function createIncorrectValidatorNew(
  fieldName: string,
  invalidValue: any,
  requestFunction: (testName: string, data: any) => Promise<Response>,
) {
  return createIncorrectValidator(
    fieldName,
    invalidValue,
    requestFunction,
    { new: DefaultRoutes.New },
    validProductData.default,
  );
}

const validateCorrectParametersOnNew = createCorrectValidator(
  newRequest,
  { new: DefaultRoutes.New },
  validProductData.default,
);
const validateIncorrectDateParameterOnNew = createIncorrectValidatorNew('birthDate', 'invalid', newRequest);
const validateIncorrectEmailParameterOnNew = createIncorrectValidatorNew('email', 'invalid', newRequest);
const validateIncorrectStringParameterOnNew = createIncorrectValidatorNew('name', 'ab', newRequest);
const validateIncorrectNumberParameterOnNew = createIncorrectValidatorNew('price', -10, newRequest);

const validateCorrectParametersOnEdit = createCorrectValidator(
  editRequest,
  { edit: DefaultRoutes.Edit },
  validProductData.alternative,
  validProductData.default,
);
const validateIncorrectDateParameterOnEdit = createIncorrectValidatorEdit('birthDate', 'invalid-date', editRequest);
const validateIncorrectEmailParameterOnEdit = createIncorrectValidatorEdit('email', 'invalid-email@a', editRequest);
const validateIncorrectStringParameterOnEdit = createIncorrectValidatorEdit('name', 'ab', editRequest);
const validateIncorrectNumberParameterOnEdit = createIncorrectValidatorEdit('price', -10, editRequest);
