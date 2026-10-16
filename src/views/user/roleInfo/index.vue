<template>
	<div
		class="role-page flex flex-col gap-3 h-[calc(100vh-110px)] overflow-hidden"
	>
		<!-- 顶部标题、数据范围提示与紧凑筛选栏 -->
		<div
			class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] shrink-0"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<!-- 左侧标题与数据范围提示胶囊 -->
				<div class="flex items-center gap-2.5 flex-wrap">
					<div
						class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0"
					>
						<IdcardOutlined class="text-base" />
					</div>
					<div class="flex items-center gap-2 flex-wrap">
						<h2
							class="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight m-0"
						>
							角色管理
						</h2>
						<span
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800"
						>
							{{ pagination?.total ?? 0 }} 个角色
						</span>
						<span
							class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100/90 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700"
							data-testid="rbac-data-scope-hint"
						>
							{{ scopeHintText }}
						</span>
					</div>
				</div>

				<!-- 右侧单行紧凑筛选栏 -->
				<a-form
					:model="searchInfo"
					layout="inline"
					class="flex flex-wrap items-center gap-2"
				>
					<a-form-item name="roleCode" class="!mb-0 !mr-0">
						<a-input
							v-model:value="searchInfo.roleCode"
							placeholder="搜索角色编码"
							allow-clear
							class="w-44 rounded-lg font-mono text-xs"
							data-testid="rbac-role-search-rolecode"
							@press-enter="() => query(true)"
						/>
					</a-form-item>

					<a-form-item name="roleName" class="!mb-0 !mr-0">
						<a-input
							v-model:value="searchInfo.roleName"
							placeholder="搜索角色名称"
							allow-clear
							class="w-40 rounded-lg"
							@press-enter="() => query(true)"
						/>
					</a-form-item>

					<a-form-item name="status" class="!mb-0 !mr-0">
						<a-select
							v-model:value="searchInfo.status"
							placeholder="全部状态"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="statusList"
							allow-clear
							class="w-32"
							@change="() => query(true)"
						/>
					</a-form-item>

					<div class="flex items-center gap-1.5 ml-1">
						<a-button
							type="primary"
							data-testid="rbac-role-btn-query"
							class="rounded-lg font-medium"
							@click="() => query(true)"
						>
							查找
						</a-button>
						<a-button
							data-testid="rbac-role-btn-reset"
							class="rounded-lg text-slate-600 dark:text-slate-300"
							@click="cancelQuery"
						>
							清空
						</a-button>
					</div>
				</a-form>
			</div>
		</div>

		<!-- 主体高密度表格区 -->
		<div
			class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex-1 flex flex-col min-h-0 overflow-hidden"
		>
			<!-- 工具栏 -->
			<div class="flex items-center justify-between mb-3 shrink-0">
				<div class="flex items-center gap-2 flex-wrap">
					<a-button
						v-permission="'role:add'"
						type="primary"
						data-testid="rbac-role-btn-add"
						class="rounded-lg font-medium shadow-sm shadow-blue-500/15"
						@click="openRoleDrawer('add')"
					>
						+ 新增角色
					</a-button>

					<span v-permission="'role:delete'">
						<a-popconfirm
							:title="`确认删除选中的 ${rowIds.length} 个角色吗？`"
							ok-text="确认删除"
							cancel-text="取消"
							:disabled="!rowIds.length"
							@confirm="handleBatchDelete"
						>
							<a-button
								danger
								:disabled="!rowIds.length"
								data-testid="rbac-role-btn-batch-delete"
								class="rounded-lg"
							>
								批量删除
								<span v-if="rowIds.length" class="ml-1 font-mono">
									({{ rowIds.length }})
								</span>
							</a-button>
						</a-popconfirm>
					</span>

					<a-button
						data-testid="rbac-role-btn-goto-relation"
						class="rounded-lg text-slate-600 dark:text-slate-300"
						@click="router.push('/user/role-user-info')"
					>
						角色-用户关系配置
					</a-button>
				</div>

				<div class="text-xs text-slate-400 dark:text-slate-500 hidden md:block">
					点击「权限数 / 成员数」胶囊可快速唤起对应分配抽屉
				</div>
			</div>

			<!-- 表格视图 -->
			<div class="flex-1 min-h-0 overflow-hidden">
				<a-table
					:data-source="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: RoleInfoData) => String(record.id)"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 1150, y: 'calc(100vh - 315px)' }"
					size="middle"
					data-testid="rbac-role-table"
					@change="handleTableChange"
				>
					<template #emptyText>
						<a-empty
							description="当前机构范围内暂无角色。可新建并绑定机构，或请超管将角色绑定到本机构。"
						/>
					</template>

					<template #bodyCell="{ column, record }">
						<!-- 1. 角色信息复合列 (名称 + 职责描述) -->
						<template v-if="column.key === 'roleName'">
							<div class="flex flex-col py-0.5">
								<div class="flex items-center gap-1.5">
									<span
										class="font-semibold text-slate-800 dark:text-slate-100 text-[13px] leading-snug truncate"
										:title="record.roleName"
									>
										{{ record.roleName || '-' }}
									</span>
									<span
										v-if="record.roleCode === 'super_super'"
										class="px-1.5 py-0 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-300/70 dark:border-amber-800 shrink-0"
									>
										超管
									</span>
								</div>
								<span
									v-if="record.summary"
									class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5"
									:title="record.summary"
								>
									{{ record.summary }}
								</span>
							</div>
						</template>

						<!-- 2. 角色编码 (点击一键复制) -->
						<template v-else-if="column.key === 'roleCode'">
							<a-tooltip title="点击复制角色编码">
								<span
									v-if="record.roleCode"
									class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-xs font-medium bg-blue-50/90 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/70 dark:text-blue-300 dark:hover:bg-blue-900/70 border border-blue-200/70 dark:border-blue-800/80 cursor-pointer transition-colors select-all"
									@click="copyRoleCode(record.roleCode)"
								>
									{{ record.roleCode }}
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</a-tooltip>
						</template>

						<!-- 3. 绑定机构胶囊 -->
						<template v-else-if="column.key === 'orgNames'">
							<div
								v-if="parseOrgNames(record.orgNames).length"
								class="flex flex-wrap items-center gap-1"
							>
								<span
									v-for="org in parseOrgNames(record.orgNames).slice(0, 2)"
									:key="org"
									class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 max-w-[110px] truncate"
									:title="org"
								>
									{{ org }}
								</span>
								<a-tooltip
									v-if="parseOrgNames(record.orgNames).length > 2"
									:title="parseOrgNames(record.orgNames).join('、')"
								>
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 cursor-help"
									>
										+{{ parseOrgNames(record.orgNames).length - 2 }}
									</span>
								</a-tooltip>
							</div>
							<span v-else class="text-xs text-slate-300 dark:text-slate-600">
								未绑定
							</span>
						</template>

						<!-- 4. 授权与成员规模 (点击直达抽屉) -->
						<template v-else-if="column.key === 'metrics'">
							<div class="inline-flex items-center gap-1.5">
								<a-tooltip title="点击配置角色菜单与按钮权限">
									<button
										type="button"
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-indigo-50/90 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/70 border border-indigo-200/70 dark:border-indigo-800/70 cursor-pointer transition-colors"
										@click="roleAuthorizationInfo(String(record.id))"
									>
										<span>{{ Number(record.permissionCount ?? 0) }}</span>
										<span class="font-sans text-[11px] opacity-80">权限</span>
									</button>
								</a-tooltip>

								<a-tooltip title="点击分配该角色下的成员">
									<button
										type="button"
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-teal-50/90 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/70 border border-teal-200/70 dark:border-teal-800/70 cursor-pointer transition-colors"
										@click="roleUserAssignmentInfo(String(record.id))"
									>
										<span>{{ Number(record.boundUserCount ?? 0) }}</span>
										<span class="font-sans text-[11px] opacity-80">用户</span>
									</button>
								</a-tooltip>
							</div>
						</template>

						<!-- 5. 状态呼吸灯胶囊 -->
						<template v-else-if="column.key === 'status'">
							<span
								v-if="String(record.status) === '1'"
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/70"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
								></span>
								有效
							</span>
							<span
								v-else
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
								失效
							</span>
						</template>

						<!-- 6. 操作列 (查看 / 编辑 / 授权 / 用户 / 删除) -->
						<template v-else-if="column.key === 'operation'">
							<div class="flex items-center justify-center gap-1.5">
								<button
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
									data-testid="rbac-role-row-view"
									@click="openRoleDrawer('view', record.id)"
								>
									查看
								</button>

								<button
									v-permission="'role:edit'"
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-blue-600 bg-blue-50/90 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/60 dark:hover:bg-blue-900/70 transition-colors cursor-pointer"
									data-testid="rbac-role-row-edit"
									@click="openRoleDrawer('update', record.id)"
								>
									编辑
								</button>

								<button
									v-permission="'role:auth'"
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-indigo-600 bg-indigo-50/90 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 transition-colors cursor-pointer"
									data-testid="rbac-role-row-authorize"
									@click="roleAuthorizationInfo(String(record.id))"
								>
									授权
								</button>

								<button
									v-permission="'role:auth'"
									type="button"
									class="px-2 py-1 text-xs font-medium rounded-md text-teal-600 bg-teal-50/90 hover:bg-teal-100 dark:text-teal-400 dark:bg-teal-950/60 dark:hover:bg-teal-900/70 transition-colors cursor-pointer"
									data-testid="rbac-role-row-users"
									@click="roleUserAssignmentInfo(String(record.id))"
								>
									用户
								</button>

								<span v-permission="'role:delete'">
									<a-popconfirm
										title="确认删除该角色吗？"
										ok-text="确认"
										cancel-text="取消"
										@confirm="delRoleInfo(String(record.id))"
									>
										<button
											type="button"
											class="px-2 py-1 text-xs font-medium rounded-md text-rose-600 bg-rose-50/90 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 transition-colors cursor-pointer"
											data-testid="rbac-role-row-delete"
										>
											删除
										</button>
									</a-popconfirm>
								</span>
							</div>
						</template>
					</template>
				</a-table>
			</div>

			<role-info-detail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			/>
			<authorization-detail
				v-model:modelInfo="authModelInfo"
				@success="() => query()"
			/>
			<user-assignment-detail
				v-model:modelInfo="userAssignModelInfo"
				@success="() => query()"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { IdcardOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '@/types/modal';
import type { PageInfo } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
import { columns, type RoleInfoData } from '@/views/user/roleInfo/config';
import { getRoleInfoPage, deleteRoleInfo } from '@/views/user/roleInfo/api';
import { useDataScopeHint } from '@/composables/useDataScopeHint';
import RoleInfoDetail from '@/views/user/roleInfo/roleInfoDetail/index.vue';
import AuthorizationDetail from '@/views/user/roleInfo/authorizationDetail/index.vue';
import UserAssignmentDetail from '@/views/user/roleInfo/userAssignmentDetail/index.vue';

// 表格行选择（保障 ID 为纯 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

// 分页组合式函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getRoleInfoListPage(searchInfo.value, p),
	});

const router = useRouter();
const { scopeHintText } = useDataScopeHint();
const { getDictByType } = useDictInfo('is_valid');

const searchInfo = ref<RoleInfoData>({});
const loading = ref<boolean>(false);
const dataSource = ref<RoleInfoData[]>([]);

const modelInfo = ref<ModelInfo>({});
const authModelInfo = ref<ModelInfo>({});
const userAssignModelInfo = ref<ModelInfo>({});

const statusList = computed(() => getDictByType('is_valid'));

const parseOrgNames = (orgNames?: string): string[] => {
	if (!orgNames) return [];
	return orgNames
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
};

const copyRoleCode = async (code?: string) => {
	if (!code) return;
	try {
		await navigator.clipboard.writeText(code);
		message.success(`已复制角色编码: ${code}`);
	} catch {
		message.info(`角色编码: ${code}`);
	}
};

const cancelQuery = () => {
	searchInfo.value = {};
	query(true);
};

const delRoleInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteRoleInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const handleBatchDelete = () => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！');
		return;
	}
	delRoleInfo(rowIds.value.map((id) => String(id)).join(','));
};

const openRoleDrawer = (
	type: 'add' | 'update' | 'view',
	id?: string | number,
) => {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value = {
		open: true,
		readonly: isView,
		title: isAdd ? '新增角色明细' : isView ? '查看角色明细' : '编辑角色明细',
		id: !isAdd && id !== undefined && id !== null ? String(id) : undefined,
	};
};

const roleAuthorizationInfo = (id: string) => {
	authModelInfo.value = {
		open: true,
		id: String(id),
		title: '角色权限配置',
	};
};

const roleUserAssignmentInfo = (id: string) => {
	userAssignModelInfo.value = {
		open: true,
		id: String(id),
		title: '角色用户分配',
	};
};

const getRoleInfoListPage = async (param: RoleInfoData, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id:
					item.id !== undefined && item.id !== null
						? String(item.id)
						: undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getRoleInfoListPage(searchInfo.value, pagination);
}

onMounted(() => {
	authModelInfo.value = { open: false };
	getRoleInfoListPage(searchInfo.value, pagination);
});
</script>
