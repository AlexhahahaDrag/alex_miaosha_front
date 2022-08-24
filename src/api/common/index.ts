import { Params } from "@/types/global";
import request from "@/utils/request/request";

export function postData(url: string, params: any): Promise<any> {
  return request.post<Params, any>(url, params);
}

export function getData(url: string, params: any): Promise<any> {
  return request.get<Params, any>(url, params);
}

export function deleteData(url: string): Promise<any> {
  return request.delete(url);
}