import { getData, postData, deleteData } from "@/api/common/index";

const baseGoods = "/api/alex-mission";

const platformGoodsUrl = {
    list: '/goods/getGoodsList',
}

export function getPlatformList(params: any): Promise<any> {
  return getData(baseGoods + platformGoodsUrl.list, params);
}

export function deleteBlogById(id: number) {
  return deleteData("/api/blog/delete?id=" + id);
}