import {
  getData,
  postData,
  putData,
  deleteData,
  baseService,
} from "@/api/common/index";

const basePrepaidCardInfoT = "/api/v1//prepaid-card-info-t";

const PrepaidCardInfoTUrl = {
  page: "/page",
  url: "",
};

export function getPrepaidCardInfoTPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
  let url = baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
  return postData(url, params);
}

export function getPrepaidCardInfoTDetail(id: number): Promise<any> {
  return getData(baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url + "?id=" + id);
}

export function deletePrepaidCardInfoT(ids: string) : Promise<any>{
  return deleteData(baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url + "?ids=" + ids);
}

export function addOrEditPrepaidCardInfoT(
  method: string,
  params: any
): Promise<any> {
  if ("put" == method) {
    return putData(baseService.finance + basePrepaidCardInfoT + PrepaidCardInfoTUrl.url, params);
  } else {
    return postData(baseService.finance + basePrepaidCardInfoT +  PrepaidCardInfoTUrl.url, params);
  }
}
