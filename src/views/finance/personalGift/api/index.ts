import {
	getDataOne,
	postData,
	putData,
	deleteData,
	baseService,
	postFileData,
} from '@/utils/request';
import type { CommonPageResult, ResponseBody } from '@/types/api';
import type { PersonalGiftInfo } from '../config';

const basePersonalGift = '/api/v1/personal-gift';

const PersonalGiftUrl = {
	page: '/page',
	url: '',
	notice: '/notice',
	import: '/import',
};

// 获取个人随礼信息表列表
export const getPersonalGiftPage = (
	params: PersonalGiftInfo,
	pageNum?: number | null,
	pageSize?: number | null,
): Promise<ResponseBody<CommonPageResult<PersonalGiftInfo>>> => {
	let url = baseService.finance + basePersonalGift + PersonalGiftUrl.page;
	return postData(url, params, {
		pageNum: pageNum ? pageNum : 1,	
		pageSize: pageSize ? pageSize : 10,
	});
};

// 获取个人随礼信息表详情
export const getPersonalGiftDetail = (
	id: number,
): Promise<ResponseBody<PersonalGiftInfo>> => {
	return getDataOne(
		baseService.finance + basePersonalGift + PersonalGiftUrl.url,
		{
			id,
		},
	);
};

// 删除个人随礼信息表信息
export const deletePersonalGift = (
	ids: string,
): Promise<ResponseBody<boolean>> => {
	return deleteData(
		baseService.finance + basePersonalGift + PersonalGiftUrl.url,
		{
			ids,
		},
	);
};

// 通知个人随礼信息表信息
export const noticePersonalGift = (
	id: number,
): Promise<ResponseBody<PersonalGiftInfo>> => {
	return getDataOne(
		baseService.finance + basePersonalGift + PersonalGiftUrl.notice,
		{
			id,
		},
	);
};

// 添加或编辑个人随礼信息表信息
export const addOrEditPersonalGift = (
	method: string,
	params: PersonalGiftInfo,
): Promise<ResponseBody<PersonalGiftInfo>> => {
	if ('put' == method) {
		return putData(
			baseService.finance + basePersonalGift + PersonalGiftUrl.url,
			params,
		);
	} else {
		return postData(
			baseService.finance + basePersonalGift + PersonalGiftUrl.url,
			params,
		);
	}
};

// 导入个人随礼信息表信息
export const importPersonalGift = (
	file: FormData,
): Promise<ResponseBody<boolean>> => {
	return postFileData(
		baseService.finance + basePersonalGift + PersonalGiftUrl.import,
		file,
	);
};
