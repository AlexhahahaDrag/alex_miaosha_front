<template>
	<div class="page-info">
		<div class="search">
			<div class="search-box">
				<a-form
					:model="searchInfo"
					:label-col="labelCol"
					:wrapper-col="wrapperCol"
				>
					<a-row :gutter="24">
						<a-col :span="6">
							<a-form-item name="username" label="用户名">
								<a-input
									v-model:value="searchInfo.username"
									placeholder="用户名"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="status" label="状态">
								<a-select
									v-model:value="searchInfo.status"
									placeholder="请选择状态"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="statusOptions"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="orgId" label="所属机构">
								<a-select
									v-model:value="searchInfo.orgId"
									placeholder="请选择机构"
									:options="orgOptions"
									show-search
									:filter-option="filterOption"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="roleId" label="角色">
								<a-select
									v-model:value="searchInfo.roleId"
									placeholder="请选择角色"
									:options="roleOptions"
									show-search
									:filter-option="filterOption"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="24" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="query(true)"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button v-permission="'user:add'" type="primary" @click="editUser('add')">新增</a-button>
				<a-button v-permission="'user:delete'" type="primary" danger @click="batchDelUserManager">
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: any) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
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
								title="确认删除用户信息?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delUser(record.id)"
								v-if="record.username !== 'superman'"
								v-permission="'user:delete'"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'birthday'">
						<span>
							{{ formatDate(record.birthday) }}
						</span>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag
							:key="record.status"
							:color="String(record.status) === '1' ? '#87d068' : 'grey'"
						>
							{{ String(record.status) === '1' ? '有效' : '失效' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'gender'">
						<a-tag
							:key="record.gender"
							:color="record.gender === 1 ? 'green' : 'red'"
						>
							{{
								record.gender === '1' ? '男'
								: record.gender === '2' ? '女'
								: ''
							}}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'avatarUrl' && record.avatarUrl">
						<a-image
							:width="50"
							:src="record.avatarThumbnailUrl"
							:preview="{ src: record.avatarUrl }"
						/>
					</template>
				</template>
			</a-table>
			<user-manager-detail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			>
			</user-manager-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
import type { UserManagerInfo } from '@/views/user/userManager/config';
import { columns, labelCol, wrapperCol } from '@/views/user/userManager/config';
import type { OrgInfoData } from '@/views/user/orgInfo/config';
import type { RoleInfoData } from '@/views/user/roleInfo/config';
import { formatDate } from '@/utils/dayjs';
import {
	getUserManagerPage,
	deleteUserManager,
} from '@/views/user/userManager/api';
import { getOrgInfoPage } from '@/views/user/orgInfo/api';
import { getRoleInfoPage } from '@/views/user/roleInfo/api';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

interface FilterOption {
	label: string;
	value: string;
}

let rowIds: (string | number)[] = [];

// Hooks
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const { getDictByType } = useDictInfo('is_valid');

// State
const searchInfo = ref<UserManagerInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<UserManagerInfo[]>([]);
const modelInfo = ref<ModelInfo>({});
const orgOptions = ref<FilterOption[]>([]);
const roleOptions = ref<FilterOption[]>([]);
const statusOptions = computed(() => getDictByType('is_valid'));

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: UserManagerInfo,
		selected: boolean,
		selectedRows: UserManagerInfo[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: UserManagerInfo[],
		changeRows: UserManagerInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// Actions
const filterOption = (input: string, option?: FilterOption) => {
	return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
};

const cancelQuery = () => {
	searchInfo.value = {};
	triggerDebouncedQuery.cancel();
	query(true);
};

const query = (resetPage = false) => {
	triggerDebouncedQuery.cancel();
	if (resetPage) {
		resetPagination();
	}
	getUserPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getUserPage(searchInfo.value, pagination);
};

const delUser = async (ids: string) => {
	const { code, message: messageInfo } = await deleteUserManager(ids);
	if (code === '200') {
		message.success(messageInfo || '删除成功！', 3);
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 批量删除用户信息
const batchDelUserManager = () => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delUser(rowIds.join(',')),
	});
};

// 查询用户信息分页数据
const getUserPage = async (param: UserManagerInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getUserManagerPage(param, cur.current, cur.pageSize).finally(() => {
		loading.value = false;
	});
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

//新增和修改弹窗
function editUser(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增明细' : '修改明细',
		id: isAdd ? undefined : id,
		confirmLoading: true,
		open: true,
	};
}

const handleSuccess = () => {
	getUserPage(searchInfo.value, pagination);
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	pagination.current = 1;
	getUserPage(searchInfo.value, pagination);
}, 300);

const loadFilterOptions = async () => {
	const [orgRes, roleRes] = await Promise.all([
		getOrgInfoPage({ status: '1' }, 1, 1000),
		getRoleInfoPage({ status: '1' }, 1, 1000),
	]);
	const { code: orgCode, data: orgData } = orgRes;
	if (orgCode === '200') {
		orgOptions.value = (orgData?.records || []).map((o: OrgInfoData) => ({
			label: o.orgName || '',
			value: String(o.id),
		}));
	}
	const { code: roleCode, data: roleData } = roleRes;
	if (roleCode === '200') {
		roleOptions.value = (roleData?.records || []).map((r: RoleInfoData) => ({
			label: r.roleName || '',
			value: String(r.id),
		}));
	}
};

// 初始化
const init = async () => {
	initPage();
	await loadFilterOptions();
	getUserPage(searchInfo.value, pagination);
};

// Lifecycle
onMounted(() => {
	init();
});

// Watchers
watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>
<style lang="scss" scoped></style>
