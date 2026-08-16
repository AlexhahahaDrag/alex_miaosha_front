<template>
	<div class="user-info-container">
		<!-- 快捷操作区：全屏 & GitHub & 消息 -->
		<div class="action-tools">
			<a-tooltip title="GitHub 开源仓库" placement="bottom">
				<button
					type="button"
					class="tool-btn"
					aria-label="GitHub"
					@click="openGithub"
				>
					<github-outlined />
				</button>
			</a-tooltip>

			<a-tooltip
				:title="isFullscreen ? '退出全屏' : '全屏浏览'"
				placement="bottom"
			>
				<button
					type="button"
					class="tool-btn"
					aria-label="全屏切换"
					@click="toggleFullscreen"
				>
					<fullscreen-exit-outlined v-if="isFullscreen" />
					<fullscreen-outlined v-else />
				</button>
			</a-tooltip>

			<a-tooltip title="消息通知" placement="bottom">
				<a-badge :count="newsCount" :offset="[-4, 4]" :overflow-count="99">
					<button
						type="button"
						class="tool-btn"
						aria-label="通知中心"
						@click="handleNotificationClick"
					>
						<bell-outlined />
					</button>
				</a-badge>
			</a-tooltip>
		</div>

		<div class="tool-divider"></div>

		<!-- 用户胶囊下拉菜单 -->
		<a-dropdown
			placement="bottomRight"
			:trigger="['hover', 'click']"
			v-model:open="dropdownVisible"
			overlay-class-name="user-dropdown-overlay"
		>
			<div
				class="user-pill"
				:class="{ 'user-pill-active': dropdownVisible }"
				@click.prevent
			>
				<a-avatar
					:size="32"
					shape="circle"
					:src="userInfo?.avatarUrl"
					class="user-avatar"
				>
					<template #icon>
						<user-outlined />
					</template>
				</a-avatar>
				<div class="user-meta">
					<span class="user-name">{{ displayName }}</span>
					<span class="user-role">{{ roleName || '系统用户' }}</span>
				</div>
				<down-outlined class="dropdown-arrow" />
			</div>

			<template #overlay>
				<div class="user-dropdown-card">
					<!-- 用户头部名片 -->
					<div class="dropdown-header">
						<a-avatar
							:size="44"
							shape="circle"
							:src="userInfo?.avatarUrl"
							class="header-avatar"
						>
							<template #icon>
								<user-outlined />
							</template>
						</a-avatar>
						<div class="header-info">
							<div class="header-name-row">
								<span class="header-name">{{ displayName }}</span>
								<a-tag color="blue" class="header-tag">
									{{ roleName || '用户' }}
								</a-tag>
							</div>
							<span class="header-org">
								{{ orgName || 'Alex 数字化平台' }}
							</span>
						</div>
					</div>

					<!-- 菜单操作列表 -->
					<div class="dropdown-body">
						<div class="menu-item" @click="handleItemClick('home')">
							<div class="menu-icon-wrap home-icon">
								<home-outlined />
							</div>
							<div class="menu-text-wrap">
								<span class="item-title">系统首页</span>
								<span class="item-desc">返回主工作台概览</span>
							</div>
						</div>

						<div class="menu-item" @click="handleItemClick('profile')">
							<div class="menu-icon-wrap profile-icon">
								<user-outlined />
							</div>
							<div class="menu-text-wrap">
								<span class="item-title">个人资料</span>
								<span class="item-desc">查看与更新个人信息</span>
							</div>
						</div>

						<div class="menu-item" @click="handleItemClick('resetPwd')">
							<div class="menu-icon-wrap lock-icon">
								<lock-outlined />
							</div>
							<div class="menu-text-wrap">
								<span class="item-title">修改密码</span>
								<span class="item-desc">保障账户访问安全</span>
							</div>
						</div>

						<div class="menu-item" @click="handleItemClick('github')">
							<div class="menu-icon-wrap github-icon">
								<github-outlined />
							</div>
							<div class="menu-text-wrap">
								<span class="item-title">开源社区</span>
								<span class="item-desc">GitHub 源码与文档</span>
							</div>
						</div>
					</div>

					<!-- 底部退出登录 -->
					<div class="dropdown-footer">
						<div
							class="menu-item logout-item"
							@click="handleItemClick('logout')"
						>
							<div class="menu-icon-wrap logout-icon">
								<logout-outlined />
							</div>
							<span class="logout-text">退出登录</span>
						</div>
					</div>
				</div>
			</template>
		</a-dropdown>

		<!-- 修改密码弹窗 -->
		<a-modal
			v-model:open="pwdModalVisible"
			title="修改密码"
			ok-text="确认修改"
			cancel-text="取消"
			:confirm-loading="pwdLoading"
			@ok="handlePasswordSubmit"
			@cancel="handlePasswordCancel"
			destroy-on-close
			:width="440"
		>
			<a-form
				ref="pwdFormRef"
				:model="pwdForm"
				:rules="pwdRules"
				layout="vertical"
				style="margin-top: 16px"
			>
				<a-form-item label="原密码" name="oldPassword">
					<a-input-password
						v-model:value="pwdForm.oldPassword"
						placeholder="请输入当前使用的原密码"
					/>
				</a-form-item>
				<a-form-item label="新密码" name="newPassword">
					<a-input-password
						v-model:value="pwdForm.newPassword"
						placeholder="请输入新密码（建议包含字母和数字）"
					/>
				</a-form-item>
				<a-form-item label="确认新密码" name="confirmPassword">
					<a-input-password
						v-model:value="pwdForm.confirmPassword"
						placeholder="请再次输入新密码"
					/>
				</a-form-item>
			</a-form>
		</a-modal>
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
	BellOutlined,
	FullscreenOutlined,
	FullscreenExitOutlined,
} from '@ant-design/icons-vue';
import { logoutApi } from '@/views/login/api';
import { useUserStore } from '@/store/modules/user/user';
import { refreshRouter } from '@/router';
import { storeToRefs } from 'pinia';

// 响应式数据
const userStore = useUserStore();
const { userInfo, roleInfo, orgInfo } = storeToRefs(userStore);
const newsCount = ref<number>(0);
const dropdownVisible = ref<boolean>(false);
const isFullscreen = ref<boolean>(false);
const router = useRouter();

// 计算属性
const displayName = computed(
	() => userInfo.value?.nickName || userInfo.value?.username || '管理员',
);

const roleName = computed(() => {
	if (roleInfo.value && Array.isArray(roleInfo.value) && roleInfo.value.length) {
		return (
			roleInfo.value[0].roleName ||
			roleInfo.value[0].name ||
			roleInfo.value[0].roleCode
		);
	}
	if (roleInfo.value && typeof roleInfo.value === 'object') {
		const r = roleInfo.value as any;
		return r.roleName || r.name || r.roleCode;
	}
	return '系统成员';
});

const orgName = computed(() => {
	if (orgInfo.value) {
		const o = orgInfo.value as any;
		return o.name || o.orgName || o.deptName;
	}
	return '';
});

// 全屏切换
const toggleFullscreen = () => {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen().then(() => {
			isFullscreen.value = true;
		});
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen().then(() => {
				isFullscreen.value = false;
			});
		}
	}
};

// 监听全屏变化
onMounted(() => {
	document.addEventListener('fullscreenchange', () => {
		isFullscreen.value = !!document.fullscreenElement;
	});
	fetchNewsCount();
});

// 消息通知点击
const handleNotificationClick = () => {
	message.info('当前暂无未读系统通知');
};

// 菜单点击分发
const handleItemClick = async (key: string) => {
	dropdownVisible.value = false;

	switch (key) {
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
			openPasswordModal();
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
	} catch (error: unknown) {
		console.error('跳转失败：', error);
	}
};

// 导航到个人资料页
const navigateToProfile = async () => {
	try {
		await router.push('/profile');
	} catch (error: unknown) {
		try {
			await router.push('/user/manager');
		} catch (err: unknown) {
			message.info('个人中心正在建设中');
		}
	}
};

// 打开 GitHub
const openGithub = () => {
	window.open('https://github.com/AlexhahahaDrag/alex_miaosha_front', '_blank');
};

// 修改密码弹窗逻辑
const pwdModalVisible = ref(false);
const pwdLoading = ref(false);
const pwdFormRef = ref();
const pwdForm = ref({
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
});

const pwdRules = {
	oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
	newPassword: [
		{ required: true, message: '请输入新密码', trigger: 'blur' },
		{ min: 6, max: 20, message: '密码长度需在 6-20 位之间', trigger: 'blur' },
	],
	confirmPassword: [
		{ required: true, message: '请确认新密码', trigger: 'blur' },
		{
			validator: async (_: any, value: string) => {
				if (value && value !== pwdForm.value.newPassword) {
					throw new Error('两次输入的密码不一致');
				}
			},
			trigger: 'blur',
		},
	],
};

const openPasswordModal = () => {
	pwdForm.value = {
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
	};
	pwdModalVisible.value = true;
};

const handlePasswordCancel = () => {
	pwdModalVisible.value = false;
};

const handlePasswordSubmit = async () => {
	try {
		await pwdFormRef.value?.validate();
		pwdLoading.value = true;
		// 模拟修改成功
		setTimeout(() => {
			pwdLoading.value = false;
			pwdModalVisible.value = false;
			message.success('密码修改成功，请牢记您的新密码');
		}, 600);
	} catch {
		pwdLoading.value = false;
	}
};

// 退出登录确认
const showLogoutConfirm = () => {
	Modal.confirm({
		title: '确认退出登录',
		content: '您确定要退出当前管理账号吗？',
		okText: '退出登录',
		cancelText: '取消',
		okType: 'danger',
		centered: true,
		onOk: handleLogout,
	});
};

// 执行注销
const handleLogout = async () => {
	try {
		await logoutApi();
	} catch (error: unknown) {
		// 忽略服务端网络注销失败，直接清理本地状态
	} finally {
		userStore.setUserInfo(null);
		userStore.setToken('');
		userStore.changeRouteStatus(false);
		refreshRouter();
		await router.push('/login');
		message.success('已安全退出登录');
	}
};

// 获取消息数
const fetchNewsCount = async () => {
	newsCount.value = 0;
};
</script>

<style lang="scss" scoped>
.user-info-container {
	display: flex;
	align-items: center;
	gap: 8px;
	height: 100%;

	.action-tools {
		display: flex;
		align-items: center;
		gap: 4px;

		.tool-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border: none;
			border-radius: 8px;
			background: transparent;
			color: #64748b;
			font-size: 16px;
			cursor: pointer;
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			&:hover {
				background: rgba(15, 23, 42, 0.05);
				color: #1e293b;
			}
		}
	}

	.tool-divider {
		width: 1px;
		height: 18px;
		background: #e2e8f0;
		margin: 0 4px;
	}

	.user-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 10px 3px 3px;
		border-radius: 20px;
		background: rgba(15, 23, 42, 0.03);
		border: 1px solid rgba(15, 23, 42, 0.06);
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		user-select: none;

		&:hover,
		&.user-pill-active {
			background: #f1f5f9;
			border-color: #cbd5e1;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
		}

		.user-avatar {
			background: linear-gradient(135deg, #3b82f6, #1d4ed8);
			color: #fff;
			font-size: 14px;
			border: 2px solid #fff;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			flex-shrink: 0;
		}

		.user-meta {
			display: flex;
			flex-direction: column;
			line-height: 1.2;
			text-align: left;

			.user-name {
				font-size: 13px;
				font-weight: 600;
				color: #1e293b;
				max-width: 90px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.user-role {
				font-size: 10px;
				color: #94a3b8;
				font-weight: 500;
			}
		}

		.dropdown-arrow {
			font-size: 10px;
			color: #94a3b8;
			margin-left: 2px;
			transition: transform 0.25s ease;
		}

		&.user-pill-active {
			.dropdown-arrow {
				transform: rotate(180deg);
				color: #3b82f6;
			}
		}
	}
}

// 悬浮下拉卡片样式
.user-dropdown-card {
	width: 256px;
	border-radius: 14px;
	background: #ffffff;
	box-shadow:
		0 12px 32px -4px rgba(15, 23, 42, 0.12),
		0 4px 12px -2px rgba(15, 23, 42, 0.06);
	border: 1px solid rgba(226, 232, 240, 0.9);
	overflow: hidden;

	.dropdown-header {
		padding: 16px;
		background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
		border-bottom: 1px solid #f1f5f9;
		display: flex;
		align-items: center;
		gap: 12px;

		.header-avatar {
			background: linear-gradient(135deg, #3b82f6, #1d4ed8);
			color: #fff;
			font-size: 18px;
			border: 2px solid #fff;
			box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
			flex-shrink: 0;
		}

		.header-info {
			display: flex;
			flex-direction: column;
			gap: 4px;
			overflow: hidden;

			.header-name-row {
				display: flex;
				align-items: center;
				gap: 6px;

				.header-name {
					font-size: 14px;
					font-weight: 700;
					color: #0f172a;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.header-tag {
					font-size: 10px;
					padding: 0 6px;
					height: 18px;
					line-height: 18px;
					border-radius: 4px;
					margin: 0;
				}
			}

			.header-org {
				font-size: 11px;
				color: #64748b;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.dropdown-body {
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		.menu-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 8px 10px;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background: #f1f5f9;

				.menu-icon-wrap {
					transform: scale(1.08);
				}
			}

			.menu-icon-wrap {
				width: 30px;
				height: 30px;
				border-radius: 7px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 14px;
				transition: transform 0.2s ease;
				flex-shrink: 0;

				&.home-icon {
					background: #eff6ff;
					color: #2563eb;
				}

				&.profile-icon {
					background: #ecfdf5;
					color: #059669;
				}

				&.lock-icon {
					background: #fffbeb;
					color: #d97706;
				}

				&.github-icon {
					background: #f8fafc;
					color: #334155;
				}
			}

			.menu-text-wrap {
				display: flex;
				flex-direction: column;
				line-height: 1.25;

				.item-title {
					font-size: 13px;
					font-weight: 600;
					color: #1e293b;
				}

				.item-desc {
					font-size: 11px;
					color: #94a3b8;
				}
			}
		}
	}

	.dropdown-footer {
		padding: 6px;
		border-top: 1px solid #f1f5f9;

		.logout-item {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 8px 10px;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.2s ease;

			&:hover {
				background: #fef2f2;

				.logout-text {
					color: #ef4444;
				}

				.logout-icon {
					transform: scale(1.08);
				}
			}

			.logout-icon {
				width: 30px;
				height: 30px;
				border-radius: 7px;
				background: #fee2e2;
				color: #ef4444;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 14px;
				transition: transform 0.2s ease;
				flex-shrink: 0;
			}

			.logout-text {
				font-size: 13px;
				font-weight: 600;
				color: #64748b;
				transition: color 0.2s ease;
			}
		}
	}
}

// 移动端自适应
@media (max-width: 768px) {
	.user-info-container {
		.action-tools {
			display: none;
		}

		.tool-divider {
			display: none;
		}

		.user-pill {
			.user-meta {
				display: none;
			}
		}
	}
}
</style>
