<template>
	<div class="dashboard-wrapper" data-testid="dash-main-container">
		<!-- 超级管理员专属沙盒视角预览工具栏 -->
		<div
			v-if="isRealSuperAdmin"
			class="super-sandbox-toolbar"
			data-testid="dash-sandbox-toolbar"
		>
			<div class="sandbox-label">
				<experiment-outlined class="sandbox-icon" />
				<span class="sandbox-title">超管专属视角预览沙盒：</span>
			</div>
			<a-radio-group
				v-model:value="currentActiveRole"
				button-style="solid"
				size="small"
				data-testid="dash-sandbox-role-radios"
			>
				<a-radio-button value="super_admin" data-testid="dash-role-btn-super">
					<crown-outlined />
					超级管理员视角
				</a-radio-button>
				<a-radio-button value="org_admin" data-testid="dash-role-btn-org">
					<bank-outlined />
					机构管理员视角
				</a-radio-button>
				<a-radio-button value="user" data-testid="dash-role-btn-user">
					<user-outlined />
					普通用户视角
				</a-radio-button>
			</a-radio-group>
		</div>

		<!-- 动态挂载对应角色看板 -->
		<transition name="fade-dashboard" mode="out-in">
			<component :is="activeDashboardComponent" :key="currentActiveRole" />
		</transition>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user/user';
import { loadEcharts } from '@/utils/echarts/loadEcharts';
import {
	resolveDashboardRole,
	type DashboardRoleType,
} from './config';
import SuperAdminDashboard from './components/super-admin/SuperAdminDashboard.vue';
import OrgAdminDashboard from './components/org-admin/OrgAdminDashboard.vue';
import UserDashboard from './components/user/UserDashboard.vue';
import {
	ExperimentOutlined,
	CrownOutlined,
	BankOutlined,
	UserOutlined,
} from '@ant-design/icons-vue';

// 首页初始化时后台预热 loadEcharts，使各角色看板图表渲染秒开，避免 Vite 8 预构建崩溃
onMounted(() => {
	void loadEcharts();
});

const userStore = useUserStore();

// 计算当前登录用户的物理真实身份
const actualRoleType = computed<DashboardRoleType>(() => {
	const permContext = userStore.getPermissionContext;
	const currentRole = userStore.getRoleInfo;
	return resolveDashboardRole(
		permContext,
		currentRole?.roleCode,
		currentRole?.roleName,
	);
});

// 是否为真超管（仅真超管可看到视角切换条）
const isRealSuperAdmin = computed(
	() => actualRoleType.value === 'super_admin',
);

// 当前正在渲染的看板角色（支持超管预览切角）
const currentActiveRole = ref<DashboardRoleType>('user');

// 初始化并保持响应
watch(
	actualRoleType,
	(val) => {
		currentActiveRole.value = val;
	},
	{ immediate: true },
);

// 根据当前选中角色计算激活组件
const activeDashboardComponent = computed(() => {
	switch (currentActiveRole.value) {
		case 'super_admin':
			return SuperAdminDashboard;
		case 'org_admin':
			return OrgAdminDashboard;
		case 'user':
		default:
			return UserDashboard;
	}
});
</script>

<style scoped lang="scss">
.dashboard-wrapper {
	padding: 20px;
	background-color: #f0f2f5;
	min-height: calc(100vh - 120px);

	.super-sandbox-toolbar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		background: #ffffff;
		padding: 8px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		border: 1px solid #e8e8e8;

		.sandbox-label {
			display: flex;
			align-items: center;
			gap: 6px;
			margin-right: 12px;
			color: #722ed1;
			font-size: 13px;
			font-weight: 600;

			.sandbox-icon {
				font-size: 15px;
			}
		}
	}
}

/* 视图平滑过渡动效 */
.fade-dashboard-enter-active,
.fade-dashboard-leave-active {
	transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease;
}

.fade-dashboard-enter-from {
	opacity: 0;
	transform: translateY(6px);
}

.fade-dashboard-leave-to {
	opacity: 0;
	transform: translateY(-6px);
}
</style>
