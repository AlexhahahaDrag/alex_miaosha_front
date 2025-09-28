import request from '@/utils/request/request';
import { baseService } from '@/api/common/index';
import type { LoginParams } from '@/views/login/config';
import type { ResponseBody } from '@/api/typing';

// 将请求数据转换为form-data格式
let baseUrl = '/api/v1';

enum Api {
	login = '/user/login',
	logout = '/user/logout',
}

export function loginApi(params: LoginParams): Promise<ResponseBody<any>> {
	return request.post(baseService.user + baseUrl + Api.login, null, { params });
}

export function logoutApi(): Promise<ResponseBody<any>> {
	return request.post(baseService.user + baseUrl + Api.logout);
}
