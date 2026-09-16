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
				<a-row :gutter="24">
					<a-col :span="24">
						<a-form-item
							:name="labelMap['orgIds'].name"
							:label="labelMap['orgIds'].label"
						>
							<a-select
								v-model:value="formState.orgIds"
								mode="multiple"
								:options="orgOptions"
								:field-names="{ label: 'orgName', value: 'id' }"
								:placeholder="'请选择' + labelMap['orgIds'].label"
								allow-clear
								data-testid="rbac-role-org-select"
							/>
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
	assignRolePermissions,
	assignRoleOrgs,
} from '@/views/user/roleInfo/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getPermissionInfoList } from '@/views/user/permissionInfo/api';

const { getDictByType } = useDictInfo('is_valid');

const loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

const formState = ref<RoleInfoData>({ orgIds: [] });

const initialOrgIds = ref<string[]>([]);

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const orgOptions = ref<OrgInfoData[]>([]);

const permissionTree = ref<unknown[]>([]);

const selectPermission = ref<string[]>([]);

const normalizeOrgIds = (ids?: (string | number)[] | null): string[] =>
	(ids || []).map((id) => String(id)).filter(Boolean);

const orgIdsChanged = (next: string[], prev: string[]) => {
	if (next.length !== prev.length) {
		return true;
	}
	const prevSet = new Set(prev);
	return next.some((id) => !prevSet.has(id));
};

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

// 主数据与权限两阶段保存：先 add/edit 角色，再 assign-permissions；编辑时机构变更再 assign-orgs
const saveRoleInfoManager = async () => {
	const payload = { ...formState.value };
	delete (payload as { permissionList?: unknown }).permissionList;
	payload.orgIds = normalizeOrgIds(payload.orgIds);

	const isEdit = !!payload.id;
	let roleId = '';

	if (isEdit) {
		const { code, message: messageInfo } = await editRoleInfo(payload);
		if (code !== '200') {
			loading.value = false;
			message.error(messageInfo || '保存失败！');
			return;
		}
		roleId = String(payload.id);
	} else {
		// 新增：orgIds 随 RoleInfoVo 一并提交，后端可直接绑定
		const { code, data, message: messageInfo } = await addRoleInfo(payload);
		if (code !== '200') {
			loading.value = false;
			message.error(messageInfo || '保存失败！');
			return;
		}
		roleId = data != null ? String(data) : '';
	}

	if (!roleId) {
		loading.value = false;
		message.error('角色已保存，但无法获取角色 ID，请稍后在授权中配置权限');
		modelInfo.value.open = false;
		emit('success');
		return;
	}

	if (isEdit && orgIdsChanged(payload.orgIds || [], initialOrgIds.value)) {
		const {
			code: orgCode,
			message: orgMessage,
		} = await assignRoleOrgs(roleId, payload.orgIds || []);
		if (orgCode !== '200') {
			loading.value = false;
			message.error(orgMessage || '角色已保存，机构绑定失败');
			return;
		}
	}

	const permissionIds = selectPermission.value.map((id) => String(id));
	const {
		code: assignCode,
		message: assignMessage,
	} = await assignRolePermissions(roleId, permissionIds).finally(() => {
		loading.value = false;
	});
	if (assignCode === '200') {
		message.success(assignMessage || '保存成功！');
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(assignMessage || '角色已保存，权限分配失败');
	}
};

const loadOrgOptions = async () => {
	const { code, data, message: messageInfo } = await getOrgInfoPage(
		{ status: '1' },
		1,
		1000,
	);
	if (code === '200') {
		orgOptions.value = (data?.records || []).map((item) => ({
			...item,
			id: item.id != null ? String(item.id) : item.id,
		}));
	} else {
		message.error(messageInfo || '获取机构列表失败！');
	}
};

const init = async () => {
	permissionTree.value = [];
	selectPermission.value = [];
	formState.value = { orgIds: [] };
	initialOrgIds.value = [];
	modelConfig.confirmLoading = true;

	await loadOrgOptions();

	const roleId = modelInfo.value?.id;
	if (roleId) {
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoDetail(String(roleId));
		if (code === '200') {
			const detail = data || {};
			const orgIds = normalizeOrgIds(detail.orgIds);
			formState.value = { ...detail, orgIds };
			initialOrgIds.value = [...orgIds];
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
		// 新增：拉全量权限树（与角色详情 permissionList 同源结构）
		const {
			code,
			data,
			message: messageInfo,
		} = await getPermissionInfoList();
		if (code === '200') {
			permissionTree.value = (data as unknown[]) || [];
		} else {
			message.error(messageInfo || '获取权限树失败！');
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
