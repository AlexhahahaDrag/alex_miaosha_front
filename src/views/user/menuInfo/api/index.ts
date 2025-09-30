import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { MenuInfoData } from '../config';

const baseMenuInfo = '/api/v1//menu-info';

const MenuInfoUrl = {
	page: '/page',
	url: '',
};

export function getMenuInfoPage(
	params: MenuInfoData,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody<CommonPageResult<MenuInfoData>>> {
	let url = baseService.user + baseMenuInfo + MenuInfoUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getMenuInfoDetail(
	id: number,
): Promise<ResponseBody<MenuInfoData>> {
	return getDataOne(baseService.user + baseMenuInfo + MenuInfoUrl.url, {
		id,
	});
}

export function deleteMenuInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseMenuInfo + MenuInfoUrl.url, {
		ids,
	});
}

export function addOrEditMenuInfo(
	method: string,
	params: MenuInfoData,
): Promise<ResponseBody<MenuInfoData>> {
	if ('put' == method) {
		return putData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
	} else {
		return postData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
	}
}
