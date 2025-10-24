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
							<a-form-item name="name" label="名称">
								<a-input
									v-model:value="searchInfo.name"
									placeholder="名称"
									@change="initPage"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="account" label="账号">
								<a-select
									ref="select"
									v-model:value="searchInfo.account"
									placeholder="请选择账号"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="accountList"
									@change="initPage"
									:allowClear="true"
								></a-select>
							</a-form-item>
						</a-col>
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
				<a-button type="primary" @click="editAccountRecordInfo('add')"
					>新增</a-button
				>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelAccountRecordInfo"
					>删除</a-button
				>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:rowKey="(record: any) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:rowSelection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editAccountRecordInfo('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delAccountRecordInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'amount'">
						<span>
							{{ formatAmount(record?.amount) }}
						</span>
					</template>
					<template v-else-if="column.key === 'isSend'">
						<a-tag
							:key="record.isSend"
							:color="record.isSend == 1 ? 'grey' : '#87d068'"
						>
							{{ record.isSend == 1 ? '是' : '否' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'avliDate'">
						<span>
							{{ formatDate(record.avliDate) }}
						</span>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag
							:key="record.status"
							:color="
								record.status == 0 ? '#C0C0C0'
								: record.status == 1 ? '#f50'
								: '#87d068'
							"
						>
							{{
								record.status == 0 ? '过期'
								: record.status == 1 ? '待过期'
								: '有效'
							}}
						</a-tag>
					</template>
				</template>
			</a-table>
		</div>
		<account-record-info-detail
			ref="editInfo"
			:open="modelInfo.open"
			:modelInfo="modelInfo"
			@handleOk="handleOk"
			@handleCancel="handleCancel"
		>
		</account-record-info-detail>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import type { AccountRecordInfo } from './config';
import { formatAmount } from '@/utils/amountInfo';
import { columns, labelCol, wrapperCol } from './config';
import {
	getAccountRecordInfoPage,
	deleteAccountRecordInfo,
} from '@/views/finance/accountRecordInfo/api';
import { message } from 'ant-design-vue';
import { usePagination } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
import { formatDate } from '@/utils/dayjs';

const { getDictByType } = useDictInfo('account_type');

const accountList = computed(() => getDictByType('account_type'));

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

let rowIds: (string | number)[] = [];

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: AccountRecordInfo,
		selected: boolean,
		selectedRows: AccountRecordInfo[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: AccountRecordInfo[],
		changeRows: AccountRecordInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 搜索条件
let searchInfo = ref<AccountRecordInfo>({});

let loading = ref<boolean>(false);

let dataSource = ref<AccountRecordInfo[]>([]);

let modelInfo = ref<ModelInfo>({});

// 查询
const query = () => {
	getAccountRecordInfoListPage(searchInfo.value, pagination);
};

//清空查询条件
const cancelQuery = () => {
	searchInfo.value = {};
	searchInfo.value.infoDateStart = undefined;
	searchInfo.value.infoDateEnd = undefined;
};

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getAccountRecordInfoListPage(searchInfo.value, pagination);
}

//删除
const delAccountRecordInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteAccountRecordInfo(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getAccountRecordInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

//批量删除
const batchDelAccountRecordInfo = () => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delAccountRecordInfo(rowIds.join(','));
};

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getAccountRecordInfoListPage = async (
	param: AccountRecordInfo,
	cur: PageInfo,
) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getAccountRecordInfoPage(param, cur.current, cur.pageSize);
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

//新增和修改弹窗
const editAccountRecordInfo = (type: string, id?: number) => {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value = { ...modelInfo.value, confirmLoading: true, open: true };
};

const handleOk = (v: boolean) => {
	modelInfo.value.open = v;
	getAccountRecordInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	modelInfo.value.open = v;
};

// 初始化页面数据
const init = () => {
	modelInfo.value = { open: false, confirmLoading: false };
	initPage();
	//获取页面数据
	getAccountRecordInfoListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
