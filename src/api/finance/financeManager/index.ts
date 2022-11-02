import {
  getDataOne,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const baseFinanceManager = "/finance-info";

const financeMangerUrl = {
  page: "/page",
  url: "",
};

export function getFinanceMangerPage(params: any): Promise<any> {
  return postData(baseService.finance + baseFinanceManager + financeMangerUrl.page, params);
}

export function getFinanceMangerDetail(id: number): Promise<any> {
  return getDataOne(baseService.finance + baseFinanceManager + financeMangerUrl.url + "?id=" + id);
}

export function deleteFinanceManger(ids: string) : Promise<any>{
  return deleteData(baseService.finance + baseFinanceManager + financeMangerUrl.url + "?ids=" + ids);
}

export function addOrEditFinanceManger(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
  } else {
    return postData(baseService.finance + baseFinanceManager + financeMangerUrl.url, params);
  }
}
