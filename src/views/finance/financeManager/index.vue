<template>
	<div class="page-info">
		<finance-manager-filter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editFinance('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelFinanceManager"
					>删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: FinanceManagerData) => record.id || 0"
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
							>
								编辑
							</a-button>
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
			<finance-manager-detail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></finance-manager-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { formatTime } from '@/utils/dayjs';
import type { ModelInfo } from '@/views/common/config';
import { formatAmount } from '@/utils/amountInfo';
import type { FinanceManagerData } from './config';
import type { SearchInfo } from './finance-manager-filter/config';
import { columns, fromSourceTransferList } from './config';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
} from '@/views/finance/financeManager/api';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { formatDate } from '@/utils/dayjs';

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
		record: FinanceManagerData,
		selected: boolean,
		selectedRows: FinanceManagerData[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: FinanceManagerData[],
		changeRows: FinanceManagerData[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

let searchInfo = ref<SearchInfo>({});

let loading = ref<boolean>(false);

let dataSource = ref<FinanceManagerData[]>([]);

// 查看详情弹窗
let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

const cancelQuery = () => {
	searchInfo.value = {};
	query();
};

// 立即查询函数（用于按钮点击等需要立即响应的场景）
const query = () => {
	getFinancePage(searchInfo.value, pagination);
};

// 获取分页数据
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getFinancePage(searchInfo.value, paginationInfo);
};

// 删除
const delFinance = async (ids: string) => {
	const { code, message: messageInfo } = await deleteFinanceManger(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getFinancePage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

//批量删除
const batchDelFinanceManager = () => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delFinance(rowIds.join(','));
};

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getFinancePage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	let queryParam = {
		...param,
		infoDateStart: param.infoDateStart ? formatDate(param.infoDateStart) : null,
		infoDateEnd: param.infoDateEnd ? formatDate(param.infoDateEnd) : null,
	} as FinanceManagerData;
	const {
		code,
		data,
		message: messageInfo,
	} = await getFinanceMangerPage(queryParam, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		let curData = data;
		dataSource.value = curData?.records || [];
		pagination.current = curData?.current || 1;
		pagination.pageSize = curData?.size || 10;
		setTotal(curData?.total || 0);
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
	getFinancePage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

// 初始化页面数据
const init = () => {
	initPage();
	//获取财务管理页面数据
	getFinancePage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
