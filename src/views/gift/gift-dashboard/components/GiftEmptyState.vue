<template>
	<div class="gift-empty-state">
		<div class="gift-empty-state__icon">
			<component :is="icon" />
		</div>
		<h4>{{ title }}</h4>
		<p>{{ description }}</p>
		<a-button v-if="actionText" type="link" @click="onAction">
			{{ actionText }}
		</a-button>
	</div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
	title: string;
	description: string;
	actionText?: string;
	icon?: Component;
	to?: string;
}

const props = withDefaults(defineProps<Props>(), {
	actionText: '',
	to: '',
});

const router = useRouter();

const onAction = async () => {
	if (!props.to) return;
	await router.push(props.to);
};
</script>

<style scoped lang="less">
.gift-empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 180px;
	padding: 24px 16px;
	text-align: center;

	&__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		margin-bottom: 12px;
		border-radius: 16px;
		background: rgba(22, 119, 255, 0.08);
		color: #1677ff;
		font-size: 24px;
	}

	h4 {
		margin: 0 0 6px;
		font-size: 15px;
		font-weight: 700;
		color: #101828;
	}

	p {
		margin: 0 0 8px;
		max-width: 260px;
		font-size: 13px;
		color: #667085;
		line-height: 1.6;
	}
}
</style>
