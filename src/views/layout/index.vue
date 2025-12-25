<template>
	<a-layout style="height: 100%">
		<a-layout-sider v-model:collapsed="collapsed" collapsible>
			<div class="logo"></div>
			<my-navbar :routes="routes" :selectedKeys="selectedKeys"></my-navbar>
		</a-layout-sider>
		<a-layout>
			<a-layout-header style="background: #fff; padding: 0">
				<div
					class="navbar"
					style="
						display: flex;
						align-items: center;
						justify-content: space-between;
					"
				>
					<my-breadcrumb class="breadcrumb-container"></my-breadcrumb>
					<div class="right-menu" style="display: flex; align-items: center">
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
				<div
					style="
						display: flex;
						align-items: center;
						justify-content: center;
						height: 100%;
					"
				>
					{{ appTitle }}
				</div>
			</a-layout-footer>
		</a-layout>
	</a-layout>
</template>
<script setup lang="ts">
import { algorithm } from '@/utils/algorithm';

const router = useRouter();
const routes = computed(() =>
	algorithm.increaseIndexes(router.options.routes as []),
);
let collapsed = ref<boolean>(false);
let selectedKeys = ref<string[]>(['1']);

// 从环境变量获取配置
const appTitle = import.meta.env.VITE_APP_DESCRIPTION || 'alex管理后台';

const showFooter = import.meta.env.VITE_SHOW_FOOTER !== 'false';
</script>
<style lang="scss" scoped>
.navbar {
	height: 50px;
	overflow: hidden;
	position: relative;
	background: #fff;
	box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

	.hamburger-container {
		line-height: 46px;
		height: 100%;
		float: left;
		cursor: pointer;
		transition: background 0.3s;
		-webkit-tap-highlight-color: transparent;

		&:hover {
			background: rgba(0, 0, 0, 0.025);
		}
	}

	.breadcrumb-container {
		float: left;
	}

	.right-menu {
		float: right;
		height: 100%;
		line-height: 10px;
		margin-right: 10px;

		&:focus {
			outline: none;
		}
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
</style>
