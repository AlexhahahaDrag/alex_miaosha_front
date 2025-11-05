import { postData, baseService } from '@/utils/request';
import type { ResponseBody, CommonPageResult } from '@/types/api';
import type { ContactsGiftRecord } from '../config/index';

const basePersonalGift = '/api/v1/personal-gift';

const PersonalGiftUrl = {
	contactsGiftRecordList: '/contacts-gift-record-list',
};

/**
 * 获取联系人随礼记录列表
 * @param pageNum 页码
 * @param pageSize 每页大小
 * @param queryCondition 查询条件
 */
export const getContactsGiftRecordList = (
	pageNum: number = 1,
	pageSize: number = 10,
	queryCondition?: Partial<ContactsGiftRecord>,
): Promise<ResponseBody<CommonPageResult<ContactsGiftRecord>>> => {
	const url =
		baseService.finance +
		basePersonalGift +
		PersonalGiftUrl.contactsGiftRecordList;
	return postData(url, queryCondition || {}, {
		pageNum,
		pageSize,
	});
};
