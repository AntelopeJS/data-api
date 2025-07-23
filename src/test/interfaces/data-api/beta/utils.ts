import { expect } from 'chai';
import { URL_BASE } from './constants';

export function getFunctionName(): string {
  const err = new Error();
  const stack = err.stack?.split('\n');
  const line = stack?.[2] ?? '';
  const match = line.match(/at (\w+)/);
  return match?.[1] ?? 'unknown';
}

export async function request(
  functionName: string,
  uri: string,
  method: string,
  payload?: unknown,
  queryParams?: Record<string, string>,
) {
  return await fetch(`${URL_BASE}/${functionName}/${uri}?${new URLSearchParams(queryParams).toString()}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
}

export async function newRequest(functionName: string, payload: unknown, queryParams?: Record<string, string>) {
  return await request(functionName, 'new', 'POST', payload, queryParams);
}

export async function getRequest(functionName: string, queryParams?: Record<string, string>) {
  return await request(functionName, 'get', 'GET', undefined, queryParams);
}

export async function listRequest(functionName: string, queryParams?: Record<string, string>) {
  return await request(functionName, 'list', 'GET', undefined, queryParams);
}

export async function editRequest(functionName: string, payload: unknown, queryParams?: Record<string, string>) {
  return await request(functionName, 'edit', 'PUT', payload, queryParams);
}

export async function deleteRequest(functionName: string, queryParams?: Record<string, string>) {
  return await request(functionName, 'delete', 'DELETE', undefined, queryParams);
}

export async function validateObject<T>(object: T, expectedObject: Partial<T>, fieldsToCheck: (keyof T)[]) {
  for (const field of fieldsToCheck) {
    expect(object[field]).to.deep.equal(expectedObject[field]);
  }
}

export async function validateObjectList<T extends { _id: string }>(
  objectList: T[],
  expectedObjectList: Partial<T>[],
  fieldsToCheck: (keyof T)[],
) {
  for (const object of objectList) {
    const id = object._id;
    const expectedObject = expectedObjectList.find((item) => item._id === id);
    if (!expectedObject) {
      expect(false).to.equal(true, `Expected object not found for id: ${id}`);
    } else {
      await validateObject(object, expectedObject, fieldsToCheck);
    }
  }
}
