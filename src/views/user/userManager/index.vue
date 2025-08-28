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
						<a-col :span="6"></a-col>
						<a-col :span="6" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="query"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editUser('add')">新增</a-button>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelUserManager"
					>删除</a-button
				>
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
				:scroll="{ x: 1400 }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editUser('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除用户信息?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delUser(record.id)"
								@cancel="cancel"
								v-if="record.username != 'superman'"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'birthday'">
						<span>
							{{
								record.birthday ? String(record.birthday).substring(0, 10) : ''
							}}
						</span>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag
							:key="record.status"
							:color="record.status == 1 ? '#87d068' : 'grey'"
						>
							{{ record.status == 1 ? '有效' : '失效' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'gender'">
						<a-tag
							:key="record.gender"
							:color="record.gender == 1 ? 'green' : 'red'"
						>
							{{
								record.gender == 0 ? '男'
								: record.gender == 1 ? '女'
								: ''
							}}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'avatarUrl' && record.avatarUrl">
						<image :src="record.avatarUrl"></image>
						<a-image :width="50" :src="record.avatarUrl" />
					</template>
				</template>
			</a-table>
			<UserManagerDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</UserManagerDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo, PageInfo } from '@/views/common/config';
import { pagination } from '@/views/common/config';
import { type SearchInfo, columns, type DataItem } from './userManager';
import type { DictInfo } from '@/views/finance/dict/dict';
import { getUserManagerPage, deleteUserManager } from '@/api/user/userManager';
import { getDictList } from '@/api/finance/dict/dictManager';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

let rowIds: (string | number)[] = [];
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
const fromSourceList = ref<DictInfo[]>([]);
const incomeAndExpensesList = ref<DictInfo[]>([]);
let searchInfo = ref<SearchInfo>({});
let loading = ref<boolean>(false);
let dataSource = ref();
let visible = ref<boolean>(false);
let modelInfo = ref<ModelInfo>({});

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: DataItem[],
		changeRows: DataItem[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

function cancelQuery() {
	searchInfo.value = {};
	triggerDebouncedQuery.cancel();
	pagination.value.current = 1;
	getUserPage(searchInfo.value, pagination.value);
}

function query() {
	triggerDebouncedQuery.cancel();
	getUserPage(searchInfo.value, pagination.value);
}

function handleTableChange(paginationInfo: PageInfo) {
	getUserPage(searchInfo.value, paginationInfo);
}

function delUser(ids: string) {
	deleteUserManager(ids).then((res: any) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			if (
				(pagination.value.total ? pagination.value.total - 1 : 0) <=
				(pagination.value.current ? pagination.value.current - 1 : 1) *
					(pagination.value.pageSize || 10)
			) {
				pagination.value.current = (pagination.value?.current || 2) - 1;
			}
			getUserPage(searchInfo.value, pagination.value);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelUserManager() {
	let ids = '';
	if (rowIds && rowIds.length > 0) {
		rowIds.forEach((item: string) => {
			ids += item + ',';
		});
		ids = ids.substring(0, ids.length - 1);
	} else {
		message.warning('请先选择数据！', 3);
		return;
	}
	delUser(ids);
}

const cancel = (e: MouseEvent) => {
	console.log(e);
};

function getUserPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getUserManagerPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data.records;
				pagination.value.current = res.data.current;
				pagination.value.pageSize = res.data.size;
				pagination.value.total = res.data.total;
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		})
		.catch((error: any) => {
			pagination.value.current = 0;
			pagination.value.pageSize = 10;
			pagination.value.total = 0;
			message.warn(error?.message || '查询列表失败！');
		})
		.finally(() => {
			loading.value = false;
		});
}

function getDictInfoList() {
	loading.value = true;
	getDictList('pay_way,income_expense_type').then((res) => {
		if (res.code == '200') {
			fromSourceList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'pay_way',
			);
			incomeAndExpensesList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'income_expense_type',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
}

function init() {
	//获取字典列表
	getDictInfoList();
	//获取财务管理页面数据
	getUserPage(searchInfo.value, pagination.value);
}

//新增和修改弹窗
function editUser(type: string, id?: number) {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = null;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
}

const handleOk = (v: boolean) => {
	visible.value = v;
	getUserPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const initPage = () => {
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

//初始化
init();

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	pagination.value.current = 1;
	getUserPage(searchInfo.value, pagination.value);
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
