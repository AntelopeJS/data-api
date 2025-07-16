import { Table, Index } from '@ajs/database-decorators/beta';

export interface MockDatabase {
  table: (tableName: string) => MockTable;
}

export interface MockTable {
  get: (id: string) => MockQuery;
  getAll: (index?: string, ...ids: string[]) => MockQuery;
  insert: (data: any) => Promise<{ generated_keys: string[] }>;
  update: (data: any) => Promise<void>;
  delete: () => Promise<boolean>;
}

export interface MockQuery {
  default: (value: any) => any;
  do: (fn: (val: any) => any) => Promise<any>;
  nth: (index: number) => MockQuery;
  orderBy: (field: string, direction?: 'asc' | 'desc', useIndex?: boolean) => MockStream;
  filter: (predicate: (row: any) => boolean) => MockStream;
  map: (fn: (val: any) => any) => MockStream;
  slice: (start: number, end: number) => MockStream;
  pluck: (field: string, ...fields: string[]) => MockStream;
  count: () => Promise<number>;
  update: (data: any) => Promise<void>;
  delete: () => Promise<boolean>;
}

export interface MockStream {
  orderBy: (field: string, direction?: 'asc' | 'desc', useIndex?: boolean) => MockStream;
  filter: (predicate: (row: any) => boolean) => MockStream;
  map: (fn: (val: any) => any) => MockStream;
  slice: (start: number, end: number) => MockStream;
  pluck: (field: string, ...fields: string[]) => MockStream;
  count: () => Promise<number>;
}

export interface MockRequestContext {
  url: URL;
  dataAPIEntry?: {
    options?: Record<string, any>;
  };
}

export class TestTable extends Table {
  @Index({ primary: true })
  declare id: string;

  declare name: string;
  declare email: string;
  declare age: number;
  declare isActive: boolean;
  declare createdAt: Date;
}

export function createTestTable() {
  return TestTable;
}

export function createMockDatabase(): MockDatabase {
  return {
    table: (_tableName: string): MockTable => ({
      get: (id: string): MockQuery => ({
        default: (value: any) => value,
        do: (fn: (val: any) => any) => Promise.resolve(fn({ id, name: 'Test User', email: 'test@example.com' })),
        nth: (_index: number) => createMockQuery(),
        orderBy: () => createMockStream(),
        filter: () => createMockStream(),
        map: () => createMockStream(),
        slice: () => createMockStream(),
        pluck: () => createMockStream(),
        count: () => Promise.resolve(1),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(true),
      }),
      getAll: (index?: string, ...ids: string[]): MockQuery => ({
        default: (value: any) => value,
        do: (fn: (val: any) => any) => Promise.resolve(fn({ id: ids[0], name: 'Test User' })),
        nth: (_index: number) => createMockQuery(),
        orderBy: () => createMockStream(),
        filter: () => createMockStream(),
        map: () => createMockStream(),
        slice: () => createMockStream(),
        pluck: () => createMockStream(),
        count: () => Promise.resolve(ids.length),
        update: () => Promise.resolve(),
        delete: () => Promise.resolve(true),
      }),
      insert: (_data: any) => Promise.resolve({ generated_keys: ['new_id_123'] }),
      update: (_data: any) => Promise.resolve(),
      delete: () => Promise.resolve(true),
    }),
  };
}

export function createMockQuery(): MockQuery {
  return {
    default: (value: any) => value,
    do: (fn: (val: any) => any) => Promise.resolve(fn({ id: 'test_id', name: 'Test User' })),
    nth: (_index: number) => createMockQuery(),
    orderBy: () => createMockStream(),
    filter: () => createMockStream(),
    map: () => createMockStream(),
    slice: () => createMockStream(),
    pluck: () => createMockStream(),
    count: () => Promise.resolve(1),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(true),
  };
}

export function createMockStream(): MockStream {
  return {
    orderBy: () => createMockStream(),
    filter: () => createMockStream(),
    map: () => createMockStream(),
    slice: () => createMockStream(),
    pluck: () => createMockStream(),
    count: () => Promise.resolve(10),
  };
}

export function createMockRequestContext(url: string = 'http://localhost/test'): MockRequestContext {
  return {
    url: new URL(url),
    dataAPIEntry: {
      options: {},
    },
  };
}

export function createValidTestData() {
  return {
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
    isActive: true,
    createdAt: new Date(),
  };
}

export function createInvalidTestData() {
  return {
    name: '',
    email: 'invalid-email',
    age: -5,
    isActive: 'definitely not a boolean',
  };
}

export function validateTestData(data: any) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('name must be a non-empty string');
  }

  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email must be a valid email address');
  }

  if (typeof data.age !== 'number' || data.age < 0) {
    errors.push('age must be a positive number');
  }

  if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return errors;
}

export function simulateDatabaseOperation<T>(data: T, delay: number = 100): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function createMockDataModel(table: MockTable, database: MockDatabase) {
  return {
    table,
    database,
    constructor: {
      fromDatabase: (data: any) => data,
    },
  };
}

export const filterUtils = {
  parseFilter: (filterString: string): { operation: string; value: string } | null => {
    const match = filterString.match(/^([^:]+):(.+)$/);
    if (!match) return null;

    return {
      operation: match[1],
      value: match[2],
    };
  },
  applyFilter: <T>(data: T[], field: keyof T, operation: string, value: any): T[] => {
    return data.filter((item) => {
      const itemValue = item[field];

      switch (operation) {
        case 'eq':
          return itemValue === value;
        case 'ne':
          return itemValue !== value;
        case 'gt':
          return itemValue > value;
        case 'ge':
          return itemValue >= value;
        case 'lt':
          return itemValue < value;
        case 'le':
          return itemValue <= value;
        default:
          return true;
      }
    });
  },
};

export const paginationUtils = {
  paginate: <T>(data: T[], offset: number, limit: number): T[] => {
    return data.slice(offset, offset + limit);
  },
  getPaginationInfo: (total: number, offset: number, limit: number) => {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      total,
      totalPages,
      currentPage,
      hasNextPage,
      hasPrevPage,
      offset,
      limit,
    };
  },
};

export const sortingUtils = {
  sort: <T>(data: T[], field: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },
};
