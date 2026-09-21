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
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f0f0f0;
		font-weight: 600;
	}

	.action-item-box {
		display: flex;
		align-items: center;
		padding: 14px 16px;
		border-radius: 10px;
		background: #fcfcfd;
		border: 1px solid #eef0f4;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			background: #ffffff;
			border-color: #1890ff;
			box-shadow: 0 4px 14px rgba(24, 144, 255, 0.12);
			transform: translateY(-2px);

			.action-arrow {
				transform: translateX(3px);
				color: #1890ff;
			}
		}

		.action-icon-wrap {
			width: 44px;
			height: 44px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 20px;
			margin-right: 14px;
			flex-shrink: 0;
		}

		.action-info {
			flex: 1;
			min-width: 0;

			.action-title {
				font-size: 15px;
				font-weight: 600;
				color: #1f2937;
				margin-bottom: 2px;
			}

			.action-desc {
				font-size: 12px;
				color: #8c8c8c;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.action-arrow {
			color: #bfbfbf;
			font-size: 13px;
			transition: all 0.25s ease;
			margin-left: 8px;
		}
	}
}
</style>
