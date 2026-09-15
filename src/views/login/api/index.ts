import request from '@/utils/request/request';
import { baseService, getData } from '@/utils/request';
import type { LoginParams } from '@/views/login/config';
import type { ResponseBody } from '@/types/api';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 将请求数据转换为form-data格式
let baseUrl = '/api/v1';

enum Api {
	login = '/user/login',
	logout = '/user/logout',
	menus = '/user/menus',
}

export function loginApi(params: LoginParams): Promise<ResponseBody<any>> {
	return request.post(baseService.user + baseUrl + Api.login, null, { params });
}

export function logoutApi(): Promise<ResponseBody<any>> {
	return request.post(baseService.user + baseUrl + Api.logout);
}

export function getUserMenusApi(): Promise<ResponseBody<MenuInfoData[]>> {
	return getData(baseService.user + Api.menus);
}
