<template>
	<a-layout style="height: 100%">
		<a-layout-sider
			v-model:collapsed="collapsed"
			collapsible
			class="app-sider"
			:width="232"
		>
			<div class="app-logo" @click="goHome">
				<div class="app-logo-mark">A</div>
				<div v-if="!collapsed" class="app-logo-text">
					<strong>Alex Platform</strong>
					<span>Management Console</span>
				</div>
			</div>
			<my-navbar :routes="routes" :selectedKeys="selectedKeys"></my-navbar>
		</a-layout-sider>
		<a-layout>
			<a-layout-header class="app-header">
				<div class="navbar">
					<div class="right-menu">
						<my-right-info></my-right-info>
					</div>
				</div>
			</a-layout-header>
			<a-layout-content class="layout-content">
				<div class="tabs-container">
					<my-tabs></my-tabs>
				</div>
				<div class="content-container">
					<router-view />
				</div>
			</a-layout-content>
			<a-layout-footer
				v-if="showFooter"
				style="height: 40px; background-color: #ffffff"
			>
				<div class="app-footer-inner">
					{{ appTitle }}
				</div>
			</a-layout-footer>
		</a-layout>
	</a-layout>
</template>
<script setup lang="ts">
import { routes as globalRoutes } from '@/router';
import { algorithm } from '@/utils/algorithm';

const router = useRouter();
const routes = computed(() =>
	algorithm.increaseIndexes(globalRoutes),
);
let collapsed = ref<boolean>(false);
let selectedKeys = ref<string[]>(['1']);

const appTitle = import.meta.env.VITE_APP_DESCRIPTION || 'alex管理后台';
const showFooter = import.meta.env.VITE_SHOW_FOOTER !== 'false';

const goHome = async () => {
	await router.push('/');
};
</script>
<style lang="scss" scoped>
.app-sider {
	background: #0f172a !important;

	:deep(.ant-layout-sider-trigger) {
		background: #111827;
	}

	:deep(.ant-menu-dark) {
		background: #0f172a;
	}

	:deep(.ant-menu-dark .ant-menu-sub) {
		background: #111827;
	}

	:deep(.ant-menu-dark .ant-menu-item-selected) {
		background: rgba(59, 130, 246, 0.15) !important;
		border-left: 3px solid #3b82f6;
	}

	:deep(.ant-menu-dark .ant-menu-item) {
		margin-inline: 8px;
		width: calc(100% - 16px);
		border-radius: 8px;
	}

	:deep(.ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover) {
		background: rgba(255, 255, 255, 0.06) !important;
	}
}

.app-logo {
	display: flex;
	align-items: center;
	gap: 12px;
	height: 64px;
	padding: 0 16px;
	cursor: pointer;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-logo-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 8px;
	background: linear-gradient(135deg, #1677ff, #4096ff);
	color: #fff;
	font-size: 18px;
	font-weight: 700;
	flex-shrink: 0;
}

.app-logo-text {
	display: flex;
	flex-direction: column;
	overflow: hidden;

	strong {
		color: #fff;
		font-size: 14px;
		line-height: 1.2;
	}

	span {
		color: rgba(255, 255, 255, 0.45);
		font-size: 11px;
		line-height: 1.3;
	}
}

.app-header {
	background: #fff;
	padding: 0;
}

.navbar {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	height: 50px;
	overflow: hidden;
	position: relative;
	background: #fff;
	box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);

	.right-menu {
		display: flex;
		align-items: center;
		height: 100%;
		margin-right: 16px;
	}
}

.layout-content {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.tabs-container {
	padding: 0 20px;
	flex-shrink: 0;
}

.content-container {
	background: #fff;
	flex: 1;
	overflow-y: auto;
}

.app-footer-inner {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
}
</style>
