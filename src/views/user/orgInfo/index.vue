<template>
	<div class="page-info">
		<div class="left-content">
			<div class="tree-title">组织架构</div>
			<a-tree
				:tree-data="treeData"
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
				<div class="search">
					<a-form :model="searchInfo" layout="inline" class="search-form">
						<a-form-item name="username" label="用户名：">
							<a-input
								v-model:value="searchInfo.username"
								placeholder="请填写用户名"
								allow-clear
							/>
						</a-form-item>
						<a-form-item name="nickName" label="昵称：">
							<a-input
								v-model:value="searchInfo.nickName"
								placeholder="请填写昵称"
								allow-clear
							/>
						</a-form-item>
						<a-form-item>
							<a-space>
								<a-button type="primary" @click="query">查找</a-button>
								<a-button @click="cancelQuery">清空</a-button>
							</a-space>
						</a-form-item>
					</a-form>
				</div>
				<a-divider style="margin: 16px 0" />
				<div class="button-group">
					<a-space>
						<a-button type="primary" @click="editOrgInfo('add')">
							<template #icon><plus-outlined /></template>
							新增
						</a-button>
						<a-button
							type="primary"
							@click="editOrgInfo('update', Number(selectedKeys[0]))"
							:disabled="!selectedKeys.length"
						>
							<template #icon><edit-outlined /></template>
							编辑
						</a-button>
						<a-popconfirm
							title="确认删除选中的机构?"
							ok-text="确认"
							cancel-text="取消"
							@confirm="delOrgInfo(selectedKeys.join(','))"
							:disabled="!selectedKeys.length"
						>
							<a-button type="primary" danger :disabled="!selectedKeys.length">
								<template #icon><delete-outlined /></template>
								删除
							</a-button>
						</a-popconfirm>
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
					class="custom-table"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'birthday'">
							<span>
								{{ formatDate(record.birthday) }}
							</span>
						</template>
						<template v-else-if="column.key === 'status'">
							<a-tag
								:key="record.status"
								:style="{
									backgroundColor: record.status == 1 ? '#f6ffed' : '#f5f5f5',
									color: record.status == 1 ? '#52c41a' : '#00000040',
									borderColor: record.status == 1 ? '#b7eb8f' : '#d9d9d9',
								}"
							>
								{{ record.status == 1 ? '有效' : '失效' }}
							</a-tag>
						</template>
						<template v-else-if="column.key === 'gender'">
							<a-tag
								:key="record.gender"
								:style="
									record.gender == '1' ?
										{
											backgroundColor: '#e6f7ff',
											color: '#1890ff',
											border: 'none',
										}
									: record.gender == '2' ?
										{
											backgroundColor: '#fff0f6',
											color: '#eb2f96',
											border: 'none',
											padding: '0 8px',
											borderRadius: '10px',
										}
									:	{}
								"
							>
								{{
									record.gender == '1' ? '男'
									: record.gender == '2' ? '女'
									: ''
								}}
							</a-tag>
						</template>
						<template
							v-else-if="column.key === 'avatarUrl' && record.avatarUrl"
						>
							<a-image
								:width="50"
								:src="record.avatarThumbnailUrl"
								:preview="{ src: record.avatarUrl }"
							/>
						</template>
						<template v-else-if="column.key === 'occupation'">
							<span>{{ record.occupation || '-' }}</span>
						</template>
						<template v-else-if="column.key === 'operation'">
							<a-button type="link" size="small" style="padding: 0">
								查看
							</a-button>
						</template>
					</template>
				</a-table>
			</div>
			<org-info-detail
				ref="editInfo"
				v-model:open="visible"
				:modelInfo="modelInfo"
				@success="handleSuccess"
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
import { formatDate } from '@/utils/dayjs';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { getOrgInfoPage, deleteOrgInfo } from '@/views/user/orgInfo/api';
import { getUserManagerPage } from '@/views/user/userManager/api';
import { message } from 'ant-design-vue';
import type { TreeDataItem } from 'ant-design-vue/es/tree';
import OrgInfoDetail from './orgInfoDetail/index.vue';

const treeData = ref<TreeDataItem[]>([]);

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
watch(expandedKeys, () => {
	console.log('expandedKeys', expandedKeys);
});
watch(selectedKeys, () => {
	console.log('selectedKeys', selectedKeys);
});
watch(checkedKeys, () => {
	console.log('checkedKeys', checkedKeys);
});

// Unused layout variables removed

let searchInfo = ref<UserManagerInfo>({});
const currentOrgCode = ref<string | undefined>(undefined);

function cancelQuery() {
	searchInfo.value = {};
	searchInfo.value.orgCode = currentOrgCode.value;
	query();
}

function query() {
	getUserDataPage();
}

function handleTableChange(paginationInfo: PageInfo) {
	paginationChange(paginationInfo);
	getUserDataPage();
}

function delOrgInfo(ids: string) {
	if (!ids) {
		message.warning('请选择要删除的机构');
		return;
	}
	deleteOrgInfo(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getOrgTreeData();
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function onTreeSelect(keys: any[], info: any) {
	if (keys.length > 0) {
		currentOrgCode.value = info.node.orgCode;
	} else {
		currentOrgCode.value = undefined;
	}
	searchInfo.value.orgCode = currentOrgCode.value;
	// reset pagination
	pagination.current = 1;
	getUserDataPage();
}

let loading = ref<boolean>(false);

let dataSource = ref<UserManagerInfo[]>([]);

const getUserDataPage = async () => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getUserManagerPage(
		searchInfo.value,
		pagination.current,
		pagination.pageSize,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const buildTree = (
	data: any[],
	parentId: string | number | null = null,
): any[] => {
	const list: any[] = [];
	data.forEach((item) => {
		const itemParentIdStr = item.parentId ? String(item.parentId) : null;
		const parentIdStr = parentId ? String(parentId) : null;
		if (
			itemParentIdStr == parentIdStr ||
			(parentIdStr == null && !itemParentIdStr) ||
			(parentIdStr == '0' && !itemParentIdStr)
		) {
			const children = buildTree(data, item.id);
			if (children.length > 0) {
				item.children = children;
			}
			list.push(item);
		}
	});
	return list;
};

const getOrgTreeData = async () => {
	// Fetch arbitrarily large number for generating tree
	const { code, data } = await getOrgInfoPage({}, 1, 1000);
	if (code == '200' && data && data.records) {
		const rawRecords = data.records;
		// Some root nodes might have parentId '0' or null
		const rootNodes = rawRecords.filter(
			(r: any) => !r.parentId || String(r.parentId) === '0',
		);

		let tree: TreeDataItem[] = [];
		if (rootNodes.length > 0) {
			rootNodes.forEach((root) => {
				const children = buildTree(rawRecords, root.id);
				if (children.length > 0) {
					root.children = children;
				}
				tree.push(root);
			});
		}
		treeData.value = tree;
		if (tree.length > 0 && !selectedKeys.value.length) {
			// expandedKeys.value = [tree[0].orgCode];
		}
	}
};

const init = async () => {
	//获取机构表页面数据并生成树
	getOrgTreeData();
	// 取用户数据
	getUserDataPage();
};

init();

const visible = ref<boolean>(false);
const modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editOrgInfo(type: string, id?: number) {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id ? String(id) : undefined;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
}

const handleSuccess = () => {
	getOrgTreeData();
};
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
