import { getDataOne, getData, postData, putData, deleteData } from "@/api/common/index";

const baseDict = "/api/am-finance";

const dictUrl = {
    page: '/dict-info/page',
    listByBelong: '/dict-info/listByBelong',
    url: '/dict-info',
}

export function getDictPage(params: any): Promise<any> {
  return postData(baseDict + dictUrl.page, params);
}

export function getDictList(belongTo: string): Promise<any> {
  return getDataOne(baseDict + dictUrl.listByBelong + "?belongTo=" + belongTo);
}

export function getDictDetail(id: number): Promise<any> {
  return getDataOne(baseDict + dictUrl.url + "?id=" + id);
}

export function addDict(params: any): Promise<any> {
  return postData(baseDict + dictUrl.url, params);
}

export function editDict(params: any): Promise<any> {
  return putData(baseDict + dictUrl.url, params);
}

export function deleteDict(ids: string) {
  return deleteData(baseDict + dictUrl.url + "?ids=" + ids);
}