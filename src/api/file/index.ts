import { getDataOne, postData, putData, deleteData, baseService, } from "@/api/common/index";

const baseFileManager = "/api/v1/file-info";

const fileUrl = {
    page: '/page',
    url: "",
}

export function getFilePage(params: any, pageNo: number | null | undefined, pageSize: number | null | undefined): Promise<any> {
    let url = baseService.finance + baseFileManager + fileUrl.page + "?pageNum=" + (pageNo ? pageNo : 1) + "&pageSize=" + (pageSize ? pageSize : 10);
    return postData(url, params);
}

export function getFileDetail(id: number | string): Promise<any> {
    return getDataOne(baseService.finance + baseFileManager + fileUrl.url + "?id=" + id);
}

export function addOrEditFileManager(
    method: string,
    params: any
): Promise<any> {
    if ("put" == method) {
        return putData(baseService.finance + baseFileManager + fileUrl.url, params);
    } else {
        return postData(baseService.finance + baseFileManager + fileUrl.url, params);
    }
}

export function deleteDictManager(ids: string): Promise<any> {
    return deleteData(baseService.finance + baseFileManager + fileUrl.url + "?ids=" + ids);
}