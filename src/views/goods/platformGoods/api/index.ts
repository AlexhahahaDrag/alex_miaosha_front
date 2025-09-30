import { getData, deleteData, baseService } from '@/utils/request';
import type { ResponseBody } from '@/types/api';

const baseGoods = '/api/v1';

const platformGoodsUrl = {
	list: '/goods/getGoodsList',
};

export function getPlatformList(params: any): Promise<ResponseBody> {
	return getData(
		baseService.mission + baseGoods + platformGoodsUrl.list,
		params,
	);
}

export function deleteBlogById(id: number): Promise<ResponseBody> {
	return deleteData('/api/blog/delete?id=' + id);
}
