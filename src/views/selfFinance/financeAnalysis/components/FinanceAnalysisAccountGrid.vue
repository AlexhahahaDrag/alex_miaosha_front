<template>
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5">
		<!-- 03 · 当月支出与收入结构排行 (占 7/12，横向条形图替代传统环形图) -->
		<div
			class="lg:col-span-7 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col justify-between"
		>
			<div class="flex items-center justify-between gap-2 mb-3.5">
				<div class="flex items-center gap-2">
					<span
						class="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 inline-flex items-center justify-center shrink-0"
					>
						<PieChartOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">
						当月收入与支出结构
					</span>
					<span class="text-[11px] text-slate-400 hidden sm:inline">
						点击分类可穿透查看对应流水明细
					</span>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
				<!-- 左栏：当月支出结构 (Top 5 + 其他) -->
				<div class="bg-slate-50/80 rounded-2xl p-3.5 flex flex-col">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-1.5">
							<span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
							<span class="text-xs font-semibold text-slate-700">
								本月支出结构
							</span>
						</div>
						<span class="text-xs font-bold font-mono tabular-nums text-rose-600">
							-¥{{ formatAmount(expenseTotal) }}
						</span>
					</div>

					<div
						v-if="rankedExpenseList.length > 0"
						class="space-y-2.5 flex-1 flex flex-col justify-start"
					>
						<div
							v-for="item in rankedExpenseList"
							:key="item.name"
							:class="[
								'group p-2 rounded-xl bg-white/90 hover:bg-white shadow-2xs transition-all',
								item.isOther ?
									'cursor-default'
								:	'cursor-pointer hover:ring-1 hover:ring-rose-500/30',
							]"
							:title="
								item.isOther ?
									'其余分类汇总'
								:	`点击查看【${item.name}】支出流水`
							"
							@click="!item.isOther && $emit('select-category', item.name, 'expense')"
						>
							<div class="flex items-center justify-between text-xs mb-1.5 gap-2">
								<div class="flex items-center gap-1.5 min-w-0">
									<span class="text-xs leading-none shrink-0">{{
										item.isOther ? '📦' : getCategoryEmoji(item.name)
									}}</span>
									<span
										class="font-medium text-slate-700 group-hover:text-rose-600 truncate transition-colors"
									>
										{{ item.name }}
									</span>
								</div>
								<div class="flex items-baseline gap-1.5 shrink-0 font-mono tabular-nums">
									<span class="font-bold text-slate-800">
										¥{{ formatAmount(item.value) }}
									</span>
									<span class="text-[11px] text-slate-400 w-11 text-right">
										{{ item.percent }}%
									</span>
								</div>
							</div>
							<div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full bg-rose-500 rounded-full transition-all duration-300"
									:style="{ width: `${Math.max(item.percent, 3)}%` }"
								></div>
							</div>
						</div>
					</div>
					<div
						v-else
						class="flex-1 flex flex-col items-center justify-center py-8 text-xs text-slate-400"
					>
						<span>本月暂无支出分类数据</span>
					</div>
				</div>

				<!-- 右栏：当月收入结构 (Top 5 + 其他) -->
				<div class="bg-slate-50/80 rounded-2xl p-3.5 flex flex-col">
					<div class="flex items-center justify-between mb-3">
						<div class="flex items-center gap-1.5">
							<span
								class="w-2 h-2 rounded-full bg-emerald-500 inline-block"
							></span>
							<span class="text-xs font-semibold text-slate-700">
								本月收入结构
							</span>
						</div>
						<span
							class="text-xs font-bold font-mono tabular-nums text-emerald-600"
						>
							+¥{{ formatAmount(incomeTotal) }}
						</span>
					</div>

					<div
						v-if="rankedIncomeList.length > 0"
						class="space-y-2.5 flex-1 flex flex-col justify-start"
					>
						<div
							v-for="item in rankedIncomeList"
							:key="item.name"
							:class="[
								'group p-2 rounded-xl bg-white/90 hover:bg-white shadow-2xs transition-all',
								item.isOther ?
									'cursor-default'
								:	'cursor-pointer hover:ring-1 hover:ring-emerald-500/30',
							]"
							:title="
								item.isOther ?
									'其余分类汇总'
								:	`点击查看【${item.name}】收入流水`
							"
							@click="!item.isOther && $emit('select-category', item.name, 'income')"
						>
							<div class="flex items-center justify-between text-xs mb-1.5 gap-2">
								<div class="flex items-center gap-1.5 min-w-0">
									<span class="text-xs leading-none shrink-0">{{
										item.isOther ? '📦' : getCategoryEmoji(item.name)
									}}</span>
									<span
										class="font-medium text-slate-700 group-hover:text-emerald-600 truncate transition-colors"
									>
										{{ item.name }}
									</span>
								</div>
								<div class="flex items-baseline gap-1.5 shrink-0 font-mono tabular-nums">
									<span class="font-bold text-slate-800">
										¥{{ formatAmount(item.value) }}
									</span>
									<span class="text-[11px] text-slate-400 w-11 text-right">
										{{ item.percent }}%
									</span>
								</div>
							</div>
							<div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
								<div
									class="h-full bg-emerald-500 rounded-full transition-all duration-300"
									:style="{ width: `${Math.max(item.percent, 3)}%` }"
								></div>
							</div>
						</div>
					</div>
					<div
						v-else
						class="flex-1 flex flex-col items-center justify-center py-8 text-xs text-slate-400"
					>
						<span>本月暂无收入分类数据</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 04 · 账户资产与负债分布 (占 5/12，Segmented 分组收纳 + 品牌 SVG 图标) -->
		<div
			class="lg:col-span-5 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col"
		>
			<div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
				<div class="flex items-center gap-2">
					<span
						class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
					>
						<CreditCardOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">账户资产分布</span>
				</div>

				<!-- 三段式 Segmented 切换：流动资金 / 信用负债 / 专户预存 -->
				<div
					class="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border-0 gap-0.5"
				>
					<button
						v-for="tab in accountTabs"
						:key="tab.key"
						type="button"
						:class="[
							'border-0 text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150 flex items-center gap-1',
							activeAccountTab === tab.key ?
								'bg-white text-indigo-600 font-semibold shadow-2xs'
							:	'bg-transparent text-slate-500 hover:text-slate-900',
						]"
						@click="activeAccountTab = tab.key"
					>
						<span>{{ tab.label }}</span>
						<span
							class="text-[10px] font-mono opacity-75"
							>({{ tab.count }})</span
						>
					</button>
				</div>
			</div>

			<!-- 当前分组小计条 -->
			<div
				class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/90 mb-2.5 text-xs"
			>
				<span class="text-slate-500 font-medium">
					{{ currentGroupConfig.desc }}
				</span>
				<div class="flex items-baseline gap-1 font-mono tabular-nums">
					<span class="text-slate-400 text-[11px]">本组小计:</span>
					<span
						:class="[
							'font-bold text-sm',
							Number(currentGroupConfig.subtotal || 0) < 0 ?
								'text-rose-600'
							:	'text-indigo-600',
						]"
					>
						{{ Number(currentGroupConfig.subtotal || 0) < 0 ? '-' : '' }}¥{{
							formatAmount(Math.abs(Number(currentGroupConfig.subtotal || 0)))
						}}
					</span>
				</div>
			</div>

			<!-- 账户余额明细列表 (点击可跳转账单流水) -->
			<div
				class="flex-1 flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-0.5"
			>
				<div
					v-for="(item, idx) in currentGroupList"
					:key="idx"
					class="group flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50/60 hover:bg-indigo-500/[0.06] cursor-pointer transition-all"
					:title="`点击查看【${item.typeName}】相关流水`"
					@click="item.typeCode && $emit('select-account', item.typeCode)"
				>
					<div class="flex items-center justify-between text-xs gap-2">
						<div class="flex items-center gap-2 min-w-0">
							<component
								v-if="getFinanceIconComponent(item.typeCode)"
								:is="getFinanceIconComponent(item.typeCode)"
								class="w-4 h-4 shrink-0"
							/>
							<CreditCardOutlined
								v-else
								class="text-xs text-slate-400 shrink-0"
							/>
							<span
								class="font-medium text-slate-700 group-hover:text-indigo-600 truncate transition-colors"
							>
								{{ item.typeName }}
							</span>
						</div>
						<div class="flex items-baseline gap-2 shrink-0 font-mono tabular-nums">
							<span
								:class="[
									'font-bold',
									Number(item.amount || 0) < 0 ?
										'text-rose-600'
									:	'text-slate-800',
								]"
							>
								{{ Number(item.amount || 0) < 0 ? '-' : '' }}¥{{
									formatAmount(Math.abs(Number(item.amount || 0)))
								}}
							</span>
							<span class="text-[11px] text-slate-400 w-10 text-right">
								{{ item.sharePercent }}%
							</span>
						</div>
					</div>
					<div class="w-full h-1 bg-slate-200/70 rounded-full overflow-hidden">
						<div
							:class="[
								'h-full rounded-full transition-all duration-300',
								Number(item.amount || 0) < 0 ? 'bg-rose-500' : 'bg-indigo-500',
							]"
							:style="{ width: `${Math.max(item.sharePercent, 2)}%` }"
						></div>
					</div>
				</div>

				<div
					v-if="currentGroupList.length === 0"
					class="flex-1 flex items-center justify-center py-8 text-xs text-slate-400"
				>
					暂无该类别账户数据
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { CreditCardOutlined, PieChartOutlined } from '@ant-design/icons-vue';
import { iconComponentMap } from '@/config/icons';
import {
	getCategoryEmoji,
	type FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';
import type { ItemInfo } from '@/views/selfFinance/financeAnalysis/analysis';

const props = defineProps<{
	listConfigs: Array<{
		key?: string;
		icon: string;
		title: string;
		desc?: string;
		subtotal: number | string;
		list: FinanceManagerData[];
		valueClass?: string;
	}>;
	pieIncomeData: ItemInfo[];
	pieExpenseData: ItemInfo[];
	formatAmount: (val?: any) => string;
}>();

defineEmits<{
	(e: 'select-category', categoryName: string, direction: 'income' | 'expense'): void;
	(e: 'select-account', fromSourceCode: string): void;
}>();

const financeSourceIconMap: Record<string, string> = {
	hfw: 'hf',
	hfm: 'hf',
	hfb: 'hf',
	hfmj: 'hf',
	dfw: 'df',
	dfm: 'df',
};

const getFinanceIconComponent = (source?: string) => {
	if (!source) return null;
	const iconKey =
		financeSourceIconMap[source] ||
		(source.startsWith('hf') ? 'hf'
		: source.startsWith('df') ? 'df'
		: source);
	return iconComponentMap[`finance-${iconKey}`] || null;
};

interface RankedStructureItem {
	name: string;
	value: number;
	percent: number;
	isOther?: boolean;
}

const buildRankedList = (raw: ItemInfo[], maxTop = 5): RankedStructureItem[] => {
	if (!Array.isArray(raw) || raw.length === 0) return [];
	const cleaned = raw
		.map((item) => ({
			name: item.name || '未分类',
			value: Math.abs(Number(item.value) || 0),
		}))
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);

	const total = cleaned.reduce((sum, item) => sum + item.value, 0);
	if (total <= 0) return [];

	const topItems = cleaned.slice(0, maxTop);
	const restItems = cleaned.slice(maxTop);
	const result: RankedStructureItem[] = topItems.map((item) => ({
		name: item.name,
		value: item.value,
		percent: Number(((item.value / total) * 100).toFixed(1)),
	}));

	if (restItems.length > 0) {
		const otherVal = restItems.reduce((sum, item) => sum + item.value, 0);
		result.push({
			name: `其他分类 (${restItems.length}项)`,
			value: otherVal,
			percent: Number(((otherVal / total) * 100).toFixed(1)),
			isOther: true,
		});
	}
	return result;
};

const expenseTotal = computed(() =>
	(props.pieExpenseData || []).reduce(
		(sum, item) => sum + Math.abs(Number(item.value) || 0),
		0,
	),
);

const incomeTotal = computed(() =>
	(props.pieIncomeData || []).reduce(
		(sum, item) => sum + Math.abs(Number(item.value) || 0),
		0,
	),
);

const rankedExpenseList = computed(() =>
	buildRankedList(props.pieExpenseData, 5),
);
const rankedIncomeList = computed(() =>
	buildRankedList(props.pieIncomeData, 5),
);

const activeAccountTab = ref<'liquid' | 'credit' | 'prepaid'>('liquid');

const accountTabs = computed(() => {
	const liquid = props.listConfigs[0]?.list || [];
	const credit = props.listConfigs[1]?.list || [];
	const prepaid = props.listConfigs[2]?.list || [];
	return [
		{ key: 'liquid' as const, label: '流动资金', count: liquid.length },
		{ key: 'credit' as const, label: '信用负债', count: credit.length },
		{ key: 'prepaid' as const, label: '专户预存', count: prepaid.length },
	];
});

const currentGroupConfig = computed(() => {
	const idx =
		activeAccountTab.value === 'liquid' ? 0
		: activeAccountTab.value === 'credit' ? 1
		: 2;
	return (
		props.listConfigs[idx] || {
			title: '账户明细',
			desc: '当前资产账户余额明细',
			subtotal: 0,
			list: [],
		}
	);
});

const currentGroupList = computed(() => {
	const rawList = currentGroupConfig.value.list || [];
	const absTotal = rawList.reduce(
		(sum, item) => sum + Math.abs(Number(item.amount) || 0),
		0,
	);
	return [...rawList]
		.sort((a, b) => Math.abs(Number(b.amount) || 0) - Math.abs(Number(a.amount) || 0))
		.map((item) => {
			const absVal = Math.abs(Number(item.amount) || 0);
			const sharePercent =
				absTotal > 0 ? Number(((absVal / absTotal) * 100).toFixed(1)) : 0;
			return {
				...item,
				sharePercent,
			};
		});
});
</script>
