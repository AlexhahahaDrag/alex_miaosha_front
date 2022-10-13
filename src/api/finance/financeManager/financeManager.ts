import { getDataOne, getData, postData, putData, deleteData } from "@/api/common/index";

const baseGoods = "/api/am-finance";

const financeMangerUrl = {
    page: '/finance-info/page',
    url: '/finance-info',
}

export function getFinanceMangerPage(params: any): Promise<any> {
  return postData(baseGoods + financeMangerUrl.page, params);
}

export function getFinanceMangerDetail(id: number): Promise<any> {
  return getDataOne(baseGoods + financeMangerUrl.url + "?id=" + id);
}

export function addFinanceManger(params: any): Promise<any> {
  return postData(baseGoods + financeMangerUrl.url, params);
}

export function editFinanceManger(params: any): Promise<any> {
  return putData(baseGoods + financeMangerUrl.url, params);
}

export function deleteFinanceManger(ids: string) {
  return deleteData(baseGoods + financeMangerUrl.url + "?ids=" + ids);
}