<template>
	<div class="welcome-header-container" data-testid="dash-welcome-header">
		<a-card :bordered="false" class="welcome-banner-card" :class="bannerClass">
			<div class="welcome-banner-inner">
				<div class="welcome-left">
					<a-avatar
						:size="68"
						class="user-avatar"
						:src="userInfo?.avatarUrl || userInfo?.avatar"
						data-testid="dash-user-avatar"
					>
						<template #icon>
							<user-outlined />
						</template>
					</a-avatar>
					<div class="welcome-info">
						<div class="greeting-row">
							<h2 class="greeting-title" data-testid="dash-greeting-text">
								{{ greetingText }}，{{ userInfo?.nickName || userInfo?.userName || '尊敬的用户' }}
							</h2>
							<div class="roles-badge-container">
								<a-tag
									v-for="(tag, index) in userRoleTags"
									:key="tag.roleCode || index"
									:color="tag.tagColor"
									class="role-tag"
									:data-testid="`dash-role-tag-${tag.roleCode || index}`"
								>
									<template #icon>
										<crown-outlined v-if="tag.iconType === 'crown'" />
										<bank-outlined v-else-if="tag.iconType === 'bank'" />
										<smile-outlined v-else-if="tag.iconType === 'smile'" />
										<user-outlined v-else />
									</template>
									{{ tag.roleName }}
								</a-tag>
							</div>

							<!-- 物理分割线 -->
							<span v-if="orgName" class="header-v-divider" />

							<!-- 复合型组织归属挂件 (区别于角色药丸Tag) -->
							<div v-if="orgName" class="org-affiliation-chip" data-testid="dash-org-chip">
								<div class="org-chip-prefix">
									<apartment-outlined class="org-icon" />
									<span>{{ isFamilyOrg ? '家庭' : '机构' }}</span>
								</div>
								<div class="org-chip-name" data-testid="dash-org-name">{{ orgName }}</div>
							</div>
						</div>
						<p class="subtitle" data-testid="dash-welcome-subtitle">
							{{ subtitleText }}
						</p>
					</div>
				</div>

				<div class="welcome-right">
					<div class="date-badge" data-testid="dash-current-date">
						<div class="date-calendar-icon">
							<calendar-outlined />
						</div>
						<div class="date-text-group">
							<span class="date-main">{{ currentDateStr }}</span>
							<span class="date-sub">{{ currentWeekStr }}</span>
						</div>
					</div>
				</div>
			</div>
		</a-card>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user/user';
import type { DashboardRoleType } from '../../config';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {
	UserOutlined,
	CrownOutlined,
	BankOutlined,
	SmileOutlined,
	ApartmentOutlined,
	CalendarOutlined,
} from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';

interface DisplayRoleTag {
	roleCode: string;
	roleName: string;
	tagColor: string;
	iconType: 'crown' | 'bank' | 'smile' | 'user';
}

const props = defineProps<{
	roleType: DashboardRoleType;
}>();

const userStore = useUserStore();
const { userInfo, orgInfo } = storeToRefs(userStore);

const orgName = computed(() => {
	return orgInfo.value?.orgName || userInfo.value?.orgName || '';
});

const currentRoleName = computed(() => userStore.getRoleInfo?.roleName);

const isFamilyOrg = computed(() => {
	const name = orgName.value || '';
	const role = (currentRoleName.value || '').toLowerCase();
	return name.includes('家') || role.includes('家庭') || role.includes('人情');
});

// 根据时间生成友好问候语
const greetingText = computed(() => {
	const hour = dayjs().hour();
	if (hour >= 5 && hour < 9) return '早上好';
	if (hour >= 9 && hour < 12) return '上午好';
	if (hour >= 12 && hour < 14) return '中午好';
	if (hour >= 14 && hour < 19) return '下午好';
	return '晚上好';
});

// 多角色聚合：遍历用户所有绑定的有效角色，去重并分配独立徽标与色系
const userRoleTags = computed<DisplayRoleTag[]>(() => {
	if (props.roleType === 'super_admin') {
		return [
			{
				roleCode: 'super_super',
				roleName: '超级管理员',
				tagColor: 'purple',
				iconType: 'crown',
			},
		];
	}

	const rawList: any[] = [
		...(userInfo.value?.roleInfoVoList || []),
		...(userStore.getPermissionContext?.roleList || []),
		...(userStore.getRoleInfo ? [userStore.getRoleInfo] : []),
	];

	const tagMap = new Map<string, DisplayRoleTag>();

	for (const role of rawList) {
		if (!role) continue;
		const code = role.roleCode || '';
		let name = role.roleName || '';
		if (!name && code) {
			if (code === 'super_super') name = '超级管理员';
			else if (code === 'admin') name = '机构管理员';
			else if (code === 'family_admin') name = '家庭管理员';
			else if (code === 'gift_admin') name = '人情管理员';
			else if (code === 'user') name = '普通用户';
			else name = code;
		}

		if (!name) continue;

		let tagColor = 'green';
		let iconType: DisplayRoleTag['iconType'] = 'user';

		if (code === 'super_super') {
			tagColor = 'purple';
			iconType = 'crown';
		} else if (
			code === 'admin' ||
			code.endsWith('_admin') ||
			code.includes('admin') ||
			name.includes('管理员') ||
			name.includes('主管')
		) {
			tagColor = code.includes('family') ? 'cyan' : 'blue';
			iconType = 'bank';
		} else {
			tagColor = 'green';
			iconType = 'smile';
		}

		const key = code || name;
		if (!tagMap.has(key)) {
			tagMap.set(key, {
				roleCode: code,
				roleName: name,
				tagColor,
				iconType,
			});
		}
	}

	const result = Array.from(tagMap.values());
	if (result.length > 0) {
		return result;
	}

	return [
		{
			roleCode: props.roleType,
			roleName: props.roleType === 'org_admin' ? '机构管理员' : '普通用户',
			tagColor: props.roleType === 'org_admin' ? 'cyan' : 'green',
			iconType: props.roleType === 'org_admin' ? 'bank' : 'smile',
		},
	];
});

// 专属说明文案（自适应家庭/机构）
const subtitleText = computed(() => {
	if (props.roleType === 'super_admin') {
		return '系统运行稳健，全站 5 大微服务在线集群感知与全局数据控制已就绪。';
	}
	if (props.roleType === 'org_admin') {
		if (isFamilyOrg.value) {
			return `您正在管理【${orgName.value || '我的家庭'}】，今日家庭成员人情往来与待办日程已更新。`;
		}
		return `您正在管理【${orgName.value || '所属机构'}】，今日共有多项机构业务动态等待跟进。`;
	}
	return '保持积极好心情，今天也要认真记录生活中的每一笔人情往来！';
});

// 样式类区分
const bannerClass = computed(() => {
	if (props.roleType === 'super_admin') return 'banner-super';
	if (props.roleType === 'org_admin') return 'banner-org';
	return 'banner-user';
});

const currentDateStr = computed(() => dayjs().locale('zh-cn').format('YYYY年MM月DD日'));
const currentWeekStr = computed(() => dayjs().locale('zh-cn').format('dddd'));
</script>

<style scoped lang="scss">
.welcome-header-container {
	margin-bottom: 20px;
	position: relative;
	z-index: 1;

	.welcome-banner-card {
		border-radius: 12px;
		color: #ffffff;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
		transition: all 0.3s ease;

		:deep(.ant-card-body) {
			padding: 24px 28px;
		}

		&.banner-super {
			background: linear-gradient(135deg, #1f1c2c 0%, #442a58 50%, #302b63 100%);
		}

		&.banner-org {
			background: linear-gradient(135deg, #0b4870 0%, #16697a 50%, #2b7a78 100%);
		}

		&.banner-user {
			background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
		}
	}

	.welcome-banner-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
	}

	.welcome-left {
		display: flex;
		align-items: center;
		gap: 20px;

		.user-avatar {
			border: 2px solid rgba(255, 255, 255, 0.85);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
			background-color: #1890ff;
			flex-shrink: 0;
		}

		.greeting-row {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 10px;
			margin-bottom: 6px;

			.greeting-title {
				margin: 0;
				font-size: 22px;
				font-weight: 600;
				color: #ffffff;
				letter-spacing: 0.5px;
			}

			.roles-badge-container {
				display: inline-flex;
				align-items: center;
				flex-wrap: wrap;
				gap: 6px;
			}

			.role-tag {
				font-size: 13px;
				border-radius: 16px;
				padding: 2px 10px;
				display: inline-flex;
				align-items: center;
				gap: 4px;
				font-weight: 500;
				margin: 0;
			}

			.header-v-divider {
				display: inline-block;
				width: 1px;
				height: 16px;
				background: rgba(255, 255, 255, 0.35);
				margin: 0 4px;
			}

			.org-affiliation-chip {
				display: inline-flex;
				align-items: center;
				background: rgba(0, 0, 0, 0.26);
				backdrop-filter: blur(8px);
				border: 1px solid rgba(255, 255, 255, 0.3);
				border-radius: 6px;
				overflow: hidden;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
				transition: all 0.25s ease;

				&:hover {
					border-color: rgba(255, 255, 255, 0.55);
					background: rgba(0, 0, 0, 0.35);
				}

				.org-chip-prefix {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					background: rgba(24, 144, 255, 0.28);
					border-right: 1px solid rgba(255, 255, 255, 0.2);
					padding: 3px 8px;
					font-size: 11px;
					font-weight: 600;
					color: #91caff;
					letter-spacing: 0.5px;

					.org-icon {
						font-size: 12px;
					}
				}

				.org-chip-name {
					padding: 3px 10px;
					font-size: 13px;
					font-weight: 600;
					color: #ffffff;
					letter-spacing: 0.3px;
				}
			}
		}

		.subtitle {
			margin: 0;
			color: rgba(255, 255, 255, 0.82);
			font-size: 14px;
		}
	}

	.welcome-right {
		display: flex;
		align-items: center;

		.date-badge {
			display: flex;
			align-items: center;
			gap: 12px;
			background: rgba(255, 255, 255, 0.12);
			backdrop-filter: blur(8px);
			border: 1px solid rgba(255, 255, 255, 0.18);
			padding: 10px 18px;
			border-radius: 10px;

			.date-calendar-icon {
				font-size: 24px;
				color: #ffffff;
			}

			.date-text-group {
				display: flex;
				flex-direction: column;

				.date-main {
					font-size: 14px;
					font-weight: 600;
					color: #ffffff;
				}

				.date-sub {
					font-size: 12px;
					color: rgba(255, 255, 255, 0.75);
				}
			}
		}
	}
}

@media (max-width: 768px) {
	.welcome-header-container {
		.welcome-banner-inner {
			flex-direction: column;
			align-items: flex-start;
		}

		.welcome-right {
			width: 100%;
			justify-content: flex-end;
		}
	}
}
</style>
