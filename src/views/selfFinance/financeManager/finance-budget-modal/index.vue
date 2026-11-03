<template>
	<!-- 调整零花钱预算右侧抽屉 (Tailwind Soft UI 高质感风格，对标记账流水抽屉) -->
	<BaseRbacDrawer
		v-model:open="open"
		title="设置 / 调整零花钱预算"
		subtitle="独立设定每月预算额度，支持快捷档位填充与全量/自选分类统计"
		width="600px"
		:loading="budgetSaving"
		:destroy-on-close="true"
		@save="handleSaveBudget"
		@cancel="open = false"
	>
		<a-form
			ref="budgetFormRef"
			:model="budgetEditForm"
			:rules="budgetRules"
			layout="vertical"
			class="modern-soft-budget-form space-y-3.5"
		>
			<!-- 普通成员只读提示横幅 -->
			<a-alert
				v-if="!canEditBudget"
				type="info"
				show-icon
				message="家庭成员浏览模式，仅家庭管理员可调整月度预算设定"
				class="!rounded-2xl !border-0 !bg-indigo-500/10 !text-indigo-700 !mb-1"
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

			<!-- 卡片 1：月度预算额度与快捷填充 (紧凑融合布局) -->
			<div class="bg-slate-50/80 rounded-2xl p-4 space-y-3">
				<a-form-item name="budgetAmount" class="!mb-0">
					<template #label>
						<div class="flex items-center justify-between w-full gap-2">
							<div class="flex items-baseline gap-2">
								<span class="text-xs font-semibold text-slate-600">
									月度预算额度
								</span>
								<span class="text-[11px] text-slate-400 font-normal">
									设为 0 表示不设限额
								</span>
							</div>
							<div class="flex items-center gap-1.5">
								<span
									class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 font-mono"
								>
									{{ currentMonth }}
								</span>
								<span class="text-[11px] text-slate-400 hidden sm:inline">
									次月自动继承
								</span>
							</div>
						</div>
					</template>
					<a-input
						v-model:value="budgetEditForm.budgetAmount"
						type="number"
						:min="0"
						:disabled="!canEditBudget"
						placeholder="0.00"
						data-testid="budget-amount-input"
						:class="[
							'w-full !rounded-xl font-mono font-bold text-sm transition-all duration-500',
							isBudgetHighlighted ?
								'!ring-2 !ring-indigo-400/90 !ring-offset-1 !border-indigo-500 shadow-xs'
							:	'',
						]"
					>
						<template #prefix>
							<span class="font-mono font-bold text-indigo-600">¥</span>
						</template>
						<template #suffix>
							<span class="text-[11px] font-mono text-slate-400">RMB / 月</span>
						</template>
					</a-input>
				</a-form-item>

				<!-- 快捷档位无边框胶囊，左对齐紧凑流，消除中间空白断层 -->
				<div class="flex items-center gap-2 pt-0.5 flex-wrap">
					<span class="text-[11px] text-slate-400 shrink-0">快捷填充:</span>
					<div class="flex items-center gap-1.5 flex-wrap">
						<!-- 融入 AI 适度推荐档位 (若就绪) -->
						<button
							v-if="aiRecommendData?.moderateAmount"
							type="button"
							:class="[
								'cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium transition-all select-none border-0 inline-flex items-center gap-1',
								Number(budgetEditForm.budgetAmount) ===
								Number(aiRecommendData.moderateAmount) ?
									'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
								:	'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15',
							]"
							@click="applyRecommendTier(aiRecommendData.moderateAmount)"
						>
							<span
								class="text-[10px] px-1.5 py-0.2 rounded-full bg-white/25 font-bold"
							>
								AI推荐
							</span>
							<span class="font-mono">
								¥{{ formatAmount(aiRecommendData.moderateAmount || 0) }}
							</span>
						</button>

						<button
							v-for="preset in QUICK_BUDGET_PRESETS"
							:key="preset"
							type="button"
							:class="[
								'cursor-pointer px-3 py-1 rounded-full text-xs font-medium font-mono transition-all select-none border-0',
								Number(budgetEditForm.budgetAmount) === preset ?
									'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 -translate-y-0.5'
								:	'bg-white text-slate-600 shadow-2xs hover:bg-indigo-500/10 hover:text-indigo-600 hover:-translate-y-0.5',
							]"
							@click="applyQuickPreset(preset)"
						>
							¥{{ preset }}
						</button>
						<button
							type="button"
							:class="[
								'cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all select-none border-0',
								Number(budgetEditForm.budgetAmount) === 0 ?
									'bg-slate-800 text-white shadow-xs'
								:	'bg-white text-slate-500 shadow-2xs hover:bg-slate-200/70 hover:text-slate-700',
							]"
							@click="applyQuickPreset(0)"
						>
							不设上限
						</button>
					</div>
				</div>
			</div>

			<!-- 卡片 2：收支方向与统计范畴 (双列对称 Segmented + 全彩 Emoji 分类池) -->
			<div class="bg-slate-50/80 rounded-2xl p-4 space-y-3.5">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<!-- 左列：收支方向 (支持单选/多选) -->
					<a-form-item name="selectedDirections" class="!mb-0">
						<template #label>
							<div class="flex items-center justify-between w-full gap-1.5">
								<span class="text-xs font-semibold text-slate-600">
									收支方向
								</span>
								<span
									class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600"
								>
									{{
										budgetEditForm.selectedDirections.length === 2 ? '双向统计'
										: isDirectionSelected('income') ? '仅限收入'
										: '仅限支出'
									}}
								</span>
							</div>
						</template>
						<div
							class="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl h-9 box-border"
						>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									isDirectionSelected('expense') ?
										'bg-white text-rose-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="toggleDirection('expense')"
							>
								<span
									:class="[
										'w-1.5 h-1.5 rounded-full inline-block',
										isDirectionSelected('expense') ?
											'bg-rose-500'
										:	'bg-slate-400',
									]"
								></span>
								<span>支出</span>
							</button>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									isDirectionSelected('income') ?
										'bg-white text-emerald-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="toggleDirection('income')"
							>
								<span
									:class="[
										'w-1.5 h-1.5 rounded-full inline-block',
										isDirectionSelected('income') ?
											'bg-emerald-500'
										:	'bg-slate-400',
									]"
								></span>
								<span>收入</span>
							</button>
						</div>
					</a-form-item>

					<!-- 右列：统计范畴 (零下拉 Segmented 切换) -->
					<div class="flex flex-col">
						<div class="flex items-center justify-between pb-2">
							<div class="flex items-center gap-1">
								<span class="text-xs font-semibold text-slate-600">
									统计范畴
								</span>
								<a-tooltip
									title="全量日常模式自动汇总当月所有非转账类别的日常收支；自选模式可精细勾选特定消费分类"
								>
									<QuestionCircleOutlined
										class="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
									/>
								</a-tooltip>
							</div>
							<span class="text-[11px] text-slate-400">
								{{ scopeMode === 'all' ? '自动剔除转账' : '按勾选类别汇总' }}
							</span>
						</div>
						<div
							class="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl h-9 box-border"
						>
							<button
								v-for="opt in scopeModeOptions"
								:key="opt.value"
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center',
									scopeMode === opt.value ?
										'bg-white text-indigo-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="scopeMode = opt.value as 'all' | 'custom'"
							>
								{{ opt.label }}
							</button>
						</div>
					</div>
				</div>

				<!-- 自选分类列表 (白底微质感内嵌容器，保留全彩 Emoji) -->
				<div
					v-if="scopeMode === 'custom'"
					:class="[
						'bg-white rounded-2xl p-3.5 shadow-2xs space-y-2.5 transition-all duration-500',
						isCategoriesHighlighted ?
							'ring-2 ring-indigo-400/90 ring-offset-1 shadow-xs'
						:	'',
					]"
				>
					<div class="flex items-center justify-between text-xs">
						<div class="flex items-center gap-1.5">
							<span class="text-slate-600 font-medium">
								选择纳入预算的分类
							</span>
							<span
								class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 font-mono"
							>
								已选 {{ selectedCategoryCount }} 项
							</span>
						</div>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="border-0 bg-transparent p-0 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
								@click="selectAllCategories"
							>
								全选
							</button>
							<span class="text-slate-200 text-xs">|</span>
							<button
								type="button"
								class="border-0 bg-transparent p-0 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
								@click="clearAllCategories"
							>
								清空
							</button>
						</div>
					</div>

					<!-- 现代全圆角灵动微胶囊 Pills (始终保留彩色 Emoji 锚点) -->
					<div
						v-if="availableCategories.length"
						class="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1 py-0.5"
					>
						<button
							v-for="cat in availableCategories"
							:key="cat"
							type="button"
							:class="[
								'cursor-pointer px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 select-none inline-flex items-center gap-1 border-0 active:scale-95',
								isCategorySelected(cat) ?
									'bg-indigo-500 text-white font-semibold shadow-sm shadow-indigo-500/25'
								:	'bg-slate-100/90 text-slate-600 hover:bg-indigo-500/10 hover:text-indigo-600',
							]"
							@click="toggleCategory(cat)"
						>
							<span class="text-xs leading-none">{{
								getCategoryEmoji(cat)
							}}</span>
							<span class="leading-tight">{{ cat }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- 卡片 3：实时试算与健康度模拟卡片 (0ms 瞬时回显) -->
			<div class="bg-slate-50/80 rounded-2xl p-4 space-y-3">
				<div class="flex items-center justify-between text-xs">
					<span class="font-semibold flex items-center gap-1.5 text-slate-700">
						<span
							class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center"
						>
							<BarChartOutlined class="text-[11px]" />
						</span>
						<span>实时试算与健康度模拟</span>
					</span>
					<span
						v-if="previewStats.budget > 0"
						:class="[
							'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono',
							previewStats.isOver ?
								'bg-rose-500/10 text-rose-600'
							:	'bg-indigo-500/10 text-indigo-600',
						]"
					>
						{{
							previewStats.isOver ?
								'预算已透支超额'
							:	`已使用 ${previewStats.percent}%`
						}}
					</span>
					<span v-else class="text-slate-400">未设置限额</span>
				</div>

				<div class="grid grid-cols-3 gap-2.5">
					<div class="bg-white p-3 rounded-xl shadow-2xs">
						<div class="text-xs text-slate-400">设定预算</div>
						<div
							class="text-sm font-bold text-slate-900 mt-1 font-mono tabular-nums"
						>
							¥{{
								previewStats.budget > 0 ?
									formatAmount(previewStats.budget)
								:	'无上限'
							}}
						</div>
					</div>
					<div class="bg-white p-3 rounded-xl shadow-2xs">
						<div class="text-xs text-slate-400">本月已计</div>
						<div
							class="text-sm font-bold text-slate-700 mt-1 font-mono tabular-nums"
						>
							{{ previewStats.actual < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(previewStats.actual))
							}}
						</div>
					</div>
					<div class="bg-white p-3 rounded-xl shadow-2xs">
						<div class="text-xs text-slate-400">试算结余</div>
						<div
							:class="[
								'text-sm font-bold mt-1 font-mono tabular-nums',
								previewStats.isOver ? 'text-rose-600' : 'text-emerald-600',
							]"
						>
							{{ previewStats.remaining < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(previewStats.remaining))
							}}
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
			<div class="flex items-center justify-end gap-2.5 w-full">
				<button
					type="button"
					data-testid="btn-close-budget"
					class="h-9 px-4 rounded-xl border-0 bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 text-xs font-medium cursor-pointer transition-all duration-200"
					@click="open = false"
				>
					{{ canEditBudget ? '取消' : '关闭' }}
				</button>
				<button
					v-if="canEditBudget"
					type="button"
					:disabled="budgetSaving"
					data-testid="btn-save-budget"
					class="h-9 px-5 rounded-xl border-0 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 text-xs font-medium shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 cursor-pointer transition-all duration-200"
					@click="handleSaveBudget"
				>
					保存配置
				</button>
			</div>
		</template>
	</BaseRbacDrawer>
</template>

<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { message } from 'ant-design-vue';
import {
	QuestionCircleOutlined,
	BarChartOutlined,
} from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import { formatAmount } from '@/utils/amountInfo';
import { getMonthRange } from '@/utils/dayjs';
import { useUserStore } from '@/store/modules/user/user';
import { usePermission } from '@/composables/usePermission';
import {
	getCategoryEmoji,
	type FinanceManagerData,
	type FinanceBudgetStatusVo,
	type FinanceBudgetAiRecommendVo,
	type FinanceBudgetAiParseVo,
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
	{ label: '全部日常 (推荐)', value: 'all' },
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
 * 根据预算使用率返回语义色阶 (Tailwind Soft UI 财务风控色板)
 */
const getBudgetProgressColor = (percent: number): string => {
	if (percent < 0) return '#059669'; // emerald-600
	if (percent >= 150) return '#be123c'; // rose-700
	if (percent >= 100) return '#e11d48'; // rose-600
	if (percent >= 90) return '#ea580c'; // orange-600
	if (percent >= 75) return '#d97706'; // amber-600
	return '#4f46e5'; // indigo-600
};

const recentCategories = ref<string[]>([]);
const categoriesLoading = ref<boolean>(false);

const IGNORED_DIRECTION_CODES = new Set(['支出', '收入', 'expense', 'income']);

// 可用分类集合：实时合并系统默认分类、已选分类与近两月流水分类，确保 0 延迟与计数一致
const availableCategories = computed(() => {
	const set = new Set<string>();
	SYSTEM_DEFAULT_CATEGORIES.forEach((c) => set.add(c));
	(props.budgetStatus?.categoryCodes || []).forEach((c) => {
		if (c && !IGNORED_DIRECTION_CODES.has(c)) {
			set.add(c);
		}
	});
	budgetEditForm.categoryCodes.forEach((c) => {
		if (c && !IGNORED_DIRECTION_CODES.has(c)) {
			set.add(c);
		}
	});
	recentCategories.value.forEach((c) => {
		if (c && !IGNORED_DIRECTION_CODES.has(c)) {
			set.add(c);
		}
	});
	return Array.from(set);
});

const selectedCategoryCount = computed(() => {
	const availableSet = new Set(availableCategories.value);
	return budgetEditForm.categoryCodes.filter((c) => availableSet.has(c)).length;
});

const simulatedActualExpense = ref<number>(0);
const simulationLoading = ref<boolean>(false);

const getEffectiveBelongTo = (): string | undefined => {
	return props.belongTo;
};

// 预算实时试算：根据当前抽屉选择的收支方向、统计模式与自选分类动态调用汇总
const getEffectiveCategoryCodes = (
	mode: 'all' | 'custom',
	codes: string[],
): string[] => {
	if (mode === 'all') {
		return [];
	}
	return codes.filter((c) => !IGNORED_DIRECTION_CODES.has(c));
};

const resolveSimulatedActual = (
	data: { totalExpense?: number | string; totalIncome?: number | string },
	hasExp: boolean,
	hasInc: boolean,
): number => {
	const exp = Number(data.totalExpense || 0);
	const inc = Number(data.totalIncome || 0);
	if (hasExp && hasInc) {
		return Number((exp - inc).toFixed(2));
	}
	if (hasInc) {
		return Number(inc.toFixed(2));
	}
	return Number(exp.toFixed(2));
};

const resolveDirectionParam = (
	hasExp: boolean,
	hasInc: boolean,
): string | undefined => {
	if (hasExp && hasInc) {
		return undefined;
	}
	return hasInc ? 'income' : 'expense';
};

const fetchPreviewSimulation = async () => {
	simulationLoading.value = true;
	try {
		const [monthStart, monthEnd] = getMonthRange(props.currentMonth || 0);
		const effectiveCategoryCodes = getEffectiveCategoryCodes(
			scopeMode.value,
			budgetEditForm.categoryCodes,
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
			incomeAndExpenses: resolveDirectionParam(hasExp, hasInc),
			...(effectiveCategoryCodes.length > 0 ?
				{ typeCodes: effectiveCategoryCodes }
			:	{}),
		};

		const { code, data } = await getFinanceSummary(queryParams);
		if (code === '200' && data) {
			simulatedActualExpense.value = resolveSimulatedActual(
				data,
				hasExp,
				hasInc,
			);
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

// 抽屉内实时试算与健康度预警
const previewStats = computed(() => {
	const budget = Number(budgetEditForm.budgetAmount || 0);
	const actual = simulatedActualExpense.value;
	const remaining = budget > 0 ? Number((budget - actual).toFixed(2)) : 0;
	let percent = 0;
	if (budget > 0 && actual > 0) {
		percent = Math.min(Math.round((actual / budget) * 100), 100);
	}
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
			const cleanData = data.filter((c) => c && !IGNORED_DIRECTION_CODES.has(c));
			const existingSelected = budgetEditForm.categoryCodes.filter(
				(c) => c && !IGNORED_DIRECTION_CODES.has(c),
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
		const effectiveCategoryCodes = getEffectiveCategoryCodes(
			scopeMode.value,
			budgetEditForm.categoryCodes,
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
			budgetAmount: Number(budgetEditForm.budgetAmount || 0),
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

// 抽屉打开时自闭环初始化（0ms 瞬时试算回显）
const initBudgetModal = async () => {
	budgetEditForm.budgetAmount = Number(props.budgetStatus?.budgetAmount || 0);
	simulatedActualExpense.value = Number(props.budgetStatus?.actualExpense || 0);
	const rawDir = props.budgetStatus?.incomeAndExpenses || 'expense';
	const parsed = rawDir
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter((s) => s === 'expense' || s === 'income');
	budgetEditForm.selectedDirections = parsed.length ? parsed : ['expense'];
	budgetEditForm.incomeAndExpenses =
		budgetEditForm.selectedDirections.join(',');
	const existingCats = [...(props.budgetStatus?.categoryCodes || [])].filter(
		(c) => c && !IGNORED_DIRECTION_CODES.has(c),
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
	void fetchPreviewSimulation();
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

<style lang="scss" scoped>
.modern-soft-budget-form {
	:deep(.ant-form-item-label > label) {
		width: 100%;
		font-size: 12px;
		font-weight: 600;
		color: #475569;
	}

	:deep(.ant-input),
	:deep(.ant-input-affix-wrapper) {
		border-radius: 12px !important;
		border-color: rgba(226, 232, 240, 0.9) !important;
	}
}
</style>
