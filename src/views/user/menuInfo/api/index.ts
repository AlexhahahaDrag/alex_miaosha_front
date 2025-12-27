import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { MenuInfoData } from '../config';

const baseMenuInfo = '/api/v1/menu-info';

const MenuInfoUrl = {
	page: '/page',
	url: '',
};

export function getMenuInfoPage(
	params: MenuInfoData,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<MenuInfoData>>> {
	return postData(baseService.user + baseMenuInfo + MenuInfoUrl.page, params, {
		pageNum: pageNum ? pageNum : 1,
		pageSize: pageSize ? pageSize : 10,
	});
}

export function getMenuInfoDetail(
	id: number,
): Promise<ResponseBody<MenuInfoData>> {
	return getDataOne(baseService.user + baseMenuInfo + MenuInfoUrl.url, { id });
}

export function deleteMenuInfo(ids: string): Promise<ResponseBody<boolean>> {
	return deleteData(baseService.user + baseMenuInfo + MenuInfoUrl.url, { ids });
}

export function addMenuInfo(
	params: MenuInfoData,
): Promise<ResponseBody<MenuInfoData>> {
	return postData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
}

export function editMenuInfo(
	params: MenuInfoData,
): Promise<ResponseBody<MenuInfoData>> {
	return putData(baseService.user + baseMenuInfo + MenuInfoUrl.url, params);
}
