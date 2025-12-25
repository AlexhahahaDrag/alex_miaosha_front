import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { getUserManagerList } from '@/views/user/userManager/api';
import type { UserManagerInfo } from '@/views/user/userManager/config';

// 用户列表
export function useUserInfo() {
	const userList = ref<UserManagerInfo[]>([]);
	const loading = ref<boolean>(false);

	const getUserInfoList = async () => {
		loading.value = true;
		try {
			const { code, data, message: messageInfo } = await getUserManagerList({});
			if (code == '200') {
				userList.value = data || [];
			} else {
				message.error(messageInfo || '查询用户列表失败！');
			}
		} catch (error: unknown) {
			message.error(
				'获取用户信息失败！' + (error as Error).message || '未知错误',
			);
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
