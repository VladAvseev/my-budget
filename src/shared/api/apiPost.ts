import type { AxiosRequestConfig } from 'axios';
import { client } from './client';

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.post<T>(url, body, config);
  return response.data;
}
