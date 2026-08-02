<template>
	<div class="page-info user-manager-page">
		<aside class="left-content org-tree-panel">
			<div class="tree-header">
				<div>
					<div class="tree-title">组织架构 (Organization)</div>
					<div class="tree-subtitle">按部门快速定位用户</div>
				</div>
				<a-button
					type="link"
					size="small"
					@click="clearOrgSelect"
				>
					全部
				</a-button>
			</div>
			<div class="org-search-shell">
				<search-outlined class="org-search-icon" />
				<input
					v-model="orgSearchKeyword"
					class="org-search-input"
					placeholder="搜索部门..."
					type="text"
				/>
			</div>
			<a-spin :spinning="orgLoading">
				<a-empty
					v-if="filteredTreeData.length === 0"
					description="暂无机构"
				/>
				<a-tree
					v-else
					v-model:expandedKeys="expandedKeys"
					v-model:selectedKeys="selectedKeys"
					:tree-data="filteredTreeData"
					:fieldNames="{ title: 'orgName', key: 'id' }"
					blockNode
					@select="onTreeSelect"
				>
					<template #title="{ id, parentId, orgName, children }">
						<a-space
							:size="6"
							class="org-node-title"
						>
							<bank-outlined
								v-if="isRootOrg(parentId)"
								class="org-node-icon"
							/>
							<folder-open-outlined
								v-else-if="isOpenFolderNode(id, children)"
								class="org-node-icon"
							/>
							<folder-outlined
								v-else-if="children && children.length > 0"
								class="org-node-icon"
							/>
							<team-outlined
								v-else
								class="org-node-icon"
							/>
							<span>{{ orgName }}</span>
						</a-space>
					</template>
				</a-tree>
			</a-spin>
		</aside>

		<section class="right-content">
			<div class="search-card user-filter-card">
				<a-form
					:model="searchInfo"
					layout="inline"
					class="search-form"
				>
					<a-form-item
						name="keyword"
						label="用户"
					>
						<a-input
							v-model:value="searchInfo.keyword"
							placeholder="用户名/昵称/手机号"
							allow-clear
							style="width: 220px"
						/>
					</a-form-item>
					<a-form-item
						name="roleId"
						label="角色"
					>
						<a-select
							v-model:value="searchInfo.roleId"
							:options="roleOptions"
							:field-names="{ label: 'roleName', value: 'id' }"
							:loading="roleLoading"
							placeholder="所有角色"
							allow-clear
							style="width: 220px"
							@change="query(true)"
						/>
					</a-form-item>
					<a-form-item>
						<a-space>
							<a-button
								type="primary"
								@click="query(true)"
							>
								查找
							</a-button>
							<a-button @click="cancelQuery">清空</a-button>
						</a-space>
					</a-form-item>
				</a-form>
			</div>

			<div class="toolbar">
				<div>
					<div class="table-title">{{ selectedOrgLabel }}用户列表</div>
					<div class="table-subtitle">当前筛选：{{ selectedOrgLabel }}</div>
				</div>
				<a-space>
					<a-button
						v-permission="'user:add'"
						type="primary"
						@click="editUser('add')"
					>
						<template #icon><plus-outlined /></template>
						新增
					</a-button>
					<a-popconfirm
						v-permission="'user:delete'"
						title="确认删除选中的用户信息？"
						ok-text="确认"
						cancel-text="取消"
						@confirm="batchDelUserManager"
					>
						<a-button
							type="primary"
							danger
							:disabled="!rowIds.length"
						>
							<template #icon><delete-outlined /></template>
							删除
						</a-button>
					</a-popconfirm>
				</a-space>
			</div>

			<div class="content">
				<a-table
					:dataSource="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record: UserManagerInfo) => String(record.id || record.username || '')"
					:pagination="pagination"
					:row-selection="rowSelection"
					:scroll="{ x: 'max-content' }"
					class="custom-table"
					@change="handleTableChange"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'operation'">
							<a-space>
								<a-button
									v-permission="'user:edit'"
									type="primary"
									size="small"
									@click="editUser('update', record.id)"
								>
									编辑
								</a-button>
								<a-popconfirm
									v-if="record.username !== 'superman'"
									v-permission="'user:delete'"
									title="确认删除用户信息？"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delUser(String(record.id || ''))"
								>
									<a-button
										type="primary"
										size="small"
										danger
									>
										删除
									</a-button>
								</a-popconfirm>
							</a-space>
						</template>
						<template v-else-if="column.key === 'birthday'">
							<span>{{ formatDate(record.birthday) }}</span>
						</template>
						<template v-else-if="column.key === 'status'">
							<a-tag
								:key="String(record.status)"
								:color="String(record.status) === '1' ? '#87d068' : 'grey'"
							>
								{{ String(record.status) === '1' ? '有效' : '失效' }}
							</a-tag>
						</template>
						<template v-else-if="column.key === 'gender'">
							<a-tag
								v-if="String(record.gender) === '1' || String(record.gender) === '2'"
								:key="String(record.gender)"
								:color="String(record.gender) === '1' ? 'blue' : 'red'"
							>
								{{ String(record.gender) === '1' ? '男' : '女' }}
							</a-tag>
						</template>
						<template v-else-if="column.key === 'avatarUrl' && record.avatarUrl">
							<a-image
								:width="50"
								:src="record.avatarThumbnailUrl || record.avatarUrl"
								:preview="{ src: record.avatarUrl }"
							/>
						</template>
					</template>
				</a-table>
			</div>

			<user-manager-detail
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import {
	BankOutlined,
	DeleteOutlined,
	FolderOpenOutlined,
	FolderOutlined,
	PlusOutlined,
	SearchOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';
import type { Key } from 'ant-design-vue/es/_util/type';
import type { TablePaginationConfig, TreeProps } from 'ant-design-vue';
import type { TreeDataItem } from 'ant-design-vue/es/tree';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import { formatDate } from '@/utils/dayjs';
import type { ModelInfo } from '@/views/common/config';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { getRoleInfoPage } from '@/views/user/roleInfo/api';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import {
	deleteUserManager,
	getUserManagerPage,
} from '@/views/user/userManager/api';
import { columns } from '@/views/user/userManager/config';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import UserManagerDetail from './userManagerDetail/index.vue';

type OrgTreeNode = OrgInfoData &
	TreeDataItem & {
		id: Key;
		parentId?: Key | null;
		children?: OrgTreeNode[];
	};

const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination({
	showTotal: (total: number) => `共 ${total} 条`,
});

const rowIds = ref<(string | number)[]>([]);
const loading = ref(false);
const orgLoading = ref(false);
const roleLoading = ref(false);
const dataSource = ref<UserManagerInfo[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<UserManagerInfo>({});
const treeData = ref<OrgTreeNode[]>([]);
const roleOptions = ref<RoleInfoData[]>([]);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<Key[]>([]);
const selectedOrgName = ref('全部机构');
const orgSearchKeyword = ref('');
const selectedOrgLabel = computed(() => selectedOrgName.value || '全部机构');

const filteredTreeData = computed(() => {
	const keyword = orgSearchKeyword.value.trim().toLowerCase();
	if (!keyword) return treeData.value;

	const filterNodes = (nodes: OrgTreeNode[]): OrgTreeNode[] => {
		const result: OrgTreeNode[] = [];
		nodes.forEach((node) => {
			const children = filterNodes((node.children || []) as OrgTreeNode[]);
			const matched =
				String(node.orgName || '').toLowerCase().includes(keyword) ||
				String(node.orgCode || '').toLowerCase().includes(keyword);
			if (matched || children.length > 0) {
				result.push({
					...node,
					children,
				});
			}
		});
		return result;
	};

	return filterNodes(treeData.value);
});

const rowSelection = computed(() => ({
	checkStrictly: false,
	selectedRowKeys: rowIds.value,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
}));

const isRootOrg = (parentId?: Key | null) => !parentId || String(parentId) === '0';

const isOpenFolderNode = (id: Key, children?: OrgTreeNode[]) =>
	Boolean(children?.length) &&
	(selectedKeys.value.includes(id) || expandedKeys.value.includes(id));

const mergeText = (left?: string, right?: string) => {
	const values = `${left || ''},${right || ''}`
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
	return Array.from(new Set(values)).join(',');
};

const normalizeUserRecords = (records: UserManagerInfo[] = []) => {
	const map = new Map<string, UserManagerInfo>();
	records.forEach((record) => {
		const key = String(record.id || `${record.username || ''}-${record.mobile || ''}`);
		const current = map.get(key);
		if (!current) {
			map.set(key, { ...record });
			return;
		}
		current.roleName = mergeText(current.roleName, record.roleName);
		current.roleCode = mergeText(current.roleCode, record.roleCode);
	});
	return Array.from(map.values());
};

const buildQueryParams = () => {
	const { keyword, ...rest } = searchInfo.value;
	const params: UserManagerInfo = {};
	Object.entries(rest).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			(params as Record<string, unknown>)[key] = value;
		}
	});
	const trimKeyword = keyword?.trim();
	if (trimKeyword) {
		params.keyword = trimKeyword;
	}
	return params;
};

const cancelQuery = () => {
	searchInfo.value = {};
	selectedKeys.value = [];
	selectedOrgName.value = '全部机构';
	triggerDebouncedQuery.cancel();
	query(true);
};

const clearOrgSelect = () => {
	selectedKeys.value = [];
	searchInfo.value.orgId = undefined;
	selectedOrgName.value = '全部机构';
	query(true);
};

const query = (resetPage = false) => {
	triggerDebouncedQuery.cancel();
	if (resetPage) {
		resetPagination();
	}
	getUserPage(buildQueryParams(), pagination);
};

const handleTableChange = (paginationInfo: TablePaginationConfig) => {
	paginationChange(paginationInfo as PageInfo);
	getUserPage(buildQueryParams(), pagination);
};

const delUser = async (ids: string) => {
	if (!ids) {
		message.warning('请选择要删除的用户', 3);
		return;
	}
	const { code, message: messageInfo } = await deleteUserManager(ids);
	if (code === '200') {
		message.success(messageInfo || '删除成功', 3);
		rowIds.value = [];
		query(true);
	} else {
		message.error(messageInfo || '删除失败', 3);
	}
};

const batchDelUserManager = () => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据', 3);
		return;
	}
	delUser(rowIds.value.join(','));
};

const getUserPage = async (param: UserManagerInfo, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getUserManagerPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = normalizeUserRecords(data?.records || []);
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败');
		}
	} finally {
		loading.value = false;
	}
};

const editUser = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增明细' : '修改明细',
		id: isAdd ? undefined : id,
		confirmLoading: true,
		open: true,
	};
};

const handleSuccess = () => {
	getUserPage(buildQueryParams(), pagination);
};

const buildTree = (data: OrgTreeNode[]): OrgTreeNode[] => {
	const map = new Map<Key, OrgTreeNode>();
	const roots: OrgTreeNode[] = [];

	data.forEach((item) => {
		map.set(item.id, { ...item, children: [] });
	});

	data.forEach((item) => {
		const node = map.get(item.id);
		if (!node) return;
		const parentId = item.parentId;
		if (!parentId || String(parentId) === '0') {
			roots.push(node);
			return;
		}
		const parent = map.get(parentId);
		if (parent) {
			parent.children = parent.children || [];
			parent.children.push(node);
			return;
		}
		roots.push(node);
	});

	return roots;
};

const getOrgTreeData = async () => {
	orgLoading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getOrgInfoPage({}, 1, 1000);
		if (code === '200') {
			const rawRecords = (data?.records || []).map((item) => ({
				...item,
				id: item.id || '',
				key: item.id,
			})) as OrgTreeNode[];
			treeData.value = buildTree(rawRecords);
			expandedKeys.value = treeData.value.slice(0, 3).map((item) => item.id);
		} else {
			message.error(messageInfo || '机构树加载失败');
		}
	} finally {
		orgLoading.value = false;
	}
};

const getRoleOptions = async () => {
	roleLoading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getRoleInfoPage({ status: '1' }, 1, 1000);
		if (code === '200') {
			roleOptions.value = data?.records || [];
		} else {
			message.error(messageInfo || '角色列表加载失败');
		}
	} finally {
		roleLoading.value = false;
	}
};

const onTreeSelect: TreeProps['onSelect'] = (keys, info) => {
	const node = info.node as unknown as OrgTreeNode;
	if (keys.length > 0) {
		searchInfo.value.orgId = String(node.id || '');
		selectedOrgName.value = node.orgName || '选中机构';
	} else {
		searchInfo.value.orgId = undefined;
		selectedOrgName.value = '全部机构';
	}
	query(true);
};

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

const init = async () => {
	pagination.current = 1;
	pagination.pageSize = 10;
	void getUserPage(buildQueryParams(), pagination);
	void getOrgTreeData();
	void getRoleOptions();
};

onMounted(() => {
	init();
});

watch(
	() => ({
		keyword: searchInfo.value.keyword,
	}),
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>

<style lang="less" scoped>
.user-manager-page {
	display: flex;
	height: calc(100vh - 120px);
	padding: 0;
	background: #f6f8fb;
	border-radius: 8px;
	box-sizing: border-box;
	overflow: hidden;
}

.left-content {
	width: 280px;
	border-right: 1px solid #e5e7eb;
	overflow-y: auto;
	flex: 0 0 auto;
}

.tree-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid #e5e7eb;
}

.tree-title,
.table-title {
	color: #111827;
	font-size: 16px;
	font-weight: 600;
}

.tree-subtitle,
.table-subtitle {
	margin-top: 4px;
	color: #8c8c8c;
	font-size: 12px;
}

.org-tree-panel {
	background: #fff;
}

.org-search-shell {
	display: flex;
	align-items: center;
	width: calc(100% - 32px);
	height: 32px;
	margin: 16px;
	padding: 0 10px;
	background: #ededf9;
	border: 1px solid #e5e7eb;
	border-radius: 4px;
	box-sizing: border-box;
}

.org-search-icon {
	flex: 0 0 auto;
	margin-right: 8px;
	color: #434655;
	font-size: 16px;
}

.org-search-input {
	width: 100%;
	height: 30px;
	min-width: 0;
	padding: 0;
	color: #111827;
	font-size: 14px;
	background: transparent;
	border: 0;
	outline: none;

	&::placeholder {
		color: #bfbfbf;
	}
}

.right-content {
	display: flex;
	flex: 1;
	flex-direction: column;
	min-width: 0;
	padding: 16px 16px 16px 24px;
	overflow: hidden;
}

.search-card {
	padding: 12px 16px;
	margin-bottom: 16px;
	background: #f3f3fe;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.search-form {
	row-gap: 16px;
}

.toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	margin-bottom: 16px;
}

.content {
	flex: 1;
	overflow: hidden;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
}

.custom-table {
	:deep(.ant-table-thead > tr > th) {
		color: #111827;
		font-weight: 600;
		background: #fafafa;
	}

	:deep(.ant-table-cell) {
		font-size: 14px;
	}
}

:deep(.ant-tree) {
	padding: 0 8px 16px;
	background: transparent;

	.ant-tree-treenode {
		width: 100%;
		padding: 2px 0;
	}

	.ant-tree-switcher {
		color: #6b7280;
		line-height: 30px;
	}

	.ant-tree-node-content-wrapper {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 30px;
		padding: 0 6px;
		border-radius: 4px;
		transition: all 0.2s;

		&:hover {
			background: #ededf9;
		}
	}

	.ant-tree-node-selected {
		color: #00174b;
		font-weight: 500;
		background-color: #dbe1ff !important;
	}

	.ant-tree-indent-unit::before {
		border-color: #e5e7eb;
	}
}

.org-node-title {
	width: 100%;
	color: inherit;
	font-size: 14px;
	line-height: 32px;

	.org-node-icon {
		color: #004ac6;
		font-size: 16px;
	}
}
</style>
