<template>
	<div class="page-info finance-manager-page">
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

		<!-- 3. 操作按钮区 -->
		<div class="button">
			<a-space>
				<a-button
					v-if="hasPermission('finance:financeManager:add')"
					type="primary"
					@click="editFinance('add')"
				>
					<template #icon><PlusOutlined /></template>
					记一笔
				</a-button>

				<template v-if="hasPermission('finance:financeManager:delete')">
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
					<a-button v-else type="primary" danger disabled>
						<template #icon><DeleteOutlined /></template>
						删除
					</a-button>
				</template>
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
								v-if="canEditRecord(record)"
								type="link"
								size="small"
								class="action-link-btn"
								@click="editFinance('update', record.id)"
							>
								编辑
							</a-button>
							<a-button
								v-else
								type="link"
								size="small"
								class="action-link-btn"
								@click="editFinance('view', record.id)"
							>
								查看
							</a-button>
							<template v-if="canDeleteRecord(record)">
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
							</template>
						</a-space>
					</template>

					<!-- 类别列：语义化彩色胶囊 -->
					<template v-else-if="column.key === 'typeCode'">
						<span
							v-if="record.typeCode"
							class="category-pill"
							:style="getCategoryPillStyle(record.typeCode)"
							@click="filterByCategory(record.typeCode)"
							:title="`点击仅筛选【${record.typeCode}】`"
						>
							{{ record.typeCode }}
						</span>
						<span v-else class="text-slate-300">-</span>
					</template>

					<!-- 金额列：等宽、红绿收支色彩区分 -->
					<template v-else-if="column.key === 'amount'">
						<span
							:class="[
								'amount-text',
								record.incomeAndExpenses === 'income' ?
									'amount-income'
								:	'amount-expense',
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
	formatTime,
	formatDate,
	formatMonth,
	formatDayjs,
	nowDayjs,
	getMonthRangeDayjs,
} from '@/utils/dayjs';
import type { ModelInfo } from '@/types/modal';
import type {
	FinanceManagerData,
	FinanceBudgetStatusVo,
} from '@/views/finance/financeManager/config';
import {
	columns,
	fromSourceTransferList,
} from '@/views/finance/financeManager/config';
import { iconComponentMap } from '@/config/icons';
import { formatAmount } from '@/utils/amountInfo';
import {
	getFinanceMangerPage,
	deleteFinanceManger,
	getFinanceSummary,
	getBudgetStatus,
	type FinanceSummaryData,
} from '@/views/finance/financeManager/api';
import {
	CalendarOutlined,
	PlusOutlined,
	DeleteOutlined,
	WalletOutlined,
	SettingOutlined,
} from '@ant-design/icons-vue';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import FinanceBudgetModal from './finance-budget-modal/index.vue';

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
const { selectedRowKeys: selectedRowIds, rowSelection } = useRowSelection({
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

// 零花钱月度预算状态
const currentMonthStr = computed(() => formatMonth());
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);
const budgetLoading = ref<boolean>(false);
const isFirstBudgetLoaded = ref<boolean>(false);
const budgetModalVisible = ref<boolean>(false);

const budgetDirectionLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '全部收支';
	if (hasInc) return '全部收入';
	return '全部支出';
});

const budgetSpentLabel = computed(() => {
	const dir = budgetStatus.value?.incomeAndExpenses || 'expense';
	const hasExp = dir.includes('expense');
	const hasInc = dir.includes('income');
	if (hasExp && hasInc) return '已计';
	if (hasInc) return '已入';
	return '已用';
});

/**
 * 根据预算使用率返回语义色阶 (Taste-Skill 财务风控色板)
 * - < 0%: 净结余充裕 (翡翠绿 #52c41a)
 * - [0%, 75%): 常规安全 (品牌蓝 #1677ff)
 * - [75%, 90%): 适度关注 (琥珀黄 #faad14)
 * - [90%, 100%): 临界高压 (火山橙 #fa541c)
 * - [100%, 150%): 超支破线 (警示红 #ff4d4f)
 * - >= 150%: 严重爆表 (深绛红 #cf1322)
 */
const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#52c41a';
	if (percent >= 150) return '#cf1322';
	if (percent >= 100) return '#ff4d4f';
	if (percent >= 90) return '#fa541c';
	if (percent >= 75) return '#faad14';
	return '#1677ff';
};

const progressStrokeColor = computed(() => {
	const pct = budgetStatus.value?.usagePercent || 0;
	return getBudgetProgressColor(pct);
});

const getEffectiveBudgetBelongTo = (): string | undefined => {
	if (searchInfo.value.belongTo) {
		return String(searchInfo.value.belongTo);
	}
	return undefined;
};

const loadBudgetStatus = async () => {
	budgetLoading.value = true;
	try {
		const { code, data } = await getBudgetStatus(
			currentMonthStr.value,
			getEffectiveBudgetBelongTo(),
		);
		if (code === '200' && data) {
			budgetStatus.value = data;
		}
	} catch (e) {
		console.warn('获取零花钱预算失败:', e);
	} finally {
		budgetLoading.value = false;
		isFirstBudgetLoaded.value = true;
	}
};

const openBudgetModal = () => {
	budgetModalVisible.value = true;
};

watch(
	() => searchInfo.value.belongTo,
	() => {
		loadBudgetStatus();
	},
);

// 统计标签标题自适应
const summaryTitle = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	if (start && end) {
		const startStr = formatDate(start);
		const endStr = formatDate(end);
		if (startStr === endStr) {
			return `${startStr} 账单`;
		}
		if (formatMonth(start) === formatMonth(end)) {
			return `${formatDate(start, 'YYYY年M月')} 账单`;
		}
		return `${formatDate(start, 'M/D')} ~ ${formatDate(end, 'M/D')} 统计`;
	}
	if (start) {
		return `自 ${formatDate(start)} 起`;
	}
	if (end) {
		return `至 ${formatDate(end)} 止`;
	}
	return '全量账单统计';
});

// 有效统计天数计算（用于日均支出）
const effectiveDaysInfo = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	const today = nowDayjs().startOf('day');

	if (start && end) {
		const startDate = formatDayjs(start).startOf('day');
		const endDate = formatDayjs(end).endOf('day');
		// 若为当月（起始为当月1号），按当月已过天数统计更贴合真实花销节奏
		const isCurrentMonth =
			startDate.isSame(today, 'month') && startDate.date() === 1;
		if (isCurrentMonth && !today.isAfter(endDate, 'day')) {
			const passedDays = today.diff(startDate, 'day') + 1;
			return {
				days: Math.max(1, passedDays),
				label: `本月已过 ${passedDays} 天`,
			};
		}
		const diffDays = Math.max(1, formatDayjs(end).diff(formatDayjs(start), 'day') + 1);
		return { days: diffDays, label: `区间共 ${diffDays} 天` };
	}

	if (start) {
		const startDate = formatDayjs(start).startOf('day');
		const diffDays = Math.max(1, today.diff(startDate, 'day') + 1);
		return { days: diffDays, label: `已过 ${diffDays} 天` };
	}

	if (end) {
		return { days: 30, label: '参考 30 天' };
	}

	// 全量未设时间筛选时，默认以当月已过天数为参考
	const daysThisMonth = today.date();
	return {
		days: Math.max(1, daysThisMonth),
		label: `参考本月已过 ${daysThisMonth} 天`,
	};
});

// 日均支出
const dailyExpenseAvg = computed(() => {
	const totalExp = Number(summaryData.value?.totalExpense) || 0;
	if (totalExp <= 0) return 0;
	const days = effectiveDaysInfo.value.days;
	return Number((totalExp / days).toFixed(2));
});

// Top 3 支出分类结构统计
interface TopExpenseCategoryItem {
	name: string;
	amount: number;
	percent: number;
}

const topExpenseCategories = computed<TopExpenseCategoryItem[]>(() => {
	const records = dataSource.value || [];
	const expenseMap = new Map<string, number>();
	let totalExpenseInList = 0;

	for (const item of records) {
		const isExpense =
			item.incomeAndExpenses === 'expense' ||
			(!item.incomeAndExpenses && (Number(item.amount) || 0) < 0);
		if (isExpense && item.typeCode) {
			const amt = Math.abs(Number(item.amount) || 0);
			if (amt > 0) {
				expenseMap.set(
					item.typeCode,
					(expenseMap.get(item.typeCode) || 0) + amt,
				);
				totalExpenseInList += amt;
			}
		}
	}

	if (expenseMap.size === 0 || totalExpenseInList <= 0) {
		return [];
	}

	const sorted = Array.from(expenseMap.entries())
		.map(([name, amount]) => ({
			name,
			amount,
			percent: Math.round((amount / totalExpenseInList) * 100),
		}))
		.sort((a, b) => b.amount - a.amount);

	return sorted.slice(0, 3);
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
		hash = (hash << 5) - hash + name.charCodeAt(i);
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

const filterByCategory = (cat?: string) => {
	if (!cat) return;
	searchInfo.value.typeCode = cat;
	activeLinkageFilter.value = {
		type: 'category',
		value: cat,
		label: `账目分类：${cat}`,
	};
	query(true);
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

const cancel = () => {};

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
	loadBudgetStatus();
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

.text-income {
	color: #52c41a !important;
}

.text-expense {
	color: #ff4d4f !important;
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
	font-family:
		-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
		Arial, sans-serif;
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

.linkage-active-banner {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #eff6ff;
	border: 1px solid #bfdbfe;
	padding: 5px 14px;
	border-radius: 6px;
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
