import { useUserStore } from "@/store/modules/user/user";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { ResponseBody } from "@/api/typing";
import { notification } from "ant-design-vue";

const request = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000,
});

axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

//异常拦截处理器
const errorHandler = (error: AxiosError): Promise<any> => {
  if (error.response) {
    // const { data, status, statusText } = error.response;
    // //403 无权限
    // if (status === 403) {
    //   notification.error({
    //     message: "Forbidden",
    //     description: (data && data.message) || statusText,
    //   });
    // }
    // //401 未登录、未授权
    // if (status === 401 && data.result && data.result.isLogin) {
    //   notification.error({
    //     message: "Unauthorized",
    //     description: "Authorization verification failed",
    //   });
    // }
  } else {
    notification.error({
      message: "system error",
      description: "请联系管理员",
    });
  }
  return Promise.reject(error);
};

//请求拦截器
const requestHandler = (
  config
): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
  const userStore = useUserStore();
  const token = userStore.getToken;
  if (token) {
    config.headers["Authorization"] = token;
  }
  return config;
};

// 添加请求拦截器
request.interceptors.request.use(requestHandler, errorHandler);

//响应拦截器
const responseHandler = (
  response: AxiosResponse<any>
): ResponseBody<any> | AxiosResponse<any> | Promise<any> | any => {
  return response.data;
};

// 添加响应拦截器
request.interceptors.response.use(responseHandler, errorHandler);

// export {AxiosResponse};
export default request;
