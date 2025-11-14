import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { ContactsUserRelationInfo } from '../config';

const baseContactsUserRelation = '/api/v1/contacts-user-relation';

const ContactsUserRelationUrl = {
	page: '/page',
	url: '',
	publicEnabled: '/public-enabled',
	userEnabled: '/user-enabled',
};

// 获取关系分类列表
export const getContactsUserRelationPage = (
	params: ContactsUserRelationInfo,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
	userId?: number,
): Promise<ResponseBody<CommonPageResult<ContactsUserRelationInfo>>> => {
	let url =
		baseService.finance +
		baseContactsUserRelation +
		ContactsUserRelationUrl.page;
	const queryParams: Record<string, unknown> = {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	};
	if (userId) {
		queryParams.userId = userId;
	}
	return postData(url, params, queryParams);
};

// 获取关系分类详情
export const getContactsUserRelationDetail = (
	id: number,
): Promise<ResponseBody<ContactsUserRelationInfo>> => {
	return getDataOne(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.url,
		{
			id,
		},
	);
};

// 删除关系分类信息
export const deleteContactsUserRelation = (
	ids: string,
): Promise<ResponseBody<boolean>> => {
	return deleteData(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.url,
		{
			ids,
		},
	);
};

// 添加关系分类信息
export const addContactsUserRelation = (
	params: ContactsUserRelationInfo,
): Promise<ResponseBody<ContactsUserRelationInfo>> => {
	return postData(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.url,
		params,
	);
};

// 编辑关系分类信息
export const editContactsUserRelation = (
	params: ContactsUserRelationInfo,
): Promise<ResponseBody<ContactsUserRelationInfo>> => {
	return putData(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.url,
		params,
	);
};

// 查询启用的公共关系分类
export const getPublicEnabledRelations = (): Promise<
	ResponseBody<ContactsUserRelationInfo[]>
> => {
	return getDataOne(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.publicEnabled,
		{},
	);
};

// 查询用户的启用关系分类（公共+私有）
export const getUserEnabledRelations = (
	userId: number | string,
): Promise<ResponseBody<ContactsUserRelationInfo[]>> => {
	return getDataOne(
		baseService.finance +
			baseContactsUserRelation +
			ContactsUserRelationUrl.userEnabled,
		{
			userId,
		},
	);
};
