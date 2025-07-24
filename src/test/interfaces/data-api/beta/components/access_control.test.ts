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
import { editRequest, getFunctionName, getRequest } from '../utils';
import path from 'node:path';

const currentTestName = path.basename(__filename).replace(/\.test\.(ts|js)$/, '');
const userTableName = `users-${currentTestName}`;
const database_name = `test-data-api-${currentTestName}`;

@RegisterTable(userTableName)
class User extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare email: string;

  declare password: string;
  declare name: string;
  declare age: number;
}
class UserModel extends BasicDataModel(User, userTableName) {}
let database: Database;

const defaultUserDataset: Partial<User> = {
  name: 'Jean Test',
  email: 'jean.test@email.com',
  age: 30,
  password: 'very-secure-qwerty123',
};

describe('Field Access Control', () => {
  it('read in a read write field', async () => await readInReadWriteField());
  it('write in a read write field', async () => await writeInReadWriteField());
  it('read in a write only field', async () => await readInWriteOnlyField());
  it('write in a read only field', async () => await writeInReadOnlyField());
  it('read in a read only field', async () => await readInReadOnlyField());
  it('write in a write only field', async () => await writeInWriteOnlyField());

  after(async () => await DeleteDatabase(database_name));
});

async function _createDataController(testName: string, user: Partial<User>) {
  @RegisterDataController()
  class _AccessTestAPI extends DataController(User, DefaultRoutes.All, Controller(`/${testName}`)) {
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
  await InitializeDatabase(database_name, { [userTableName]: UserModel });
  const insertResult = await userModel.insert(user);
  return { id: insertResult.generated_keys![0], userModel };
}

async function readInReadWriteField() {
  const { id } = await _createDataController(getFunctionName(), defaultUserDataset);

  const response = await getRequest(getFunctionName(), { id });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as User;
  expect(data.name).to.equal(defaultUserDataset.name);
  expect(data.age).to.equal(defaultUserDataset.age);
  expect(data.email).to.equal(defaultUserDataset.email);
  expect(data.password).to.equal(undefined);
}

async function writeInReadWriteField() {
  const { id, userModel } = await _createDataController(getFunctionName(), defaultUserDataset);

  const replacementEmail = 'bob.test@email.com';
  const response = await editRequest(getFunctionName(), { email: replacementEmail }, { id });
  expect(response.status).to.equal(200);
  const user = await userModel.get(id);
  expect(user?.email).to.equal(replacementEmail);
}

async function readInWriteOnlyField() {
  const { id } = await _createDataController(getFunctionName(), defaultUserDataset);

  const response = await getRequest(getFunctionName(), { id });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as User;
  expect(data.password).to.equal(undefined);
}

async function writeInReadOnlyField() {
  const { id, userModel } = await _createDataController(getFunctionName(), defaultUserDataset);

  const response = await editRequest(getFunctionName(), { age: (defaultUserDataset.age ?? 0) + 5 }, { id });
  expect(response.status).to.equal(200);
  const user = await userModel.get(id);
  expect(user?.age).to.equal(defaultUserDataset.age);
}

async function readInReadOnlyField() {
  const { id } = await _createDataController(getFunctionName(), defaultUserDataset);

  const response = await getRequest(getFunctionName(), { id });
  expect(response.status).to.equal(200);
  const data = (await response.json()) as User;
  expect(data.email).to.equal(defaultUserDataset.email);
}

async function writeInWriteOnlyField() {
  const { id, userModel } = await _createDataController(getFunctionName(), defaultUserDataset);

  const replacementPassword = 'new-password';
  const response = await editRequest(getFunctionName(), { password: replacementPassword }, { id });
  expect(response.status).to.equal(200);
  const user = await userModel.get(id);
  expect(user?.password).to.equal(replacementPassword);
}
