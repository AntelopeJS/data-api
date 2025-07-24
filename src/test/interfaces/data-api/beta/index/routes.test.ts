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
import { Access, AccessMode, Listable, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { deleteRequest, editRequest, getFunctionName, getRequest, listRequest, newRequest } from '../utils';
import path from 'node:path';

const currentTestName = path.basename(__filename).replace(/\.test\.(ts|js)$/, '');
const userTableName = `users-${currentTestName}`;
const database_name = `test-data-api-${currentTestName}`;

@RegisterTable(userTableName)
class User extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare email: string;

  declare password: string;
  declare name: string;
  declare age: number;
}
class UserModel extends BasicDataModel(User, userTableName) {}

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
  it('accessing default routes', async () => requestingDefaultRoutes());
  it('accessing undefined route', async () => await requestingUndefinedRoute());
  it('using route get', async () => await usingRouteGet());
  it('using route list', async () => await usingRouteList());
  it('using route new', async () => await usingRouteNew());
  it('using route edit', async () => await usingRouteEdit());
  it('using route delete', async () => await usingRouteDelete());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, user: Partial<User>, routes?: any) {
  @RegisterDataController()
  class _AccessTestAPI extends DataController(User, routes ?? DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @StaticModel(UserModel, database_name)
    declare userModel: UserModel;

    @Listable()
    @Access(AccessMode.ReadOnly)
    @Index({ primary: true })
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare password: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare age: number;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare email: string;
  }
  const userModel = new UserModel(Database(database_name));
  await InitializeDatabase(database_name, { [userTableName]: UserModel });
  const insertResult = await userModel.insert(user);
  return { id: insertResult.generated_keys![0], userModel };
}

async function requestingDefaultRoutes() {
  await _createDataController(getFunctionName(), validUserDataset.default);

  const [get_response, list_response, new_response, edit_response, delete_response] = await Promise.all([
    getRequest(getFunctionName(), {}),
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

async function requestingUndefinedRoute() {
  await _createDataController(getFunctionName(), validUserDataset.default, {
    get: DefaultRoutes.Get,
    new: DefaultRoutes.New,
    delete: DefaultRoutes.Delete,
  });

  const [get_response, list_response, new_response, edit_response, delete_response] = await Promise.all([
    getRequest(getFunctionName(), {}),
    listRequest(getFunctionName(), {}),
    newRequest(getFunctionName(), {}),
    editRequest(getFunctionName(), {}),
    deleteRequest(getFunctionName(), {}),
  ]);

  expect(list_response.status).to.equal(404);
  expect(edit_response.status).to.equal(404);

  expect(get_response.status).to.not.equal(404);
  expect(new_response.status).to.not.equal(404);
  expect(delete_response.status).to.not.equal(404);
}

async function validateUserUsingResponse(response: Response, id: string, validDataset: Partial<User>) {
  const data = (await response.json()) as { results: User[] };
  expect(response.status).to.equal(200);

  let found: User | undefined;
  if (data.results && Array.isArray(data.results)) {
    for (const user of data.results) {
      if (user._id == id) {
        found = user;
        break;
      }
    }
  }
  await validateUser(found, validDataset);
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
  const { id } = await _createDataController(getFunctionName(), validUserDataset.default, {
    list: DefaultRoutes.List,
  });

  const response = await listRequest(getFunctionName(), {});
  expect(response.status).to.equal(200);
  await validateUserUsingResponse(response, id, validUserDataset.default);
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

  await editRequest(getFunctionName(), validUserDataset.alternative, { id });
  await validateUserUsingModel(userModel, id, validUserDataset.alternative);
}

async function usingRouteDelete() {
  const { id, userModel } = await _createDataController(getFunctionName(), validUserDataset.default, {
    delete: DefaultRoutes.Delete,
  });

  await deleteRequest(getFunctionName(), { id });
  expect(await userModel.get(id)).to.equal(undefined);
}
