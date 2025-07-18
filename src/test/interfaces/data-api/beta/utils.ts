import { URL_BASE } from './constants';

export function getFunctionName(): string {
  const err = new Error();
  const stack = err.stack?.split('\n');
  const line = stack?.[2] ?? '';
  const match = line.match(/at (\w+)/);
  return match?.[1] ?? 'unknown';
}

async function _request(
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
  return await _request(functionName, 'new', 'POST', payload, queryParams);
}

export async function getRequest(functionName: string, queryParams?: Record<string, string>) {
  return await _request(functionName, 'get', 'GET', undefined, queryParams);
}

export async function listRequest(functionName: string, queryParams?: Record<string, string>) {
  return await _request(functionName, 'list', 'GET', undefined, queryParams);
}

export async function editRequest(functionName: string, payload: unknown, queryParams?: Record<string, string>) {
  return await _request(functionName, 'edit', 'PUT', payload, queryParams);
}

export async function deleteRequest(functionName: string, queryParams?: Record<string, string>) {
  return await _request(functionName, 'delete', 'DELETE', undefined, queryParams);
}
