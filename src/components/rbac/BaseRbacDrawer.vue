<template>
	<a-drawer
		:open="open"
		:width="width"
		:closable="!loading"
		:destroy-on-close="destroyOnClose"
		:body-style="{ padding: 0 }"
		wrap-class-name="rbac-drawer-wrap"
		@close="handleCancel"
	>
		<template #title>
			<div class="rbac-drawer-title">
				<span class="rbac-drawer-title__text">{{ title }}</span>
				<span v-if="subtitle" class="rbac-drawer-title__subtitle">
					{{ subtitle }}
				</span>
			</div>
		</template>

		<div class="rbac-drawer">
			<section
				v-if="summaryItems.length || $slots.summary"
				class="rbac-drawer__summary"
			>
				<slot name="summary">
					<div
						v-for="item in summaryItems"
						:key="item.label"
						class="rbac-drawer__summary-item"
					>
						<span class="rbac-drawer__summary-label">{{ item.label }}</span>
						<span class="rbac-drawer__summary-value">
							{{ item.value ?? '-' }}
						</span>
					</div>
				</slot>
			</section>

			<a-alert
				v-if="errorText"
				class="rbac-drawer__alert"
				type="error"
				:message="errorText"
				show-icon
			/>

			<a-spin :spinning="loading">
				<section class="rbac-drawer__body">
					<slot />
				</section>
			</a-spin>
		</div>

		<template #footer>
			<div class="rbac-drawer__footer">
				<slot name="footer">
					<a-button :disabled="loading" @click="handleCancel">
						{{ cancelText }}
					</a-button>
					<a-button
						type="primary"
						:loading="loading"
						class="rbac-drawer__primary"
						@click="emit('save')"
					>
						{{ saveText }}
					</a-button>
				</slot>
			</div>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import type { RbacSummaryItem } from './types';

interface Props {
	open: boolean;
	title: string;
	subtitle?: string;
	summaryItems?: RbacSummaryItem[];
	loading?: boolean;
	errorText?: string;
	width?: number | string;
	saveText?: string;
	cancelText?: string;
	destroyOnClose?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	summaryItems: () => [],
	loading: false,
	errorText: '',
	width: 560,
	saveText: '保存',
	cancelText: '取消',
	destroyOnClose: false,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
	save: [];
	cancel: [];
}>();

function handleCancel() {
	if (props.loading) return;
	emit('update:open', false);
	emit('cancel');
}
</script>

<style scoped lang="less">
.rbac-drawer-title {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.rbac-drawer-title__text {
	color: #111111;
	font-size: 16px;
	font-weight: 600;
	line-height: 24px;
}

.rbac-drawer-title__subtitle {
	color: #737373;
	font-size: 12px;
	font-weight: 400;
	line-height: 18px;
}

.rbac-drawer {
	background: #ffffff;
	min-height: 100%;
}

.rbac-drawer__summary {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	margin: 16px;
	padding: 12px;
	background: #fafafa;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.rbac-drawer__summary-item {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.rbac-drawer__summary-label {
	color: #737373;
	font-size: 12px;
	line-height: 18px;
}

.rbac-drawer__summary-value {
	color: #111111;
	font-size: 13px;
	font-weight: 500;
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.rbac-drawer__alert {
	margin: 0 16px 12px;
}

.rbac-drawer__body {
	padding: 16px;
}

.rbac-drawer__footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.rbac-drawer__primary {
	background: #111111;
	border-color: #111111;
}
</style>
