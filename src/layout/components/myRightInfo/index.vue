<template>
	<div class="user-info-container">
		<a-badge :count="newsCount" :offset="[10, 0]">
			<span class="welcome-text"> 欢迎你，{{ displayName }} </span>
		</a-badge>

		<a-dropdown
			placement="bottomRight"
			:trigger="['hover', 'click']"
			v-model:open="dropdownVisible"
		>
			<div class="avatar-wrapper" @click.prevent>
				<a-avatar
					:size="40"
					shape="square"
					:src="userInfo?.avatarUrl"
					class="user-avatar"
				>
					<template #icon>
						<user-outlined />
					</template>
				</a-avatar>
				<down-outlined class="dropdown-icon" />
			</div>

			<template #overlay>
				<a-menu @click="handleMenuClick" class="user-dropdown-menu">
					<a-menu-item key="home" class="menu-item">
						<home-outlined />
						<span>首页</span>
					</a-menu-item>
					<a-menu-item key="profile" class="menu-item">
						<user-outlined />
						<span>个人资料</span>
					</a-menu-item>
					<a-menu-item key="github" class="menu-item">
						<github-outlined />
						<span>GitHub</span>
					</a-menu-item>
					<a-menu-divider />
					<a-menu-item key="resetPwd" class="menu-item">
						<lock-outlined />
						<span>重置密码</span>
					</a-menu-item>
					<a-menu-item key="logout" class="menu-item logout-item">
						<logout-outlined />
						<span>注销</span>
					</a-menu-item>
				</a-menu>
			</template>
		</a-dropdown>
	</div>
</template>

<script setup lang="ts">
import { Modal, message } from 'ant-design-vue';
import {
	UserOutlined,
	DownOutlined,
	HomeOutlined,
	GithubOutlined,
	LockOutlined,
	LogoutOutlined,
} from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { logoutApi } from '@/views/login/api';
import { useUserStore } from '@/store/modules/user/user';
import { refreshRouter } from '@/router/index';
import { storeToRefs } from 'pinia';

// 响应式数据
const { userInfo } = storeToRefs(useUserStore());
const newsCount = ref<number>(0);
const dropdownVisible = ref<boolean>(false);
const router = useRouter();
const userStore = useUserStore();

// 计算属性
const displayName = computed(() => {
	return userInfo.value?.nickName || userInfo.value?.username || '未知用户';
});

// 菜单点击处理
const handleMenuClick: MenuProps['onClick'] = async (e) => {
	dropdownVisible.value = false;

	switch (e.key) {
		case 'home':
			await navigateToHome();
			break;
		case 'profile':
			await navigateToProfile();
			break;
		case 'github':
			openGithub();
			break;
		case 'resetPwd':
			showResetPasswordModal();
			break;
		case 'logout':
			showLogoutConfirm();
			break;
	}
};

// 导航到首页
const navigateToHome = async () => {
	try {
		await router.push('/');
		message.success('已跳转到首页');
	} catch (error: any) {
		message.error('跳转失败，请重试', error);
	}
};

// 导航到个人资料页
const navigateToProfile = async () => {
	try {
		await router.push('/profile');
	} catch (error: any) {
		message.error('跳转失败，请重试', error);
	}
};

// 打开GitHub页面
const openGithub = () => {
	window.open('https://github.com/AlexhahahaDrag/alex_miaosha_front', '_blank');
};

// 显示重置密码模态框
const showResetPasswordModal = () => {
	Modal.info({
		title: '重置密码',
		content: '密码重置功能正在开发中，敬请期待！',
		okText: '知道了',
	});
};

// 显示注销确认对话框
const showLogoutConfirm = () => {
	Modal.confirm({
		title: '确认注销',
		content: '您确定要注销当前账户吗？',
		okText: '确认注销',
		cancelText: '取消',
		okType: 'danger',
		onOk: handleLogout,
	});
};

// 处理注销
const handleLogout = async () => {
	try {
		await logoutApi();

		// 清空用户状态
		userStore.setUserInfo(null);
		userStore.setToken('');
		userStore.changeRouteStatus(false);

		// 刷新路由
		refreshRouter();

		// 跳转到登录页
		await router.push('/login');

		message.success('注销成功');
	} catch (error) {
		console.error('注销失败:', error);
		message.error('注销失败，请重试');
	}
};

// 获取消息数量（模拟数据，实际应该从API获取）
const fetchNewsCount = async () => {
	try {
		// 这里应该调用实际的API
		// const response = await getNewsCountApi();
		// newsCount.value = response.count;
		newsCount.value = 0; // 临时设置为0
	} catch (error) {
		console.error('获取消息数量失败:', error);
	}
};

// 组件挂载时获取消息数量
onMounted(() => {
	fetchNewsCount();
});
</script>

<style lang="scss" scoped>
.user-info-container {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 16px;
	height: 100%;

	.welcome-text {
		font-size: 14px;
		color: #666;
		font-weight: 500;
		white-space: nowrap;

		@media (max-width: 768px) {
			display: none; // 移动端隐藏欢迎文字
		}
	}

	.avatar-wrapper {
		display: flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		transition: all 0.2s ease;

		&:hover {
			background-color: rgba(0, 0, 0, 0.04);
		}

		.user-avatar {
			border: 2px solid #f0f0f0;
			transition: all 0.2s ease;

			&:hover {
				border-color: #1890ff;
				transform: scale(1.05);
			}
		}

		.dropdown-icon {
			font-size: 12px;
			color: #999;
			transition: transform 0.2s ease;
		}

		&.ant-dropdown-open {
			.dropdown-icon {
				transform: rotate(180deg);
			}
		}
	}
}

:deep(.user-dropdown-menu) {
	min-width: 160px;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

	.menu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		transition: all 0.2s ease;

		&:hover {
			background-color: #f5f5f5;
		}

		.anticon {
			font-size: 14px;
			width: 14px;
			text-align: center;
		}

		span {
			font-size: 14px;
		}

		&.logout-item {
			color: #ff4d4f;

			&:hover {
				background-color: #fff2f0;
				color: #ff4d4f;
			}
		}
	}
}

// 徽章样式优化
:deep(.ant-badge) {
	.ant-badge-count {
		box-shadow: 0 0 0 1px #fff;
		font-size: 12px;
		min-width: 18px;
		height: 18px;
		line-height: 18px;
	}
}

// 响应式设计
@media (max-width: 768px) {
	.user-info-container {
		padding: 4px 8px;
		gap: 8px;

		.avatar-wrapper {
			padding: 2px 4px;

			.user-avatar {
				width: 32px;
				height: 32px;
			}
		}
	}
}
</style>
