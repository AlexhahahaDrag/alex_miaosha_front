import { useUserStore } from '@/store/modules/user/user';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { ResponseBody } from '@/types/api';
import { message } from 'ant-design-vue';
import router from '@/router';
import { decrypt } from '@/utils/crypto/index';
import moment from 'moment';

const request = axios.create({
	timeout: 6000,
});

axios.defaults.headers.post['Content-Type'] = 'application/json';

//异常拦截处理器
const errorHandler = (error: AxiosError): Promise<any> => {
	let response = null;
	if ('ECONNABORTED' == error.code) {
		message.warning('请求超时，请稍后再试！', 3);
		return Promise.reject(error);
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

//请求拦截器
const requestHandler = (
	config: AxiosRequestConfig<any>,
): AxiosRequestConfig<any> | Promise<AxiosRequestConfig<any>> | any => {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (token) {
		if (config?.headers) {
			config.headers['Authorization'] = token;
		}
	} else {
		router.push({ name: 'login' });
	}
	if (config?.data) {
		for (const k in config.data) {
			if (config.data[k] && config.data[k].$L == 'zh-cn') {
				config.data[k] = config.data[k].add(8, 'hours');
			}
		}
	}
	return config;
};

//请求拦截器
const requestHandlerFile = (
	config: AxiosRequestConfig<any>,
): AxiosRequestConfig<any> | Promise<AxiosRequestConfig<any>> | any => {
	const userStore = useUserStore();
	const token = userStore.getToken;
	if (token) {
		if (config?.headers) {
			config.headers['Authorization'] = token;
			config.headers['Content-Type'] = 'multipart/form-data';
		}
	} else {
		router.push({ name: 'login' });
	}
	if (config?.data) {
		for (const k in config.data) {
			if (config.data[k] && config.data[k] instanceof Date) {
				config.data[k] = moment(config.data[k])
					.add(8, 'hours')
					.local()
					.toISOString();
			}
		}
	}
	return config;
};

// 添加请求拦截器
request.interceptors.request.use(requestHandler, errorHandler);

//响应拦截器
const responseHandler = (
	response: AxiosResponse<any>,
): ResponseBody<any> | AxiosResponse<any> | Promise<any> | any => {
	const { data } = response;
	let resData = decrypt(data);
	if (resData.code == 403) {
		router.push({ name: 'login' });
		return;
	}
	return resData;
};

// 添加响应拦截器
request.interceptors.response.use(responseHandler, errorHandler);

const requestFile = axios.create({
	timeout: 30000,
});

// 添加请求拦截器
requestFile.interceptors.request.use(requestHandlerFile, errorHandler);

requestFile.interceptors.response.use(responseHandler, errorHandler);

export { request as default, requestFile };
