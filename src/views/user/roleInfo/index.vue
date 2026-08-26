<template>
	<div class="page-info">
		<a-tag
			color="blue"
			data-testid="rbac-data-scope-hint"
			style="margin-bottom: 12px"
		>
			{{ scopeHintText }}
		</a-tag>
		<div class="search">
			<div class="search-box">
				<a-form
					:model="searchInfo"
					:label-col="labelCol"
					:wrapper-col="wrapperCol"
				>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['roleCode'].name"
								:label="labelMap['roleCode'].label"
							>
								<a-input
									v-model:value="searchInfo.roleCode"
									:placeholder="'请填写' + labelMap['roleCode'].label"
									data-testid="rbac-role-search-rolecode"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['roleName'].name"
								:label="labelMap['roleName'].label"
							>
								<a-input
									v-model:value="searchInfo.roleName"
									:placeholder="'请填写' + labelMap['roleName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col style="text-align: right">
							<a-space>
								<a-button
									type="primary"
									data-testid="rbac-role-btn-query"
									@click="() => query(true)"
								>
									查找
								</a-button>
								<a-button
									type="primary"
									data-testid="rbac-role-btn-reset"
									@click="cancelQuery"
								>
									清空
								</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button
					v-permission="'role:add'"
					type="primary"
					data-testid="rbac-role-btn-add"
					@click="editRoleInfo('add')"
				>
					新增
				</a-button>
				<a-button
					v-permission="'role:delete'"
					type="primary"
					danger
					data-testid="rbac-role-btn-batch-delete"
					@click="batchDelRoleInfo"
				>
					删除
				</a-button>
				<a-button
					data-testid="rbac-role-btn-goto-relation"
					@click="router.push('/user/role-user-info')"
				>
					角色-用户关系配置
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: RoleInfoData) => record.id || 0"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content', y: 520 }"
				:row-selection="rowSelection"
				data-testid="rbac-role-table"
			>
				<template #emptyText>
					<a-empty
						description="当前机构范围内暂无角色。可新建并绑定机构，或请超管将角色绑定到本机构。"
					/>
				</template>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								v-permission="'role:edit'"
								type="primary"
								size="small"
								data-testid="rbac-role-row-edit"
								@click="editRoleInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-button
								v-permission="'role:auth'"
								type="primary"
								size="small"
								data-testid="rbac-role-row-authorize"
								@click="roleAuthorizationInfo(String(record.id))"
							>
								授权
							</a-button>
							<a-button
								v-permission="'role:auth'"
								type="primary"
								size="small"
								data-testid="rbac-role-row-users"
								@click="roleUserAssignmentInfo(String(record.id))"
							>
								用户
							</a-button>
							<a-popconfirm
								v-permission="'role:delete'"
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delRoleInfo(record.id)"
								@cancel="cancel"
							>
								<a-button
									type="primary"
									size="small"
									danger
									data-testid="rbac-role-row-delete"
								>
									删除
								</a-button>
							</a-popconfirm>
						</a-space>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag
							:key="record.status"
							:color="record.status === '1' ? '#87d068' : 'grey'"
						>
							{{ record.status === '1' ? '有效' : '失效' }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<role-info-detail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			></role-info-detail>
			<authorization-detail
				v-model:modelInfo="authModelInfo"
				@success="() => query()"
			></authorization-detail>
			<user-assignment-detail
				v-model:modelInfo="userAssignModelInfo"
				@success="() => query()"
			></user-assignment-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	columns,
	type RoleInfoData,
	labelMap,
} from '@/views/user/roleInfo/config';
import { getRoleInfoPage, deleteRoleInfo } from '@/views/user/roleInfo/api';
import { useDataScopeHint } from '@/composables/useDataScopeHint';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import UserAssignmentDetail from './userAssignmentDetail/index.vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const router = useRouter();
const { scopeHintText } = useDataScopeHint();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const rowIds = ref<(string | number)[]>([]);

let searchInfo = ref<RoleInfoData>({});

let loading = ref<boolean>(false);

let dataSource = ref<RoleInfoData[]>([]);

const modelInfo = ref<ModelInfo>({});
const authModelInfo = ref<ModelInfo>({});
const userAssignModelInfo = ref<ModelInfo>({});

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
	onSelect: (
		record: RoleInfoData,
		selected: boolean,
		selectedRows: RoleInfoData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: RoleInfoData[],
		changeRows: RoleInfoData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 清空查询条件
const cancelQuery = () => {
	searchInfo.value = {};
	query(true);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getRoleInfoListPage(searchInfo.value, pagination);
};

const delRoleInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteRoleInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		// 刷新列表
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelRoleInfo = (): void => {
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
		onOk: () => delRoleInfo(rowIds.value.join(',')),
	});
};

const cancel = (e: MouseEvent) => {
	console.log(e);
};

//新增和修改弹窗
const editRoleInfo = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? undefined : id ?? undefined;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

// 移除冗余的 handleSuccess 函数

const roleAuthorizationInfo = (id: string) => {
	authModelInfo.value.open = true;
	authModelInfo.value.id = id;
	authModelInfo.value.title = '角色权限配置';
};

const roleUserAssignmentInfo = (id: string) => {
	userAssignModelInfo.value.open = true;
	userAssignModelInfo.value.id = id;
	userAssignModelInfo.value.title = '角色用户分配';
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
			dataSource.value = data?.records || [];
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

// 初始化页面数据
const init = () => {
	authModelInfo.value = { open: false };
	//获取角色信息表页面数据
	getRoleInfoListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
});

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
</script>
<style lang="scss" scoped></style>
