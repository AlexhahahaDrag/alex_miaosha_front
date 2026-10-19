<template>
	<div>
		<base-rbac-drawer
			:open="!!modelInfo.open"
			:width="modelInfo?.width || 620"
			:title="modelInfo?.title || '机构信息'"
			:subtitle="subtitle"
			:summary-items="summaryItems"
			:loading="loading"
			:destroy-on-close="true"
			@update:open="(open) => (modelInfo.open = open)"
			@save="handleOk"
			@cancel="handleCancel"
		>
			<!-- 1. 只读模式：卡片式结构化阅读视图 (Read/Write Separation) -->
			<div v-if="isReadonly" class="org-detail-readonly space-y-4">
				<!-- Hero 机构概览卡片 -->
				<div
					class="flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
				>
					<div
						class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/70 flex items-center justify-center text-xl shrink-0"
					>
						<ApartmentOutlined />
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2 flex-wrap">
							<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
								{{ formState.orgName || '-' }}
							</h3>
							<span
								v-if="formState.orgShortName"
								class="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
							>
								简称: {{ formState.orgShortName }}
							</span>
							<span
								v-if="String(formState.status) === '1'"
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
								有效
							</span>
							<span
								v-else
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
								失效
							</span>
						</div>
						<div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
							<span class="inline-flex items-center gap-1 font-mono text-blue-600 dark:text-blue-400">
								编码: {{ formState.orgCode || '-' }}
							</span>
						</div>
					</div>
				</div>

				<!-- 组织拓扑与层级信息卡片 -->
				<div
					class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
				>
					<div
						class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
					>
						<BranchesOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
						<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
							组织架构与层级归属
						</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div class="flex flex-col gap-1">
							<span class="text-slate-400">上级机构</span>
							<div class="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100">
								<BankOutlined class="text-slate-400" />
								<span>{{ resolvedParentOrgName }}</span>
							</div>
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-slate-400">机构编码</span>
							<span class="font-mono font-medium text-blue-600 dark:text-blue-400">
								{{ formState.orgCode || '-' }}
							</span>
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-slate-400">机构简称</span>
							<span class="font-medium text-slate-700 dark:text-slate-200">
								{{ formState.orgShortName || '-' }}
							</span>
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-slate-400">机构状态</span>
							<span class="font-medium text-slate-700 dark:text-slate-200">
								{{ String(formState.status) === '1' ? '启用 (有效)' : '禁用 (失效)' }}
							</span>
						</div>
					</div>
				</div>

				<!-- 机构职责简介卡片 -->
				<div
					class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs"
				>
					<div
						class="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800"
					>
						<FileTextOutlined class="text-indigo-600 dark:text-indigo-400 text-sm" />
						<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
							机构职责与简介
						</span>
					</div>
					<p
						v-if="formState.summary"
						class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0 whitespace-pre-wrap"
					>
						{{ formState.summary }}
					</p>
					<p v-else class="text-xs text-slate-400 italic m-0">
						暂无机构职责或简介说明
					</p>
				</div>
			</div>

			<!-- 2. 编辑/新增模式：标准化 A11y 垂直表单 -->
			<a-form
				v-else
				ref="formRef"
				name="OrgInfoForm"
				layout="vertical"
				class="space-y-5"
				:model="formState"
				:rules="rulesRef"
			>
				<section>
					<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
						<span class="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
						<span>机构基础标识与拓扑层级</span>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
						<a-form-item
							:name="labelMap['orgName'].name"
							:label="labelMap['orgName'].label"
							class="mb-3.5"
						>
							<a-input
								id="form_orgName"
								v-model:value="formState.orgName"
								name="orgName"
								placeholder="请输入机构名称"
								allow-clear
								class="rounded-lg"
							/>
						</a-form-item>

						<a-form-item
							:name="labelMap['orgCode'].name"
							:label="labelMap['orgCode'].label"
							class="mb-3.5"
						>
							<a-input
								id="form_orgCode"
								v-model:value="formState.orgCode"
								name="orgCode"
								placeholder="请输入机构编码"
								allow-clear
								class="rounded-lg font-mono"
							/>
						</a-form-item>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
						<a-form-item
							:name="labelMap['orgShortName'].name"
							:label="labelMap['orgShortName'].label"
							class="mb-3.5"
						>
							<a-input
								id="form_orgShortName"
								v-model:value="formState.orgShortName"
								name="orgShortName"
								placeholder="请输入机构简称"
								allow-clear
								class="rounded-lg"
							/>
						</a-form-item>

						<a-form-item
							:name="labelMap['parentId'].name"
							:label="labelMap['parentId'].label"
							extra="留空则作为顶级根机构创建"
							class="mb-0"
						>
							<a-tree-select
								id="form_parentId"
								v-model:value="formState.parentId"
								:tree-data="selectableTreeData"
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
								class="rounded-lg w-full"
							/>
						</a-form-item>
					</div>
				</section>

				<div class="border-t border-slate-200/80 dark:border-slate-800"></div>

				<section>
					<div class="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
						<span class="w-1.5 h-3.5 bg-indigo-600 rounded-full"></span>
						<span>状态与职责说明</span>
					</div>

					<a-form-item
						:name="labelMap['status'].name"
						:label="labelMap['status'].label"
						class="mb-3.5"
					>
						<a-radio-group
							id="form_status"
							v-model:value="formState.status"
							name="status"
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

					<a-form-item
						:name="labelMap['summary'].name"
						:label="labelMap['summary'].label"
						class="mb-0"
					>
						<a-textarea
							id="form_summary"
							v-model:value="formState.summary"
							name="summary"
							placeholder="请输入机构简介或职责描述..."
							:rows="3"
							:maxlength="150"
							show-count
							class="rounded-lg"
						/>
					</a-form-item>
				</section>
			</a-form>

			<!-- 只读模式自定义 Footer -->
			<template v-if="isReadonly" #footer>
				<div class="flex justify-end">
					<a-button type="primary" class="px-5 shadow-xs" @click="handleCancel">
						关闭
					</a-button>
				</div>
			</template>
		</base-rbac-drawer>
	</div>
</template>
<script lang="ts" setup>
import {
	ApartmentOutlined,
	BranchesOutlined,
	BankOutlined,
	FileTextOutlined,
} from '@ant-design/icons-vue';
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

const statusList = computed(() => {
	const dict = getDictByType('is_valid');
	if (Array.isArray(dict) && dict.length > 0) {
		return dict;
	}
	return [
		{ typeCode: '1', typeName: '有效' },
		{ typeCode: '0', typeName: '失效' },
	];
});

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
	return isReadonly.value ? '只读浏览模式' : undefined;
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

const findOrgNameInTree = (
	nodes: TreeDataItem[],
	targetId?: string,
): string | undefined => {
	if (!targetId) return undefined;
	for (const node of nodes) {
		if (String(node.id) === String(targetId)) {
			return (node as OrgInfoData).orgName;
		}
		if (node.children?.length) {
			const found = findOrgNameInTree(node.children, targetId);
			if (found) return found;
		}
	}
	return undefined;
};

const resolvedParentOrgName = computed(() => {
	if (formState.value.parentOrgName) {
		return formState.value.parentOrgName;
	}
	if (!formState.value.parentId || String(formState.value.parentId) === '0') {
		return '顶级根机构';
	}
	return (
		findOrgNameInTree(rawTreeData.value, String(formState.value.parentId)) ||
		'顶级根机构'
	);
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
		const { code: treeCode, data: treeDataList } = await getOrgInfoTree();
		if (treeCode === '200') {
			rawTreeData.value = (treeDataList || []) as TreeDataItem[];
		}

		if (modelInfo.value?.id) {
			const {
				code: detailCode,
				data: detailData,
				message: detailMsg,
			} = await getOrgInfoDetail(String(modelInfo.value.id));
			if (detailCode === '200') {
				formState.value = {
					...(detailData || {}),
					id: detailData?.id != null ? String(detailData.id) : undefined,
					parentId:
						detailData?.parentId != null ? String(detailData.parentId) : undefined,
					status:
						detailData?.status != null ? String(detailData.status) : '1',
				};
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
