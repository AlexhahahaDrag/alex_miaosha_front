import {
  getDataOne,
  postData,
  putData,
  deleteData,
} from "@/api/common/index";

const baseFinanceManager = "/api/am-finance";

const financeMangerUrl = {
  page: "/finance-info/page",
  url: "/finance-info",
};

export function getFinanceMangerPage(params: any): Promise<any> {
  return postData(baseFinanceManager + financeMangerUrl.page, params);
}

export function getFinanceMangerDetail(id: number): Promise<any> {
  return getDataOne(baseFinanceManager + financeMangerUrl.url + "?id=" + id);
}

export function deleteFinanceManger(ids: string) : Promise<any>{
  return deleteData(baseFinanceManager + financeMangerUrl.url + "?ids=" + ids);
}

export function addOrEditFinanceManger(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseFinanceManager + financeMangerUrl.url, params);
  } else {
    return postData(baseFinanceManager + financeMangerUrl.url, params);
  }
}
