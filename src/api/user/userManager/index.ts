import {
    getDataOne,
    postData,
    putData,
    deleteData,
    baseService,
  } from "@/api/common/index";
  
  const baseUserManager = "/user";
  
  const userMangerUrl = {
    page: "/page",
    url: "",
  };
  
  export function getUserMangerPage(params: any, pageNo: number | null | undefined, pageSize : number | null| undefined): Promise<any> {
    let url = baseService.user + baseUserManager + userMangerUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
    return postData(url, params);
  }
  
  export function getUserMangerDetail(id: number): Promise<any> {
    return getDataOne(baseService.user + baseUserManager + userMangerUrl.url + "?id=" + id);
  }
  
  export function deleteUserManger(ids: string) : Promise<any>{
    return deleteData(baseService.user + baseUserManager + userMangerUrl.url + "?ids=" + ids);
  }
  
  export function addOrEditUserManger(
    method: string,
    params: any
  ): Promise<any> {
    if ("put" == method) {
      return putData(baseService.user + baseUserManager + userMangerUrl.url, params);
    } else {
      return postData(baseService.user + baseUserManager + userMangerUrl.url, params);
    }
  }
  