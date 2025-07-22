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
import { Access, AccessMode, Mandatory, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { editRequest, getFunctionName, newRequest, request, validateObject } from '../utils';
import path from 'node:path';

const orderTableName = 'orders';
const database_name = `test-data-api-${path.basename(__filename).replace(/\.test\.(ts|js)$/, '')}`;

@RegisterTable(orderTableName)
class Order extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare internalReference: string;

  declare customerName: string;
  declare customerEmail: string;
  declare totalAmount: number;
  declare status: string;
  declare notes: string;
}

class OrderModel extends BasicDataModel(Order, orderTableName) {}

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

async function _dropOrderTable() {
  await Database(database_name).table(orderTableName).delete();
}

async function _createDataController(testName: string, route: any, order?: Partial<Order>) {
  await _dropOrderTable();
  @RegisterDataController()
  class _MandatoryTestAPI extends DataController(Order, route, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(OrderModel, database_name)
    declare orderModel: OrderModel;

    declare _id: string;

    @Access(AccessMode.ReadWrite)
    @Mandatory('new', 'edit')
    declare customerName: string;

    @Access(AccessMode.ReadWrite)
    @Mandatory('new')
    declare customerEmail: string;

    @Access(AccessMode.ReadWrite)
    @Mandatory('new', 'edit')
    declare totalAmount: number;

    @Access(AccessMode.ReadWrite)
    @Mandatory('edit')
    declare status: string;

    @Access(AccessMode.ReadWrite)
    declare notes: string;

    @Access(AccessMode.ReadWrite)
    declare internalReference: string;
  }
  const orderModel = new OrderModel(Database(database_name));
  await InitializeDatabase(database_name, { order: OrderModel });

  if (order) {
    const insertResult = await orderModel.insert(order);
    return { id: insertResult.generated_keys![0], orderModel };
  }
  return { orderModel };
}

async function newWithAllMandatoryFields() {
  const { orderModel } = await _createDataController(
    getFunctionName(),
    { new: DefaultRoutes.New },
    validOrderDataset.alternative,
  );

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
  expect(order).to.not.equal(undefined);
  if (order) {
    await validateObject(order, validOrderDataset.default, ['customerName', 'customerEmail', 'totalAmount']);
  }
}

async function newWithMissingMandatoryFields() {
  await _createDataController(getFunctionName(), { new: DefaultRoutes.New });

  const response = await newRequest(getFunctionName(), {
    customerName: validOrderDataset.default.customerName,
    totalAmount: validOrderDataset.default.totalAmount,
  });
  expect(response.status).to.equal(400);
  const result = await response.text();
  expect(result).to.include('Missing mandatory fields: customerEmail');
}

async function editWithAllMandatoryFields() {
  const { id, orderModel } = await _createDataController(
    getFunctionName(),
    { edit: DefaultRoutes.Edit },
    validOrderDataset.default,
  );

  const response = await editRequest(
    getFunctionName(),
    {
      customerName: validOrderDataset.alternative.customerName,
      totalAmount: validOrderDataset.alternative.totalAmount,
      status: validOrderDataset.alternative.status,
    },
    { id: id! },
  );
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
  const { id } = await _createDataController(
    getFunctionName(),
    { edit: DefaultRoutes.Edit },
    validOrderDataset.default,
  );

  const response = await editRequest(
    getFunctionName(),
    {
      customerName: validOrderDataset.alternative.customerName,
      totalAmount: validOrderDataset.alternative.totalAmount,
    },
    { id: id! },
  );
  expect(response.status).to.equal(400);
  const text = await response.text();
  expect(text).to.include('Missing mandatory fields: status');
}

async function skipMandatoryValidationWhenNoMandatory() {
  const { id, orderModel } = await _createDataController(
    getFunctionName(),
    { editNoMandatory: DefaultRoutes.WithOptions(DefaultRoutes.Edit, { noMandatory: 'true' }) },
    validOrderDataset.default,
  );

  const response = await request(getFunctionName(), 'editNoMandatory', 'PUT', { notes: 'Updated notes' }, { id: id! });
  expect(response.status).to.equal(200);

  const result = (await response.json()) as string[];
  expect(result).to.be.an('array');
  expect(result).to.have.length(1);
  expect(result[0]).to.be.a('string');

  const order = await orderModel.get(id!);
  expect(order).to.be.an('object');
  expect(order).to.have.property('notes', 'Updated notes');
}
