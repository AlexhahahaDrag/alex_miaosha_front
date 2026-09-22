<template>
	<a-card :title="title" :bordered="false" class="quick-actions-card">
		<a-row :gutter="[16, 16]">
			<a-col
				v-for="(item, index) in actions"
				:key="index"
				:xs="24"
				:sm="12"
				:md="12"
				:lg="24"
			>
				<div
					class="action-item-box"
					:data-testid="item.testId"
					@click="handleNavigate(item.path)"
				>
					<div class="action-icon-wrap" :style="{ backgroundColor: item.color + '18', color: item.color }">
						<component :is="iconMap[item.icon] || AppstoreOutlined" />
					</div>
					<div class="action-info">
						<div class="action-title">{{ item.title }}</div>
						<div class="action-desc">{{ item.desc }}</div>
					</div>
					<div class="action-arrow">
						<right-outlined />
					</div>
				</div>
			</a-col>
		</a-row>
	</a-card>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { QuickActionItem } from '../../config';
import {
	UserOutlined,
	SafetyCertificateOutlined,
	ApartmentOutlined,
	FileSearchOutlined,
	TeamOutlined,
	AppstoreOutlined,
	ThunderboltOutlined,
	AccountBookOutlined,
	PlusCircleOutlined,
	ContactsOutlined,
	ShoppingOutlined,
	RightOutlined,
} from '@ant-design/icons-vue';

defineProps<{
	title: string;
	actions: QuickActionItem[];
}>();

const router = useRouter();

const iconMap: Record<string, Component> = {
	UserOutlined,
	SafetyCertificateOutlined,
	ApartmentOutlined,
	FileSearchOutlined,
	TeamOutlined,
	AppstoreOutlined,
	ThunderboltOutlined,
	AccountBookOutlined,
	PlusCircleOutlined,
	ContactsOutlined,
	ShoppingOutlined,
};

const handleNavigate = (path: string) => {
	if (path) {
		router.push(path);
	}
};
</script>

<style scoped lang="scss">
.quick-actions-card {
	border-radius: 16px; /* Tailwind rounded-2xl */
	border: 1px solid #e2e8f0; /* Tailwind border-slate-200 */
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;
	background: #ffffff;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f1f5f9;
		font-weight: 700;
		color: #0f172a;
		font-size: 15px;
		letter-spacing: -0.2px;
		padding: 0 20px;
	}

	.action-item-box {
		display: flex;
		align-items: center;
		padding: 14px 16px;
		border-radius: 12px; /* Tailwind rounded-xl */
		background: #f8fafc; /* Tailwind bg-slate-50 */
		border: 1px solid #f1f5f9;
		cursor: pointer;
		transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			background: #ffffff;
			border-color: #bfdbfe; /* Tailwind border-blue-200 */
			box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.08), 0 4px 6px -4px rgba(37, 99, 235, 0.04);
			transform: translateY(-2px);

			.action-arrow {
				transform: translateX(4px);
				color: #2563eb;
			}
		}

		.action-icon-wrap {
			width: 44px;
			height: 44px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 20px;
			margin-right: 14px;
			flex-shrink: 0;
			box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
		}

		.action-info {
			flex: 1;
			min-width: 0;

			.action-title {
				font-size: 15px;
				font-weight: 700;
				color: #0f172a; /* Tailwind slate-900 */
				margin-bottom: 2px;
			}

			.action-desc {
				font-size: 12px;
				color: #64748b; /* Tailwind slate-500 */
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.action-arrow {
			color: #94a3b8;
			font-size: 13px;
			transition: all 0.22s ease;
			margin-left: 8px;
		}
	}
}
</style>
