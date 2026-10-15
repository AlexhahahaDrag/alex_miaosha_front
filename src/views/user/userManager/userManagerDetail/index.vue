<template>
	<BaseRbacDrawer
		:open="Boolean(modelInfo.open)"
		:width="modelInfo?.width || 720"
		:title="modelInfo?.title || '用户明细'"
		subtitle="用户基础信息、组织与角色绑定"
		:summary-items="summaryItems"
		:loading="drawerLoading"
		:error-text="errorText"
		destroy-on-close
		@save="handleOk"
		@cancel="handleCancel"
		@update:open="handleOpenChange"
	>
		<template v-if="isReadonly" #footer>
			<div class="flex justify-end gap-2">
				<a-button type="primary" class="px-5 shadow-xs" @click="handleCancel">
					关闭
				</a-button>
			</div>
		</template>

		<!-- 1. 只读模式：卡片式结构化详情 (Taste & Ergonomics) -->
		<div v-if="isReadonly" class="user-detail-readonly space-y-4">
			<!-- 顶部个人资料 Hero Profile Card -->
			<div
				class="hero-profile-card flex items-center gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800/40 shadow-xs"
			>
				<div class="relative shrink-0">
					<a-avatar
						:size="64"
						:src="formState.avatarThumbnailUrl || formState.avatarUrl"
						class="border-2 border-white dark:border-slate-800 shadow-sm"
					>
						<template #icon><UserOutlined /></template>
					</a-avatar>
					<span
						class="status-indicator-dot absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900"
						:class="formState.status === '1' ? 'bg-emerald-500' : 'bg-slate-400'"
					/>
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<h3 class="text-base font-bold text-slate-900 dark:text-slate-100 m-0 truncate">
							{{ formState.nickName || formState.username || '-' }}
						</h3>
						<span
							v-if="formState.gender"
							class="text-xs px-2 py-0.5 rounded-full font-medium"
							:class="
								formState.gender === '1'
									? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
									: formState.gender === '2'
										? 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400'
										: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
							"
						>
							{{ genderName }}
						</span>
						<a-tag
							:color="formState.status === '1' ? 'success' : 'default'"
							class="rounded-full px-2 text-xs border-0"
						>
							{{ formState.status === '1' ? '正常在职' : '已停用/待确认' }}
						</a-tag>
					</div>
					<div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
						<span class="inline-flex items-center gap-1 font-mono">
							<span class="text-slate-400">@</span>{{ formState.username || '-' }}
						</span>
						<span v-if="formState.occupation" class="inline-flex items-center gap-1">
							<IdcardOutlined class="text-slate-400" />
							{{ formState.occupation }}
						</span>
						<span v-if="formState.birthday" class="inline-flex items-center gap-1 font-mono">
							<CalendarOutlined class="text-slate-400" />
							{{ displayBirthday }}
						</span>
					</div>
				</div>
			</div>

			<!-- 组织与权限卡片 (Organization & Roles Card) -->
			<div class="detail-section-card p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
				<div class="section-card-header flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
					<SafetyCertificateOutlined class="text-blue-600 dark:text-blue-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">组织归属与角色配置</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">所属主机构</span>
						<div class="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
							<BankOutlined class="text-slate-400" />
							<span>{{ currentOrgName }}</span>
						</div>
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-slate-400">兼任机构</span>
						<div class="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
							<TeamOutlined class="text-slate-400" />
							<span>{{ displayAuxiliaryOrgs }}</span>
						</div>
					</div>
					<div class="flex flex-col gap-1.5 col-span-1 md:col-span-2">
						<span class="text-slate-400">角色分配 ({{ resolvedRoles.length }})</span>
						<div v-if="resolvedRoles.length > 0" class="flex flex-wrap gap-1.5 items-center">
							<span
								v-for="role in resolvedRoles"
								:key="role.id"
								class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border"
								:class="getRoleBadgeClass(role.name)"
							>
								<SafetyCertificateOutlined class="text-xs opacity-70" />
								<span>{{ role.name }}</span>
							</span>
						</div>
						<span v-else class="text-slate-400 italic">暂未分配任何业务角色</span>
					</div>
				</div>
			</div>

			<!-- 联系与通讯卡片 (Contact Info Card) -->
			<div class="detail-section-card p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
				<div class="section-card-header flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
					<PhoneOutlined class="text-emerald-600 dark:text-emerald-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">联系方式与社交账号</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
					<div class="flex items-center gap-2.5">
						<div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
							<MobileOutlined class="text-slate-500" />
						</div>
						<div class="flex flex-col">
							<span class="text-slate-400 text-[11px]">手机电话</span>
							<span class="font-medium font-mono text-slate-700 dark:text-slate-200">{{ formState.mobile || '-' }}</span>
						</div>
					</div>
					<div class="flex items-center gap-2.5">
						<div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
							<MailOutlined class="text-slate-500" />
						</div>
						<div class="flex flex-col">
							<span class="text-slate-400 text-[11px]">电子邮箱</span>
							<span class="font-medium text-slate-700 dark:text-slate-200">{{ formState.email || '-' }}</span>
						</div>
					</div>
					<div class="flex items-center gap-2.5">
						<div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
							<WechatOutlined class="text-emerald-500" />
						</div>
						<div class="flex flex-col">
							<span class="text-slate-400 text-[11px]">微信号</span>
							<span class="font-medium text-slate-700 dark:text-slate-200">{{ formState.weChat || '-' }}</span>
						</div>
					</div>
					<div class="flex items-center gap-2.5">
						<div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
							<QqOutlined class="text-blue-500" />
						</div>
						<div class="flex flex-col">
							<span class="text-slate-400 text-[11px]">QQ号</span>
							<span class="font-medium font-mono text-slate-700 dark:text-slate-200">{{ formState.qqNumber || '-' }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 个人简介卡片 -->
			<div class="detail-section-card p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
				<div class="section-card-header flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
					<ProfileOutlined class="text-amber-600 dark:text-amber-400 text-sm" />
					<span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">个人简介</span>
				</div>
				<p
					class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap m-0"
					:class="!formState.summary ? 'italic text-slate-400' : ''"
				>
					{{ formState.summary || '暂无个人简介描述...' }}
				</p>
			</div>
		</div>

		<!-- 2. 编辑/新增模式：可编辑表单（带完整 A11y input id/name） -->
		<a-form
			v-else
			ref="formRef"
			name="userForm"
			class="user-detail-form"
			:rules="rulesRef"
			:model="formState"
			layout="vertical"
		>
			<!-- 核心身份行：头像上传置于左侧，用户名/昵称/性别置于右侧 (Ponytail 最短路径: 提升至首屏视觉锚点并节省高度) -->
			<div class="user-edit-header-row flex flex-col sm:flex-row gap-5 mb-4 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
				<div class="avatar-edit-box shrink-0 flex flex-col items-center">
					<a-form-item name="avatar" label="头像" class="!mb-0">
						<my-upload
							:fromSystem="fromSystem"
							:fileInfo="fileInfo"
							:disabled="isReadonly"
							@customImageRequest="customImageRequest"
						/>
					</a-form-item>
				</div>
				<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
					<a-form-item name="username" label="用户名" class="!mb-2">
						<a-input
							id="form_username"
							name="username"
							v-model:value="formState.username"
							placeholder="请填写用户名"
						/>
					</a-form-item>
					<a-form-item name="gender" label="性别" class="!mb-2">
						<a-radio-group
							id="form_gender"
							name="gender"
							v-model:value="formState.gender"
							button-style="solid"
							class="w-full"
						>
							<a-radio-button
								v-for="item in genderList"
								:key="item.typeCode"
								:value="item.typeCode"
							>
								{{ item.typeName }}
							</a-radio-button>
						</a-radio-group>
					</a-form-item>
					<a-form-item name="nickName" label="昵称" class="!mb-0 sm:col-span-2">
						<a-input
							id="form_nickName"
							name="nickName"
							v-model:value="formState.nickName"
							placeholder="请填写昵称"
						/>
					</a-form-item>
				</div>
			</div>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="weChat" label="微信号">
						<a-input
							id="form_weChat"
							name="weChat"
							v-model:value="formState.weChat"
							placeholder="请填写微信号"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="qqNumber" label="QQ号">
						<a-input
							id="form_qqNumber"
							name="qqNumber"
							v-model:value="formState.qqNumber"
							placeholder="请填写QQ号"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="occupation" label="职业">
						<a-input
							id="form_occupation"
							name="occupation"
							v-model:value="formState.occupation"
							placeholder="请填写职业"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="birthday" label="生日">
						<a-date-picker
							id="form_birthday"
							name="birthday"
							v-model:value="formState.birthday"
							:format="defaultDateFormat"
							:get-popup-container="
								(triggerNode: HTMLElement) =>
									triggerNode.parentNode as HTMLElement
							"
							style="width: 100%"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="mobile" label="电话号码">
						<a-input
							id="form_mobile"
							name="mobile"
							v-model:value="formState.mobile"
							placeholder="请填写电话号码"
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item name="email" label="邮箱">
						<a-input
							id="form_email"
							name="email"
							v-model:value="formState.email"
							placeholder="请填写邮箱"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="12">
					<a-form-item name="status" label="状态">
						<a-select
							id="form_status"
							v-model:value="formState.status"
							placeholder="请选择有效状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="validList"
							allow-clear
						/>
					</a-form-item>
				</a-col>
				<a-col :span="12">
					<a-form-item
						name="orgId"
						label="所属主机构"
						extra="主归属机构，决定默认数据权限与层级"
					>
						<a-tree-select
							id="form_orgId"
							v-model:value="formState.orgId"
							:tree-data="mainOrgTreeData"
							:field-names="{
								children: 'children',
								label: 'orgName',
								value: 'id',
							}"
							placeholder="请选择主所属机构"
							tree-default-expand-all
							allow-clear
							show-search
							tree-node-filter-prop="orgName"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item
						name="auxiliaryOrgIds"
						label="兼任机构"
						extra="选填，跨机构借调或兼任，可多选"
					>
						<a-tree-select
							id="form_auxiliaryOrgIds"
							v-model:value="formState.auxiliaryOrgIds"
							:tree-data="auxiliaryOrgTreeData"
							:field-names="{
								children: 'children',
								label: 'orgName',
								value: 'id',
							}"
							placeholder="请选择兼任机构（可多选）"
							tree-default-expand-all
							multiple
							:max-tag-count="3"
							allow-clear
							show-search
							tree-node-filter-prop="orgName"
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item name="roleIds" label="角色分配">
						<a-select
							id="form_roleIds"
							v-model:value="formState.roleIds"
							:options="roleOptions"
							:field-names="{ label: 'roleName', value: 'id' }"
							mode="multiple"
							placeholder="请选择角色"
							allow-clear
						/>
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="16">
				<a-col :span="24">
					<a-form-item name="summary" label="个人简介">
						<a-textarea
							id="form_summary"
							name="summary"
							v-model:value="formState.summary"
							placeholder="请添加个人简介"
							:auto-size="{ minRows: 2, maxRows: 5 }"
							:maxlength="500"
							show-count
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</BaseRbacDrawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	UserOutlined,
	SafetyCertificateOutlined,
	BankOutlined,
	TeamOutlined,
	PhoneOutlined,
	MobileOutlined,
	MailOutlined,
	WechatOutlined,
	QqOutlined,
	ProfileOutlined,
	IdcardOutlined,
	CalendarOutlined,
} from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import type { RbacSummaryItem } from '@/components/rbac/types';
import { useDictInfo } from '@/composables/useDictInfo';
import { defaultDateFormat, formatDate, formatDayjs } from '@/utils/dayjs';
import type { FileInfo } from '@/components/my-upload/config';
import type { ModelInfo } from '@/types/modal';
import { getOrgInfoTree } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getRoleInfoPage } from '@/views/user/roleInfo/api';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import {
	addUserManager,
	editUserManager,
	getUserManagerDetail,
} from '@/views/user/userManager/api';
import { rulesRef } from '@/views/user/userManager/config';
import type { UserManagerInfo } from '@/views/user/userManager/config';

const modelInfo = defineModel<ModelInfo>('modelInfo', {
	default: () => ({}),
});

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const { getDictByType } = useDictInfo('gender,is_valid');

const loading = ref<boolean>(false);
const pageLoading = ref<boolean>(false);
const errorText = ref('');
const formState = ref<UserManagerInfo>({});
const formRef = ref<FormInstance>();
const genderList = computed(() => getDictByType('gender'));
const validList = computed(() => getDictByType('is_valid'));
const orgTreeList = ref<OrgInfoData[]>([]);
const roleOptions = ref<RoleInfoData[]>([]);
const fileInfo = ref<FileInfo>({});
const fromSystem = ref('user');
const drawerLoading = computed(() => loading.value || pageLoading.value);

// 递归标准化机构树节点（同时注入 id/value 与 label/title/orgName，保证各种模式下的名称回显）
const normalizeTreeNodes = (nodes: OrgInfoData[]): OrgInfoData[] => {
	return nodes.map((node) => {
		const idStr = String(node.id);
		const copy: OrgInfoData & { value: string; label: string; title: string } = {
			...node,
			id: idStr,
			value: idStr,
			label: node.orgName || '',
			title: node.orgName || '',
		};
		if (node.children && node.children.length > 0) {
			copy.children = normalizeTreeNodes(node.children);
		}
		return copy;
	});
};

// 递归标注禁选节点（防止主机构与兼任机构重复绑定）
const markTreeDisabled = (
	nodes: OrgInfoData[],
	disabledIds: Set<string>,
): OrgInfoData[] => {
	return nodes.map((node) => {
		const idStr = String(node.id);
		const copy: OrgInfoData & { value: string; label: string; title: string } = {
			...node,
			id: idStr,
			value: idStr,
			label: node.orgName || '',
			title: node.orgName || '',
			disabled: disabledIds.has(idStr),
		};
		if (node.children && node.children.length > 0) {
			copy.children = markTreeDisabled(node.children, disabledIds);
		}
		return copy;
	});
};

// 主机构可选树：若已被选为兼任机构，则禁用
const mainOrgTreeData = computed(() => {
	const disabledIds = new Set(
		(formState.value.auxiliaryOrgIds || []).map((id) => String(id)),
	);
	return markTreeDisabled(orgTreeList.value, disabledIds);
});

// 兼任机构可选树：若已被选为主机构，则禁用
const auxiliaryOrgTreeData = computed(() => {
	const disabledIds = new Set<string>();
	if (formState.value.orgId) {
		disabledIds.add(String(formState.value.orgId));
	}
	return markTreeDisabled(orgTreeList.value, disabledIds);
});

// 当切换主机构时，若兼任机构列表中包含了新主机构，自动移除冲突项
watch(
	() => formState.value.orgId,
	(newOrgId) => {
		if (newOrgId && formState.value.auxiliaryOrgIds?.length) {
			formState.value.auxiliaryOrgIds = formState.value.auxiliaryOrgIds.filter(
				(id) => String(id) !== String(newOrgId),
			);
		}
	},
);

// 主机构展示名称：优先用服务端返回的 orgName，若缺失则从机构树反查
const currentOrgName = computed(() => {
	if (formState.value.orgName) return formState.value.orgName;
	if (!formState.value.orgId) return '未设置主机构';
	const findName = (list: OrgInfoData[]): string | undefined => {
		for (const item of list) {
			if (String(item.id) === String(formState.value.orgId)) return item.orgName;
			if (item.children && item.children.length > 0) {
				const child = findName(item.children);
				if (child) return child;
			}
		}
	};
	return findName(orgTreeList.value) || String(formState.value.orgId);
});

// 兼任机构展示文本：递归翻译或回显
const displayAuxiliaryOrgs = computed(() => {
	if (formState.value.auxiliaryOrgNames) return formState.value.auxiliaryOrgNames;
	const ids = formState.value.auxiliaryOrgIds || [];
	if (ids.length === 0) return '无兼任机构';
	const names: string[] = [];
	const findName = (list: OrgInfoData[], targetId: string): string | undefined => {
		for (const item of list) {
			if (String(item.id) === targetId) return item.orgName;
			if (item.children && item.children.length > 0) {
				const child = findName(item.children, targetId);
				if (child) return child;
			}
		}
	};
	for (const id of ids) {
		const matched = findName(orgTreeList.value, String(id));
		names.push(matched || String(id));
	}
	return names.join('、 ');
});

// 性别展示文本
const genderName = computed(() => {
	const code = formState.value.gender;
	if (!code) return '保密';
	const matched = genderList.value?.find((item) => String(item.typeCode) === String(code));
	return matched?.typeName || (code === '1' ? '男' : code === '2' ? '女' : '未知');
});

// 生日安全格式化文本
const displayBirthday = computed(() => {
	if (!formState.value.birthday) return '';
	return formatDate(formState.value.birthday);
});

// 解析角色名称（杜绝雪花 ID 裸露）
const resolvedRoles = computed(() => {
	const result: Array<{ id: string; name: string }> = [];
	const idSet = new Set<string>();

	// 1. 优先尝试从 roleInfoVoList 收集
	if (formState.value.roleInfoVoList && formState.value.roleInfoVoList.length > 0) {
		for (const r of formState.value.roleInfoVoList) {
			const idStr = String(r.id || '');
			if (idStr && !idSet.has(idStr)) {
				idSet.add(idStr);
				result.push({
					id: idStr,
					name: r.roleName || idStr,
				});
			}
		}
	}

	// 2. 从 formState.roleIds 结合 roleOptions 字典匹配
	const roleIds = formState.value.roleIds || [];
	for (const roleId of roleIds) {
		const idStr = String(roleId);
		if (!idSet.has(idStr)) {
			idSet.add(idStr);
			const matched = roleOptions.value.find((opt) => String(opt.id) === idStr);
			result.push({
				id: idStr,
				name: matched?.roleName || idStr,
			});
		}
	}

	return result;
});

// 角色语义色彩徽章
const getRoleBadgeClass = (roleName: string) => {
	if (!roleName) return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
	if (roleName.includes('超') || roleName.includes('Admin') || roleName.includes('管理')) {
		return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
	}
	if (roleName.includes('财务') || roleName.includes('礼尚') || roleName.includes('钱')) {
		return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
	}
	if (roleName.includes('家庭') || roleName.includes('成员') || roleName.includes('亲友')) {
		return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
	}
	return 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
};

const summaryItems = computed<RbacSummaryItem[]>(() => {
	const items: RbacSummaryItem[] = [
		{
			label: '当前用户',
			value: formState.value.username || formState.value.nickName || '新增用户',
		},
		{
			label: '所属主机构',
			value: currentOrgName.value,
		},
		{
			label: '兼任机构',
			value: displayAuxiliaryOrgs.value,
		},
		{
			label: '状态',
			value: formState.value.status === '1' ? '有效' : '待确认',
		},
	];
	return items;
});

const handleOk = () => {
	if (isReadonly.value) {
		modelInfo.value.open = false;
		return;
	}
	errorText.value = '';
	loading.value = true;
	if (!formRef.value) {
		loading.value = false;
		return;
	}
	formRef.value
		.validateFields()
		.then(() => saveUserManager())
		.catch(() => {
			loading.value = false;
		});
};

const customImageRequest = (file: FileInfo) => {
	formState.value.avatar = file.id != null ? String(file.id) : undefined;
	formState.value.avatarUrl = file.preUrl;
	formState.value.avatarThumbnailUrl = file?.preThumbnailUrl ?? '';
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const handleOpenChange = (open: boolean) => {
	modelInfo.value.open = open;
	if (!open) {
		errorText.value = '';
	}
};

const saveUserManager = async () => {
	const api = formState.value.id ? editUserManager : addUserManager;
	const { code, message: messageInfo } = (await api(formState.value).finally(
		() => {
			loading.value = false;
		},
	)) || {};
	if (code === '200') {
		message.success(messageInfo || '保存成功');
		modelInfo.value.open = false;
		emit('success');
		initForm();
	} else {
		errorText.value = messageInfo || '保存失败';
		message.error(errorText.value);
	}
};

const initForm = () => {
	formState.value = {
		status: '1',
		gender: '0',
		roleIds: [],
		auxiliaryOrgIds: [],
	};
};

const loadRbacOptions = async () => {
	const [orgResult, roleResult] = await Promise.all([
		getOrgInfoTree(),
		getRoleInfoPage({}, 1, 1000),
	]);
	const { code: orgCode, data: orgData } = orgResult || {};
	if (orgCode === '200') {
		orgTreeList.value = normalizeTreeNodes((orgData as OrgInfoData[]) || []);
	}
	const { code: roleCode, data: roleData } = roleResult || {};
	if (roleCode === '200') {
		roleOptions.value = (roleData?.records || []).map((r: RoleInfoData) => ({
			...r,
			id: String(r.id),
			value: String(r.id),
			label: r.roleName || '',
			roleName: r.roleName || '',
		}));
	}
};

const normalizeDetail = (data: UserManagerInfo | undefined) => {
	formState.value = data || {};
	const detail = data as
		| (UserManagerInfo & {
				orgInfoVo?: OrgInfoData;
				roleInfoVo?: RoleInfoData;
		  })
		| undefined;
	formState.value.orgId =
		formState.value.orgId != null
			? String(formState.value.orgId)
			: (detail?.orgInfoVo?.id ? String(detail.orgInfoVo.id) : undefined);
	formState.value.auxiliaryOrgIds = (formState.value.auxiliaryOrgIds || []).map(
		(id) => String(id),
	);
	formState.value.roleIds =
		formState.value.roleIds?.map((id) => String(id)) ||
		detail?.roleInfoVoList?.map((role) => String(role.id)) ||
		(detail?.roleInfoVo?.id ? [String(detail.roleInfoVo.id)] : []);
	if (formState.value.gender !== undefined && formState.value.gender !== null) {
		formState.value.gender = String(formState.value.gender);
	}
	if (formState.value.status !== undefined && formState.value.status !== null) {
		formState.value.status = String(formState.value.status);
	}
	if (formState.value.birthday) {
		formState.value.birthday = formatDayjs(formState.value.birthday);
	}
	if (formState.value.avatar) {
		fileInfo.value.id = formState.value.avatar;
		fileInfo.value.url = formState.value.avatarUrl;
		fileInfo.value.preUrl = formState.value.avatarUrl;
		fileInfo.value.preThumbnailUrl = formState.value.avatarThumbnailUrl;
	} else {
		fileInfo.value = {};
	}
};

const init = async () => {
	pageLoading.value = true;
	errorText.value = '';
	await loadRbacOptions();
	if (modelInfo.value?.id) {
		try {
			const {
				code,
				data,
				message: messageInfo,
			} = (await getUserManagerDetail(String(modelInfo.value.id))) || {};
			if (code === '200') {
				normalizeDetail(data as UserManagerInfo | undefined);
			} else {
				errorText.value = messageInfo || '查询失败';
				message.error(errorText.value);
			}
		} finally {
			pageLoading.value = false;
		}
		return;
	}
	fileInfo.value = {};
	initForm();
	pageLoading.value = false;
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

<style lang="less" scoped>
.user-detail-readonly {
	padding-bottom: 12px;

	.hero-profile-card {
		transition: all 0.2s ease;
	}

	.detail-section-card {
		transition: all 0.2s ease;
	}
}

.user-detail-form {
	padding-bottom: 8px;

	.user-edit-header-row {
		:deep(.avatar-uploader > .ant-upload) {
			width: 104px;
			height: 104px;
			margin: 0;
			border-radius: 12px;
		}
	}

	:deep(.ant-form-item) {
		margin-bottom: 16px;
	}

	:deep(.ant-form-item-label > label) {
		color: #6b7280;
	}

	:deep(.ant-input),
	:deep(.ant-select-selector),
	:deep(.ant-picker),
	:deep(.ant-input-affix-wrapper) {
		border-color: #e5e7eb;
		border-radius: 6px;
	}
}
</style>
