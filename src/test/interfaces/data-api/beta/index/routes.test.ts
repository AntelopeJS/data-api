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
import { Access, AccessMode, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { deleteRequest, editRequest, getFunctionName, getRequest, listRequest, newRequest } from '../utils';

@RegisterTable('users')
class User extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare email: string;

  declare password: string;
  declare name: string;
  declare age: number;
}
class UserModel extends BasicDataModel(User, 'users') {}
const database_name = 'test-data-api-components';
let database: Database;

const validUserDataset: Record<string, Partial<User>> = {
  default: {
    name: 'Bob',
    email: 'bob@email.com',
    age: 30,
    password: 'very-secure-qwerty123',
  },
  alternative: {
    name: 'Alice',
    email: 'alice@email.com',
    age: 25,
    password: 'very-secure-qwerty123',
  },
};

describe('Routes', () => {
  after(async () => {
    await DeleteDatabase(database_name);
  });

  it('accessing default routes', async () => await requestingDefaultRoutes());
  it('using route get', async () => await usingRouteGet());
  it('using route list', async () => await usingRouteList());
  it('using route new', async () => await usingRouteNew());
  it('using route edit', async () => await usingRouteEdit());
  it('using route delete', async () => await usingRouteDelete());
});

async function _createDataController(testName: string, user: Partial<User>, routes?: any) {
  @RegisterDataController()
  class _AccessTestAPI extends DataController(User, routes ?? DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(UserModel, database_name)
    declare userModel: UserModel;

    @Access(AccessMode.ReadOnly)
    @Index({ primary: true })
    declare _id: string;

    @Access(AccessMode.WriteOnly)
    declare password: string;

    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Access(AccessMode.ReadOnly)
    declare age: number;

    @Access(AccessMode.ReadWrite)
    declare email: string;
  }
  database = Database(database_name);
  const userModel = new UserModel(database);
  await InitializeDatabase(database_name, { user: UserModel });
  const insertResult = await userModel.insert(user);
  return { id: insertResult.generated_keys![0], userModel };
}

async function requestingDefaultRoutes() {
  const { id } = await _createDataController(getFunctionName(), validUserDataset);

  const [get_response, list_response, new_response, edit_response, delete_response] = await Promise.all([
    getRequest(getFunctionName(), { id }),
    listRequest(getFunctionName(), {}),
    newRequest(getFunctionName(), {}),
    editRequest(getFunctionName(), {}),
    deleteRequest(getFunctionName(), {}),
  ]);

  expect(get_response.status).to.not.equal(404);
  expect(list_response.status).to.not.equal(404);
  expect(new_response.status).to.not.equal(404);
  expect(edit_response.status).to.not.equal(404);
  expect(delete_response.status).to.not.equal(404);
}

async function validateUserUsingResponse(response: Response, validDataset: Partial<User>) {
  const data = (await response.json()) as User[];
  expect(response.status).to.equal(200);
  await validateUser(data[0], validDataset);
}

async function validateUserUsingModel(userModel: UserModel, id: string, validDataset: Partial<User>) {
  const user = await userModel.get(id);
  await validateUser(user, validDataset, id);
}

async function validateUser(
  user: User | Record<string, unknown> | undefined,
  validDataset: Partial<User>,
  id?: string,
) {
  const foundDataset = user instanceof UserModel ? await user.get(id!) : user;
  expect(foundDataset).to.be.an('object');
  expect(foundDataset).to.have.property('id', id);
  expect(foundDataset).to.have.property('name', validDataset.name);
  expect(foundDataset).to.have.property('email', validDataset.email);
  expect(foundDataset).to.have.property('age', validDataset.age);
  expect(foundDataset).to.have.property('password', validDataset.password);
}

async function usingRouteGet() {
  const { id, userModel } = await _createDataController(getFunctionName(), validUserDataset.default, {
    get: DefaultRoutes.Get,
  });

  const response = await getRequest(getFunctionName(), { id });
  expect(response.status).to.equal(200);
  await validateUserUsingModel(userModel, id, validUserDataset.default);
}

async function usingRouteList() {
  await _createDataController(getFunctionName(), validUserDataset.default, {
    list: DefaultRoutes.List,
  });

  const response = await listRequest(getFunctionName(), {});
  expect(response.status).to.equal(200);
  await validateUserUsingResponse(response, validUserDataset.default);
}

async function usingRouteNew() {
  const { userModel } = await _createDataController(getFunctionName(), validUserDataset.default, {
    new: DefaultRoutes.New,
  });

  const response = await newRequest(getFunctionName(), validUserDataset.default);
  const result = (await response.json()) as string[];
  await validateUserUsingModel(userModel, result[0], validUserDataset.default);
}

async function usingRouteEdit() {
  const { id, userModel } = await _createDataController(getFunctionName(), validUserDataset.default, {
    edit: DefaultRoutes.Edit,
  });

  await editRequest(getFunctionName(), { id, ...validUserDataset.alternative });
  await validateUserUsingModel(userModel, id, validUserDataset.alternative);
}

async function usingRouteDelete() {
  const { id, userModel } = await _createDataController(getFunctionName(), validUserDataset.default, {
    delete: DefaultRoutes.Delete,
  });

  await deleteRequest(getFunctionName(), { id });
  await validateUserUsingModel(userModel, id, validUserDataset.default);
}
