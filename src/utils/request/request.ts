import { useUserStore } from '@/store/modules/user/user';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { ResponseBody } from '@/types/api';
import { message } from 'ant-design-vue';
import router from '@/router';
import { decrypt } from '@/utils/crypto';

const request = axios.create({
	timeout: 30000,
});

axios.defaults.headers.post['Content-Type'] = 'application/json';

// 异常拦截处理器
const errorHandler = (type: string) => {
	return (error: AxiosError): Promise<any> => {
		let response = null;
		if ('ECONNABORTED' == error.code) {
			message.warning('请求超时，请稍后再试！', 3);
			return Promise.reject(error);
		}
		if (type === 'file') {
			return Promise.reject(error.response);
		}
		if (error.response) {
			const { status } = error.response;
			// 403 无权限
			if (status === 403) {
				message.warning('请先登录！', 3);
				router.push({ name: 'login' });
				return Promise.resolve(error);
			}
			const { data } = error.response;
			if (data) {
				response = decrypt(data as string);
			}
		}
		return Promise.resolve(response);
	};
};

// 请求拦截器
const requestHandler = (type: string) => {
	return (
		config: AxiosRequestConfig<any>,
	): AxiosRequestConfig<any> | Promise<AxiosRequestConfig<any>> | any => {
		const userStore = useUserStore();
		const token = userStore.getToken;
		if (token) {
			if (config?.headers) {
				config.headers['Authorization'] = token;
				if (type === 'file') {
					config.headers['Content-Type'] = 'multipart/form-data';
				}
			}
		} else {
			router.push({ name: 'login' });
		}
		if (config?.data && type !== 'file') {
			for (const k in config.data) {
				if (config.data[k] && config.data[k].$L == 'zh-cn') {
					config.data[k] = config.data[k].add(8, 'hours');
				}
			}
		}
		return config;
	};
};

// 响应拦截器
const responseHandler = (type: string) => {
	return (
		response: AxiosResponse<any>,
	): ResponseBody<any> | AxiosResponse<any> | Promise<any> | any => {
		if (type === 'file') {
			return response;
		}
		const { data } = response;
		let resData = decrypt(data);
		if (resData.code == 403) {
			router.push({ name: 'login' });
			return;
		}
		return resData;
	};
};

// 添加请求拦截器
request.interceptors.request.use(requestHandler(''), errorHandler(''));
// 添加响应拦截器
request.interceptors.response.use(responseHandler(''), errorHandler(''));

const requestFile = axios.create({
	timeout: 30000,
});

// 添加请求拦截器
requestFile.interceptors.request.use(
	requestHandler('file'),
	errorHandler('file'),
);

requestFile.interceptors.response.use(
	responseHandler('file'),
	errorHandler('file'),
);

export { request as default, requestFile };
