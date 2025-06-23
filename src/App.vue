<template>
	<a-config-provider :locale="zhCN">
		<router-view />
	</a-config-provider>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
dayjs.locale('zh-cn');
document.title = import.meta.env.VITE_APP_TITLE || '默认标题';
</script>

<style></style>
