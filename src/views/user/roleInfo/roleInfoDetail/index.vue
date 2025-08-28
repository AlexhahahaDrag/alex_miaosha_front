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
			@cancel="handleCancel"
		>
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
				name="RoleInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
				:rules="rulesRef"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['roleCode'].name"
							:label="labelMap['roleCode'].label"
						>
							<a-input
								v-model:value="formState.roleCode"
								:placeholder="'请填写' + labelMap['roleCode'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['roleName'].name"
							:label="labelMap['roleName'].label"
						>
							<a-input
								v-model:value="formState.roleName"
								:placeholder="'请填写' + labelMap['roleName'].label"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['summary'].name"
							:label="labelMap['summary'].label"
						>
							<a-input
								v-model:value="formState.summary"
								:placeholder="'请填写' + labelMap['summary'].label"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-select
								ref="select"
								v-model:value="formState.status"
								:placeholder="'请输入' + labelMap['status'].label"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								:allowClear="true"
							>
							</a-select>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
			<div>菜单权限</div>
			<div>
				<menu-tree
					:treeData="permissionTree"
					:selectedKeys="selectPermission"
				></menu-tree>
			</div>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { RoleInfoDetail } from './roleInfoDetailTs';
import {
	getRoleInfoDetail,
	addOrEditRoleInfo,
} from '@/api/user/roleInfo/roleInfoTs';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { DictInfo } from '@/views/finance/dict/dict';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { ModelInfo } from '@/views/common/config/index';
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
	roleCode: { name: 'roleCode', label: '角色编码' },
	roleName: { name: 'roleName', label: '角色名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
});

const rulesRef = reactive({
	roleCode: [
		{
			required: true,
			message: '角色编码不能为空！',
		},
	],
	roleName: [
		{
			required: true,
			message: '角色名称不能为空！',
		},
	],
	summary: [
		{
			required: true,
			message: '描述不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
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

let formState = ref<RoleInfoDetail>({});

let statusList = ref<DictInfo[]>([]);

const permissionTree = ref<any[]>([]);

const selectPermission = ref<string[]>([]);

const getDictInfoList = () => {
	getDictList('is_valid').then((res) => {
		if (res.code == '200') {
			statusList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveRoleInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存角色信息表信息
function saveRoleInfoManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditRoleInfo(method, formState.value)
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
}

const onFinish = (values: any) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};

function init() {
	getDictInfoList();
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			getRoleInfoDetail(props.modelInfo.id)
				.then((res) => {
					if (res.code == '200') {
						formState.value = res.data;
						permissionTree.value = res?.data?.permissionList || [];
						selectPermission.value = res?.data?.rolePermissionInfoVoList?.map(
							(item: any) => item.id,
						);
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
}

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
