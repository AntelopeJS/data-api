import { expect } from 'chai';
import { Schema } from '@ajs/database/beta';
import {
  Table,
  Index,
  RegisterTable,
  CreateDatabaseSchemaInstance,
  BasicDataModel,
  Model,
} from '@ajs/database-decorators/beta';
import { Controller } from '@ajs/api/beta';
import { DataController, DefaultRoutes, RegisterDataController } from '@ajs.local/data-api/beta';
import { Access, AccessMode, Listable, ModelReference } from '@ajs.local/data-api/beta/metadata';
import { editRequest, getFunctionName, getRequest, newRequest } from '../utils';
import path from 'node:path';

const currentTestName = path.basename(__filename).replace(/\.test\.(ts|js)$/, '');
const userTableName = `users-${currentTestName}`;
const database_name = `test-data-api-${currentTestName}`;
const schemaName = 'default';

@RegisterTable(userTableName, schemaName)
class User extends Table {
  @Index({ primary: true })
  declare id: string;

  @Index()
  declare email: string;

  declare name: string;
  declare role: string;
  declare age: number;
}
class UserModel extends BasicDataModel(User, userTableName) { }

const defaultUserDataset: Partial<User> = {
  name: 'Jean Test',
  email: 'jean.test@email.com',
  role: 'admin',
  age: 30,
};

describe('Per-Action Access Control', () => {
  it('writable in new but read-only in edit', async () => await writableInNewReadOnlyInEdit());
  it('read-only globally but read-write in new', async () => await readOnlyGloballyReadWriteInNew());

  after(async () => { });
});

async function _createDataController(testName: string, user: Partial<User>) {
  @RegisterDataController()
  class _PerActionAccessAPI extends DataController(User, DefaultRoutes.All, Controller(`/${testName}`)) {
    @ModelReference()
    @Model(UserModel, database_name)
    declare userModel: UserModel;

    @Access(AccessMode.ReadOnly)
    @Index({ primary: true })
    declare _id: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare name: string;

    @Listable()
    @Access(AccessMode.ReadWrite)
    declare email: string;

    @Listable()
    @Access(AccessMode.ReadWrite, { edit: AccessMode.ReadOnly })
    declare role: string;

    @Listable()
    @Access(AccessMode.ReadOnly, { new: AccessMode.ReadWrite })
    declare age: number;
  }
  await CreateDatabaseSchemaInstance(schemaName, database_name);
  const database = Schema.get(schemaName)!.instance(database_name);
  const userModel = new UserModel(database);
  const insertResult = await userModel.insert(user);
  return { id: insertResult[0], userModel };
}

async function writableInNewReadOnlyInEdit() {
  const { id, userModel } = await _createDataController(getFunctionName(), defaultUserDataset);

  const getResponse = await getRequest(getFunctionName(), { id });
  expect(getResponse.status).to.equal(200);
  const data = (await getResponse.json()) as User;
  expect(data.role).to.equal('admin');

  await editRequest(getFunctionName(), { role: 'user' }, { id });
  const user = await userModel.get(id);
  expect(user?.role).to.equal('admin');
}

async function readOnlyGloballyReadWriteInNew() {
  const { id, userModel } = await _createDataController(getFunctionName(), defaultUserDataset);

  const newResponse = await newRequest(getFunctionName(), defaultUserDataset);
  expect(newResponse.status).to.equal(200);
  const newIds = (await newResponse.json()) as string[];
  const newUser = await userModel.get(newIds[0]);
  expect(newUser?.age).to.equal(30);

  await editRequest(getFunctionName(), { age: 99 }, { id });
  const editedUser = await userModel.get(id);
  expect(editedUser?.age).to.equal(30);

  const getResponse = await getRequest(getFunctionName(), { id });
  expect(getResponse.status).to.equal(200);
  const getData = (await getResponse.json()) as User;
  expect(getData.age).to.equal(30);
}
