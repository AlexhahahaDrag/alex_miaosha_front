<template>
	<div class="page-info finance-manager-page">
		<!-- 1. 单行紧凑日常记账筛选栏 -->
		<finance-manager-filter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>

		<!-- 2. 轻量日常记账概览条（随过滤条件实时联动） -->
		<div class="summary-bar">
			<div class="summary-left">
				<span class="summary-tag-title">
					<CalendarOutlined class="summary-title-icon" />
					<span>{{ summaryTitle }}</span>
				</span>

				<!-- 全部 或 支出模式：展示支出 -->
				<div
					v-if="!searchInfo.incomeAndExpenses || searchInfo.incomeAndExpenses === 'expense'"
					class="summary-item expense"
				>
					<span class="label">{{ searchInfo.incomeAndExpenses === 'expense' ? '支出合计' : '总支出' }}</span>
					<span class="value">-¥{{ formatAmount(summaryData.totalExpense) }}</span>
				</div>

				<!-- 全部 或 收入模式：展示收入 -->
				<div
					v-if="!searchInfo.incomeAndExpenses || searchInfo.incomeAndExpenses === 'income'"
					class="summary-item income"
				>
					<span class="label">{{ searchInfo.incomeAndExpenses === 'income' ? '收入合计' : '总收入' }}</span>
					<span class="value">+¥{{ formatAmount(summaryData.totalIncome) }}</span>
				</div>

				<!-- 仅在全部模式下展示结余 -->
				<div
					v-if="!searchInfo.incomeAndExpenses"
					class="summary-item balance"
				>
					<span class="label">净结余</span>
					<span
						:class="[
							'value',
							(summaryData.totalBalance || 0) >= 0 ? 'text-income' : 'text-expense',
						]"
					>
						{{ (summaryData.totalBalance || 0) >= 0 ? '+' : '-' }}¥{{
							formatAmount(Math.abs(summaryData.totalBalance || 0))
						}}
					</span>
				</div>
			</div>
			<div class="summary-right">
				<span class="record-total-badge">
					共 <strong>{{ summaryData.totalCount ?? pagination.total ?? 0 }}</strong> 笔账单
				</span>
			</div>
		</div>

		<!-- 3. 操作按钮区 -->
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editFinance('add')">
					<template #icon><PlusOutlined /></template>
					记一笔
				</a-button>

				<a-popconfirm
					v-if="selectedRowIds.length"
					:title="`确认批量删除选中的 ${selectedRowIds.length} 笔账目?`"
					ok-text="确认"
					cancel-text="取消"
					@confirm="batchDelFinanceManager"
				>
					<a-button type="primary" danger>
						<template #icon><DeleteOutlined /></template>
						批量删除 ({{ selectedRowIds.length }})
					</a-button>
				</a-popconfirm>
				<a-button
					v-else
					type="primary"
					danger
					disabled
				>
					<template #icon><DeleteOutlined /></template>
					删除
				</a-button>
			</a-space>
		</div>

		<!-- 4. 账单明细表格 -->
		<div class="content" ref="tableContainerRef">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: FinanceManagerData) => record.id || ''"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content', y: tableScrollY }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<!-- 操作列：轻量链接按钮降噪 -->
					<template v-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								class="action-link-btn"
								@click="editFinance('update', record.id)"
							>
								编辑
							</a-button>
							<a-divider type="vertical" />
							<a-popconfirm
								title="确认删除该笔账目?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delFinance(record.id)"
								@cancel="cancel"
							>
								<a-button
									type="link"
									size="small"
									danger
									class="action-link-btn"
								>
									删除
								</a-button>
							</a-popconfirm>
						</a-space>
					</template>

					<!-- 金额列：等宽、红绿收支色彩区分 -->
					<template v-else-if="column.key === 'amount'">
						<span
							:class="[
								'amount-text',
								record.incomeAndExpenses === 'income'
									? 'amount-income'
									: 'amount-expense',
							]"
						>
							{{ record.incomeAndExpenses === 'income' ? '+' : '-' }}¥{{
								formatAmount(record.amount)
							}}
						</span>
					</template>

					<!-- 状态列：圆点 Badge 风格 -->
					<template v-else-if="column.key === 'isValid'">
						<a-badge
							:status="record.isValid === '1' ? 'success' : 'default'"
							:text="record.isValid === '1' ? '有效' : '失效'"
						/>
					</template>

					<!-- 收支类型列 -->
					<template v-else-if="column.key === 'incomeAndExpenses'">
						<a-tag
							:color="
								record.incomeAndExpenses === 'income' ? 'success' : 'error'
							"
							class="type-tag"
						>
							{{ record.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</a-tag>
					</template>

					<!-- 业务时间列 -->
					<template v-else-if="column.key === 'infoDate'">
						<span class="info-date-text">
							{{ record.infoDate ? formatTime(record.infoDate) : '-' }}
						</span>
					</template>

					<!-- 支付方式列：图标胶囊 -->
					<template v-else-if="column.key === 'fromSource'">
						<div class="from-source-pill">
							<component
								v-if="iconComponentMap[`finance-${record.fromSource}`]"
								:is="iconComponentMap[`finance-${record.fromSource}`]"
								class="from-source-icon"
							/>
							<span>{{ getFromSourceName(record.fromSource) }}</span>
						</div>
					</template>
				</template>
			</a-table>

			<!-- 记账 / 修改明细弹窗 -->
			<finance-manager-detail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			></finance-manager-detail>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { formatTime } from '@/utils/dayjs';
import type { ModelInfo } from '@/views/common/config';
import type { FinanceManagerData } from '@/views/finance/financeManager/config';
import {
	columns,
	fromSourceTransferList,
} from '@/views/finance/financeManager/config';
import { iconComponentMap } from '@/views/common/config';
import { formatAmount } from '@/utils/amountInfo';
import { formatDate } from '@/utils/dayjs';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
	getFinanceSummary,
	type FinanceSummaryData,
} from '@/views/finance/financeManager/api';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import dayjs from 'dayjs';
import {
	CalendarOutlined,
	PlusOutlined,
	DeleteOutlined,
	ReloadOutlined,
} from '@ant-design/icons-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const route = useRoute();

// 选中的 ID 列表（严格 string 类型）
const selectedRowIds = ref<string[]>([]);

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		selectedRowIds.value = selectedRowKeys.map(String);
	},
});

const searchInfo = ref<FinanceManagerData>({});
const loading = ref<boolean>(false);
const dataSource = ref<FinanceManagerData[]>([]);
const modelInfo = ref<ModelInfo>({});

// 服务端多维动态聚合统计
const summaryData = ref<FinanceSummaryData>({
	totalExpense: 0,
	totalIncome: 0,
	totalBalance: 0,
	totalCount: 0,
});
const summaryLoading = ref<boolean>(false);

// 统计标签标题自适应
const summaryTitle = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	if (start && end) {
		const startStr = dayjs(start).format('YYYY-MM-DD');
		const endStr = dayjs(end).format('YYYY-MM-DD');
		if (startStr === endStr) {
			return `${startStr} 账单`;
		}
		if (dayjs(start).isSame(dayjs(end), 'month')) {
			return `${dayjs(start).format('YYYY年M月')} 账单`;
		}
		return `${dayjs(start).format('M/D')} ~ ${dayjs(end).format('M/D')} 统计`;
	}
	if (start) {
		return `自 ${dayjs(start).format('YYYY-MM-DD')} 起`;
	}
	if (end) {
		return `至 ${dayjs(end).format('YYYY-MM-DD')} 止`;
	}
	return '全量账单统计';
});

// 构建规整后的查询参数（过滤空字符串并格式化日期）
const buildQueryParams = (param: FinanceManagerData): FinanceManagerData => {
	return {
		...param,
		name: param.name?.trim() || undefined,
		typeCode: param.typeCode?.trim() || undefined,
		fromSource: param.fromSource || undefined,
		incomeAndExpenses: param.incomeAndExpenses || undefined,
		belongTo: param.belongTo || undefined,
		infoDateStart: param.infoDateStart
			? formatDate(param.infoDateStart)
			: undefined,
		infoDateEnd: param.infoDateEnd
			? formatDate(param.infoDateEnd)
			: undefined,
	};
};

// 获取服务端动态多维汇总统计
const fetchSummary = async (queryParam: FinanceManagerData) => {
	summaryLoading.value = true;
	try {
		const { code, data } = await getFinanceSummary(queryParam);
		if (code === '200' && data) {
			summaryData.value = {
				totalExpense: Number(data.totalExpense) || 0,
				totalIncome: Number(data.totalIncome) || 0,
				totalBalance: Number(data.totalBalance) || 0,
				totalCount: Number(data.totalCount) || 0,
			};
		}
	} catch (e) {
		console.warn('获取多维统计失败:', e);
	} finally {
		summaryLoading.value = false;
	}
};

// 获取支付方式展示名称
const getFromSourceName = (source?: string) => {
	if (!source) return '-';
	const matched = fromSourceTransferList.find((item) => item.value === source);
	return matched ? matched.name : source;
};

const cancelQuery = () => {
	searchInfo.value = {};
	query(true);
};

// 立即查询函数（联动刷新分页与统计）
const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	const queryParam = buildQueryParams(searchInfo.value);
	getFinancePage(queryParam, pagination);
	fetchSummary(queryParam);
};

// 分页变化
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	const queryParam = buildQueryParams(searchInfo.value);
	getFinancePage(queryParam, paginationInfo);
};

// 删除账单
const delFinance = async (id?: string) => {
	if (!id) return;
	const { code, message: messageInfo } = await deleteFinanceManger(id);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		selectedRowIds.value = selectedRowIds.value.filter((i) => i !== id);
		query();
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 批量删除
const batchDelFinanceManager = () => {
	if (!selectedRowIds.value.length) {
		message.warning('请先选择要删除的账目！', 3);
		return;
	}
	delFinance(selectedRowIds.value.join(','));
};

const cancel = () => {};

// 分页获取账单数据
const getFinancePage = async (queryParam: FinanceManagerData, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getFinanceMangerPage(queryParam, cur.current, cur.pageSize);
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

// 记一笔与修改弹窗
const editFinance = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '记一笔账' : '修改账单明细';
	modelInfo.value.id = isAdd ? null : (id ?? null);
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const initPage = () => {
	resetPagination();
	pagination.pageSize = 10;
};

// 初始化页面数据
const init = () => {
	initPage();
	if (route.query.fromSource) {
		searchInfo.value.fromSource = route.query.fromSource as string;
	}
	if (route.query.typeCode) {
		searchInfo.value.typeCode = route.query.typeCode as string;
	}
	const queryParam = buildQueryParams(searchInfo.value);
	getFinancePage(queryParam, pagination);
	fetchSummary(queryParam);
};

// 表格高度自适应计算
const tableContainerRef = ref<HTMLElement | null>(null);
const tableScrollY = ref<number>(450);

const updateTableScrollY = () => {
	if (!tableContainerRef.value) return;
	const containerHeight = tableContainerRef.value.clientHeight;
	if (containerHeight > 180) {
		// 扣除表头(~50px) + 底部分页器与间距(~66px) + 容器内边距(24px) + 边框安全量(12px) ≈ 152px
		tableScrollY.value = Math.max(containerHeight - 152, 160);
	}
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
	nextTick(() => {
		updateTableScrollY();
		if (tableContainerRef.value && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				updateTableScrollY();
			});
			resizeObserver.observe(tableContainerRef.value);
		}
	});
	window.addEventListener('resize', updateTableScrollY);
});

onUnmounted(() => {
	if (resizeObserver) {
		resizeObserver.disconnect();
		resizeObserver = null;
	}
	window.removeEventListener('resize', updateTableScrollY);
});

init();
</script>

<style lang="scss" scoped>
.finance-manager-page {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 10px 10px 12px;
	box-sizing: border-box;
	overflow: hidden;
}

:deep(.search) {
	flex-shrink: 0;
	margin: 0 0 8px;
}

.summary-bar {
	flex-shrink: 0;
	background: #fff;
	padding: 10px 16px;
	border-radius: 8px;
	margin: 0 0 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12px;

	.summary-left {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 18px;
	}

	.summary-tag-title {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		color: #595959;
		background: #f5f5f5;
		padding: 4px 10px;
		border-radius: 4px;

		.summary-title-icon {
			color: #1677ff;
		}
	}

	.summary-item {
		display: inline-flex;
		align-items: baseline;
		gap: 6px;
		font-size: 13px;

		.label {
			color: #8c8c8c;
		}

		.value {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
				'Helvetica Neue', Arial, sans-serif;
			font-weight: 600;
			font-size: 15px;
			font-variant-numeric: tabular-nums;
		}

		&.expense .value {
			color: #ff4d4f;
		}

		&.income .value {
			color: #52c41a;
		}
	}

	.text-income {
		color: #52c41a !important;
	}

	.text-expense {
		color: #ff4d4f !important;
	}

	.record-total-badge {
		font-size: 13px;
		color: #8c8c8c;

		strong {
			color: #262626;
			font-weight: 600;
		}
	}
}

.button {
	flex-shrink: 0;
	margin: 0 0 8px;
}

.content {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	background: #fff;
	padding: 12px 16px;
	border-radius: 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	margin: 0;
	overflow: hidden;

	:deep(.ant-table-wrapper) {
		height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;

		.ant-spin-nested-loading {
			height: 100%;
			display: flex;
			flex-direction: column;
			min-height: 0;

			.ant-spin-container {
				height: 100%;
				display: flex;
				flex-direction: column;
				min-height: 0;

				.ant-table {
					flex: 1;
					min-height: 0;
				}

				.ant-pagination {
					flex-shrink: 0;
					margin: 12px 0 0 !important;
					padding-bottom: 2px;
				}
			}
		}
	}
}

.amount-text {
	font-weight: 600;
	font-size: 14px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
		'Helvetica Neue', Arial, sans-serif;
	font-variant-numeric: tabular-nums;

	&.amount-income {
		color: #52c41a;
	}

	&.amount-expense {
		color: #ff4d4f;
	}
}

.action-link-btn {
	padding: 0 2px;
	font-size: 13px;
}

.type-tag {
	border-radius: 4px;
	font-size: 12px;
}

.info-date-text {
	color: #595959;
	font-size: 13px;
	font-variant-numeric: tabular-nums;
}

.from-source-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 4px;
	font-size: 12px;
	color: #595959;

	.from-source-icon {
		width: 16px;
		height: 16px;
	}
}
</style>
