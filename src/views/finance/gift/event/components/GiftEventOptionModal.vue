<template>
	<a-modal
		v-model:open="open"
		title="编辑事件分类配置"
		:confirm-loading="saving"
		destroy-on-close
		@ok="handleSave"
	>
		<a-form
			:model="formState"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 16 }"
			style="padding-top: 12px"
		>
			<a-form-item label="分类名称">
				<a-input v-model:value="formState.name" disabled />
			</a-form-item>
			<a-form-item label="分类分组">
				<a-select v-model:value="formState.category">
					<a-select-option value="婚庆类">婚庆类</a-select-option>
					<a-select-option value="家庭类">家庭类</a-select-option>
					<a-select-option value="节日类">节日类</a-select-option>
					<a-select-option value="其他">其他</a-select-option>
				</a-select>
			</a-form-item>
			<a-form-item label="图标/Emoji">
				<a-input
					v-model:value="formState.icon"
					placeholder="输入单个 Emoji 图标"
				/>
			</a-form-item>
			<a-form-item label="默认推荐金额">
				<a-input-number
					v-model:value="formState.defaultAmount"
					:min="0"
					:precision="2"
					style="width: 100%"
					placeholder="随礼时的默认候选金额"
				/>
			</a-form-item>
			<a-form-item label="启用状态">
				<a-radio-group v-model:value="formState.status">
					<a-radio :value="1">启用</a-radio>
					<a-radio :value="0">停用</a-radio>
				</a-radio-group>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { updateGiftEventTypeOption } from '@/views/finance/gift/api';
import type { GiftEventTypeOptionItem } from '@/views/finance/gift/config';

const props = defineProps<{
	optionData?: Partial<GiftEventTypeOptionItem> | null;
}>();

const emit = defineEmits<{
	(e: 'success'): void;
}>();

const open = defineModel<boolean>('open', { default: false });
const saving = ref<boolean>(false);
const formState = ref<Partial<GiftEventTypeOptionItem>>({});

watch(
	() => open.value,
	(val) => {
		if (val && props.optionData) {
			formState.value = { ...props.optionData };
		}
	},
	{ immediate: true },
);

const handleSave = async () => {
	const { id, name, defaultAmount, status, icon, category } = formState.value;
	if (!id || saving.value) return;

	saving.value = true;
	try {
		const { code, message: msg } = await updateGiftEventTypeOption({
			id,
			eventLabel: name,
			defaultAmount,
			status,
			icon,
			category,
		});
		if (code === '200') {
			message.success('更新事由配置成功');
			open.value = false;
			emit('success');
		} else {
			message.error(msg || '更新事由配置失败');
		}
	} catch (error: unknown) {
		message.error('更新事由配置失败，请重试');
	} finally {
		saving.value = false;
	}
};
</script>
