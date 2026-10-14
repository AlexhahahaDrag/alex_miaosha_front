<template>
	<div class="create-form-panel">
		<div class="panel-header">
			<h4 class="panel-title">新建人情事件</h4>
			<span class="panel-subtitle">创建后将自动为您选中该事件</span>
		</div>
		<a-form :model="createForm" layout="vertical" ref="formRef">
			<a-row :gutter="16">
				<a-col :span="14">
					<a-form-item
						label="事件名称"
						name="eventName"
						:rules="[
							{ required: true, message: '请输入事件名称，如：徐福乐结婚' },
						]"
					>
						<a-input
							v-model:value="createForm.eventName"
							placeholder="例如：徐福乐结婚"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="10">
					<a-form-item
						label="事件分类"
						name="eventType"
						:rules="[{ required: true, message: '请选择事件分类' }]"
					>
						<a-select
							v-model:value="createForm.eventType"
							placeholder="请选择分类"
							:options="eventTypeSelectOptions"
						/>
					</a-form-item>
				</a-col>
			</a-row>

			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item
						label="举行时间"
						name="eventTime"
						:rules="[{ required: true, message: '请选择举行时间' }]"
					>
						<a-date-picker
							v-model:value="createForm.eventTime"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							placeholder="请选择举行日期"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item label="关联亲友" name="hostPersonId">
						<gift-person-picker
							v-model="createForm.hostPersonId"
							placeholder="选择或搜索关联亲友"
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
		<div class="panel-buttons">
			<a-button @click="$emit('cancel')">返回列表</a-button>
			<a-button type="primary" :loading="creating" @click="handleCreate">
				确定并选中
			</a-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { formatDate, formatTime } from '@/utils/dayjs';
import { addGiftEvent } from '@/views/finance/gift/api';
import type { GiftEventInfo } from '@/views/finance/gift/config';

defineProps<{
	eventTypeSelectOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
	(e: 'created', event: GiftEventInfo): void;
	(e: 'cancel'): void;
}>();

const formRef = ref();
const creating = ref<boolean>(false);
const createForm = ref<GiftEventInfo>({
	eventName: '',
	eventType: undefined,
	eventTime: formatDate(new Date()),
	hostPersonId: undefined,
});

const handleCreate = async () => {
	if (!formRef.value) return;
	creating.value = true;
	try {
		await formRef.value.validateFields();

		let params: Record<string, any> = {
			eventName: createForm.value.eventName?.trim() || undefined,
			eventType: createForm.value.eventType || undefined,
			hostPersonId: createForm.value.hostPersonId || undefined,
		};
		if (createForm.value.eventTime) {
			params.eventTime = formatTime(createForm.value.eventTime);
		}

		const {
			code,
			data,
			message: msg,
		} = await addGiftEvent(params as GiftEventInfo);
		if (code === '200' && data) {
			message.success('创建成功并已选中该事件');
			emit('created', data);
		} else {
			message.error(msg || '创建失败');
		}
	} catch (e) {
		// validation failed
	} finally {
		creating.value = false;
	}
};

const resetForm = () => {
	createForm.value = {
		eventName: '',
		eventType: undefined,
		eventTime: formatDate(new Date()),
		hostPersonId: undefined,
	};
	formRef.value?.clearValidate();
};

defineExpose({
	resetForm,
});
</script>

<style lang="scss" scoped>
.create-form-panel {
	border: 1px solid #eaecf0;
	border-radius: 8px;
	padding: 16px 20px;
	background: #f8fafc;

	.panel-header {
		margin-bottom: 16px;

		.panel-title {
			margin: 0 0 2px;
			font-weight: 700;
			font-size: 15px;
			color: #1e293b;
		}

		.panel-subtitle {
			font-size: 12px;
			color: #64748b;
		}
	}

	.panel-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 12px;
	}
}
</style>
