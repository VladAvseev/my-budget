import type { AxiosRequestConfig } from 'axios';
import { client } from './client';

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await client.get<T>(url, { params, ...config });
  return response.data;
}
