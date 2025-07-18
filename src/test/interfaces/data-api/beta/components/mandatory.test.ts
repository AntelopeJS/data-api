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
import { Mandatory, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { editRequest, getFunctionName, newRequest } from '../utils';

@RegisterTable('orders')
class Order extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare internalReference: string;

  declare customerName: string;
  declare customerEmail: string;
  declare totalAmount: number;
  declare status: string;
  declare notes: string;
}
class OrderModel extends BasicDataModel(Order, 'orders') {}
const database_name = 'test-data-api-mandatory';
let database: Database;

const validOrderDataset: Record<string, Partial<Order>> = {
  default: {
    customerName: 'Bob',
    customerEmail: 'bob@example.com',
    totalAmount: 99.99,
    status: 'pending',
    notes: 'Customer requested express shipping',
    internalReference: 'INT-REF-001',
  },
  alternative: {
    customerName: 'Alice',
    customerEmail: 'alice@example.com',
    totalAmount: 149.99,
    status: 'processing',
    notes: 'Customer requested express shipping',
    internalReference: 'INT-REF-002',
  },
};

describe('Field Mandatory', () => {
  it('new row with all mandatory fields', async () => await newWithAllMandatoryFields());
  it('new row with missing mandatory fields', async () => await newWithMissingMandatoryFields());
  it('edit row with all mandatory fields', async () => await editWithAllMandatoryFields());
  it('edit row with missing mandatory fields', async () => await editWithMissingMandatoryFields());
  it('skip mandatory validation when noMandatory is true', async () => await skipMandatoryValidationWhenNoMandatory());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, order?: Partial<Order>) {
  @RegisterDataController()
  class _MandatoryTestAPI extends DataController(Order, DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(OrderModel, database_name)
    declare orderModel: OrderModel;

    declare id: string;

    @Mandatory('new', 'edit')
    declare customerName: string;

    @Mandatory('new')
    declare customerEmail: string;

    @Mandatory('new', 'edit')
    declare totalAmount: number;

    @Mandatory('edit')
    declare status: string;

    declare notes: string;

    declare internalReference: string;
  }
  database = Database(database_name);
  const orderModel = new OrderModel(database);
  await InitializeDatabase(database_name, { order: OrderModel });

  if (order) {
    const insertResult = await orderModel.insert(order);
    return { id: insertResult.generated_keys![0], orderModel };
  }
  return { orderModel };
}

async function newWithAllMandatoryFields() {
  const { orderModel } = await _createDataController(getFunctionName(), validOrderDataset.default);

  const response = await newRequest(getFunctionName(), {
    customerName: validOrderDataset.default.customerName,
    customerEmail: validOrderDataset.default.customerEmail,
    totalAmount: validOrderDataset.default.totalAmount,
  });
  expect(response.status).to.equal(200);
  const result = (await response.json()) as string[];
  expect(result).to.be.an('array');
  expect(result).to.have.length(1);
  expect(result[0]).to.be.a('string');
  const order = await orderModel.get(result[0]);
  expect(order).to.be.an('object');
  expect(order).to.have.property('customerName', validOrderDataset.default.customerName);
  expect(order).to.have.property('customerEmail', validOrderDataset.default.customerEmail);
  expect(order).to.have.property('totalAmount', validOrderDataset.default.totalAmount);
}

async function newWithMissingMandatoryFields() {
  await _createDataController(getFunctionName());

  const response = await newRequest(getFunctionName(), {
    customerName: validOrderDataset.default.customerName,
    totalAmount: validOrderDataset.default.totalAmount,
  });
  expect(response.status).to.equal(400);
  const result = (await response.json()) as { error: string };
  expect(result).to.be.an('object');
  expect(result).to.have.property('error');
  expect(result.error).to.include('customerEmail');
}

async function editWithAllMandatoryFields() {
  const { id, orderModel } = await _createDataController(getFunctionName(), validOrderDataset.default);

  const response = await editRequest(getFunctionName(), {
    id: id!,
    customerName: validOrderDataset.alternative.customerName,
    totalAmount: validOrderDataset.alternative.totalAmount,
    status: validOrderDataset.alternative.status,
  });
  expect(response.status).to.equal(200);

  const result = (await response.json()) as string[];
  expect(result).to.be.an('array');
  expect(result).to.have.length(1);
  expect(result[0]).to.be.a('string');

  const order = await orderModel.get(id!);
  expect(order).to.be.an('object');
  expect(order).to.have.property('customerName', validOrderDataset.alternative.customerName);
  expect(order).to.have.property('totalAmount', validOrderDataset.alternative.totalAmount);
  expect(order).to.have.property('status', validOrderDataset.alternative.status);
}

async function editWithMissingMandatoryFields() {
  const { id } = await _createDataController(getFunctionName(), validOrderDataset.default);

  const response = await editRequest(getFunctionName(), {
    id: id!,
    customerName: validOrderDataset.alternative.customerName,
    totalAmount: validOrderDataset.alternative.totalAmount,
  });
  expect(response.status).to.equal(400);

  const result = (await response.json()) as { error: string };
  expect(result).to.be.an('object');
  expect(result).to.have.property('error');
  expect(result.error).to.include('status');
}

async function skipMandatoryValidationWhenNoMandatory() {
  const { id, orderModel } = await _createDataController(getFunctionName(), validOrderDataset.default);

  const response = await editRequest(
    getFunctionName(),
    {
      id: id!,
      notes: 'Updated notes',
    },
    { noMandatory: 'true' },
  );
  expect(response.status).to.equal(200);

  const result = (await response.json()) as string[];
  expect(result).to.be.an('array');
  expect(result).to.have.length(1);
  expect(result[0]).to.be.a('string');

  const order = await orderModel.get(id!);
  expect(order).to.be.an('object');
  expect(order).to.have.property('notes', 'Updated notes');
}
