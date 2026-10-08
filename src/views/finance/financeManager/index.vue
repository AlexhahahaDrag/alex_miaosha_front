<template>
	<div class="page-info finance-manager-page">
		<!-- 1. 单行紧凑日常记账筛选栏 -->
		<finance-manager-filter
			v-model:searchInfo="searchInfo"
			@query="query"
			@cancelQuery="cancelQuery"
		/>

		<!-- 2. 一体化概览面板（账单统计与月度预算并排，节省纵向空间） -->
		<div class="finance-overview-card">
			<!-- 左侧：账单收支统计 -->
			<div class="overview-section bill-stats-section">
				<div class="section-header">
					<span class="summary-tag-title">
						<CalendarOutlined class="summary-title-icon" />
						<span>{{ summaryTitle }}</span>
					</span>
					<span class="record-total-badge">
						共 <strong>{{ summaryData.totalCount ?? pagination.total ?? 0 }}</strong> 笔账单
					</span>
				</div>

				<div class="stats-metrics-group">
					<!-- 全部 或 支出模式：展示支出 -->
					<div
						v-if="!searchInfo.incomeAndExpenses || searchInfo.incomeAndExpenses === 'expense'"
						class="stat-metric expense"
					>
						<span class="label">{{ searchInfo.incomeAndExpenses === 'expense' ? '支出合计' : '总支出' }}</span>
						<span class="value">-¥{{ formatAmount(summaryData.totalExpense) }}</span>
					</div>

					<!-- 全部 或 收入模式：展示收入 -->
					<div
						v-if="!searchInfo.incomeAndExpenses || searchInfo.incomeAndExpenses === 'income'"
						class="stat-metric income"
					>
						<span class="label">{{ searchInfo.incomeAndExpenses === 'income' ? '收入合计' : '总收入' }}</span>
						<span class="value">+¥{{ formatAmount(summaryData.totalIncome) }}</span>
					</div>

					<!-- 仅在全部模式下展示结余 -->
					<div
						v-if="!searchInfo.incomeAndExpenses"
						class="stat-metric balance"
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
			</div>

			<!-- 中间细垂直分割线 -->
			<div class="overview-divider"></div>

			<!-- 右侧：零花钱月度预算 -->
			<div class="overview-section budget-section">
				<div class="section-header">
					<div class="budget-title-line">
						<WalletOutlined class="budget-icon" />
						<span class="budget-title">{{ currentMonthStr }} 零花钱预算</span>
						<a-tag v-if="budgetStatus?.isInherited" color="processing" class="budget-tag">
							继承自上月
						</a-tag>
						<a-tag v-if="budgetStatus?.isOverBudget" color="error" class="budget-tag">
							已超支
						</a-tag>
					</div>
					<a-button type="link" size="small" class="budget-setting-btn" @click="openBudgetModal">
						<template #icon><SettingOutlined /></template>
						调整预算
					</a-button>
				</div>

				<div class="budget-metrics-group">
					<div class="budget-stat-item">
						<span class="stat-label">{{ budgetStatus?.isOverBudget ? '超支金额:' : '剩余可用:' }}</span>
						<span :class="['stat-val', budgetStatus?.isOverBudget ? 'text-expense' : 'text-income']">
							{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
						</span>
					</div>

					<div class="budget-sub-stats">
						<span class="sub-stat">上限 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span>
						<span class="sub-sep">/</span>
						<span class="sub-stat">已用 ¥{{ formatAmount(budgetStatus?.actualExpense || 0) }}</span>
					</div>

					<div class="budget-progress-wrap">
						<a-progress
							:percent="Math.min(budgetStatus?.usagePercent || 0, 100)"
							:stroke-color="progressStrokeColor"
							:format="() => `${budgetStatus?.usagePercent || 0}%`"
							size="small"
							class="budget-progress"
						/>
					</div>

					<div class="budget-category-hints" :title="budgetStatus?.categoryNames?.length ? budgetStatus.categoryNames.join('、') : '全部分类（不含转账）'">
						<span class="hint-label">计入:</span>
						<template v-if="budgetStatus?.categoryNames?.length">
							<a-tag v-for="cat in budgetStatus.categoryNames.slice(0, 2)" :key="cat" class="cat-pill">
								{{ cat }}
							</a-tag>
							<span v-if="budgetStatus.categoryNames.length > 2" class="cat-pill-more">
								+{{ budgetStatus.categoryNames.length - 2 }}
							</span>
						</template>
						<span v-else class="cat-pill-all">全分类</span>
					</div>
				</div>
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

		<!-- 调整零花钱预算弹窗 (Tailwind 现代风格) -->
		<a-modal
			v-model:open="budgetModalVisible"
			:confirm-loading="budgetSaving"
			width="620px"
			:mask-closable="false"
			:destroy-on-close="true"
			@ok="handleSaveBudget"
		>
			<template #title>
				<div class="flex items-center gap-2 text-slate-800 font-semibold text-base">
					<WalletOutlined class="text-amber-500 text-lg" />
					<span>设置 / 调整零花钱预算</span>
				</div>
			</template>

			<div class="space-y-4 py-1">
				<!-- 1. 预算基础信息卡片 -->
				<div class="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 space-y-3.5">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-slate-600">预算月份</span>
						<div class="flex items-center gap-2">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
								{{ currentMonthStr }}
							</span>
							<span class="text-xs text-slate-400">每月独立保存，次月自动继承</span>
						</div>
					</div>

					<div class="flex items-center justify-between gap-4">
						<div class="flex flex-col">
							<span class="text-sm font-medium text-slate-700 flex items-center gap-1">
								月度预算额度 <span class="text-rose-500">*</span>
							</span>
							<span class="text-xs text-slate-400">设为 0 表示不设置限额</span>
						</div>
						<div class="w-64">
							<a-input-number
								v-model:value="budgetEditForm.budgetAmount"
								:min="0"
								:precision="2"
								prefix="¥"
								placeholder="0.00"
								class="w-full !rounded-lg"
							/>
						</div>
					</div>
				</div>

				<!-- 2. 消费分类配置卡片 (Tailwind 胶囊交互) -->
				<div class="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
					<div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
						<div>
							<div class="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
								<span>计入零花钱的消费分类</span>
								<span class="text-xs font-normal text-slate-400">
									(已选 {{ budgetEditForm.categoryCodes.length }} 项)
								</span>
							</div>
							<div class="text-xs text-slate-400 mt-0.5">
								仅勾选的类别支出会计入预算，不勾选则默认统计全部支出（不含转账）
							</div>
						</div>
						<div class="flex items-center gap-2 text-xs">
							<button
								type="button"
								class="text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
								@click="selectAllCategories"
							>
								全选
							</button>
							<span class="text-slate-300">|</span>
							<button
								type="button"
								class="text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
								@click="clearAllCategories"
							>
								清空
							</button>
						</div>
					</div>

					<!-- 收支大类 (支出 / 收入) -->
					<div class="space-y-1.5">
						<div class="text-xs font-medium text-slate-500 flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
							<span>收支类型</span>
						</div>
						<div class="flex flex-wrap gap-2">
							<div
								v-for="item in incomeExpenseTypes"
								:key="item.value"
								:class="[
									'cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all select-none flex items-center gap-1.5',
									isCategorySelected(item.value)
										? 'bg-blue-50 border-blue-500 text-blue-600 shadow-xs ring-1 ring-blue-500/20'
										: 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
								]"
								@click="toggleCategory(item.value)"
							>
								<span
									v-if="isCategorySelected(item.value)"
									class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"
								></span>
								<span>{{ item.label }}</span>
							</div>
						</div>
					</div>

					<!-- 近两月真实账目类别 (上月 + 本月动态提取) -->
					<div class="space-y-1.5 pt-1">
						<div class="text-xs font-medium text-slate-500 flex items-center justify-between">
							<div class="flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
								<span>账目类别 (提取自上月及本月账本)</span>
							</div>
							<span v-if="categoriesLoading" class="text-xs text-slate-400">加载中...</span>
						</div>

						<div v-if="recentCategories.length" class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
							<div
								v-for="cat in recentCategories"
								:key="cat"
								:class="[
									'cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-all select-none flex items-center gap-1.5',
									isCategorySelected(cat)
										? 'bg-blue-50 border-blue-500 text-blue-600 shadow-xs ring-1 ring-blue-500/20'
										: 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
								]"
								@click="toggleCategory(cat)"
							>
								<span
									v-if="isCategorySelected(cat)"
									class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"
								></span>
								<span>{{ cat }}</span>
							</div>
						</div>
						<div
							v-else-if="!categoriesLoading"
							class="text-xs text-slate-400 py-3 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200"
						>
							近两个月暂无具体类别记账，默认统计全部支出
						</div>
					</div>
				</div>
			</div>

			<template #footer>
				<div class="flex items-center justify-end gap-2.5 pt-2">
					<a-button @click="budgetModalVisible = false" class="!rounded-lg">取消</a-button>
					<a-button
						type="primary"
						:loading="budgetSaving"
						class="!rounded-lg !bg-blue-600 hover:!bg-blue-500"
						@click="handleSaveBudget"
					>
						保存配置
					</a-button>
				</div>
			</template>
		</a-modal>
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
	getBudgetStatus,
	saveMonthlyBudget,
	getBudgetCategories,
	type FinanceSummaryData,
} from '@/views/finance/financeManager/api';
import type { FinanceBudgetStatusVo } from '@/views/finance/financeManager/config';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import { useUserStore } from '@/store/modules/user/user';
import dayjs from 'dayjs';
import {
	CalendarOutlined,
	PlusOutlined,
	DeleteOutlined,
	ReloadOutlined,
	WalletOutlined,
	SettingOutlined,
} from '@ant-design/icons-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const route = useRoute();
const userStore = useUserStore();

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

// 零花钱月度预算状态
const currentMonthStr = computed(() => dayjs().format('YYYY-MM'));
const budgetStatus = ref<FinanceBudgetStatusVo | null>(null);
const budgetModalVisible = ref(false);
const budgetSaving = ref(false);
const budgetEditForm = reactive({
	budgetAmount: 0,
	categoryCodes: [] as string[],
});

const progressStrokeColor = computed(() => {
	const pct = budgetStatus.value?.usagePercent || 0;
	if (pct >= 100) return '#ff4d4f';
	if (pct >= 80) return '#faad14';
	return '#1677ff';
});

const incomeExpenseTypes = [
	{ label: '支出', value: '支出' },
	{ label: '收入', value: '收入' },
];
const recentCategories = ref<string[]>([]);
const categoriesLoading = ref(false);

const isCategorySelected = (val: string) => {
	return budgetEditForm.categoryCodes.includes(val);
};

const toggleCategory = (val: string) => {
	const idx = budgetEditForm.categoryCodes.indexOf(val);
	if (idx > -1) {
		budgetEditForm.categoryCodes.splice(idx, 1);
	} else {
		budgetEditForm.categoryCodes.push(val);
	}
};

const selectAllCategories = () => {
	const all = Array.from(
		new Set([
			...incomeExpenseTypes.map((t) => t.value),
			...recentCategories.value,
		]),
	);
	budgetEditForm.categoryCodes = all;
};

const clearAllCategories = () => {
	budgetEditForm.categoryCodes = [];
};

const getEffectiveBudgetBelongTo = () => {
	return searchInfo.value.belongTo || userStore.getUserInfo?.id;
};

const fetchRecentCategories = async () => {
	categoriesLoading.value = true;
	try {
		const { code, data } = await getBudgetCategories(
			currentMonthStr.value,
			getEffectiveBudgetBelongTo(),
		);
		if (code === '200' && Array.isArray(data)) {
			// 保留当前已选的其他类别以防历史配置不显示
			const existingSelected = budgetEditForm.categoryCodes.filter(
				(c) => c !== '支出' && c !== '收入',
			);
			recentCategories.value = Array.from(
				new Set([...data, ...existingSelected]),
			).sort();
		}
	} catch (e) {
		console.warn('获取近两月记账类别失败:', e);
	} finally {
		categoriesLoading.value = false;
	}
};

const loadBudgetStatus = async () => {
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
	}
};

const openBudgetModal = async () => {
	budgetEditForm.budgetAmount = Number(budgetStatus.value?.budgetAmount || 0);
	budgetEditForm.categoryCodes = [...(budgetStatus.value?.categoryCodes || [])];
	budgetModalVisible.value = true;
	await fetchRecentCategories();
};

const handleSaveBudget = async () => {
	if (budgetEditForm.budgetAmount < 0) {
		message.warning('预算金额不能为负数！');
		return;
	}
	budgetSaving.value = true;
	try {
		const { code, message: msg } = await saveMonthlyBudget({
			yearMonth: currentMonthStr.value,
			belongTo: getEffectiveBudgetBelongTo(),
			budgetAmount: budgetEditForm.budgetAmount,
			categoryCodes: budgetEditForm.categoryCodes,
		});
		if (code === '200') {
			message.success('零花钱预算已更新');
			budgetModalVisible.value = false;
			await loadBudgetStatus();
		} else {
			message.error(msg || '保存失败');
		}
	} catch (e: any) {
		message.error(e?.message || '保存预算失败');
	} finally {
		budgetSaving.value = false;
	}
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
	loadBudgetStatus();
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
	loadBudgetStatus();
	fetchRecentCategories();
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

.finance-overview-card {
	flex-shrink: 0;
	background: #fff;
	padding: 8px 16px;
	border-radius: 8px;
	margin: 0 0 8px;
	border: 1px solid #f0f0f0;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
	display: flex;
	align-items: center;
	gap: 16px;

	.overview-divider {
		width: 1px;
		align-self: stretch;
		background: #f0f0f0;
		flex-shrink: 0;
		margin: 2px 0;
	}

	.overview-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;

		&.bill-stats-section {
			flex: 1.1;
		}

		&.budget-section {
			flex: 1.3;
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 5px;
		line-height: 20px;
	}

	.summary-tag-title {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: #262626;

		.summary-title-icon {
			color: #1677ff;
			font-size: 14px;
		}
	}

	.record-total-badge {
		font-size: 12px;
		color: #8c8c8c;

		strong {
			color: #262626;
			font-weight: 600;
		}
	}

	.stats-metrics-group {
		display: flex;
		align-items: baseline;
		gap: 16px;
		flex-wrap: wrap;

		.stat-metric {
			display: inline-flex;
			align-items: baseline;
			gap: 4px;
			font-size: 12px;

			.label {
				color: #8c8c8c;
			}

			.value {
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
					'Helvetica Neue', Arial, sans-serif;
				font-weight: 600;
				font-size: 14px;
				font-variant-numeric: tabular-nums;
			}

			&.expense .value {
				color: #ff4d4f;
			}

			&.income .value {
				color: #52c41a;
			}
		}
	}

	.budget-title-line {
		display: inline-flex;
		align-items: center;
		gap: 6px;

		.budget-icon {
			color: #fa8c16;
			font-size: 14px;
		}

		.budget-title {
			font-weight: 600;
			font-size: 13px;
			color: #262626;
		}

		.budget-tag {
			font-size: 11px;
			line-height: 18px;
			padding: 0 5px;
			margin: 0;
		}
	}

	.budget-setting-btn {
		padding: 0 4px;
		font-size: 12px;
		height: 20px;
		line-height: 20px;
	}

	.budget-metrics-group {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;

		.budget-stat-item {
			display: inline-flex;
			align-items: baseline;
			gap: 4px;
			font-size: 12px;

			.stat-label {
				color: #8c8c8c;
			}

			.stat-val {
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
					'Helvetica Neue', Arial, sans-serif;
				font-weight: 600;
				font-size: 14px;
				font-variant-numeric: tabular-nums;
			}
		}

		.budget-sub-stats {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: 12px;
			color: #8c8c8c;

			.sub-sep {
				color: #d9d9d9;
			}

			.sub-stat {
				font-variant-numeric: tabular-nums;
			}
		}

		.budget-progress-wrap {
			width: 110px;
			flex-shrink: 0;

			.budget-progress {
				margin: 0;
			}
		}

		.budget-category-hints {
			display: inline-flex;
			align-items: center;
			gap: 3px;
			font-size: 12px;
			max-width: 140px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			.hint-label {
				color: #8c8c8c;
			}

			.cat-pill {
				font-size: 11px;
				line-height: 16px;
				padding: 0 4px;
				margin: 0;
			}

			.cat-pill-more {
				font-size: 11px;
				color: #8c8c8c;
			}

			.cat-pill-all {
				color: #8c8c8c;
			}
		}
	}
}

@media (max-width: 1300px) {
	.finance-overview-card {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;

		.overview-divider {
			display: none;
		}
	}
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
