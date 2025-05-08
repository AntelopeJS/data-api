import { BasicDataModel, Index, Table, RegisterTable, Fixture } from '@ajs/database-decorators/beta';

const tableName = 'users';

@Fixture(() => [
  { _id: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User' },
  { _id: 'user', email: 'user@example.com', firstName: 'Standard', lastName: 'User' },
  { _id: 'guest', email: 'guest@example.com', firstName: 'Guest', lastName: 'User' },
  { _id: 'user1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe' },
  { _id: 'user2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith' },
  { _id: 'user3', email: 'user3@example.com', firstName: 'Robert', lastName: 'Johnson' },
  { _id: 'user4', email: 'user4@example.com', firstName: 'Emily', lastName: 'Williams' },
  { _id: 'user5', email: 'user5@example.com', firstName: 'Michael', lastName: 'Brown' },
  { _id: 'user6', email: 'user6@example.com', firstName: 'Sarah', lastName: 'Jones' },
  { _id: 'user7', email: 'user7@example.com', firstName: 'David', lastName: 'Garcia' },
  { _id: 'user8', email: 'user8@example.com', firstName: 'Lisa', lastName: 'Miller' },
  { _id: 'user9', email: 'user9@example.com', firstName: 'Thomas', lastName: 'Davis' },
  { _id: 'user10', email: 'user10@example.com', firstName: 'Jennifer', lastName: 'Martinez' },
  { _id: 'user11', email: 'user11@example.com', firstName: 'Christopher', lastName: 'Rodriguez' },
  { _id: 'user12', email: 'user12@example.com', firstName: 'Michelle', lastName: 'Wilson' },
  { _id: 'user13', email: 'user13@example.com', firstName: 'Daniel', lastName: 'Anderson' },
  { _id: 'user14', email: 'user14@example.com', firstName: 'Jessica', lastName: 'Taylor' },
  { _id: 'user15', email: 'user15@example.com', firstName: 'James', lastName: 'Thomas' },
  { _id: 'user16', email: 'user16@example.com', firstName: 'Elizabeth', lastName: 'Moore' },
  { _id: 'user17', email: 'user17@example.com', firstName: 'Matthew', lastName: 'Jackson' },
  { _id: 'user18', email: 'user18@example.com', firstName: 'Nicole', lastName: 'White' },
  { _id: 'user19', email: 'user19@example.com', firstName: 'Andrew', lastName: 'Harris' },
  { _id: 'user20', email: 'user20@example.com', firstName: 'Stephanie', lastName: 'Clark' },
])
@RegisterTable(tableName, 'default')
export class User extends Table {
  @Index({ primary: true })
  declare _id: string;

  @Index()
  declare email: string;

  declare firstName: string;
  declare lastName: string;
}

export class UserModel extends BasicDataModel(User, tableName) {}
