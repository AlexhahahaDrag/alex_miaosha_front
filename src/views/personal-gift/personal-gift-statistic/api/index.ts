import { getData, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';
import type { QueryParams, PersonalGiftStatisticData } from '../config/index';

const basePersonalGift = '/api/v1/personal-gift';

const PersonalGiftUrl = {
	occasionDistribution: '/occasion-distribution',
	trend: '/trend',
	statistic: '/statistic',
};

/**
 * 获取个人随礼场合分布数据
 * @param params 查询参数 { startTime?: string, endTime?: string }
 */
export const getOccasionDistribution = (
	params?: QueryParams,
): Promise<ResponseBody<Array<{ occasion: string; count: number }>>> => {
	const urlParams = new URLSearchParams();
	if (params?.startTime) {
		urlParams.append('startTime', params.startTime);
	}
	if (params?.endTime) {
		urlParams.append('endTime', params.endTime);
	}
	const url =
		baseService.finance +
		basePersonalGift +
		PersonalGiftUrl.occasionDistribution +
		(urlParams.toString() ? `?${urlParams.toString()}` : '');
	return getData(url);
};

/**
 * 获取个人随礼近12个月趋势数据
 * @param params 查询参数 { startTime?: string, endTime?: string }
 */
export const getPersonalGiftTrend = (
	params?: QueryParams,
): Promise<
	ResponseBody<
		Array<{
			month: string;
			giftOutAmount: number;
			giftInAmount: number;
			giftOutCount: number;
			giftInCount: number;
		}>
	>
> => {
	const urlParams = new URLSearchParams();
	if (params?.startTime) {
		urlParams.append('startTime', params.startTime);
	}
	if (params?.endTime) {
		urlParams.append('endTime', params.endTime);
	}
	const url =
		baseService.finance +
		basePersonalGift +
		PersonalGiftUrl.trend +
		(urlParams.toString() ? `?${urlParams.toString()}` : '');
	return getData(url);
};

/**
 * 获取个人随礼统计概览数据
 * @param params 查询参数 { startTime?: string, endTime?: string }
 */
export const getPersonalGiftStatistic = (
	params?: QueryParams,
): Promise<ResponseBody<PersonalGiftStatisticData>> => {
	const urlParams = new URLSearchParams();
	if (params?.startTime) {
		urlParams.append('startTime', params.startTime);
	}
	if (params?.endTime) {
		urlParams.append('endTime', params.endTime);
	}
	const url =
		baseService.finance +
		basePersonalGift +
		PersonalGiftUrl.statistic +
		(urlParams.toString() ? `?${urlParams.toString()}` : '');
	return getData(url);
};
