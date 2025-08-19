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
import {
  Access,
  AccessMode,
  Listable,
  ModelReference,
  Sortable,
  Mandatory,
  Validator,
} from '@ajs.local/data-api/beta/metadata';
import { editRequest, getRequest, listRequest, newRequest, request, validateObject } from './utils';
import path from 'node:path';

const currentTestName = path.basename(__filename).replace(/\.test\.(ts|js)$/, '');
const customerTableName = `customers-${currentTestName}`;
const productTableName = `products-${currentTestName}`;
const orderTableName = `orders-${currentTestName}`;
const orderItemTableName = `order_items-${currentTestName}`;
const database_name = `test-data-api-${currentTestName}`;

@RegisterTable(customerTableName)
class Customer extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare email: string;

  declare firstName: string;
  declare lastName: string;
  declare phone: string;
  declare address: string;
  declare city: string;
  declare postalCode: string;
  declare country: string;
  declare registrationDate: Date;
  declare isActive: boolean;
  declare loyaltyPoints: number;
  declare preferences: string[];
}

@RegisterTable(productTableName)
class Product extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare sku: string;

  declare name: string;
  declare description: string;
  declare price: number;
  declare costPrice: number;
  declare stockQuantity: number;
  declare category: string;
  declare brand: string;
  declare tags: string[];
  declare images: string[];
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

@RegisterTable(orderTableName)
class Order extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare orderNumber: string;

  @Index()
  declare customerId: string;

  declare status: string;
  declare totalAmount: number;
  declare shippingCost: number;
  declare taxAmount: number;
  declare discountAmount: number;
  declare finalAmount: number;
  declare shippingAddress: string;
  declare billingAddress: string;
  declare paymentMethod: string;
  declare notes: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

@RegisterTable(orderItemTableName)
class OrderItem extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare orderId: string;

  @Index()
  declare productId: string;

  declare quantity: number;
  declare unitPrice: number;
  declare totalPrice: number;
  declare finalPrice: number;
  declare discount: number;
}

class CustomerModel extends BasicDataModel(Customer, customerTableName) {}
class ProductModel extends BasicDataModel(Product, productTableName) {}
class OrderModel extends BasicDataModel(Order, orderTableName) {}
class OrderItemModel extends BasicDataModel(OrderItem, orderItemTableName) {}

const testCustomers: Partial<Customer>[] = [
  {
    firstName: 'Bob',
    lastName: 'Bobberson',
    email: 'bob.bobberson@email.com',
    phone: '+1234567890',
    address: '123 Poutine Square',
    city: 'Quebec City',
    postalCode: 'G1K 1K1',
    country: 'Canada',
    registrationDate: new Date('2023-01-15'),
    isActive: true,
    loyaltyPoints: 150,
    preferences: ['electronics', 'books'],
  },
  {
    firstName: 'Alice',
    lastName: 'Alison',
    email: 'alice.alison@email.com',
    phone: '+33123456789',
    address: '456 Baguette Street',
    city: 'Lyon',
    postalCode: '69001',
    country: 'France',
    registrationDate: new Date('2023-03-20'),
    isActive: true,
    loyaltyPoints: 75,
    preferences: ['fashion', 'home'],
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+32123456789',
    address: '789 Fries Avenue',
    city: 'Brussels',
    postalCode: '1000',
    country: 'Belgium',
    registrationDate: new Date('2023-06-10'),
    isActive: false,
    loyaltyPoints: 0,
    preferences: ['sports'],
  },
];

const testProducts: Partial<Product>[] = [
  {
    sku: 'LAPTOP-001',
    name: 'Gaming Laptop',
    description: 'High performance gaming laptop',
    price: 1299.99,
    costPrice: 899.99,
    stockQuantity: 15,
    category: 'electronics',
    brand: 'TechCorp',
    tags: ['gaming', 'laptop', 'high-performance'],
    images: ['laptop1.jpg', 'laptop2.jpg'],
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    sku: 'PHONE-002',
    name: 'Premium Smartphone',
    description: 'Professional camera smartphone',
    price: 899.99,
    costPrice: 599.99,
    stockQuantity: 25,
    category: 'electronics',
    brand: 'MobileTech',
    tags: ['smartphone', 'camera', 'premium'],
    images: ['phone1.jpg', 'phone2.jpg'],
    isActive: true,
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-11-15'),
  },
  {
    sku: 'BOOK-003',
    name: 'The Soldering Bible',
    description: 'Complete guide to soldering components',
    price: 49.99,
    costPrice: 25.99,
    stockQuantity: 50,
    category: 'books',
    brand: 'TechBooks',
    tags: ['soldering', 'electronics', 'education'],
    images: ['book1.jpg'],
    isActive: true,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-10-01'),
  },
  {
    sku: 'SHIRT-004',
    name: 'Organic Cotton T-shirt',
    description: 'Comfortable organic cotton t-shirt',
    price: 29.99,
    costPrice: 15.99,
    stockQuantity: 100,
    category: 'fashion',
    brand: 'EcoFashion',
    tags: ['cotton', 'organic', 'comfortable'],
    images: ['shirt1.jpg', 'shirt2.jpg'],
    isActive: true,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-09-10'),
  },
];

describe('Integration tests', () => {
  it('workflow complete of customer management', async () => await workflowCustomerManagement());
  it('workflow complete of product management', async () => await workflowProductManagement());
  it('workflow complete of order management', async () => await workflowOrderManagement());
  it('stock management and automatic update', async () => await stockManagementAndAutomaticUpdate());
  it('advanced search and filtering', async () => await advancedSearchAndFiltering());
  it('client preferences management and recommendations', async () => await clientPreferencesManagement());
  it('error management and complex validation', async () => await errorManagementAndComplexValidation());

  after(async () => await DeleteDatabase(database_name));
});

@RegisterDataController()
class _CustomerAPI extends DataController(Customer, DefaultRoutes.All, Controller('/customers')) {
  @ModelReference()
  @StaticModel(CustomerModel, database_name)
  declare customerModel: CustomerModel;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Index({ primary: true })
  declare _id: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'string' && value.length >= 2)
  declare firstName: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'string' && value.length >= 2)
  declare lastName: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  })
  declare email: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Validator((value) => typeof value === 'string' && value.length >= 10)
  declare phone: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare address: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare city: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare postalCode: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare country: string;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Sortable({ noIndex: true })
  declare registrationDate: Date;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare isActive: boolean;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Sortable({ noIndex: true })
  declare loyaltyPoints: number;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare preferences: string[];
}

@RegisterDataController()
class _ProductAPI extends DataController(Product, DefaultRoutes.All, Controller('/products')) {
  @ModelReference()
  @StaticModel(ProductModel, database_name)
  declare productModel: ProductModel;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Index({ primary: true })
  declare _id: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'string' && value.length >= 3)
  declare sku: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'string' && value.length >= 3)
  declare name: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare description: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'number' && value >= 0)
  @Sortable({ noIndex: true })
  declare price: number;

  @Access(AccessMode.WriteOnly)
  @Validator((value) => typeof value === 'number' && value >= 0)
  @Sortable({ noIndex: true })
  declare costPrice: number;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'number' && value >= 0)
  @Sortable({ noIndex: true })
  declare stockQuantity: number;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  declare category: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare brand: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare tags: string[];

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare images: string[];

  @Listable()
  @Access(AccessMode.ReadWrite)
  declare isActive: boolean;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Sortable({ noIndex: true })
  declare createdAt: Date;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Sortable({ noIndex: true })
  declare updatedAt: Date;
}

@RegisterDataController()
class _OrderAPI extends DataController(Order, DefaultRoutes.All, Controller('/orders')) {
  @ModelReference()
  @StaticModel(OrderModel, database_name)
  declare orderModel: OrderModel;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Index({ primary: true })
  declare _id: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  declare orderNumber: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  declare customerId: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(value as string))
  declare status: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Sortable({ noIndex: true })
  declare totalAmount: number;

  @Access(AccessMode.ReadWrite)
  declare shippingCost: number;

  @Access(AccessMode.ReadWrite)
  declare taxAmount: number;

  @Access(AccessMode.ReadWrite)
  declare discountAmount: number;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Sortable({ noIndex: true })
  declare finalAmount: number;

  @Access(AccessMode.ReadWrite)
  declare shippingAddress: string;

  @Access(AccessMode.ReadWrite)
  declare billingAddress: string;

  @Access(AccessMode.ReadWrite)
  declare paymentMethod: string;

  @Access(AccessMode.ReadWrite)
  declare notes: string;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Sortable({ noIndex: true })
  declare createdAt: Date;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Sortable({ noIndex: true })
  declare updatedAt: Date;
}

@RegisterDataController()
class _OrderItemAPI extends DataController(OrderItem, DefaultRoutes.All, Controller('/order-items')) {
  @ModelReference()
  @StaticModel(OrderItemModel, database_name)
  declare orderItemModel: OrderItemModel;

  @Listable()
  @Access(AccessMode.ReadOnly)
  @Index({ primary: true })
  declare _id: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  declare orderId: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  declare productId: string;

  @Listable()
  @Access(AccessMode.ReadWrite)
  @Mandatory('new', 'edit')
  @Validator((value) => typeof value === 'number' && value > 0)
  declare quantity: number;

  @Listable()
  @Access(AccessMode.ReadOnly)
  declare unitPrice: number;

  @Access(AccessMode.ReadWrite)
  declare discount: number;
}

async function initializeDatabase() {
  await InitializeDatabase(database_name, {
    [customerTableName]: CustomerModel,
    [productTableName]: ProductModel,
    [orderTableName]: OrderModel,
    [orderItemTableName]: OrderItemModel,
  });
}

async function createTestData() {
  const customerModel = new CustomerModel(Database(database_name));
  const productModel = new ProductModel(Database(database_name));
  const orderModel = new OrderModel(Database(database_name));
  const customerResults = await customerModel.insert(testCustomers);
  const productResults = await productModel.insert(testProducts);

  return {
    customerIds: customerResults.generated_keys!,
    productIds: productResults.generated_keys!,
    customerModel,
    productModel,
    orderModel,
  };
}

async function workflowCustomerManagement() {
  await initializeDatabase();
  const { customerModel } = await createTestData();

  const newCustomer = {
    firstName: 'Sophie',
    lastName: 'Marrone',
    email: 'sophie.marrone@email.com',
    phone: '+393334445556',
    address: 'Via Pasta 10',
    city: 'Naples',
    postalCode: '80100',
    country: 'Italy',
    isActive: true,
    loyaltyPoints: 0,
    preferences: ['art', 'music'],
  };

  const createResponse = await newRequest('customers', newCustomer);
  expect(createResponse.status).to.equal(200);
  const createdIds = (await createResponse.json()) as string[];
  expect(createdIds).to.have.length(1);
  expect(createdIds[0]).to.be.a('string');

  const getResponse = await getRequest('customers', { id: createdIds[0] });
  expect(getResponse.status).to.equal(200);
  const customer = (await getResponse.json()) as Customer;
  await validateObject(customer, newCustomer, ['firstName', 'lastName', 'email', 'city']);

  const updateData = {
    ...newCustomer,
    loyaltyPoints: 50,
    preferences: ['art', 'music', 'travel'],
  };
  const updateResponse = await editRequest('customers', updateData, { id: createdIds[0] });
  expect(updateResponse.status).to.equal(200);

  const updatedCustomer = await customerModel.get(createdIds[0]);
  expect(updatedCustomer?.loyaltyPoints).to.equal(50);
  expect(updatedCustomer?.preferences).to.include('travel');

  const listResponse = await listRequest('customers', {
    sortKey: 'registrationDate',
    sortDirection: 'desc',
    limit: '2',
  });
  expect(listResponse.status).to.equal(200);
  const listData = (await listResponse.json()) as { results: Customer[] };
  expect(listData.results).to.have.length(2);
}

async function workflowProductManagement() {
  await initializeDatabase();
  const { productModel } = await createTestData();

  const newProduct = {
    sku: 'HEADPHONES-005',
    name: 'Casque audio sans fil',
    description: 'Casque audio haute qualité avec réduction de bruit',
    price: 199.99,
    costPrice: 120.0,
    stockQuantity: 30,
    category: 'electronics',
    brand: 'AudioTech',
    tags: ['wireless', 'noise-cancelling', 'premium'],
    images: ['headphones1.jpg', 'headphones2.jpg'],
    isActive: true,
  };

  const createResponse = await newRequest('products', newProduct);
  expect(createResponse.status).to.equal(200);
  const createdIds = (await createResponse.json()) as string[];
  expect(createdIds).to.have.length(1);

  const stockUpdate = { ...newProduct, stockQuantity: 25 };
  const updateResponse = await editRequest('products', stockUpdate, { id: createdIds[0] });
  expect(updateResponse.status).to.equal(200);

  const updatedProduct = await productModel.get(createdIds[0]);
  expect(updatedProduct?.stockQuantity).to.equal(25);

  const listResponse = await listRequest('products', {
    sortKey: 'price',
    sortDirection: 'asc',
    limit: '3',
  });
  expect(listResponse.status).to.equal(200);
  const listData = (await listResponse.json()) as { results: Product[] };
  expect(listData.results).to.have.length(3);

  const categoryResponse = await listRequest('products', { category: 'electronics' });
  expect(categoryResponse.status).to.equal(200);
  const categoryData = (await categoryResponse.json()) as { results: Product[] };
  expect(categoryData.results.length).to.be.greaterThan(0);
}

async function workflowOrderManagement() {
  await initializeDatabase();
  const { customerIds, productIds, orderModel } = await createTestData();

  const orderData = {
    orderNumber: 'ORD-2024-001',
    customerId: customerIds[0],
    status: 'pending',
    totalAmount: 0,
    shippingCost: 9.99,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 0,
    shippingAddress: 'Via Pasta 10, Naples, 80100',
    billingAddress: 'Via Pasta 10, Naples, 80100',
    paymentMethod: 'credit_card',
    notes: 'Express delivery requested',
  };

  const orderResponse = await newRequest('orders', orderData);
  expect(orderResponse.status).to.equal(200);
  const orderIds = (await orderResponse.json()) as string[];
  expect(orderIds).to.have.length(1);

  const orderItem1 = {
    orderId: orderIds[0],
    productId: productIds[0],
    quantity: 2,
    unitPrice: 1299.99,
    totalPrice: 2599.98,
    discount: 0,
  };

  const orderItem2 = {
    orderId: orderIds[0],
    productId: productIds[1],
    quantity: 1,
    unitPrice: 899.99,
    totalPrice: 899.99,
    discount: 50.0,
  };

  const item1Response = await newRequest('order-items', orderItem1);
  const item2Response = await newRequest('order-items', orderItem2);
  expect(item1Response.status).to.equal(200);
  expect(item2Response.status).to.equal(200);

  const totalAmount = 2599.98 + (899.99 - 50.0);
  const taxAmount = totalAmount * 0.2;
  const finalAmount = totalAmount + taxAmount + 9.99;

  const orderUpdate = {
    ...orderData,
    totalAmount,
    taxAmount,
    finalAmount,
  };

  const updateResponse = await editRequest('orders', orderUpdate, { id: orderIds[0] });
  expect(updateResponse.status).to.equal(200);

  const updatedOrder = await orderModel.get(orderIds[0]);
  expect(updatedOrder?.totalAmount).to.equal(totalAmount);
  expect(updatedOrder?.finalAmount).to.equal(finalAmount);

  const statusUpdate = { ...orderData, status: 'processing' };
  const statusResponse = await editRequest('orders', statusUpdate, { id: orderIds[0] });
  expect(statusResponse.status).to.equal(200);

  const finalOrder = await orderModel.get(orderIds[0]);
  expect(finalOrder?.status).to.equal('processing');
}

async function stockManagementAndAutomaticUpdate() {
  await initializeDatabase();
  const { productIds, productModel } = await createTestData();

  const initialProduct = await productModel.get(productIds[0]);
  const initialStock = initialProduct?.stockQuantity || 0;

  const stockReduction = { ...initialProduct, stockQuantity: initialStock - 3 };
  const updateResponse = await editRequest('products', stockReduction, { id: productIds[0] });
  expect(updateResponse.status).to.equal(200);

  const updatedProduct = await productModel.get(productIds[0]);
  expect(updatedProduct?.stockQuantity).to.equal(initialStock - 3);

  const invalidStock = { stockQuantity: -5 };
  const invalidResponse = await editRequest('products', invalidStock, { id: productIds[0] });
  expect(invalidResponse.status).to.equal(400);

  const restock = { ...initialProduct, stockQuantity: initialStock + 10 };
  const restockResponse = await editRequest('products', restock, { id: productIds[0] });
  expect(restockResponse.status).to.equal(200);

  const restockedProduct = await productModel.get(productIds[0]);
  expect(restockedProduct?.stockQuantity).to.equal(initialStock + 10);
}

async function advancedSearchAndFiltering() {
  await initializeDatabase();
  await createTestData();

  const categoryResponse = await listRequest('products', {
    category: 'electronics',
    sortKey: 'price',
    sortDirection: 'desc',
  });
  expect(categoryResponse.status).to.equal(200);
  const categoryData = (await categoryResponse.json()) as { results: Product[] };
  expect(categoryData.results.length).to.be.greaterThan(0);

  const activeCustomersResponse = await listRequest('customers', {
    isActive: 'true',
    sortKey: 'loyaltyPoints',
    sortDirection: 'desc',
  });
  expect(activeCustomersResponse.status).to.equal(200);
  const activeCustomersData = (await activeCustomersResponse.json()) as { results: Customer[] };
  expect(activeCustomersData.results.length).to.be.greaterThan(0);

  const paginatedResponse = await listRequest('products', {
    limit: '2',
    offset: '1',
  });
  expect(paginatedResponse.status).to.equal(200);
  const paginatedData = (await paginatedResponse.json()) as { results: Product[]; total: number };
  expect(paginatedData.results).to.have.length(2);
  expect(paginatedData.total).to.be.greaterThan(2);

  const pendingOrdersResponse = await listRequest('orders', {
    status: 'pending',
    sortKey: 'createdAt',
    sortDirection: 'desc',
  });
  expect(pendingOrdersResponse.status).to.equal(200);
}

async function clientPreferencesManagement() {
  await initializeDatabase();
  const { customerIds, customerModel } = await createTestData();

  const customer = await customerModel.get(customerIds[0]);
  const newPreferences = ['electronics', 'gaming', 'tech'];
  const preferenceUpdate = { ...customer, preferences: newPreferences };
  const updateResponse = await editRequest('customers', preferenceUpdate, { id: customerIds[0] });
  expect(updateResponse.status).to.equal(200);

  const updatedCustomer = await customerModel.get(customerIds[0]);
  expect(updatedCustomer?.preferences).to.deep.equal(newPreferences);

  const electronicsResponse = await listRequest('products', {
    category: 'electronics',
    sortKey: 'price',
    sortDirection: 'asc',
  });
  expect(electronicsResponse.status).to.equal(200);
  const electronicsData = (await electronicsResponse.json()) as { results: Product[] };
  expect(electronicsData.results.length).to.be.greaterThan(0);

  const loyaltyUpdate = { ...updatedCustomer, loyaltyPoints: 200 };
  const loyaltyResponse = await editRequest('customers', loyaltyUpdate, { id: customerIds[0] });
  expect(loyaltyResponse.status).to.equal(200);

  const customerWithLoyalty = await customerModel.get(customerIds[0]);
  expect(customerWithLoyalty?.loyaltyPoints).to.equal(200);
}

async function errorManagementAndComplexValidation() {
  await initializeDatabase();

  const invalidCustomer = {
    firstName: 'Test',
    lastName: 'User',
    email: 'invalid-email',
    phone: '123',
    isActive: true,
    loyaltyPoints: 0,
    preferences: ['test'],
  };

  const invalidEmailResponse = await newRequest('customers', invalidCustomer);
  expect(invalidEmailResponse.status).to.equal(400);
  const emailError = await invalidEmailResponse.text();
  expect(emailError).to.include('email');

  const invalidProduct = {
    sku: 'TEST-001',
    name: 'Test Product',
    price: -50.0,
    stockQuantity: 10,
    category: 'test',
    isActive: true,
  };

  const invalidPriceResponse = await newRequest('products', invalidProduct);
  expect(invalidPriceResponse.status).to.equal(400);
  const priceError = await invalidPriceResponse.text();
  expect(priceError).to.include('price');

  const invalidOrderItem = {
    orderId: 'fake-order-id',
    productId: 'fake-product-id',
    quantity: 0,
    unitPrice: 10.0,
    totalPrice: 0,
    discount: 0,
  };

  const invalidQuantityResponse = await newRequest('order-items', invalidOrderItem);
  expect(invalidQuantityResponse.status).to.equal(400);
  const quantityError = await invalidQuantityResponse.text();
  expect(quantityError).to.include('quantity');

  const { customerIds } = await createTestData();
  const invalidStatusUpdate = { status: 'invalid_status' };
  const invalidStatusResponse = await editRequest('orders', invalidStatusUpdate, { id: customerIds[0] });
  expect(invalidStatusResponse.status).to.equal(400);

  const invalidRouteResponse = await request('customers', 'nonexistent', 'GET');
  expect(invalidRouteResponse.status).to.equal(404);

  const missingFieldsCustomer = {
    firstName: 'Test',
    email: 'test@example.com',
    isActive: true,
    loyaltyPoints: 0,
    preferences: ['test'],
  };

  const missingFieldsResponse = await newRequest('customers', missingFieldsCustomer);
  expect(missingFieldsResponse.status).to.equal(400);
  const missingFieldsError = await missingFieldsResponse.text();
  expect(missingFieldsError).to.include('lastName');
}
