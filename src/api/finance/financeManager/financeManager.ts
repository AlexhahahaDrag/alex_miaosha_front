import { getDataOne, getData, postData, putData, deleteData } from "@/api/common/index";

const baseFinanceManager = "/api/am-finance";

const financeMangerUrl = {
    page: '/finance-info/page',
    url: '/finance-info',
}

export function getFinanceMangerPage(params: any): Promise<any> {
  return postData(baseFinanceManager + financeMangerUrl.page, params);
}

export function getFinanceMangerDetail(id: number): Promise<any> {
  return getDataOne(baseFinanceManager + financeMangerUrl.url + "?id=" + id);
}

export function addFinanceManger(params: any): Promise<any> {
  return postData(baseFinanceManager + financeMangerUrl.url, params);
}

export function editFinanceManger(params: any): Promise<any> {
  return putData(baseFinanceManager + financeMangerUrl.url, params);
}

export function deleteFinanceManger(ids: string) {
  return deleteData(baseFinanceManager + financeMangerUrl.url + "?ids=" + ids);
}