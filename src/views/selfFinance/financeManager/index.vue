<template>
	<div class="finance-manager-screen finance-manager-page">
		<!-- 1. 单行紧凑日常记账筛选栏 -->
		<finance-manager-filter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>

		<!-- 2. 一体化概览面板（子组件） -->
		<finance-overview-card
			:is-first-summary-loaded="isFirstSummaryLoaded"
			:is-first-budget-loaded="isFirstBudgetLoaded"
			:summary-title="summaryTitle"
			:summary-data="summaryData"
			:search-info="searchInfo"
			:pagination-total="pagination.total"
			:effective-days-info="effectiveDaysInfo"
			:daily-expense-avg="dailyExpenseAvg"
			:top-expense-categories="topExpenseCategories"
			:current-month-str="currentMonthStr"
			:budget-status="budgetStatus"
			:budget-spent-label="budgetSpentLabel"
			:budget-direction-label="budgetDirectionLabel"
			:progress-stroke-color="progressStrokeColor"
			:budget-daily-guide="budgetDailyGuide"
			@filter-category="filterByCategory"
			@open-budget-modal="openBudgetModal"
			@drill-down-budget-month="drillDownBudgetMonth"
			@drill-down-category="drillDownCategory"
		/>

		<!-- 联动筛选指示栏 -->
		<div v-if="activeLinkageFilter" class="linkage-active-banner">
			<div class="banner-content">
				<span class="banner-dot"></span>
				<span class="banner-text">
					已联动过滤：<strong>{{ activeLinkageFilter.label }}</strong>
				</span>
			</div>
			<a-button
				type="link"
				size="small"
				class="banner-close-btn"
				@click="clearLinkageFilter"
			>
				清除联动，查看全量
			</a-button>
		</div>

		<!-- 3. 账单明细表格卡片（内聚操作按钮栏） -->
		<div class="table-card-shell" ref="tableContainerRef">
			<finance-manager-table
				:data-source="dataSource"
				:columns="columns"
				:loading="loading"
				:table-scroll-y="tableScrollY"
				:row-selection="rowSelection"
				:selected-row-ids="selectedRowIds"
				:pagination="pagination"
				:can-edit-record="canEditRecord"
				:can-delete-record="canDeleteRecord"
				:get-category-pill-style="getCategoryPillStyle"
				:format-amount="formatAmount"
				:get-from-source-name="getFromSourceName"
				@edit="editFinance"
				@delete="delFinance"
				@batch-delete="batchDelFinanceManager"
				@clear-selected="clearSelected"
				@filter-category="filterByCategory"
				@table-change="handleTableChange"
				@page-change="onFooterPageChange"
				@size-change="onFooterSizeChange"
			>
				<template #headerActions>
					<a-space :size="8">
						<template v-if="hasPermission('finance:financeManager:delete')">
							<a-popconfirm
								v-if="selectedRowIds.length"
								:title="`确认批量删除选中的 ${selectedRowIds.length} 笔账目?`"
								ok-text="确认"
								cancel-text="取消"
								@confirm="batchDelFinanceManager"
							>
								<a-button danger size="small" class="header-batch-del-btn">
									<template #icon><DeleteOutlined /></template>
									批量删除 ({{ selectedRowIds.length }})
								</a-button>
							</a-popconfirm>
						</template>
						<a-button
							v-if="hasPermission('finance:financeManager:add')"
							type="dashed"
							data-testid="btn-finance-ai-parse"
							@click="openAiModal"
						>
							<template #icon><ThunderboltOutlined /></template>
							智能记账
						</a-button>
						<a-button
							v-if="hasPermission('finance:financeManager:add')"
							type="primary"
							class="primary-record-btn"
							data-testid="btn-add-finance"
							@click="editFinance('add')"
						>
							<template #icon><PlusOutlined /></template>
							记一笔
						</a-button>
					</a-space>
				</template>
			</finance-manager-table>
		</div>

		<!-- AI 智能记账弹窗 -->
		<FinanceAiParseModal
			v-model:visible="aiModalVisible"
			:default-belong-to="searchInfo.belongTo"
			@apply="onApplyAiFromList"
		/>

		<!-- 记账 / 修改明细抽屉 -->
		<finance-manager-detail
			v-model:modelInfo="modelInfo"
			@success="() => query()"
		></finance-manager-detail>

		<!-- 调整零花钱预算弹窗 (自闭环子组件) -->
		<finance-budget-modal
			v-model:open="budgetModalVisible"
			:current-month="currentMonthStr"
			:budget-status="budgetStatus"
			:belong-to="getEffectiveBudgetBelongTo()"
			@success="loadBudgetStatus"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	formatDate,
	getMonthRangeDayjs,
} from '@/utils/dayjs';
import type { ModelInfo } from '@/types/modal';
import FinanceOverviewCard from '@/views/selfFinance/financeManager/components/FinanceOverviewCard.vue';
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';
import { useFinanceSummary } from './composables/useFinanceSummary';
import {
	columns,
	fromSourceTransferList,
} from '@/views/selfFinance/financeManager/config';
import { formatAmount } from '@/utils/amountInfo';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
	getFinanceSummary,
	type FinanceSummaryData,
} from '@/views/selfFinance/financeManager/api';
import {
	PlusOutlined,
	DeleteOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons-vue';
import FinanceAiParseModal from '@/views/selfFinance/financeManager/components/FinanceAiParseModal.vue';
import type { UniversalFinanceAiParseVo } from '@/views/selfFinance/financeManager/config';
import {
	usePagination,
	useRowSelection,
	calculateAdaptivePageSize,
} from '@/composables/usePagination';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import FinanceBudgetModal from '@/views/selfFinance/financeManager/finance-budget-modal/index.vue';

const userStore = useUserStore();
const { hasPermission, isSuperAdmin } = usePermission();

const isFamilyAdminOrSuper = computed(() => {
	if (isSuperAdmin.value) return true;
	const roleCode = userStore.getRoleInfo?.roleCode || '';
	if (roleCode === 'admin' || roleCode === 'family_admin') return true;
	const roleList = userStore.getPermissionContext?.roleList || [];
	return roleList.some(
		(r) => r.roleCode === 'admin' || r.roleCode === 'family_admin',
	);
});

const canEditRecord = (record: FinanceManagerData) => {
	if (!hasPermission('finance:financeManager:edit')) {
		return false;
	}
	if (isFamilyAdminOrSuper.value) {
		return true;
	}
	const myId = userStore.getUserInfo?.id;
	return (
		myId !== undefined &&
		record.belongTo !== undefined &&
		String(record.belongTo) === String(myId)
	);
};

const canDeleteRecord = (record: FinanceManagerData) => {
	if (!hasPermission('finance:financeManager:delete')) {
		return false;
	}
	if (isFamilyAdminOrSuper.value) {
		return true;
	}
	const myId = userStore.getUserInfo?.id;
	return (
		myId !== undefined &&
		record.belongTo !== undefined &&
		String(record.belongTo) === String(myId)
	);
};

// 选中的 ID 列表（严格 string 类型，普通成员禁用勾选他人账目）
const {
	selectedRowKeys: selectedRowIds,
	rowSelection,
	clearSelected,
} = useRowSelection({
	config: {
		getCheckboxProps: (record: FinanceManagerData) => ({
			disabled: !canDeleteRecord(record),
		}),
	},
});

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (paginationInfo) => {
			const queryParam = buildQueryParams(searchInfo.value);
			getFinancePage(queryParam, paginationInfo);
		},
	});

// 用户是否手动变更过每页条数（若手动选择过，则停止被窗口大小重置）
const hasUserCustomizedPageSize = ref<boolean>(false);

const onFooterPageChange = (page: number, pageSize: number) => {
	handleTableChange({ ...pagination, current: page, pageSize });
};

const onFooterSizeChange = (_: number, size: number) => {
	hasUserCustomizedPageSize.value = true;
	handleTableChange({ ...pagination, current: 1, pageSize: size });
};

const route = useRoute();

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
const isFirstSummaryLoaded = ref<boolean>(false);

// 零花钱月度预算状态与多维统计 (抽离子领域 composable)
const budgetModalVisible = ref<boolean>(false);
const openBudgetModal = () => {
	budgetModalVisible.value = true;
};

// AI 智能记账弹窗控制
const aiModalVisible = ref<boolean>(false);
const openAiModal = () => {
	aiModalVisible.value = true;
};

const onApplyAiFromList = (parsed: UniversalFinanceAiParseVo) => {
	if (!parsed) return;
	modelInfo.value.extraData = parsed;
	editFinance('add');
};

const {
	currentMonthStr,
	budgetStatus,
	isFirstBudgetLoaded,
	budgetSpentLabel,
	budgetDirectionLabel,
	progressStrokeColor,
	summaryTitle,
	effectiveDaysInfo,
	dailyExpenseAvg,
	topExpenseCategories,
	budgetDailyGuide,
	getEffectiveBudgetBelongTo,
	loadBudgetStatus,
} = useFinanceSummary(searchInfo, dataSource, summaryData as any);

// 构建规整后的查询参数（过滤空字符串并格式化日期）
const buildQueryParams = (param: FinanceManagerData): FinanceManagerData => {
	return {
		...param,
		name: param.name?.trim() || undefined,
		typeCode: param.typeCode?.trim() || undefined,
		fromSource: param.fromSource || undefined,
		incomeAndExpenses: param.incomeAndExpenses || undefined,
		belongTo: param.belongTo || undefined,
		infoDateStart:
			param.infoDateStart ? formatDate(param.infoDateStart) : undefined,
		infoDateEnd: param.infoDateEnd ? formatDate(param.infoDateEnd) : undefined,
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
		isFirstSummaryLoaded.value = true;
	}
};

// 获取支付方式展示名称
const getFromSourceName = (source?: string) => {
	if (!source) return '-';
	const matched = fromSourceTransferList.find((item) => item.value === source);
	return matched ? matched.name : source;
};

// 预算/分类穿透联动筛选状态
const activeLinkageFilter = ref<{
	type: string;
	value: string;
	label: string;
} | null>(null);

// 语义化标签配色调色板
const pillColorPalette = [
	{ bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
	{ bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
	{ bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
	{ bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
	{ bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
	{ bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
	{ bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
	{ bg: '#fdf4ff', text: '#a21caf', border: '#f5d0fe' },
];

const getCategoryPillStyle = (name?: string) => {
	if (!name) return {};
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = (hash << 5) - hash + (name.codePointAt(i) ?? 0);
		hash |= 0;
	}
	const idx = Math.abs(hash) % pillColorPalette.length;
	const color = pillColorPalette[idx];
	return {
		backgroundColor: color.bg,
		color: color.text,
		border: `1px solid ${color.border}`,
		borderRadius: '12px',
		padding: '2px 9px',
		fontSize: '12px',
		fontWeight: '500',
		display: 'inline-block',
		lineHeight: '1.4',
		cursor: 'pointer',
		transition: 'all 0.15s ease',
	};
};


const scrollToTable = () => {
	nextTick(() => {
		tableContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	});
};

const filterByCategory = (cat?: string) => {
	if (!cat) return;
	searchInfo.value.typeCode = cat;
	activeLinkageFilter.value = {
		type: 'category',
		value: cat,
		label: `账目分类：${cat}`,
	};
	query(true);
	scrollToTable();
};

const drillDownCategory = (cat: string) => {
	if (!cat) return;
	searchInfo.value.typeCode = cat;
	const [monthStartDayjs, monthEndDayjs] = getMonthRangeDayjs();
	searchInfo.value.infoDateStart = monthStartDayjs;
	searchInfo.value.infoDateEnd = monthEndDayjs;
	activeLinkageFilter.value = {
		type: 'category',
		value: cat,
		label: `预算分类：${cat}`,
	};
	query(true);
};

const drillDownBudgetMonth = () => {
	const [monthStartDayjs, monthEndDayjs] = getMonthRangeDayjs();
	searchInfo.value.infoDateStart = monthStartDayjs;
	searchInfo.value.infoDateEnd = monthEndDayjs;
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	if (dir === 'expense' || dir === 'income') {
		searchInfo.value.incomeAndExpenses = dir;
	} else {
		searchInfo.value.incomeAndExpenses = undefined;
	}
	if (
		budgetStatus.value?.categoryCodes &&
		budgetStatus.value.categoryCodes.length > 0
	) {
		searchInfo.value.typeCode = budgetStatus.value.categoryCodes.join(',');
	} else {
		searchInfo.value.typeCode = undefined;
	}
	activeLinkageFilter.value = {
		type: 'budgetMonth',
		value: currentMonthStr.value,
		label: `${currentMonthStr.value} 月预算相关账目`,
	};
	query(true);
};

const clearLinkageFilter = () => {
	activeLinkageFilter.value = null;
	searchInfo.value.typeCode = undefined;
	query(true);
};

const cancelQuery = () => {
	activeLinkageFilter.value = null;
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
	loadBudgetStatus();
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

// 分页获取账单数据
const getFinancePage = async (
	queryParam: FinanceManagerData,
	cur: PageInfo,
) => {
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

// 记一笔与修改/查看弹窗
const editFinance = (type: string, id?: string) => {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value.title = isAdd ? '记一笔账' : isView ? '账单明细' : '修改账单明细';
	modelInfo.value.id = isAdd ? null : (id ?? null);
	modelInfo.value.readonly = isView;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const getInitialAdaptivePageSize = (): number => {
	if (typeof window === 'undefined') return 15;
	const windowHeight = window.innerHeight;
	// 估算表体可用高度（扣除顶部外壳、Tab、搜索栏、统计与按钮的预估高度约 400px）
	const estimatedTableHeight = windowHeight - 400;
	return calculateAdaptivePageSize(estimatedTableHeight);
};

const initPage = () => {
	resetPagination();
	if (!hasUserCustomizedPageSize.value) {
		pagination.pageSize = getInitialAdaptivePageSize();
	}
};

// 初始化页面数据
const loadInitialFinanceData = () => {
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
	loadBudgetStatus();
};

// 表格高度自适应计算
const tableContainerRef = ref<HTMLElement | null>(null);
const tableScrollY = ref<number>(450);

const updateTableScrollY = () => {
	if (!tableContainerRef.value) return;
	const containerHeight = tableContainerRef.value.clientHeight;
	if (containerHeight > 180) {
		// 扣除卡片顶栏(~46px) + 表头(~42px) + 底栏工具条(~46px) ≈ 134px
		tableScrollY.value = Math.max(containerHeight - 134, 160);

		// 若用户尚未手动选择过条数，根据实际容器渲染高度校准最匹配条数阶梯 (10 / 15 / 20)
		if (!hasUserCustomizedPageSize.value) {
			const bestSize = calculateAdaptivePageSize(tableScrollY.value);
			if (pagination.pageSize !== bestSize) {
				pagination.pageSize = bestSize;
			}
		}
	}
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
	loadInitialFinanceData();
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
</script>

<style lang="scss" scoped>
.finance-manager-page {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 12px;
	background: #f8fafc;
	box-sizing: border-box;
	overflow: hidden;
}

.table-card-shell {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

.primary-record-btn {
	height: 32px;
	padding: 0 14px;
	border-radius: 8px;
	font-weight: 600;
	box-shadow: 0 1px 2px rgba(22, 119, 255, 0.2);
}

.header-batch-del-btn {
	height: 32px;
	border-radius: 8px;
}

:deep(.search) {
	flex-shrink: 0;
	margin: 0 0 8px;
}

.text-income {
	color: #059669 !important;
}

.text-expense {
	color: #e11d48 !important;
}

.linkage-active-banner {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #eff6ff;
	border: 1px solid #bfdbfe;
	padding: 5px 14px;
	border-radius: 8px;
	margin-bottom: 8px;
	font-size: 12px;
	color: #1e40af;

	.banner-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.banner-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #3b82f6;
		display: inline-block;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
	}

	.banner-close-btn {
		padding: 0;
		height: auto;
		font-size: 12px;
		color: #2563eb;
		&:hover {
			color: #1d4ed8;
		}
	}
}

.clickable-sub-stat {
	cursor: pointer;
	transition: color 0.15s ease;
	&:hover {
		color: #1677ff !important;
		text-decoration: underline;
	}
	.drill-icon {
		font-size: 10px;
		margin-left: 2px;
		opacity: 0.7;
	}
}

.clickable-cat-pill {
	cursor: pointer;
	transition: all 0.15s ease;
	&:hover {
		border-color: #1677ff;
		color: #1677ff;
		transform: translateY(-1px);
	}
}

.clickable-cat-more {
	cursor: pointer;
	&:hover {
		color: #1677ff;
	}
}

.category-pill {
	transition: all 0.15s ease;
	&:hover {
		opacity: 0.85;
		transform: translateY(-1px);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}
}
</style>
