import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseMenuInfo = '/api/v1/menu-info';

const MenuInfoUrl = {
	page: '/page',
	url: '',
};

export function getMenuInfoPage(
	params: unknown,
	pageNo: number | null | undefined,
	pageSize: number | null | undefined,
): Promise<ResponseBody> {
	let url = baseService.user + baseMenuInfo + MenuInfoUrl.page;
	return postData(url, params, {
		pageNo: pageNo ? pageNo : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getMenuInfoDetail(id: number): Promise<ResponseBody> {
	return getDataOne(
		baseService.user + baseMenuInfo + MenuInfoUrl.url + '?id=' + id,
	);
}

export function deleteMenuInfo(ids: string): Promise<ResponseBody> {
	return deleteData(
		baseService.user + baseMenuInfo + MenuInfoUrl.url + '?ids=' + ids,
	);
}

export function addOrEditMenuInfo(
	method: string,
	params: unknown,
): Promise<ResponseBody> {
	if ('put' == method) {
		return putData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
	} else {
		return postData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
	}
}
