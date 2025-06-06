<template>
	<div>
		<a-modal
			:open="props.open"
			:width="
				props.modelInfo && props.modelInfo.width ?
					props.modelInfo.width
				:	'1000px'
			"
			:title="
				props.modelInfo && props.modelInfo.title ?
					props.modelInfo.title
				:	'Basic Modal'
			"
			@ok="handleOk"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
			@cancel="handleCancel">
			<template #footer>
				<a-button key="back" @click="handleCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					@click="handleOk"
					>保存</a-button
				>
			</template>
			<a-form
				ref="formRef"
				name="PrepaidCardInfoTForm"
				class="ant-advanced-search-form"
				:model="formState"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol">
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['cardId'].name"
							:label="labelMap['cardId'].label">
							<a-input
								v-model:value="formState.cardId"
								:placeholder="'请填写' + labelMap['cardId'].label"></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['cardName'].name"
							:label="labelMap['cardName'].label">
							<a-input
								v-model:value="formState.cardName"
								:placeholder="'请填写' + labelMap['cardName'].label"></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['initialBalance'].name"
							:label="labelMap['initialBalance'].label">
							<a-input
								v-model:value="formState.initialBalance"
								:placeholder="
									'请填写' + labelMap['initialBalance'].label
								"></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['currentBalance'].name"
							:label="labelMap['currentBalance'].label">
							<a-input
								v-model:value="formState.currentBalance"
								:placeholder="
									'请填写' + labelMap['currentBalance'].label
								"></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['expireDate'].name"
							:label="labelMap['expireDate'].label">
							<a-datap
								v-model:value="formState.expireDate"
								:placeholder="
									'请填写' + labelMap['expireDate'].label
								"></a-datap>
							<a-date-picker
								v-model:value="formState.expireDate"
								:format="dateFormatter"
								:getPopupContainer="
									(triggerNode: any) => {
										return triggerNode.parentNode;
									}
								" />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['cardStatus'].name"
							:label="labelMap['cardStatus'].label">
							<a-input
								v-model:value="formState.cardStatus"
								:placeholder="
									'请填写' + labelMap['cardStatus'].label
								"></a-input>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
	import { PrepaidCardInfoTDetail } from './prepaidCardInfoTDetailTs';
	import {
		getPrepaidCardInfoTDetail,
		addOrEditPrepaidCardInfoT,
	} from '../api/index';
	import { message, FormInstance } from 'ant-design-vue';
	import { ModelInfo } from '../prepaidCardInfoTListTs';

	const labelCol = ref({ span: 5 });
	const wrapperCol = ref({ span: 19 });

	let loading = ref<boolean>(false);

	const dateFormatter = 'YYYY-MM-DD HH:mm:ss';
	const formRef = ref<FormInstance>();

	const labelMap = ref<any>({
		cardId: { name: 'cardId', label: '卡号（业务唯一标识）' },
		cardName: { name: 'cardName', label: '卡名称' },
		userId: { name: 'userId', label: '持卡人ID' },
		initialBalance: { name: 'initialBalance', label: '初始金额' },
		currentBalance: { name: 'currentBalance', label: '当前余额' },
		expireDate: { name: 'expireDate', label: '过期日期' },
		cardStatus: { name: 'cardStatus', label: '状态（正常/冻结/挂失/过期）' },
		version: { name: 'version', label: '版本' },
	});

	const rulesRef = reactive({
		cardId: [
			{
				required: true,
				message: '卡号（业务唯一标识）不能为空！',
			},
		],
		cardName: [
			{
				required: true,
				message: '卡名称不能为空！',
			},
		],
		userId: [
			{
				required: true,
				message: '持卡人ID不能为空！',
			},
		],
		initialBalance: [
			{
				required: true,
				message: '初始金额不能为空！',
			},
		],
		currentBalance: [
			{
				required: true,
				message: '当前余额不能为空！',
			},
		],
		expireDate: [
			{
				required: true,
				message: '过期日期不能为空！',
			},
		],
		cardStatus: [
			{
				required: true,
				message: '状态（正常/冻结/挂失/过期）不能为空！',
			},
		],
		version: [
			{
				required: true,
				message: '版本不能为空！',
			},
		],
	});

	const modelConfig = {
		confirmLoading: true,
		destroyOnClose: true,
	};

	interface Props {
		open?: boolean;
		modelInfo?: ModelInfo;
	}
	const props = defineProps<Props>();

	let formState = ref<PrepaidCardInfoTDetail>({});

	const emit = defineEmits(['handleOk', 'handleCancel']);

	const handleOk = (): void => {
		loading.value = true;
		if (formRef.value) {
			formRef.value
				.validateFields()
				.then(() => savePrepaidCardInfoTManager())
				.catch(() => {
					loading.value = false;
				});
		}
	};

	const handleCancel = (): void => {
		emit('handleCancel', false);
	};

	//保存消费卡信息表信息
	const savePrepaidCardInfoTManager = (): void => {
		let method = '';
		if (formState.value.id) {
			method = 'put';
		} else {
			method = 'post';
		}
		addOrEditPrepaidCardInfoT(method, formState.value)
			.then((res) => {
				if (res.code == '200') {
					message.success((res && res.message) || '保存成功！');
					emit('handleOk', false);
				} else {
					message.error((res && res.message) || '保存失败！');
				}
				formState.value = {};
			})
			.catch((error: any) => {
				let data = error?.response?.data;
				if (data) {
					message.error(data?.message || '保存失败！');
				}
			})
			.finally(() => {
				loading.value = false;
			});
	};

	const onFinish = (values: any): void => {
		console.log('Success:', values);
	};

	const onFinishFailed = (errorInfo: any): void => {
		console.log('Failed:', errorInfo);
	};

	const init = (): void => {
		if (props.modelInfo) {
			if (props.modelInfo.id) {
				getPrepaidCardInfoTDetail(props.modelInfo.id)
					.then((res) => {
						if (res.code == '200') {
							formState.value = res.data;
							modelConfig.confirmLoading = false;
						} else {
							message.error((res && res.message) || '查询失败！');
						}
					})
					.catch((error: any) => {
						let data = error?.response?.data;
						if (data) {
							message.error(data?.message || '查询失败！');
						}
					});
			} else {
				modelConfig.confirmLoading = false;
				formState.value = {};
			}
		}
	};

	watch(
		() => props.open,
		(newVal) => {
			if (newVal) {
				init();
			}
		},
		{
			immediate: true,
			deep: true,
		},
	);

	defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
