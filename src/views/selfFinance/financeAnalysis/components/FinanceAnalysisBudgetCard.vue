<template>
	<!-- 07 · 当月零钱消费与预算分析 (全宽白卡，Soft UI 高质感双舱看板) -->
	<div
		class="finance-analysis-budget-card bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 mt-4"
	>
		<!-- 头部标题栏与快捷操作 -->
		<div
			class="flex items-center justify-between gap-3 pb-3 mb-4 border-0 border-b border-solid border-slate-100 flex-wrap"
		>
			<div class="flex items-center gap-2.5 flex-wrap">
				<span
					class="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center text-sm shrink-0"
				>
					<WalletOutlined />
				</span>
				<div class="flex items-baseline gap-2">
					<span class="text-base font-bold text-slate-900">
						当月零钱消费与预算分析
					</span>
					<span class="text-xs text-slate-400 font-mono">
						({{ currentMonth }})
					</span>
				</div>

				<template v-if="!loading">
					<span
						v-if="budgetStatus?.isOverBudget"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 bg-rose-500/10 text-rose-600"
					>
						🚨 已超支
					</span>
					<span
						v-else-if="budgetStatus?.isInherited"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 bg-indigo-500/10 text-indigo-600"
					>
						继承自上月
					</span>
					<span
						v-else-if="(budgetStatus?.budgetAmount || 0) > 0"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 bg-emerald-500/10 text-emerald-600"
					>
						预算充裕
					</span>
					<span
						v-else
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-0 bg-slate-100 text-slate-500"
					>
						未设限额
					</span>
				</template>
				<span
					v-else
					class="inline-block w-16 h-5 rounded-full bg-slate-200/70 animate-pulse"
				></span>
			</div>

			<!-- 右侧快捷操作 -->
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border-0 bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 text-xs font-semibold cursor-pointer transition-colors"
					@click="$emit('open-budget')"
				>
					<SettingOutlined class="text-[11px]" />
					<span>调整预算</span>
				</button>
				<button
					type="button"
					class="inline-flex items-center gap-1 h-7 px-3 rounded-lg border-0 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 text-xs font-semibold cursor-pointer transition-colors"
					@click="$emit('view-records')"
				>
					<span>查看全部明细</span>
					<ArrowRightOutlined class="text-[11px]" />
				</button>
			</div>
		</div>

		<!-- 骨架屏加载态 (1:1 左右双舱轮廓) -->
		<div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-5 py-1">
			<!-- 左舱骨架 (5/12) -->
			<div class="lg:col-span-5 bg-slate-50/80 rounded-2xl p-4 space-y-4">
				<div class="flex justify-between items-center">
					<div class="h-4 w-24 bg-slate-200/70 rounded animate-pulse"></div>
					<div class="h-5 w-32 bg-slate-200/50 rounded-full animate-pulse"></div>
				</div>
				<div class="h-9 w-44 bg-slate-200/80 rounded-lg animate-pulse"></div>
				<div class="space-y-2 pt-1">
					<div class="h-3 w-36 bg-slate-200/60 rounded animate-pulse"></div>
					<div class="h-5 w-full bg-slate-200/70 rounded-xl animate-pulse"></div>
				</div>
				<div class="grid grid-cols-2 gap-3 pt-2">
					<div class="h-11 bg-slate-200/50 rounded-xl animate-pulse"></div>
					<div class="h-11 bg-slate-200/50 rounded-xl animate-pulse"></div>
				</div>
			</div>
			<!-- 右舱骨架 (7/12) -->
			<div class="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 space-y-3">
				<div class="flex justify-between items-center mb-3">
					<div class="h-4 w-32 bg-slate-200/70 rounded animate-pulse"></div>
					<div class="h-3 w-28 bg-slate-200/50 rounded animate-pulse"></div>
				</div>
				<div v-for="i in 3" :key="i" class="space-y-1.5 py-1">
					<div class="flex justify-between">
						<div class="h-3.5 w-20 bg-slate-200/60 rounded animate-pulse"></div>
						<div class="h-3.5 w-16 bg-slate-200/60 rounded animate-pulse"></div>
					</div>
					<div class="h-3 w-full bg-slate-200/50 rounded-full animate-pulse"></div>
				</div>
				<div class="h-6 w-full bg-slate-200/40 rounded-lg animate-pulse mt-2"></div>
			</div>
		</div>

		<!-- 真实数据双舱内容 -->
		<div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-5">
			<!-- 👈 左舱：预算健康度与进度看板 (占 5/12) -->
			<div
				class="lg:col-span-5 bg-slate-50/80 rounded-2xl p-4 border-0 flex flex-col justify-between"
			>
				<div>
					<!-- 核心大字指标 + 动态节奏胶囊 -->
					<div class="flex items-center justify-between text-xs mb-1">
						<span class="text-slate-500 font-medium">
							{{ budgetStatus?.isOverBudget ? '已超支金额' : '剩余可用零钱' }}
						</span>
						<span
							v-if="dailyGuideText"
							:class="[
								'text-[11px] font-mono px-2 py-0.5 rounded-full border-0 font-medium',
								budgetStatus?.isOverBudget ?
									'bg-rose-500/10 text-rose-600 font-semibold'
								:	'bg-emerald-500/10 text-emerald-600',
							]"
						>
							{{ dailyGuideText }}
						</span>
					</div>

					<div
						:class="[
							'text-3xl font-extrabold font-mono tabular-nums tracking-tight my-1',
							budgetStatus?.isOverBudget ? 'text-rose-600' : 'text-emerald-600',
						]"
					>
						{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{
							formatAmount(Math.abs(budgetStatus?.remainingAmount || 0))
						}}
					</div>

					<!-- 子弹对比图主体 (Bullet Track) -->
					<div class="mt-4 pt-1">
						<div class="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
							<div class="flex items-center gap-1.5">
								<span class="text-slate-700 font-bold">预算使用进度</span>
								<span
									:class="[
										'text-[10px] font-semibold px-2 py-0.5 rounded-full border-0',
										pacingStatus.bg,
										pacingStatus.color,
									]"
								>
									{{ pacingStatus.label }}
								</span>
							</div>
							<div class="flex items-baseline gap-2 font-mono">
								<span class="text-slate-400 text-[11px]">
									已消耗 {{ budgetStatus?.usagePercent ?? 0 }}%
								</span>
								<span
									v-if="!budgetStatus?.isOverBudget && (budgetStatus?.budgetAmount || 0) > 0"
									class="text-emerald-600 font-bold text-xs"
								>
									余 ¥{{ formatAmount(budgetStatus?.remainingAmount) }}
								</span>
								<span
									v-else-if="budgetStatus?.isOverBudget"
									class="text-rose-600 font-bold text-xs"
								>
									超 ¥{{ formatAmount(Math.abs(budgetStatus?.remainingAmount || 0)) }}
								</span>
							</div>
						</div>

						<!-- 子弹图轨道与标线 -->
						<div class="relative w-full pt-1 pb-1">
							<div
								class="relative w-full h-5 bg-slate-200/70 rounded-xl overflow-hidden border border-solid border-slate-200/90"
							>
								<!-- 主消费进度条 -->
								<div
									:class="[
										'h-full rounded-l-xl transition-all duration-500 relative flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-white',
										budgetStatus?.isOverBudget
											? 'bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
											: 'bg-indigo-500',
									]"
									:style="{
										width: `${progressPercent}%`,
										minWidth: progressPercent > 0 ? '10px' : '0',
										background: barGradientStyle,
									}"
								>
									<span v-if="progressPercent >= 24" class="drop-shadow-xs">
										¥{{ formatAmount(budgetStatus?.actualExpense || 0) }}
									</span>
								</div>

								<!-- 时间流逝参考虚线 (当月流逝节奏) -->
								<div
									v-if="monthTimeProgress > 0 && monthTimeProgress < 100"
									class="absolute top-0 bottom-0 pointer-events-none -translate-x-1/2 flex flex-col items-center z-10"
									:style="{ left: `${monthTimeProgress}%` }"
									:title="`今日时间线: 当月第 ${todayDay} 天 (${monthTimeProgress}%)`"
								>
									<div
										class="w-px h-full border-0 border-r border-dashed border-slate-500/80"
									></div>
								</div>
							</div>

							<!-- 100% 预算上限强标线 (右侧垂线标线) -->
							<div
								class="absolute top-0 bottom-0 right-0 w-1 bg-slate-800 rounded-full z-20 shadow-xs pointer-events-none"
								title="预算上限 100% 标线"
							></div>
						</div>

						<!-- 底部刻度与标线图例 -->
						<div
							class="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1 px-0.5"
						>
							<span>¥0</span>
							<span
								v-if="monthTimeProgress > 0 && monthTimeProgress < 100"
								class="inline-flex items-center gap-1 text-slate-500 font-sans"
								:title="`建议进度: 当月时间已过 ${monthTimeProgress}%`"
							>
								<span class="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
								<span>时间参考 ({{ monthTimeProgress }}%)</span>
							</span>
							<span class="text-slate-800 font-semibold flex items-center gap-1">
								<span class="w-1 h-2.5 rounded-xs bg-slate-800 inline-block"></span>
								<span>上限 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span>
							</span>
						</div>
					</div>
				</div>

				<!-- 上限与已花费副指标 -->
				<div
					class="grid grid-cols-2 gap-3 pt-3 mt-4 border-0 border-t border-solid border-slate-200/60"
				>
					<div class="flex flex-col">
						<span class="text-[11px] text-slate-400">零花钱预算上限</span>
						<span
							class="text-base font-bold font-mono tabular-nums text-slate-800 mt-0.5"
						>
							¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}
						</span>
					</div>
					<div
						class="flex flex-col cursor-pointer group"
						title="点击联动查看当月已计入明细"
						@click="$emit('view-records')"
					>
						<span
							class="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors"
						>
							当月实际开销 ↗
						</span>
						<span
							:class="[
								'text-base font-bold font-mono tabular-nums mt-0.5 transition-colors',
								budgetStatus?.isOverBudget ?
									'text-rose-600 font-extrabold'
								:	'text-slate-800 group-hover:text-indigo-600',
							]"
						>
							{{ (budgetStatus?.actualExpense || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(budgetStatus?.actualExpense || 0))
							}}
						</span>
					</div>
				</div>
			</div>

			<!-- 👉 右舱：当月零钱消费去向 (TOP 分类排行条，占 7/12) -->
			<div
				class="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 border-0 flex flex-col justify-between"
			>
				<div>
					<!-- 头部说明与穿透提示 -->
					<div class="flex items-center justify-between gap-2 mb-3">
						<div class="flex items-center gap-1.5">
							<span class="text-xs font-bold text-slate-800">
								当月零钱消费去向
							</span>
							<span
								v-if="rankedExpenseCategories.length > 0"
								class="text-[10px] text-slate-400 font-mono"
							>
								(共 {{ rankedExpenseCategories.length }} 个支出分类)
							</span>
						</div>
						<span class="text-[11px] text-slate-400">
							点击分类可穿透筛选对应流水 ↗
						</span>
					</div>

					<!-- 分类条目清单 (TOP 4) -->
					<div
						v-if="rankedExpenseCategories.length > 0"
						class="space-y-2.5 py-0.5"
					>
						<div
							v-for="(item, idx) in rankedExpenseCategories.slice(0, 4)"
							:key="item.name"
							class="group cursor-pointer p-1.5 rounded-xl hover:bg-white/90 transition-all duration-200"
							:title="`点击穿透查看【${item.name}】流水明细`"
							@click="$emit('select-category', item.name)"
						>
							<div class="flex items-center justify-between text-xs mb-1">
								<div class="flex items-center gap-1.5">
									<span class="text-sm select-none">{{ item.emoji }}</span>
									<span
										:class="[
											'font-semibold transition-colors',
											item.isCulprit ?
												'text-rose-600'
											:	'text-slate-700 group-hover:text-indigo-600',
										]"
									>
										{{ item.name }}
									</span>
									<span
										v-if="item.isCulprit"
										class="text-[10px] px-1.5 py-0.2 rounded-full border-0 bg-rose-500/10 text-rose-600 font-semibold"
									>
										主要开销项
									</span>
								</div>
								<div class="flex items-baseline gap-2 font-mono">
									<span
										:class="[
											'font-bold tabular-nums',
											item.isCulprit ? 'text-rose-600' : 'text-slate-800',
										]"
									>
										¥{{ formatAmount(item.value) }}
									</span>
									<span class="text-[11px] text-slate-400 w-11 text-right">
										{{ item.ratio }}%
									</span>
								</div>
							</div>

							<!-- 进度胶囊轨道 -->
							<div
								class="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden p-0.5"
							>
								<div
									:class="[
										'h-full rounded-full transition-all duration-500',
										item.isCulprit ?
											'bg-rose-500 shadow-xs'
										: idx === 0 ?
											'bg-indigo-500'
										:	'bg-indigo-400',
									]"
									:style="{
										width: `${item.barWidth}%`,
										minWidth: item.barWidth > 0 ? '8px' : '0',
										background: item.isCulprit
											? 'linear-gradient(90deg, #f43f5e, #e11d48)'
											: idx === 0
											? 'linear-gradient(90deg, #6366f1, #4f46e5)'
											: 'linear-gradient(90deg, #818cf8, #6366f1)',
									}"
								></div>
							</div>
						</div>
					</div>

					<!-- 空状态 (当月尚未产生零钱消费) -->
					<div
						v-else
						class="h-40 flex flex-col items-center justify-center text-center p-4"
					>
						<span class="text-2xl mb-1.5 select-none">🌱</span>
						<span class="text-xs font-semibold text-slate-600">
							当月暂无零钱分类消费
						</span>
						<span class="text-[11px] text-slate-400 mt-0.5">
							记账流水计入零钱预算后将在此实时呈现结构排行
						</span>
					</div>
				</div>

				<!-- 底部极简智能归因条 -->
				<div
					class="pt-2.5 mt-3 border-0 border-t border-solid border-slate-200/60 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-1"
				>
					<div class="flex items-center gap-1.5">
						<span class="text-xs select-none">
							{{ budgetStatus?.isOverBudget ? '⚠️' : '💡' }}
						</span>
						<span
							:class="[
								'text-[11px] font-medium',
								budgetStatus?.isOverBudget ?
									'text-rose-600 font-semibold'
								:	'text-slate-600',
							]"
						>
							{{ attributionMessage }}
						</span>
					</div>
					<button
						type="button"
						class="inline-flex items-center gap-0.5 text-[11px] text-indigo-600 hover:text-indigo-700 bg-transparent border-0 cursor-pointer p-0 font-medium transition-colors"
						@click="$emit('view-records')"
					>
						<span>全部明细</span>
						<ArrowRightOutlined class="text-[10px]" />
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	WalletOutlined,
	SettingOutlined,
	ArrowRightOutlined,
} from '@ant-design/icons-vue';
import {
	getCategoryEmoji,
	type FinanceBudgetStatusVo,
} from '@/views/selfFinance/financeManager/config';
import { nowDayjs, dateFormatYYYYMM } from '@/utils/dayjs';

export interface ExpenseCategoryItem {
	name: string;
	value: string | number;
}

const props = defineProps<{
	loading?: boolean;
	budgetStatus?: FinanceBudgetStatusVo | null;
	currentMonth: string;
	formatAmount: (val?: any) => string;
	expenseCategories?: ExpenseCategoryItem[];
}>();

defineEmits<{
	(e: 'open-budget'): void;
	(e: 'view-records'): void;
	(e: 'select-category', category: string): void;
}>();

// 进度条百分比（0 - 100 范围保护）
const progressPercent = computed(() => {
	const raw = props.budgetStatus?.usagePercent ?? 0;
	return Math.max(0, Math.min(Number(raw) || 0, 100));
});

// 当月时间流逝进度 (1号 ~ 月末，对应时间参考线)
const todayDay = computed(() => nowDayjs().date());

const monthTimeProgress = computed(() => {
	const today = nowDayjs().startOf('day');
	const currentRealMonth = today.format(dateFormatYYYYMM);
	if (props.currentMonth < currentRealMonth) {
		return 100;
	}
	if (props.currentMonth > currentRealMonth) {
		return 0;
	}
	const dayOfMonth = today.date();
	const totalDays = today.daysInMonth();
	return Math.min(100, Math.max(0, Number(((dayOfMonth / totalDays) * 100).toFixed(1))));
});

// 消费节奏判定状态（基于 Tailwind Soft UI 语义色）
const pacingStatus = computed(() => {
	if (props.budgetStatus?.isOverBudget) {
		return { label: '已超支', color: 'text-rose-600', bg: 'bg-rose-500/10' };
	}
	const budgetAmount = Number(props.budgetStatus?.budgetAmount || 0);
	if (budgetAmount <= 0) {
		return { label: '不设限额', color: 'text-slate-500', bg: 'bg-slate-100' };
	}
	const usage = Number(props.budgetStatus?.usagePercent || 0);
	const timeProgress = monthTimeProgress.value;

	// 如果开销进度比时间流逝进度多出 20% 以上，且使用率达到 50%
	if (usage > timeProgress + 20 && usage >= 50) {
		return { label: '消费偏快', color: 'text-amber-600', bg: 'bg-amber-500/10' };
	}
	return { label: '节奏平稳', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
});

// 进度条内联安全渐变样式（防止无 Tailwind base 变量时 background-image 失效）
const barGradientStyle = computed(() => {
	if (props.budgetStatus?.isOverBudget) {
		return 'linear-gradient(90deg, #f59e0b, #f43f5e, #e11d48)';
	}
	const usage = Number(props.budgetStatus?.usagePercent || 0);
	const timeProgress = monthTimeProgress.value;
	if (usage > timeProgress + 20 && usage >= 50) {
		return 'linear-gradient(90deg, #f59e0b, #d97706)';
	}
	return 'linear-gradient(90deg, #6366f1, #4f46e5)';
});

// 日均消费建议
const dailyGuideText = computed(() => {
	const status = props.budgetStatus;
	if (!status?.budgetAmount || Number(status.budgetAmount) <= 0) {
		return null;
	}
	const today = nowDayjs().startOf('day');
	const currentRealMonth = today.format(dateFormatYYYYMM);

	// 若查看的是历史月份
	if (props.currentMonth !== currentRealMonth) {
		return status.isOverBudget ? '当月已超支' : '历史月份归档';
	}

	const endOfMonth = nowDayjs().endOf('month').startOf('day');
	const remainingDays = Math.max(1, endOfMonth.diff(today, 'day') + 1);
	const remainingAmount = Number(status.remainingAmount) || 0;

	if (remainingAmount <= 0 || status.isOverBudget) {
		const overAmount = Math.abs(remainingAmount);
		const budgetAmt = Number(status.budgetAmount) || 1;
		const overRatio = ((overAmount / budgetAmt) * 100).toFixed(1);
		return `已超出预算 ${overRatio}%`;
	}

	const suggestedDaily = (remainingAmount / remainingDays).toFixed(1);
	return `剩余 ${remainingDays} 天 · 建议日均 ≤ ¥${suggestedDaily}`;
});

// 右侧当月零钱消费去向（过滤并降序排序计算）
interface DisplayExpenseRankItem {
	name: string;
	value: number;
	emoji: string;
	ratio: number;
	barWidth: number;
	isCulprit: boolean;
}

const rankedExpenseCategories = computed<DisplayExpenseRankItem[]>(() => {
	const allCategories = props.expenseCategories || [];
	if (!allCategories.length) return [];

	const budgetCategoryFilter = props.budgetStatus?.categoryNames || [];
	const hasFilter = budgetCategoryFilter.length > 0;

	// 若设定了特定预算分类则只过滤预算内的，否则纳入所有大于 0 的消费项
	const matchedList = allCategories.filter((item) => {
		const val = Number(item.value) || 0;
		if (val <= 0) return false;
		if (hasFilter) {
			return budgetCategoryFilter.includes(item.name);
		}
		return true;
	});

	// 按消费金额降序
	const sorted = [...matchedList].sort(
		(a, b) => (Number(b.value) || 0) - (Number(a.value) || 0),
	);
	if (!sorted.length) return [];

	const totalExpense =
		Number(props.budgetStatus?.actualExpense) ||
		sorted.reduce((sum, item) => sum + (Number(item.value) || 0), 0) ||
		1;

	const maxVal = Math.max(...sorted.map((i) => Number(i.value) || 0), 1);
	const isOver = Boolean(props.budgetStatus?.isOverBudget);

	return sorted.map((item, index) => {
		const val = Number(item.value) || 0;
		const ratio = Math.max(0, Math.min(100, Math.round((val / totalExpense) * 100)));
		const barWidth = Math.max(12, Math.min(100, Math.round((val / maxVal) * 100)));
		// 超支时，第 1 名且消费显著的项目标记为首要责任项
		const isCulprit = isOver && index === 0;

		return {
			name: item.name,
			value: val,
			emoji: getCategoryEmoji(item.name),
			ratio,
			barWidth,
			isCulprit,
		};
	});
});

// 智能归因提示语
const attributionMessage = computed(() => {
	const list = rankedExpenseCategories.value;
	const isOver = props.budgetStatus?.isOverBudget;
	if (!list.length) {
		return '当月暂无零钱分类支出，开支节奏良好';
	}
	const top = list[0];
	if (isOver) {
		return `「${top.name}」单项支出占实际开销 ${top.ratio}%，为超支主要诱因`;
	}
	return `「${top.name}」为当月首要支出项，占零钱开销 ${top.ratio}%`;
});
</script>

<style scoped>
.finance-analysis-budget-card {
	transition: all 0.2s ease-in-out;
}
</style>
