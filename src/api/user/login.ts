import request from "@/utils/request/request";
import { LoginResultModel } from "./typing";

// 将请求数据转换为form-data格式
// 这里不用qs，用FormData也可以，不赘述
enum Api {
  login = "/api/am-user/api/v1/user/login",
  logout = "/api/am-user/api/v1/user/logout",
}

export interface LoginParams {
  isRememberMe?: boolean;
  username: string;
  password: string;
  type?: string;
}

function transParams(data) {
  let params = new URLSearchParams();
  for (let item in data) {
    params.append(item, data["" + item + ""]);
  }
  return params;
}

export function loginApi(params: LoginParams) {
  return request.post<LoginResultModel>(Api.login, transParams(params));
}

export function logoutApi() {
  return request.post(Api.logout);
}