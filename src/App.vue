<template>
	<a-config-provider :locale="zhCN" :theme="antdTheme">
		<router-view />
	</a-config-provider>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { theme } from 'ant-design-vue';
import { useThemeStore } from '@/store/modules/theme';

dayjs.locale('zh-cn');
document.title = import.meta.env.VITE_APP_TITLE || '默认标题';

const themeStore = useThemeStore();

onMounted(() => {
	themeStore.initTheme();
});

const antdTheme = computed(() => ({
	token: {
		colorPrimary: themeStore.primaryColor,
	},
	algorithm: themeStore.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));
</script>


<style></style>
