import { loginApi } from "@/api/user/login";
import { defineStore } from "pinia";
import { UserState } from "./typing";
import { LoginParams } from "@/api/user/login";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useUserStore = defineStore({
  id: "app-user",
  state: (): UserState => ({
    userInfo: null,
    token: undefined,
    roleList: [],
    sessionTimeout: false,
    lastUpdateTime: 0,
  }),

  getters: {
    getUserInfo(): any {
      return this.userInfo;
      // return this.userInfo || getAuthCache<UserInfo>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      let localStorage = window.localStorage;
      return this.token || localStorage.getItem("token") || "";
      // return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    // getRoleList(): RoleEnum[] {
    //   return this.roleList.length > 0
    //     ? this.roleList
    //     : getAuthCache<RoleEnum[]>(ROLES_KEY);
    // },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ""; // for null or undefined value
      let localStorage = window.localStorage;
      localStorage.setItem("token", this.token);
      // setAuthCache(TOKEN_KEY, info);
    },
    async login(
      params: LoginParams & {
        goHome?: boolean;
      }
    ) {
      // ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, ...loginParams } = params;
        const data = await loginApi(loginParams);
        const { token, admin } = data.data;
        // save token
        this.setToken(token);
        return admin;
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
});
