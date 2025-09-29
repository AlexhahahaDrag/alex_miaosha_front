import { message } from 'ant-design-vue';
import { getUserManagerList } from '@/api/user/userManager';
import type { UserInfo } from '@/types/store';

export function useUserInfo() {
	const userList = ref<UserInfo[]>([]);
	const loading = ref<boolean>(false);

	const getUserInfoList = async () => {
		loading.value = true;
		try {
			const { code, data, message: messageInfo } = await getUserManagerList({});
			if (code == '200') {
				userList.value = data;
			} else {
				message.error(messageInfo || '查询用户列表失败！');
			}
		} catch (error: any) {
			message.error('获取用户信息失败！', error);
		} finally {
			loading.value = false;
		}
	};

	// 初始化时获取用户列表
	onMounted(() => {
		getUserInfoList();
	});

	return {
		userList,
		loading,
		getUserInfoList,
	};
}
