import type { Params } from '@/types/global';
import request, { requestFile } from '@/utils/request/request';
import type { ResponseBody } from '@/types/api';
import type { AxiosRequestConfig } from 'axios';

export function getData<T = unknown>(
	url: string,
	config?: Record<string, unknown>,
): Promise<ResponseBody<T>> {
	return request.get<Params, ResponseBody<T>>(url, config);
}

export function getDataOne<T = unknown>(
	url: string,
	config?: Record<string, unknown>,
): Promise<ResponseBody<T>> {
	return request.get<Params, ResponseBody<T>>(url, { params: config });
}

export function postData<T = unknown>(
	url: string,
	params: unknown,
	config?: Record<string, unknown>,
): Promise<ResponseBody<T>> {
	return request.post<Params, ResponseBody<T>>(url, params, { params: config });
}

export function putData<T = unknown>(
	url: string,
	params: unknown,
	config?: AxiosRequestConfig,
): Promise<ResponseBody<T>> {
	return request.put<Params, ResponseBody<T>>(url, params, { params: config });
}

export function deleteData<T = unknown>(
	url: string,
	config?: Record<string, unknown>,
): Promise<ResponseBody<T>> {
	return request.delete<Params, ResponseBody<T>>(url, { params: config });
}

export function postFileData<T = unknown>(
	url: string,
	params: unknown,
	config?: Record<string, unknown>,
): Promise<ResponseBody<T>> {
	return requestFile.post<Params, ResponseBody<T>>(url, params, config);
}

export const baseService = {
	finance: '/api/am-finance',
	user: '/api/am-user',
	mission: '/api/am-mission',
	file: '/api/am-oss',
	product: '/api/am-product',
};
