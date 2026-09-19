import { useUserStore } from '@/store/modules/user/user';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { ResponseBody } from '@/types/api';
import { message } from 'ant-design-vue';
import router from '@/router';
import { decrypt, decryptGcm } from '@/utils/crypto';

const request = axios.create({
	timeout: 30000,
});

axios.defaults.headers.post['Content-Type'] = 'application/json';

// 异常拦截处理器
const errorHandler = (type: string) => {
	return async (error: AxiosError): Promise<any> => {
		let response = null;
		if ('ECONNABORTED' == error.code) {
			message.warning('请求超时，请稍后再试！', 3);
			return Promise.reject(error);
		}
		if (type === 'file') {
			return Promise.reject(error.response);
		}
		if (error.response) {
			const { status, headers } = error.response;
			// 401 / 403 鉴权失败或无权限，清理过期凭据并跳登录页
			if (status === 401 || status === 403) {
				message.warning('登录态已失效，请重新登录！', 3);
				const userStore = useUserStore();
				userStore.resetAuth();
				router.push({ name: 'login' });
				return Promise.resolve(error);
			}
			const { data } = error.response;
			if (data) {
				const version = headers ? (headers['x-crypto-version'] || headers['X-Crypto-Version']) : null;
				if (version === '2.0' && typeof data === 'string') {
					response = await decryptGcm(data);
				} else {
					response = decrypt(data as string);
				}
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
		if (config?.headers) {
			config.headers['X-Crypto-Version'] = '2.0';
		}
		const userStore = useUserStore();
		const token = userStore.getToken;
		if (token) {
			if (config?.headers) {
				config.headers['Authorization'] = token;
				// FormData 必须由浏览器自动带 boundary；勿手写 multipart/form-data
				if (
					type === 'file' &&
					typeof FormData !== 'undefined' &&
					config.data instanceof FormData
				) {
					const headers = config.headers as {
						delete?: (name: string) => void;
						[key: string]: unknown;
					};
					if (typeof headers.delete === 'function') {
						headers.delete('Content-Type');
					} else {
						delete headers['Content-Type'];
					}
				}
			}
		} else {
			router.push({ name: 'login' });
		}
		return config;
	};
};

// 响应拦截器
const responseHandler = (type: string) => {
	return async (
		response: AxiosResponse<any>,
	): Promise<ResponseBody<any> | AxiosResponse<any> | any> => {
		// 下载类 blob 原样返回；上传等 JSON 与普通请求一致解密业务体
		if (type === 'file' && response.config.responseType === 'blob') {
			return response;
		}
		const { data, headers } = response;
		const version = headers ? (headers['x-crypto-version'] || headers['X-Crypto-Version']) : null;
		let resData;
		if (version === '2.0' && typeof data === 'string') {
			resData = await decryptGcm(data);
		} else {
			resData = decrypt(data);
		}
		if (
			resData?.code == 401 ||
			resData?.code == 403 ||
			resData?.code == '401' ||
			resData?.code == '403'
		) {
			message.warning(resData?.message || '登录态已失效，请重新登录！', 3);
			const userStore = useUserStore();
			userStore.resetAuth();
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
