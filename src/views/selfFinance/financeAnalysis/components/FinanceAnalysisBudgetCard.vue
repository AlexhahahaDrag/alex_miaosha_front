<template>
	<!-- 07 · 当月零钱消费与预算分析 (全宽白卡，Soft UI 高质感看板) -->
	<div
		class="finance-analysis-budget-card bg-white p-5 rounded-2xl border border-solid border-[#E4E9F2] mt-4"
	>
		<!-- 头部标题栏与操作 -->
		<div
			class="flex items-center justify-between gap-3 pb-3 mb-4 border-0 border-b border-solid border-slate-100 flex-wrap"
		>
			<div class="flex items-center gap-2.5 flex-wrap">
				<span
					class="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 inline-flex items-center justify-center text-sm shrink-0"
				>
					<WalletOutlined />
				</span>
				<div class="flex items-baseline gap-2">
					<span class="text-base font-bold text-[#1E293B]">
						当月零钱消费与预算分析
					</span>
					<span class="text-xs text-slate-400 font-mono">
						({{ currentMonth }})
					</span>
				</div>

				<template v-if="!loading">
					<span
						v-if="budgetStatus?.isOverBudget"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E94B68]/10 text-[#E94B68]"
					>
						已超支
					</span>
					<span
						v-else-if="budgetStatus?.isInherited"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#526CF5]/10 text-[#526CF5]"
					>
						继承自上月
					</span>
					<span
						v-else-if="(budgetStatus?.budgetAmount || 0) > 0"
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16A36A]/10 text-[#16A36A]"
					>
						预算充裕
					</span>
					<span
						v-else
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500"
					>
						未设限额
					</span>
				</template>
				<span
					v-else
					class="inline-block w-16 h-5 rounded-full bg-slate-200/70 animate-pulse"
				></span>
			</div>

			<!-- 右侧操作 -->
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
					class="inline-flex items-center gap-1 h-7 px-3 rounded-lg border-0 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold cursor-pointer transition-colors"
					@click="$emit('view-records')"
				>
					<span>查看全部明细</span>
					<ArrowRightOutlined class="text-[11px]" />
				</button>
			</div>
		</div>

		<!-- 骨架屏加载态 (1:1 轮廓) -->
		<div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-5 py-2">
			<!-- 左侧指标骨架 -->
			<div class="lg:col-span-5 space-y-4">
				<div class="space-y-2">
					<div class="h-4 w-28 bg-slate-200/60 rounded animate-pulse"></div>
					<div class="h-9 w-48 bg-slate-200/80 rounded-lg animate-pulse"></div>
				</div>
				<div class="grid grid-cols-2 gap-3 pt-2">
					<div class="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
					<div class="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
				</div>
			</div>
			<!-- 右侧进度与标签骨架 -->
			<div class="lg:col-span-7 space-y-4">
				<div class="space-y-2">
					<div class="h-4 w-36 bg-slate-200/60 rounded animate-pulse"></div>
					<div class="h-4 w-full bg-slate-100 rounded-full animate-pulse"></div>
				</div>
				<div class="flex flex-wrap gap-2 pt-2">
					<div
						v-for="i in 5"
						:key="i"
						class="h-7 w-20 bg-slate-100 rounded-xl animate-pulse"
					></div>
				</div>
			</div>
		</div>

		<!-- 真实数据内容 -->
		<div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-5">
			<!-- 左侧核心看盘：剩余可用 + 预算上限与实际支出 (占 5/12) -->
			<div
				class="lg:col-span-5 bg-[#F8FAFC] rounded-2xl p-4 border border-solid border-slate-100 flex flex-col justify-between"
			>
				<div>
					<div class="flex items-center justify-between text-xs mb-1">
						<span class="text-slate-500 font-medium">
							{{ budgetStatus?.isOverBudget ? '超支金额' : '剩余可用零钱' }}
						</span>
						<span
							v-if="dailyGuideText"
							:class="[
								'text-[11px] font-mono px-2 py-0.5 rounded-full',
								budgetStatus?.isOverBudget ?
									'bg-rose-50 text-rose-600'
								:	'bg-emerald-50 text-emerald-600',
							]"
						>
							{{ dailyGuideText }}
						</span>
					</div>

					<div
						:class="[
							'text-3xl font-extrabold font-mono tabular-nums tracking-tight my-1',
							budgetStatus?.isOverBudget ? 'text-[#E94B68]' : 'text-[#16A36A]',
						]"
					>
						{{ budgetStatus?.isOverBudget ? '-' : '' }}¥{{
							formatAmount(Math.abs(budgetStatus?.remainingAmount || 0))
						}}
					</div>
				</div>

				<!-- 上限与已花费副指标 -->
				<div
					class="grid grid-cols-2 gap-3 pt-3 mt-3 border-0 border-t border-solid border-slate-200/60"
				>
					<div class="flex flex-col">
						<span class="text-[11px] text-slate-400">零花钱预算上限</span>
						<span
							class="text-base font-bold font-mono tabular-nums text-[#1E293B] mt-0.5"
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
									'text-[#E94B68]'
								:	'text-[#1E293B] group-hover:text-indigo-600',
							]"
						>
							{{ (budgetStatus?.actualExpense || 0) < 0 ? '-' : '' }}¥{{
								formatAmount(Math.abs(budgetStatus?.actualExpense || 0))
							}}
						</span>
					</div>
				</div>
			</div>

			<!-- 右侧进度与纳入分类池 (占 7/12) -->
			<div
				class="lg:col-span-7 bg-[#F8FAFC] rounded-2xl p-4 border border-solid border-slate-100 flex flex-col justify-between"
			>
				<!-- 子弹图：带预算上限标线与时间参考线 -->
				<div>
					<div class="flex items-center justify-between text-xs mb-2 flex-wrap gap-1">
						<div class="flex items-center gap-1.5">
							<span class="text-slate-700 font-bold">预算使用进度 (子弹对比图)</span>
							<span
								:class="[
									'text-[10px] font-semibold px-2 py-0.5 rounded-full',
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
								class="text-[#16A36A] font-bold text-xs"
							>
								余 ¥{{ formatAmount(budgetStatus?.remainingAmount) }}
							</span>
						</div>
					</div>

					<!-- 子弹图主体轨道 (Bullet Track) -->
					<div class="relative w-full pt-1 pb-1">
						<div
							class="relative w-full h-5 bg-slate-200/60 rounded-xl overflow-hidden border border-solid border-slate-200/80"
						>
							<!-- 主消费进度条 -->
							<div
								:class="[
									'h-full rounded-l-xl transition-all duration-500 relative flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-white',
									barGradientClass,
								]"
								:style="{ width: `${progressPercent}%` }"
							>
								<span v-if="progressPercent >= 22" class="drop-shadow-xs">
									¥{{ formatAmount(budgetStatus?.actualExpense || 0) }}
								</span>
							</div>

							<!-- 时间流逝参考虚线 -->
							<div
								v-if="monthTimeProgress > 0 && monthTimeProgress < 100"
								class="absolute top-0 bottom-0 pointer-events-none -translate-x-1/2 flex flex-col items-center z-10"
								:style="{ left: `${monthTimeProgress}%` }"
								:title="`今日时间线: 当月第 ${todayDay} 天 (${monthTimeProgress}%)`"
							>
								<div
									class="w-px h-full border-r border-dashed border-slate-600/70"
								></div>
							</div>
						</div>

						<!-- 100% 预算上限强标线 (右侧垂线标线) -->
						<div
							class="absolute top-0 bottom-0 right-0 w-1 bg-[#1E293B] rounded-full z-20 shadow-xs pointer-events-none"
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
							:title="`若按时间均匀消费，当前预算建议进度应 ≤ ${monthTimeProgress}%`"
						>
							<span class="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
							<span>时间参考线 ({{ monthTimeProgress }}%)</span>
						</span>
						<span class="text-[#1E293B] font-semibold flex items-center gap-1">
							<span class="w-1 h-2.5 rounded-xs bg-[#1E293B] inline-block"></span>
							<span>上限标线 ¥{{ formatAmount(budgetStatus?.budgetAmount || 0) }}</span>
						</span>
					</div>
				</div>

				<!-- 计入分类微标签池 -->
				<div class="pt-3 mt-3 border-0 border-t border-solid border-slate-200/60">
					<div class="flex items-center justify-between gap-2 mb-2">
						<span class="text-xs font-semibold text-slate-600">
							纳入零钱预算统计的分类
						</span>
						<span class="text-[11px] text-slate-400">
							点击分类可穿透查看对应流水
						</span>
					</div>

					<div
						v-if="categoryItems.length > 0"
						class="flex items-center flex-wrap gap-2"
					>
						<button
							v-for="cat in categoryItems"
							:key="cat"
							type="button"
							class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-solid border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-xs text-slate-700 hover:text-indigo-600 cursor-pointer transition-all"
							:title="`点击查看【${cat}】分类流水`"
							@click="$emit('select-category', cat)"
						>
							<span>{{ getCategoryEmoji(cat) }}</span>
							<span class="font-medium">{{ cat }}</span>
						</button>
					</div>
					<div v-else class="text-xs text-slate-400 py-1">
						已纳入全部常规消费分类统计
					</div>
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

const props = defineProps<{
	loading?: boolean;
	budgetStatus?: FinanceBudgetStatusVo | null;
	currentMonth: string;
	formatAmount: (val?: any) => string;
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

// 消费节奏判定状态
const pacingStatus = computed(() => {
	if (props.budgetStatus?.isOverBudget) {
		return { label: '已超支', color: 'text-[#E94B68]', bg: 'bg-[#E94B68]/10' };
	}
	const budgetAmount = Number(props.budgetStatus?.budgetAmount || 0);
	if (budgetAmount <= 0) {
		return { label: '不设限额', color: 'text-slate-500', bg: 'bg-slate-100' };
	}
	const usage = Number(props.budgetStatus?.usagePercent || 0);
	const timeProgress = monthTimeProgress.value;

	// 如果开销进度比时间流逝进度多出 20% 以上，且使用率达到 50%
	if (usage > timeProgress + 20 && usage >= 50) {
		return { label: '消费偏快', color: 'text-[#E99A32]', bg: 'bg-[#E99A32]/10' };
	}
	return { label: '节奏平稳', color: 'text-[#16A36A]', bg: 'bg-[#16A36A]/10' };
});

// 进度条渐变样式：超支红、偏快橙、安全靛蓝
const barGradientClass = computed(() => {
	if (props.budgetStatus?.isOverBudget) {
		return 'bg-gradient-to-r from-[#E94B68]/80 to-[#E94B68] animate-pulse';
	}
	const usage = Number(props.budgetStatus?.usagePercent || 0);
	const timeProgress = monthTimeProgress.value;
	if (usage > timeProgress + 20 && usage >= 50) {
		return 'bg-gradient-to-r from-[#E99A32]/85 to-[#E99A32]';
	}
	return 'bg-gradient-to-r from-[#526CF5] to-[#7B91FF]';
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
		return `剩余 ${remainingDays} 天 · 已超支`;
	}

	const suggestedDaily = (remainingAmount / remainingDays).toFixed(1);
	return `剩余 ${remainingDays} 天 · 建议日均 ≤ ¥${suggestedDaily}`;
});

// 分类列表
const categoryItems = computed(() => {
	const list = props.budgetStatus?.categoryNames || [];
	return list.filter(Boolean);
});
</script>

<style scoped>
.finance-analysis-budget-card {
	transition: all 0.2s ease-in-out;
}
</style>
