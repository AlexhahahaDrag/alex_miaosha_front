<template>
  <a-badge :count="newsCount">
    欢迎你，{{
      userInfo ?
        userInfo.nickName ?
          userInfo.nickName
        : userInfo.username
      : ''
    }}
    <a-dropdown>
      <a class="ant-dropdown-link" @click.prevent>
        <a-avatar
          shape="square"
          :src="userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : ''"
        >
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </a>
      <template #overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="home"> 首页 </a-menu-item>
          <a-menu-item key="github"> github </a-menu-item>
          <a-menu-item key="resetPwd"> 重置密码(todo...) </a-menu-item>
          <a-menu-item key="logout"> 注销 </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-badge>
</template>
<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { logoutApi } from '@/api/user/login';
import { useUserStore } from '@/store/modules/user/user';
import { refreshRouter } from '@/router/index';

const { userInfo } = useUserStore();
const newsCount = ref<number>(0);
const router = useRouter();
const userStore = useUserStore();

const handleMenuClick: MenuProps['onClick'] = async (e) => {
  switch (e.key) {
    case 'home':
      router.push('/');
      break;
    case 'github':
      window.open('https://github.com/AlexhahahaDrag/alex_miaosha_front');
      break;
    case 'logout':
      await logout();
      // 清空页面缓存
      userStore.setUserInfo(null);
      userStore.setToken('');
      userStore.changeRouteStatus(false);
      // 刷新路由，防止动态路由被多余读取
      refreshRouter();
      break;
  }
};

const logout = async () => {
  await logoutApi();
  //跳转到登录页面
  router.push('/login');
  return;
};
</script>
<style lang="scss" scoped>
.right-menu-item {
  display: inline-block;
  padding: 0 8px;
  height: 100%;
  font-size: 18px;
  color: #5a5e66;
  vertical-align: text-bottom;

  &.hover-effect {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
}

.avatar-container {
  margin-right: 30px;

  .avatar-wrapper {
    margin-top: 5px;
    position: relative;

    .ant-avatar {
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }

    .ant-dropdown-link {
      cursor: pointer;
      position: absolute;
      right: -20px;
      top: 25px;
      font-size: 120px;
    }
  }
}
</style>
