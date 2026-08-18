<template>
	<div class="page-info">
		<div class="left-content">
			<div class="tree-title">组织架构</div>
			<a-tree
				:tree-data="treeData"
				data-testid="rbac-org-tree"
				v-model:expandedKeys="expandedKeys"
				v-model:selectedKeys="selectedKeys"
				v-model:checkedKeys="checkedKeys"
				:fieldNames="{ title: 'orgName', key: 'id' }"
				@select="onTreeSelect"
				blockNode
			>
				<template #title="{ orgName, children }">
					<a-space :size="4">
						<template v-if="children && children.length > 0">
							<folder-outlined />
						</template>
						<template v-else>
							<user-outlined />
						</template>
						<span>{{ orgName }}</span>
					</a-space>
				</template>
			</a-tree>
		</div>
		<div class="right-content">
			<div class="top-area">
				<a-tag
					color="blue"
					data-testid="rbac-data-scope-hint"
					style="margin-bottom: 12px"
				>
					{{ scopeHintText }}
				</a-tag>
				<div class="search">
					<a-form :model="searchInfo" layout="inline" class="search-form">
						<a-form-item name="orgName" label="机构名称：">
							<a-input
								v-model:value="searchInfo.orgName"
								placeholder="请输入机构名称"
								data-testid="rbac-org-search-orgname"
								allow-clear
							/>
						</a-form-item>
						<a-form-item name="orgCode" label="机构编码：">
							<a-input
								v-model:value="searchInfo.orgCode"
								placeholder="请输入机构编码"
								allow-clear
							/>
						</a-form-item>
						<a-form-item name="status" label="状态：">
							<a-select
								v-model:value="searchInfo.status"
								placeholder="请选择状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								allow-clear
								style="width: 140px"
							/>
						</a-form-item>
						<a-form-item name="parentId" label="所属上级：">
							<a-input
								v-model:value="searchInfo.parentId"
								placeholder="请输入上级机构ID"
								allow-clear
							/>
						</a-form-item>
						<a-form-item>
							<a-space>
								<a-button
									type="primary"
									data-testid="rbac-org-btn-query"
									@click="() => query()"
								>
									查找
								</a-button>
								<a-button data-testid="rbac-org-btn-reset" @click="cancelQuery">
									清空
								</a-button>
							</a-space>
						</a-form-item>
					</a-form>
				</div>
				<a-divider style="margin: 16px 0" />
				<div class="button-group">
					<a-space>
						<a-button
							v-permission="'org:add'"
							type="primary"
							data-testid="rbac-org-btn-add"
							@click="editOrgInfo('add')"
						>
							<template #icon><plus-outlined /></template>
							新增
						</a-button>
						<a-button
							v-permission="'org:edit'"
							type="primary"
							data-testid="rbac-org-btn-edit-node"
							@click="editOrgInfo('update', String(selectedKeys[0]))"
							:disabled="!hasSelectedNode"
						>
							<template #icon><edit-outlined /></template>
							编辑
						</a-button>
						<a-popconfirm
							v-permission="'org:delete'"
							title="确认删除选中的机构?"
							ok-text="确认"
							cancel-text="取消"
							@confirm="delOrgInfo(selectedKeys.join(','))"
							:disabled="!hasSelectedNode"
						>
							<a-button
								type="primary"
								danger
								data-testid="rbac-org-btn-delete-node"
								:disabled="!hasSelectedNode"
							>
								<template #icon><delete-outlined /></template>
								删除
							</a-button>
						</a-popconfirm>
						<a-button
							v-permission="'org:delete'"
							type="primary"
							danger
							data-testid="rbac-org-batch-delete"
							@click="batchDelOrgInfo"
						>
							<template #icon><delete-outlined /></template>
							批量删除
						</a-button>
						<a-button
							data-testid="rbac-org-btn-goto-relation"
							@click="router.push('/user/org-user-info')"
						>
							机构-用户关系配置
						</a-button>
					</a-space>
				</div>
			</div>
			<div class="content">
				<a-table
					:dataSource="dataSource"
					:columns="columns"
					:loading="loading"
					:row-key="(record) => record.id"
					:pagination="pagination"
					@change="handleTableChange"
					:scroll="{ x: 'max-content' }"
					:row-selection="rowSelection"
					class="custom-table"
					data-testid="rbac-org-table"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'status'">
							<a-tag
								:key="String(record.status)"
								:style="{
									backgroundColor:
										String(record.status) === '1' ? '#f6ffed' : '#f5f5f5',
									color: String(record.status) === '1' ? '#52c41a' : '#00000040',
									borderColor:
										String(record.status) === '1' ? '#b7eb8f' : '#d9d9d9',
								}"
							>
								{{ String(record.status) === '1' ? '启用' : '禁用' }}
							</a-tag>
						</template>
						<template v-else-if="column.key === 'operation'">
							<a-space>
								<a-button
									v-permission="'org:edit'"
									type="link"
									size="small"
									style="padding: 0"
									data-testid="rbac-org-row-edit"
									@click="editOrgInfo('update', record.id)"
								>
									编辑
								</a-button>
								<a-popconfirm
									v-permission="'org:delete'"
									title="确认删除该机构?"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delOrgInfo(String(record.id || ''))"
								>
									<a-button
										type="link"
										danger
										size="small"
										style="padding: 0"
										data-testid="rbac-org-row-delete"
									>
										删除
									</a-button>
								</a-popconfirm>
							</a-space>
						</template>
					</template>
				</a-table>
			</div>
			<org-info-detail
				v-model:modelInfo="modelInfo"
				:treeData="treeData"
				@success="() => handleSuccess()"
			></org-info-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	FolderOutlined,
	UserOutlined,
} from '@ant-design/icons-vue';
// 字典数据已通过 useDictInfo 自动加载

import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import { columns } from '@/views/user/orgInfo/config';
import {
	getOrgInfoPage,
	getOrgInfoTree,
	deleteOrgInfo,
} from '@/views/user/orgInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';
import { useDataScopeHint } from '@/composables/useDataScopeHint';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { TreeDataItem } from 'ant-design-vue/es/tree';
import type { TreeProps } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/_util/type';
import OrgInfoDetail from './orgInfoDetail/index.vue';

type OrgTreeNode = OrgInfoData &
	TreeDataItem & {
		id: Key;
		parentId?: Key | null;
		orgCode?: string;
		children?: OrgTreeNode[];
	};

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const { getDictByType } = useDictInfo('is_valid');
const statusList = computed(() => getDictByType('is_valid'));
const { scopeHintText } = useDataScopeHint();

const router = useRouter();

const treeData = ref<TreeDataItem[]>([]);
const expandedKeys = ref<Key[]>([]);
const selectedKeys = ref<Key[]>([]);
const checkedKeys = ref<Key[]>([]);
const loading = ref<boolean>(false);
const dataSource = ref<OrgInfoData[]>([]);
const modelInfo = ref<ModelInfo>({});
const searchInfo = ref<OrgInfoData>({});
const currentParentId = ref<string | undefined>(undefined);
const hasSelectedNode = computed(() => selectedKeys.value.length > 0);
const rowIds = ref<(string | number)[]>([]);

// 表格行选择（批量删除）
const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

// 查询
const query = (resetPage: boolean = false) => {
	if (resetPage) {
		resetPagination();
	}
	getOrgDataPage();
};

// 清空查询条件
function cancelQuery() {
	searchInfo.value = {};
	searchInfo.value.parentId = currentParentId.value;
	query(true);
}

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getOrgDataPage();
};

const delOrgInfo = async (ids: string) => {
	if (!ids) {
		message.warning('请选择要删除的机构');
		return;
	}
	try {
		const { code, message: messageInfo } = await deleteOrgInfo(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			await getOrgTreeData();
			if (!selectedKeys.value.length) {
				searchInfo.value.parentId = undefined;
				currentParentId.value = undefined;
			}
			query(true);
		} else {
			message.error(messageInfo || '删除失败！', 3);
		}
	} catch {
		message.error('删除失败，请稍后重试！', 3);
	}
};

// 批量删除表格中选中的机构
const batchDelOrgInfo = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.value.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delOrgInfo(rowIds.value.join(',')),
	});
};

const onTreeSelect: TreeProps['onSelect'] = (keys, info) => {
	if (keys.length > 0) {
		currentParentId.value = String((info.node as unknown as OrgTreeNode).id || '');
	} else {
		currentParentId.value = undefined;
	}
	searchInfo.value.parentId = currentParentId.value;
	// No need to call getOrgDataPage here, watch on searchInfo will handle it
};

const getOrgDataPage = async () => {
	try {
		loading.value = true;
		const {
			code,
			data,
			message: messageInfo,
		} = await getOrgInfoPage(
			searchInfo.value,
			pagination.current,
			pagination.pageSize,
		);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 递归补齐 tree 组件所需的 key 字段（后端已按 parentId 组装好 children，无需前端再拼树）
const withTreeKey = (nodes: OrgInfoData[]): OrgTreeNode[] =>
	nodes.map((item) => ({
		...item,
		key: item.id,
		children: item.children?.length
			? withTreeKey(item.children as OrgInfoData[])
			: undefined,
	})) as OrgTreeNode[];

const getOrgTreeData = async () => {
	try {
		const { code, data, message: messageInfo } = await getOrgInfoTree();
		if (code === '200') {
			treeData.value = withTreeKey(data || []);
		} else {
			message.error(messageInfo || '机构树加载失败！');
		}
	} catch {
		message.error('机构树加载失败，请稍后重试！');
	}
};

//新增和修改弹窗
function editOrgInfo(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? null : (id !== undefined && id !== null ? String(id) : null);
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

const handleSuccess = () => {
	getOrgTreeData();
	query(false);
};

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);

const init = async () => {
	//获取机构表页面数据并生成树
	getOrgTreeData();
	// 取机构数据
	getOrgDataPage();
};

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.page-info {
	display: flex;
	height: calc(100vh - 120px);
	background: #fff;
	padding: 24px;
	border-radius: 8px;

	.left-content {
		width: 250px;
		border-right: 1px solid #f0f0f0;
		padding-right: 24px;
		overflow-y: auto;

		.tree-title {
			font-size: 16px;
			font-weight: bold;
			color: #333;
			margin-bottom: 20px;
		}

		:deep(.ant-tree) {
			.ant-tree-node-content-wrapper {
				border-radius: 4px;
				transition: all 0.2s;
				padding: 0 4px;
			}
			.ant-tree-node-selected {
				background-color: #e6f4ff !important;
				color: #1677ff;
				font-weight: 500;
			}
		}
	}

	.right-content {
		flex: 1;
		padding-left: 24px;
		overflow: hidden;
		display: flex;
		flex-direction: column;

		.top-area {
			.search-form {
				.ant-form-item {
					margin-bottom: 0;
				}
			}
		}

		.button-group {
			margin-bottom: 16px;
		}

		.content {
			flex: 1;
			overflow: hidden;
			border: 1px solid #f0f0f0;
			border-radius: 8px;

			.custom-table {
				:deep(.ant-table-thead > tr > th) {
					background: #fafafa;
					color: #333;
					font-weight: 500;
				}
				:deep(.ant-table-cell) {
					font-size: 14px;
				}
			}
		}
	}
}
</style>
