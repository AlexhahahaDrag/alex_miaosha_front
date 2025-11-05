import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
	postFileData,
	downloadFile,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ContactsUserInfo } from '../config';

const baseContactsUser = '/api/v1/contacts-user';

const ContactsUserUrl = {
	page: '/page',
	url: '',
	import: '/import',
};

// 获取联系人列表
export const getContactsUserPage = (
	params: ContactsUserInfo,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<ContactsUserInfo>>> => {
	let url = baseService.finance + baseContactsUser + ContactsUserUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
};

// 获取联系人详情
export const getContactsUserDetail = (
	id: number,
): Promise<ResponseBody<ContactsUserInfo>> => {
	return getDataOne(
		baseService.finance + baseContactsUser + ContactsUserUrl.url,
		{
			id,
		},
	);
};

// 删除联系人信息
export const deleteContactsUser = (
	ids: string,
): Promise<ResponseBody<boolean>> => {
	return deleteData(
		baseService.finance + baseContactsUser + ContactsUserUrl.url,
		{
			ids,
		},
	);
};

// 添加联系人信息
export const addContactsUser = (
	params: ContactsUserInfo,
): Promise<ResponseBody<ContactsUserInfo>> => {
	return postData(
		baseService.finance + baseContactsUser + ContactsUserUrl.url,
		params,
	);
};

// 编辑联系人信息
export const editContactsUser = (
	params: ContactsUserInfo,
): Promise<ResponseBody<ContactsUserInfo>> => {
	return putData(
		baseService.finance + baseContactsUser + ContactsUserUrl.url,
		params,
	);
};

// 导入联系人信息
export const importContactsUser = (
	file: FormData,
): Promise<ResponseBody<boolean>> => {
	return postFileData(
		baseService.finance + baseContactsUser + ContactsUserUrl.import,
		file,
	);
};

// 下载联系人模版
// 注意事项：
// 1. 此接口返回的是二进制Blob文件，不是JSON数据
// 2. 响应拦截器会自动跳过解密处理
// 3. 返回的response.data是Blob对象，需要通过createObjectURL处理
// 4. 使用示例见：index.vue中的onDownloadTemplate()函数
export const downloadContactsUserTemplate = (
	params: unknown,
): Promise<ResponseBody<unknown>> => {
	return downloadFile(baseService.finance + baseContactsUser + '/template', {
		params,
	});
};
