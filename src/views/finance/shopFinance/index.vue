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
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleAmountFrom'].name"
								:label="labelMap['saleAmountFrom'].label"
							>
								<a-input-number
									v-model:value="searchInfo.saleAmountFrom"
									:placeholder="'请填写' + labelMap['saleAmountFrom'].label"
									:formatter="(value) => `${value}`"
									class="full-width"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleAmountEnd'].name"
								:label="labelMap['saleAmountEnd'].label"
							>
								<a-input-number
									v-model:value="searchInfo.saleAmountEnd"
									:placeholder="'请填写' + labelMap['saleAmountEnd'].label"
									:formatter="(value) => `${value}`"
									class="full-width"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleDateFrom'].name"
								:label="labelMap['saleDateFrom'].label"
							>
								<a-date-picker
									v-model:value="saleDateFrom"
									@change="query(true)"
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleDateEnd'].name"
								:label="labelMap['saleDateEnd'].label"
							>
								<a-date-picker v-model:value="saleDateEnd" @change="initPage" />
							</a-form-item>
						</a-col>
						<a-col :span="20" class="actions-col">
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
				<a-button type="primary" @click="editShopFinance('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelShopFinance">
					删除
				</a-button>
			</a-space>
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
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editShopFinance('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopFinance(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'saleAmount'">
						<span>
							{{ formatAmount(record.saleAmount) }}
						</span>
					</template>
					<template v-else-if="column.key === 'isValid'">
						<a-tag
							:key="record.isValid"
							:color="record.isValid === 1 ? '#87d068' : 'grey'"
						>
							{{ record.isValid === 1 ? '有效' : '失效' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'incomeAndExpenses'">
						<a-tag
							:key="record.incomeAndExpenses"
							:color="record.incomeAndExpenses === 'income' ? 'green' : 'red'"
						>
							{{ record.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'saleDate'">
						<span>
							{{ formatTime(record.saleDate) }}
						</span>
					</template>
					<template v-else-if="column.key === 'payWay'">
						<div
							v-for="(fromSource, index) in fromSourceTransferList"
							:key="index"
						>
							<MySvgIcon
								v-if="
									record.payWay.indexOf(fromSource.value) >= 0 &&
									fromSource.value !== ''
								"
								:name="fromSource.label"
								class="pay-way-icon"
							></MySvgIcon>
						</div>
					</template>
				</template>
			</a-table>
			<ShopFinanceDetail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			></ShopFinanceDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import type { ModelInfo } from '@/views/common/config';
import { formatAmount } from '@/utils/amountInfo';
import { usePagination } from '@/composables/usePagination';
import type { ShopFinanceData } from '@/views/finance/shopFinance/config';
import {
	columns,
	fromSourceTransferList,
} from '@/views/finance/shopFinance/config';
import { formatTime, formatDate } from '@/utils/dayjs';
import {
	getShopFinancePage,
	deleteShopFinance,
} from '@/views/finance/shopFinance/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { Dayjs } from 'dayjs';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const selectedRowIds = ref<(string | number)[]>([]);

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		selectedRowIds.value = selectedRowKeys;
	},
});

const labelMap: Record<string, { name: string; label: string }> = {
	shopName: { name: 'shopName', label: '商品名称' },
	shopCode: { name: 'shopCode', label: '商品编码' },
	saleAmount: { name: 'saleAmount', label: '售价' },
	saleAmountFrom: { name: 'saleAmountFrom', label: '售价从' },
	saleAmountEnd: { name: 'saleAmountEnd', label: '售价到' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleDate: { name: 'saleDate', label: '销售日期' },
	saleDateFrom: { name: 'saleDateFrom', label: '销售日期从' },
	saleDateEnd: { name: 'saleDateEnd', label: '销售日期到' },
};

const searchInfo = ref<ShopFinanceData>({});
const saleDateFrom = ref<string | Dayjs>();
const saleDateEnd = ref<string | Dayjs>();
const loading = ref<boolean>(false);
const dataSource = ref<ShopFinanceData[]>([]);
const modelInfo = ref<ModelInfo>({});

const cancelQuery = () => {
	searchInfo.value = {};
	saleDateFrom.value = undefined;
	saleDateEnd.value = undefined;
	query(true);
};

const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	searchInfo.value.saleDateFrom =
		saleDateFrom.value ? formatDate(saleDateFrom.value) : null;
	searchInfo.value.saleDateEnd =
		saleDateEnd.value ? formatDate(saleDateEnd.value) : null;
	getShopFinanceListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getShopFinanceListPage(searchInfo.value, paginationInfo);
};

const delShopFinance = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopFinance(ids);
	if (code === '200') {
		message.success('删除' + messageInfo || '删除成功！', 3);
		selectedRowIds.value = [];
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopFinance = (): void => {
	if (!selectedRowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopFinance(selectedRowIds.value.join(','));
};

const cancel = () => {};

const getShopFinanceListPage = async (
	param: ShopFinanceData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getShopFinancePage(param, cur.current, cur.pageSize).finally(() => {
		loading.value = false;
	});
	if (code === '200') {
		dataSource.value = (data?.records || []) as ShopFinanceData[];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

// 初始化页面数据
const init = () => {
	//获取商店财务表页面数据
	getShopFinanceListPage(searchInfo.value, pagination);
};

//新增和修改弹窗
const editShopFinance = (type: string, id?: string) => {
	if (type === 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = null;
	} else if (type === 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id ?? null;
	}
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const handleSuccess = () => {
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

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.button {
	padding-left: 10px;
}

.full-width {
	width: 100%;
}

.actions-col {
	text-align: right;
}

.pay-way-icon {
	width: 1.5em;
	height: 1.5em;
	font-size: 18px;
	cursor: pointer;
	vertical-align: middle;
}
</style>
