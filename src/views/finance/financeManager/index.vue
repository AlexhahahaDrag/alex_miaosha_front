<template>
	<div class="page-info">
		<FinanceManagerFilter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editFinance('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelFinanceManager"
					>删除</a-button
				>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: DataItem) => record.id || 0"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editFinance('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delFinance(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'amount'">
						<span>
							{{ formatAmount(record.amount) }}
						</span>
					</template>
					<template v-else-if="column.key === 'isValid'">
						<a-tag
							:key="record.isValid"
							:color="record.isValid == 1 ? '#87d068' : 'grey'"
						>
							{{ record.isValid == 1 ? '有效' : '失效' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'incomeAndExpenses'">
						<a-tag
							:key="record.incomeAndExpenses"
							:color="record.incomeAndExpenses == 'income' ? 'green' : 'red'"
						>
							{{ record.incomeAndExpenses == 'income' ? '收入' : '支出' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'infoDate'">
						<span>
							{{ record.infoDate ? formatTime(record.infoDate) : '' }}
						</span>
					</template>
					<template v-else-if="column.key === 'fromSource'">
						<div
							v-for="(fromSource, index) in fromSourceTransferList"
							:key="index"
						>
							<MySvgIcon
								v-if="
									record.fromSource.indexOf(fromSource.value) >= 0 &&
									fromSource.value != ''
								"
								:name="fromSource.label"
								class="svg"
								style="
									width: 1.5em;
									height: 1.5em;
									font-size: 18px;
									cursor: pointer;
									vertical-align: middle;
								"
							></MySvgIcon>
						</div>
					</template>
				</template>
			</a-table>
			<FinanceManagerDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			/>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { formatTime } from '@/utils/dayjs';
import type { ModelInfo, PageInfo } from '@/views/common/config';
import { pagination, formatAmount } from '@/views/common/config';
import type { SearchInfo, DataItem } from './config';
import { columns, fromSourceTransferList } from './config';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
} from '@/api/finance/financeManager';

let rowIds: (string | number)[] = [];

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

let searchInfo = ref<SearchInfo>({});

let loading = ref<boolean>(false);

let dataSource = ref<DataItem[]>([]);

// 查看详情弹窗
let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

const cancelQuery = () => {
	searchInfo.value = {};
	query();
};

const query = () => {
	getFinancePage(searchInfo.value, pagination.value);
};

// 获取分页数据
const handleTableChange = (pagination: PageInfo) => {
	getFinancePage(searchInfo.value, pagination);
};

// 删除
const delFinance = async (ids: string) => {
	const { code, message: messageInfo } = await deleteFinanceManger(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getFinancePage(searchInfo.value, pagination.value);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

//批量删除
const batchDelFinanceManager = () => {
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
	delFinance(ids);
};

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getFinancePage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getFinanceMangerPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		dataSource.value = data.records;
		pagination.value.current = data.current;
		pagination.value.pageSize = data.size;
		pagination.value.total = data.total;
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

//新增和修改弹窗
const editFinance = (type: string, id?: number) => {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
};

const handleOk = (v: boolean) => {
	visible.value = v;
	getFinancePage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const initPage = () => {
	pagination.value.current = 1;
	pagination.value.pageSize = 10;
};

function init() {
	initPage();
	//获取财务管理页面数据
	getFinancePage(searchInfo.value, pagination.value);
}

init();

watch(
	() => [searchInfo.value],
	() => {
		console.log(`searchInfo.value:`, searchInfo.value);
		getFinancePage(searchInfo.value, pagination.value);
	},
	{
		deep: true,
		immediate: true,
	},
);
</script>
<style lang="scss" scoped></style>
