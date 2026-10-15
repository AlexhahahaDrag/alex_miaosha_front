<template>
	<!-- 调整零花钱预算弹窗 (Taste-Skill 极简现代高质感风格) -->
	<a-modal
		v-model:open="open"
		:confirm-loading="budgetSaving"
		width="800px"
		:mask-closable="false"
		:destroy-on-close="true"
		@ok="handleSaveBudget"
	>
		<template #title>
			<div
				class="flex items-center gap-2.5 text-slate-800 font-semibold text-base py-0.5"
			>
				<div
					class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-solid border-blue-100 shadow-2xs"
				>
					<WalletOutlined class="text-base" />
				</div>
				<div>
					<div class="leading-snug">设置 / 调整零花钱预算</div>
					<div class="text-xs font-normal text-slate-400">
						独立设定每月预算额度，支持快捷档位填充与全量/自选分类统计
					</div>
				</div>
			</div>
		</template>

		<a-form
			ref="budgetFormRef"
			:model="budgetEditForm"
			:rules="budgetRules"
			layout="vertical"
			class="space-y-4 py-2"
		>
			<!-- 普通成员只读提示横幅 -->
			<a-alert
				v-if="!canEditBudget"
				type="info"
				show-icon
				message="家庭成员浏览模式，仅家庭管理员可调整月度预算设定"
				class="!rounded-lg !mb-2"
				data-testid="budget-readonly-alert"
			/>

			<!-- AI 智能助手面板 (子组件) -->
			<budget-ai-assistant-panel
				ref="aiAssistantPanelRef"
				v-model:ai-recommend-data="aiRecommendData"
				:current-month="currentMonth"
				:belong-to="getEffectiveBelongTo()"
				:current-budget-amount="budgetEditForm.budgetAmount"
				:available-categories="availableCategories"
				@apply-tier="applyRecommendTier"
				@apply-categories="applyRecommendedCategories"
				@apply-parsed-command="handleApplyParsedCommand"
			/>

			<!-- 1. 预算额度与快捷填充卡片 -->
			<div
				class="bg-slate-50/70 rounded-xl p-4 border border-solid border-slate-200/80 space-y-3"
			>
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-700">预算月份</span>
					<div class="flex items-center gap-2">
						<span
							class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-700 border border-solid border-blue-200/60 font-mono"
						>
							{{ currentMonth }}
						</span>
						<span class="text-xs text-slate-400"
							>每月独立保存，次月自动继承</span
						>
					</div>
				</div>

				<a-form-item name="budgetAmount" class="!mb-0">
					<template #label>
						<div class="flex flex-col text-left">
							<span class="text-sm font-medium text-slate-700"
								>月度预算额度</span
							>
							<span class="text-xs text-slate-400 font-normal"
								>设为 0 表示不设置限额</span
							>
						</div>
					</template>
					<a-input-number
						v-model:value="budgetEditForm.budgetAmount"
						:min="0"
						:precision="2"
						:disabled="!canEditBudget"
						prefix="¥"
						placeholder="0.00"
						data-testid="budget-amount-input"
						:class="[
							'w-full !rounded-lg font-mono font-medium transition-all duration-500',
							isBudgetHighlighted
								? '!ring-2 !ring-indigo-400/90 !ring-offset-1 !border-indigo-500 shadow-xs'
								: '',
						]"
					/>
				</a-form-item>

				<!-- 快捷档位无边框胶囊，融入输入卡片 -->
				<div class="flex items-center justify-between pt-1">
					<span class="text-xs text-slate-400">快捷填充</span>
					<div class="flex items-center gap-1.5 flex-wrap">
						<!-- 融入 AI 适度推荐档位 (若就绪) -->
						<button
							v-if="aiRecommendData?.moderateAmount"
							type="button"
							:class="[
								'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid flex items-center gap-1',
								budgetEditForm.budgetAmount ===
								aiRecommendData.moderateAmount
									? '!bg-indigo-600 !text-white !border-indigo-600 shadow-2xs'
									: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-100',
							]"
							@click="
								applyRecommendTier(aiRecommendData.moderateAmount)
							"
						>
							<span
								class="text-3xs px-1 rounded bg-indigo-500/20 text-indigo-900 font-bold"
								>AI推荐</span
							>
							<span
								>¥{{
									formatAmount(aiRecommendData.moderateAmount || 0)
								}}</span
							>
						</button>

						<button
							v-for="preset in QUICK_BUDGET_PRESETS"
							:key="preset"
							type="button"
							:class="[
								'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid',
								budgetEditForm.budgetAmount === preset
									? '!bg-blue-600 !text-white !border-blue-600 shadow-2xs'
									: 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600',
							]"
							@click="applyQuickPreset(preset)"
						>
							¥{{ preset }}
						</button>
						<button
							type="button"
							:class="[
								'cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium transition-all select-none border border-solid',
								budgetEditForm.budgetAmount === 0
									? '!bg-slate-700 !text-white !border-slate-700 shadow-2xs'
									: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
							]"
							@click="applyQuickPreset(0)"
						>
							不设上限
						</button>
					</div>
				</div>
			</div>

			<!-- 2. 统计范围与收支方向卡片 (自然心智流 + 无分割线容器化) -->
			<div
				class="bg-slate-50/70 rounded-xl p-4 border border-solid border-slate-200/80 space-y-3.5"
			>
				<!-- 收支方向全局前置 -->
				<a-form-item name="selectedDirections" class="!mb-0">
					<template #label>
						<div class="flex items-center justify-between w-full">
							<span class="text-xs font-medium text-slate-700"
								>收支方向:</span
							>
							<span class="text-xs text-slate-400 font-normal">
								{{
									budgetEditForm.selectedDirections.length === 2 ? '双向统计'
									: isDirectionSelected('income') ? '仅限收入'
									: '仅限支出'
								}}
							</span>
						</div>
					</template>
					<div class="flex items-center gap-2">
						<button
							type="button"
							:class="[
								'cursor-pointer px-3 py-1 rounded-lg text-xs font-medium transition-all select-none border border-solid flex items-center gap-1.5',
								isDirectionSelected('expense') ?
									'bg-rose-50/90 text-rose-600 border-rose-300 shadow-2xs ring-1 ring-rose-200'
								:	'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
							]"
							@click="toggleDirection('expense')"
						>
							<CheckOutlined
								v-if="isDirectionSelected('expense')"
								class="text-xs"
							/>
							<span>支出 (消费)</span>
						</button>
						<button
							type="button"
							:class="[
								'cursor-pointer px-3 py-1 rounded-lg text-xs font-medium transition-all select-none border border-solid flex items-center gap-1.5',
								isDirectionSelected('income') ?
									'bg-emerald-50/90 text-emerald-600 border-emerald-300 shadow-2xs ring-1 ring-emerald-200'
								:	'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
							]"
							@click="toggleDirection('income')"
						>
							<CheckOutlined
								v-if="isDirectionSelected('income')"
								class="text-xs"
							/>
							<span>收入</span>
						</button>
					</div>
				</a-form-item>

				<!-- 统计范畴控制器 (紧随其后) -->
				<div class="flex items-center justify-between pt-0.5">
					<div class="flex items-center gap-1.5">
						<span class="text-xs font-medium text-slate-700">统计范畴</span>
						<a-tooltip
							title="全量日常模式自动汇总当月所有非转账类别的日常收支；自选模式可精细勾选特定消费分类"
						>
							<QuestionCircleOutlined
								class="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
							/>
						</a-tooltip>
					</div>

					<!-- 原生 Segmented 分段切换，自带丝滑滑块 -->
					<a-segmented
						v-model:value="scopeMode"
						:options="scopeModeOptions"
						class="!rounded-lg text-xs"
					/>
				</div>

				<!-- 自选分类列表 (紧贴控制器展开，白底微质感内嵌容器，无割裂线) -->
				<div
					v-if="scopeMode === 'custom'"
					:class="[
						'bg-white rounded-xl p-3.5 border border-solid border-slate-200/70 shadow-2xs space-y-2.5 transition-all duration-500',
						isCategoriesHighlighted
							? 'ring-2 ring-indigo-400/90 ring-offset-1 !border-indigo-400 shadow-xs'
							: '',
					]"
				>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5">
							<span class="text-slate-600 font-medium"
								>选择纳入预算的分类</span
							>
							<span
								class="inline-flex items-center px-1.5 py-0.2 rounded-full text-2xs font-semibold bg-blue-50 text-blue-600 border border-solid border-blue-200/50 font-mono"
							>
								已选 {{ budgetEditForm.categoryCodes.length }} 项
							</span>
						</div>
						<div class="flex items-center gap-2">
							<a-button
								type="link"
								size="small"
								class="!text-xs !p-0 !text-blue-600 font-medium"
								@click="selectAllCategories"
							>
								全选
							</a-button>
							<span class="text-slate-200 text-xs">|</span>
							<a-button
								type="link"
								size="small"
								class="!text-xs !p-0 !text-slate-400 hover:!text-slate-600"
								@click="clearAllCategories"
							>
								清空
							</a-button>
						</div>
					</div>

					<!-- 现代全圆角灵动微胶囊 Pills -->
					<div
						v-if="availableCategories.length"
						class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1 py-0.5"
					>
						<div
							v-for="cat in availableCategories"
							:key="cat"
							:class="[
								'cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all select-none flex items-center gap-1.5 border border-solid active:scale-95',
								isCategorySelected(cat) ?
									'bg-blue-600 border-blue-600 text-white shadow-xs'
								:	'bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/70',
							]"
							@click="toggleCategory(cat)"
						>
							<CheckOutlined
								v-if="isCategorySelected(cat)"
								class="text-2xs"
							/>
							<span>{{ cat }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- 3. 实时试算与健康度模拟卡片 (高质感金融轻量卡片) -->
			<div
				class="bg-slate-50/80 rounded-xl p-3.5 border border-solid border-slate-200/80 space-y-2.5"
			>
				<div class="flex items-center justify-between text-xs">
					<span class="font-medium flex items-center gap-1.5 text-slate-700">
						<BarChartOutlined class="text-blue-500" />
						<span>实时试算与健康度模拟</span>
					</span>
					<span
						v-if="previewStats.budget > 0"
						:class="[
							'font-medium',
							previewStats.isOver ?
								'text-rose-600 font-semibold'
							:	'text-blue-600',
						]"
					>
						{{
							previewStats.isOver ? '预算已透支超额' : (
								`已使用 ${previewStats.percent}%`
							)
						}}
					</span>
					<span v-else class="text-slate-400">未设置限额</span>
				</div>

				<div class="grid grid-cols-3 gap-2">
					<div
						class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
					>
						<div class="text-xs text-slate-400">设定预算</div>
						<div
							class="text-sm font-semibold text-slate-800 mt-0.5 font-mono"
						>
							¥{{
								previewStats.budget > 0 ?
									formatAmount(previewStats.budget)
								:	'无上限'
							}}
						</div>
					</div>
					<div
						class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
					>
						<div class="text-xs text-slate-400">本月已计</div>
						<div
							class="text-sm font-semibold text-slate-700 mt-0.5 font-mono"
						>
							<span
								v-if="simulationLoading"
								class="text-xs text-slate-400 font-normal"
								>计算中...</span
							>
							<span v-else>
								{{ previewStats.actual < 0 ? '-' : '' }}¥{{
									formatAmount(Math.abs(previewStats.actual))
								}}
							</span>
						</div>
					</div>
					<div
						class="bg-white p-2.5 rounded-lg border border-solid border-slate-200/60 shadow-2xs"
					>
						<div class="text-xs text-slate-400">试算结余</div>
						<div
							:class="[
								'text-sm font-semibold mt-0.5 font-mono',
								previewStats.isOver ? 'text-rose-600' : 'text-emerald-600',
							]"
						>
							<span
								v-if="simulationLoading"
								class="text-xs text-slate-400 font-normal"
								>计算中...</span
							>
							<span v-else>
								{{ previewStats.remaining < 0 ? '-' : '' }}¥{{
									formatAmount(Math.abs(previewStats.remaining))
								}}
							</span>
						</div>
					</div>
				</div>

				<div v-if="previewStats.budget > 0" class="pt-0.5">
					<a-progress
						:percent="Math.max(0, Math.min(previewStats.percent, 100))"
						:status="previewStats.isOver ? 'exception' : 'active'"
						:stroke-color="getBudgetProgressColor(previewStats.percent)"
						:show-info="false"
						size="small"
					/>
				</div>
			</div>
		</a-form>

		<template #footer>
			<div class="flex items-center justify-end gap-2.5 pt-2">
				<a-button @click="open = false" class="!rounded-lg" data-testid="btn-close-budget">
					{{ canEditBudget ? '取消' : '关闭' }}
				</a-button>
				<a-button
					v-if="canEditBudget"
					type="primary"
					:loading="budgetSaving"
					data-testid="btn-save-budget"
					class="!rounded-lg !bg-blue-600 hover:!bg-blue-500"
					@click="handleSaveBudget"
				>
					保存配置
				</a-button>
			</div>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import {
	WalletOutlined,
	CheckOutlined,
	QuestionCircleOutlined,
	BarChartOutlined,
} from '@ant-design/icons-vue';
import { formatAmount } from '@/utils/amountInfo';
import { getMonthRange } from '@/utils/dayjs';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import type {
	FinanceManagerData,
	FinanceBudgetStatusVo,
	FinanceBudgetAiRecommendVo,
	FinanceBudgetAiParseVo,
} from '@/views/selfFinance/financeManager/config';
import {
	getFinanceSummary,
	saveMonthlyBudget,
	getBudgetCategories,
} from '@/views/selfFinance/financeManager/api';
import BudgetAiAssistantPanel from '@/views/selfFinance/financeManager/finance-budget-modal/components/BudgetAiAssistantPanel.vue';

// 采用 Vue 3.4 原生 defineModel 宏实现 open 双向绑定
const open = defineModel<boolean>('open', { default: false });

interface Props {
	currentMonth: string;
	budgetStatus: FinanceBudgetStatusVo | null;
	belongTo?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'success'): void;
}>();

const userStore = useUserStore();
const { hasPermission, isSuperAdmin } = usePermission();

const canEditBudget = computed(() => {
	if (isSuperAdmin.value) return true;
	return hasPermission('finance:financeManager:budget:edit');
});

// 预算表单与状态
const budgetSaving = ref<boolean>(false);
const budgetFormRef = ref<FormInstance>();
const budgetEditForm = reactive({
	budgetAmount: 0,
	incomeAndExpenses: 'expense',
	selectedDirections: ['expense'] as string[],
	categoryCodes: [] as string[],
});

// 预算表单校验规则
const budgetRules: Record<string, Rule[]> = {
	budgetAmount: [
		{
			required: true,
			validator: async (_rule, value) => {
				if (value === null || value === undefined || value === '') {
					throw new Error('预算金额不能为空');
				}
				if (Number(value) < 0) {
					throw new Error('预算金额不能为负数');
				}
			},
			trigger: ['change', 'blur'],
		},
	],
	selectedDirections: [
		{
			required: true,
			validator: async (_rule, value) => {
				if (!value || !value.length) {
					throw new Error('收支方向至少需要选择一项');
				}
			},
			trigger: 'change',
		},
	],
};

// 快捷预算金额档位
const QUICK_BUDGET_PRESETS = [1000, 2000, 3000, 5000];

// 统计范围模式: 'all' 全部流水(推荐) | 'custom' 指定特定分类
const scopeMode = ref<'all' | 'custom'>('all');
const scopeModeOptions = [
	{ label: '全部日常账目 (推荐)', value: 'all' },
	{ label: '自选专属分类', value: 'custom' },
];

// 系统内置基础分类（防止新月份或新用户记账较少时分类池为空）
const SYSTEM_DEFAULT_CATEGORIES = [
	'餐饮美食',
	'日用百货',
	'交通出行',
	'休闲娱乐',
	'数码电器',
	'服饰美容',
	'医疗保健',
	'住房物业',
	'人情往来',
	'工资薪酬',
];

const isDirectionSelected = (dir: string) => {
	return budgetEditForm.selectedDirections.includes(dir);
};

const toggleDirection = (dir: string) => {
	const current = [...budgetEditForm.selectedDirections];
	const idx = current.indexOf(dir);
	if (idx > -1) {
		if (current.length === 1) {
			message.info('收支类型至少需要保留一项');
			return;
		}
		current.splice(idx, 1);
	} else {
		current.push(dir);
	}
	budgetEditForm.selectedDirections = current;
	budgetEditForm.incomeAndExpenses = current.join(',');
	budgetFormRef.value?.validateFields(['selectedDirections']).catch(() => {});
};

const applyQuickPreset = (amount: number) => {
	budgetEditForm.budgetAmount = amount;
	budgetFormRef.value?.validateFields(['budgetAmount']).catch(() => {});
};

/**
 * 根据预算使用率返回语义色阶 (Taste-Skill 财务风控色板)
 */
const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#52c41a';
	if (percent >= 150) return '#cf1322';
	if (percent >= 100) return '#ff4d4f';
	if (percent >= 90) return '#fa541c';
	if (percent >= 75) return '#faad14';
	return '#1677ff';
};

const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);

// 可用分类集合：合并系统默认分类与近两月流水分类并去重
const availableCategories = computed(() => {
	const set = new Set<string>();
	SYSTEM_DEFAULT_CATEGORIES.forEach((c) => set.add(c));
	recentCategories.value.forEach((c) => {
		if (
			c &&
			c !== '支出' &&
			c !== '收入' &&
			c !== 'expense' &&
			c !== 'income'
		) {
			set.add(c);
		}
	});
	return Array.from(set);
});

const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);

const getEffectiveBelongTo = (): string | undefined => {
	return props.belongTo;
};

// 预算实时试算：根据当前弹窗选择的收支方向、统计模式与自选分类动态调用汇总
const fetchPreviewSimulation = async () => {
	simulationLoading.value = true;
	try {
		const [monthStart, monthEnd] = getMonthRange();
		const effectiveCategoryCodes =
			scopeMode.value === 'all' ?
				[]
			:	budgetEditForm.categoryCodes.filter(
					(c) =>
						c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
				);

		// 如果选择自选模式但未勾选任何具体分类，则当月已计直接为 0
		if (scopeMode.value === 'custom' && effectiveCategoryCodes.length === 0) {
			simulatedActualExpense.value = 0;
			return;
		}

		const dirs = budgetEditForm.selectedDirections;
		const hasExp = dirs.includes('expense');
		const hasInc = dirs.includes('income');

		const queryParams: FinanceManagerData = {
			infoDateStart: monthStart,
			infoDateEnd: monthEnd,
			belongTo: getEffectiveBelongTo(),
			isValid: '1',
		};

		if (effectiveCategoryCodes.length > 0) {
			queryParams.typeCodes = effectiveCategoryCodes;
		}

		if (hasExp && hasInc) {
			queryParams.incomeAndExpenses = undefined;
		} else if (hasInc) {
			queryParams.incomeAndExpenses = 'income';
		} else {
			queryParams.incomeAndExpenses = 'expense';
		}

		const { code, data } = await getFinanceSummary(queryParams);
		if (code === '200' && data) {
			const exp = Number(data.totalExpense || 0);
			const inc = Number(data.totalIncome || 0);
			if (hasExp && hasInc) {
				// 双选净支出: 支出 - 收入
				simulatedActualExpense.value = Number((exp - inc).toFixed(2));
			} else if (hasInc) {
				// 仅收入
				simulatedActualExpense.value = Number(inc.toFixed(2));
			} else {
				// 仅支出
				simulatedActualExpense.value = Number(exp.toFixed(2));
			}
		}
	} catch (e) {
		console.warn('预算动态试算失败:', e);
	} finally {
		simulationLoading.value = false;
	}
};

let simulationTimer: ReturnType<typeof setTimeout> | null = null;
const triggerSimulationDebounced = () => {
	if (simulationTimer) {
		clearTimeout(simulationTimer);
	}
	simulationTimer = setTimeout(() => {
		fetchPreviewSimulation();
	}, 150);
};

// 监听影响已计流水统计的维度：收支方向、统计模式、具体分类列表
watch(
	[
		() => budgetEditForm.selectedDirections,
		() => scopeMode.value,
		() => budgetEditForm.categoryCodes,
	],
	() => {
		if (open.value) {
			triggerSimulationDebounced();
		}
	},
	{ deep: true },
);

// 弹窗内实时试算与健康度预警
const previewStats = computed(() => {
	const budget = Number(budgetEditForm.budgetAmount || 0);
	const actual = simulatedActualExpense.value;
	const remaining = budget > 0 ? Number((budget - actual).toFixed(2)) : 0;
	const percent =
		budget > 0 ?
			actual > 0 ?
				Math.min(Math.round((actual / budget) * 100), 100)
			:	0
		:	0;
	const isOver = budget > 0 && actual > budget;
	return {
		budget,
		actual,
		remaining,
		percent,
		isOver,
	};
});

const isCategorySelected = (cat: string) => {
	return budgetEditForm.categoryCodes.includes(cat);
};

const toggleCategory = (cat: string) => {
	const idx = budgetEditForm.categoryCodes.indexOf(cat);
	if (idx > -1) {
		budgetEditForm.categoryCodes.splice(idx, 1);
	} else {
		budgetEditForm.categoryCodes.push(cat);
	}
};

const selectAllCategories = () => {
	budgetEditForm.categoryCodes = [...availableCategories.value];
};

const clearAllCategories = () => {
	budgetEditForm.categoryCodes = [];
};

const fetchRecentCategories = async () => {
	categoriesLoading.value = true;
	try {
		const { code, data } = await getBudgetCategories(
			props.currentMonth,
			getEffectiveBelongTo(),
		);
		if (code === '200' && Array.isArray(data)) {
			const cleanData = data.filter(
				(c) =>
					c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
			);
			const existingSelected = budgetEditForm.categoryCodes.filter(
				(c) =>
					c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
			);
			recentCategories.value = Array.from(
				new Set([...cleanData, ...existingSelected]),
			).sort();
		}
	} catch (e) {
		console.warn('获取近两月记账类别失败:', e);
	} finally {
		categoriesLoading.value = false;
	}
};

// AI 智能预算测算与解析状态
const aiAssistantPanelRef = ref<{
	fetchAiRecommend: () => void;
	resetPanel: () => void;
} | null>(null);
const isBudgetHighlighted = ref<boolean>(false);
const isCategoriesHighlighted = ref<boolean>(false);
const aiRecommendData = ref<FinanceBudgetAiRecommendVo | null>(null);

const triggerBudgetHighlight = () => {
	isBudgetHighlighted.value = true;
	setTimeout(() => {
		isBudgetHighlighted.value = false;
	}, 1200);
};

const triggerCategoriesHighlight = () => {
	isCategoriesHighlighted.value = true;
	setTimeout(() => {
		isCategoriesHighlighted.value = false;
	}, 1200);
};

const handleApplyParsedCommand = (data: FinanceBudgetAiParseVo) => {
	if (
		data.hasBudget &&
		data.amount !== undefined &&
		data.amount !== null
	) {
		budgetEditForm.budgetAmount = Number(data.amount);
		triggerBudgetHighlight();
	}
	if (data.hasCategories && data.categories && data.categories.length > 0) {
		scopeMode.value = 'custom';
		const matched = data.categories.filter((c) =>
			availableCategories.value.includes(c),
		);
		budgetEditForm.categoryCodes =
			matched.length > 0 ? matched : data.categories;
		triggerCategoriesHighlight();
	}
};

const applyRecommendTier = (amount?: number) => {
	if (amount !== undefined && amount !== null) {
		budgetEditForm.budgetAmount = Number(amount);
		triggerBudgetHighlight();
	}
};

const applyRecommendedCategories = (categories?: string[]) => {
	if (!categories || !categories.length) return;
	scopeMode.value = 'custom';
	const matched = categories.filter((c) =>
		availableCategories.value.includes(c),
	);
	budgetEditForm.categoryCodes =
		matched.length > 0 ? matched : [...categories];
	triggerCategoriesHighlight();
	message.success('已切换为自选模式并应用推荐分类');
};

const handleSaveBudget = async () => {
	if (!canEditBudget.value) {
		message.warning('家庭成员浏览模式，仅家庭管理员可调整月度预算设定');
		return;
	}
	try {
		await budgetFormRef.value?.validate();
	} catch {
		return;
	}
	budgetSaving.value = true;
	try {
		const effectiveCategoryCodes =
			scopeMode.value === 'all' ?
				[]
			:	budgetEditForm.categoryCodes.filter(
					(c) =>
						c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
				);
		const saveBelongTo =
			getEffectiveBelongTo() ||
			((
				userStore.getUserInfo?.id !== undefined &&
				userStore.getUserInfo?.id !== null
			) ?
				String(userStore.getUserInfo?.id)
			:	undefined);
		const { code, message: msg } = await saveMonthlyBudget({
			budgetMonth: props.currentMonth,
			yearMonth: props.currentMonth,
			belongTo: saveBelongTo,
			incomeAndExpenses: budgetEditForm.selectedDirections.join(','),
			budgetAmount: budgetEditForm.budgetAmount,
			categoryCodes: effectiveCategoryCodes,
		});
		if (code === '200') {
			message.success('零花钱预算已更新');
			open.value = false;
			emit('success');
		} else {
			message.error(msg || '保存失败');
		}
	} catch (e: any) {
		message.error(e?.message || '保存预算失败');
	} finally {
		budgetSaving.value = false;
	}
};

// 弹窗打开时自闭环初始化
const initBudgetModal = async () => {
	budgetEditForm.budgetAmount = Number(props.budgetStatus?.budgetAmount || 0);
	const rawDir = props.budgetStatus?.incomeAndExpenses || 'expense';
	const parsed = rawDir
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter((s) => s === 'expense' || s === 'income');
	budgetEditForm.selectedDirections = parsed.length ? parsed : ['expense'];
	budgetEditForm.incomeAndExpenses =
		budgetEditForm.selectedDirections.join(',');
	const existingCats = [...(props.budgetStatus?.categoryCodes || [])].filter(
		(c) => c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
	);
	budgetEditForm.categoryCodes = existingCats;
	scopeMode.value = existingCats.length > 0 ? 'custom' : 'all';
	aiAssistantPanelRef.value?.resetPanel();
	if (!aiRecommendData.value) {
		aiAssistantPanelRef.value?.fetchAiRecommend();
	}
	nextTick(() => {
		budgetFormRef.value?.clearValidate();
	});
	fetchPreviewSimulation();
	await fetchRecentCategories();
};

watch(
	open,
	(val) => {
		if (val) {
			initBudgetModal();
		}
	},
	{ immediate: false },
);
</script>
