<template>
	<div>
		<base-rbac-drawer
			:open="!!modelInfo.open"
			:width="modelInfo?.width || 640"
			:title="modelInfo?.title || '机构信息'"
			:subtitle="subtitle"
			:summary-items="summaryItems"
			:loading="loading"
			:destroy-on-close="true"
			@update:open="(open) => (modelInfo.open = open)"
			@save="handleOk"
			@cancel="handleCancel"
		>
			<a-form
				ref="formRef"
				name="OrgInfoForm"
				class="ant-advanced-search-form mt-2"
				:model="formState"
				:rules="isReadonly ? {} : rulesRef"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
			>
				<a-row :gutter="20">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgName'].name"
							:label="labelMap['orgName'].label"
						>
							<a-input
								v-model:value="formState.orgName"
								:disabled="isReadonly"
								placeholder="请输入机构名称"
								class="rounded-lg"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgCode'].name"
							:label="labelMap['orgCode'].label"
						>
							<a-input
								v-model:value="formState.orgCode"
								:disabled="isReadonly"
								placeholder="请输入机构编码"
								class="rounded-lg font-mono"
							></a-input>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="20">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['orgShortName'].name"
							:label="labelMap['orgShortName'].label"
						>
							<a-input
								v-model:value="formState.orgShortName"
								:disabled="isReadonly"
								placeholder="请输入机构简称"
								class="rounded-lg"
							></a-input>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							:name="labelMap['parentId'].name"
							:label="labelMap['parentId'].label"
							extra="留空则作为顶级根机构创建"
						>
							<a-tree-select
								v-model:value="formState.parentId"
								:tree-data="selectableTreeData"
								:disabled="isReadonly"
								placeholder="请选择父级机构"
								:field-names="{
									children: 'children',
									label: 'orgName',
									value: 'id',
								}"
								tree-default-expand-all
								allow-clear
								show-search
								tree-node-filter-prop="orgName"
								class="rounded-lg"
							>
							</a-tree-select>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="20">
					<a-col :span="12">
						<a-form-item
							:name="labelMap['status'].name"
							:label="labelMap['status'].label"
						>
							<a-radio-group
								v-model:value="formState.status"
								:disabled="isReadonly"
								button-style="solid"
							>
								<a-radio-button
									v-for="item in statusList"
									:key="item.typeCode"
									:value="item.typeCode"
								>
									{{ item.typeName }}
								</a-radio-button>
							</a-radio-group>
						</a-form-item>
					</a-col>
				</a-row>

				<a-row :gutter="20">
					<a-col :span="24">
						<a-form-item
							:name="labelMap['summary'].name"
							:label="labelMap['summary'].label"
							:label-col="{ span: 3 }"
							:wrapper-col="{ span: 21 }"
						>
							<a-textarea
								v-model:value="formState.summary"
								:disabled="isReadonly"
								placeholder="请输入机构简介或职责描述..."
								:rows="3"
								:maxlength="150"
								show-count
								class="rounded-lg"
							></a-textarea>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>

			<!-- 只读模式自定义 Footer -->
			<template v-if="isReadonly" #footer>
				<div class="flex justify-end">
					<a-button @click="handleCancel">关闭</a-button>
				</div>
			</template>
		</base-rbac-drawer>
	</div>
</template>
<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { RbacSummaryItem } from '@/components/rbac/types';
import { labelMap, rulesRef } from '@/views/user/orgInfo/config';
import {
	getOrgInfoDetail,
	getOrgInfoTree,
	addOrgInfo,
	editOrgInfo,
} from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { TreeDataItem } from 'ant-design-vue/es/tree';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const loading = ref<boolean>(false);
const rawTreeData = ref<TreeDataItem[]>([]);
const formRef = ref<FormInstance>();

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const subtitle = computed(() => {
	if (formState.value.orgCode) {
		return `编码: ${formState.value.orgCode}`;
	}
	return isReadonly.value ? '机构详情' : undefined;
});

const summaryItems = computed<RbacSummaryItem[]>(() => {
	if (!formState.value.id) return [];
	const items: RbacSummaryItem[] = [];
	if (formState.value.createTime) {
		items.push({ label: '创建时间', value: formState.value.createTime });
	}
	if (formState.value.updateTime) {
		items.push({ label: '更新时间', value: formState.value.updateTime });
	}
	return items;
});

// 编辑节点时，前端递归禁用自身及其子孙节点，杜绝成环与自选
const disableSelfAndDescendants = (
	nodes: TreeDataItem[],
	targetId?: string,
	ancestorDisabled: boolean = false,
): TreeDataItem[] => {
	return nodes.map((node) => {
		const isSelf = Boolean(targetId && String(node.id) === String(targetId));
		const disabled = Boolean(ancestorDisabled || isSelf || node.disabled);
		return {
			...node,
			disabled,
			children:
				node.children?.length ?
					disableSelfAndDescendants(node.children, targetId, disabled)
				:	undefined,
		};
	});
};

const selectableTreeData = computed(() => {
	if (!modelInfo.value?.id) {
		return rawTreeData.value;
	}
	return disableSelfAndDescendants(rawTreeData.value, String(modelInfo.value.id));
});

const formState = ref<OrgInfoData>({});

const handleOk = () => {
	if (isReadonly.value) {
		handleCancel();
		return;
	}
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => saveOrgInfoManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

// 保存机构表信息
const saveOrgInfoManager = async () => {
	try {
		const api = formState.value.id ? editOrgInfo : addOrgInfo;
		const payload: OrgInfoData = {
			...formState.value,
			parentId: formState.value.parentId ? String(formState.value.parentId) : undefined,
		};
		const { code, message: messageInfo } = await api(payload);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			formState.value = {};
			modelInfo.value.open = false;
			emit('success');
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = async () => {
	loading.value = true;
	formState.value = modelInfo.value?.id ? {} : { status: '1' };
	try {
		// 1. 公共组织机构树：统一先行加载并赋值
		const { code: treeCode, data: treeDataList } = (await getOrgInfoTree()) || {};
		if (treeCode === '200') {
			rawTreeData.value = (treeDataList || []) as TreeDataItem[];
		}

		// 2. 仅编辑模式按需拉取详情
		if (modelInfo.value?.id) {
			const { code: detailCode, data: detailData, message: detailMsg } =
				(await getOrgInfoDetail(modelInfo.value.id)) || {};
			if (detailCode === '200') {
				formState.value = detailData || {};
			} else if (detailCode) {
				message.error(detailMsg || '查询失败！');
			}
		}
	} catch {
		message.error('加载失败，请重试');
	} finally {
		loading.value = false;
		nextTick(() => {
			formRef.value?.clearValidate();
		});
	}
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
	},
);

const emit = defineEmits(['success']);
</script>
