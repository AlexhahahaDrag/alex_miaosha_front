<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '1000px'"
			:title="modelInfo?.title || 'Basic Modal'"
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
				>
					保存
				</a-button>
			</template>
			<a-form
				ref="formRef"
				name="RoleInfoForm"
				class="ant-advanced-search-form"
				:model="formState"
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
								:placeholder="'请选择' + labelMap['status'].label"
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
					v-model:selectedKeys="selectPermission"
				></menu-tree>
			</div>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { RoleInfoData } from '../config';
import {
	labelMap,
	rulesRef,
	labelCol,
	wrapperCol,
} from '@/views/user/roleInfo/config';
import {
	getRoleInfoDetail,
	addRoleInfo,
	editRoleInfo,
} from '@/views/user/roleInfo/api';

const { getDictByType } = useDictInfo('is_valid');

const loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

const formState = ref<RoleInfoData>({});

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const permissionTree = ref<unknown[]>([]);

const selectPermission = ref<string[]>([]);

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
	modelInfo.value.open = false;
};

const saveRoleInfoManager = async () => {
	let api = addRoleInfo;
	if (formState.value.id) {
		api = editRoleInfo;
	}
	formState.value.permissionList = selectPermission.value.map((id) => ({
		id: Number(id),
	}));
	const { code, message: messageInfo } = await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	);
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const init = async () => {
	permissionTree.value = [];
	selectPermission.value = [];
	formState.value = {};
	modelConfig.confirmLoading = true;

	const roleId = modelInfo.value?.id;
	// 无论新增还是修改，都尝试获取权限树（如果是新增，可以传一个特定的标志位或复用一个已知角色的列表获取）
	// 这里逻辑与 AuthorizationDetail 保持一致，优先保证修改模式正常，新增模式下若后端支持则加载
	if (roleId) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoDetail(roleId);
		if (code === '200') {
			formState.value = data || {};
			permissionTree.value =
				(data as { permissionList?: unknown[] })?.permissionList || [];
			selectPermission.value =
				(
					data as { rolePermissionInfoVoList?: { id: string | number }[] }
				)?.rolePermissionInfoVoList?.map((item) => String(item.id)) || [];
		} else {
			message.error(messageInfo || '查询失败！');
		}
	} else {
		// 新增模式：尝试获取权限列表（这里可以调用一个默认 ID 或专门的接口）
		const { code, data } = await getRoleInfoDetail('1').catch(() => ({
			code: '500',
			data: null,
		}));
		if (code === '200') {
			permissionTree.value =
				(data as { permissionList?: unknown[] })?.permissionList || [];
		}
	}
	modelConfig.confirmLoading = false;
};

watch(
	() => modelInfo.value.open,
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

const emit = defineEmits(['success']);
</script>
<style lang="scss" scoped></style>
