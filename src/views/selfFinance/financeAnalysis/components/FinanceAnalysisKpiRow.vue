<template>
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-3.5">
		<!-- 01 · 当月核心财务指标 (P0 全页第一视觉重心，占 7/12) -->
		<div
			class="lg:col-span-7 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col justify-between"
		>
			<div class="flex items-center justify-between gap-2 mb-3">
				<div class="flex items-center gap-2">
					<span
						class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center shrink-0"
					>
						<AccountBookOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">
						当月核心财务指标
					</span>
					<span
						class="text-[11px] text-slate-400 font-normal hidden sm:inline"
					>
						期间收支流量
					</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="text-xs text-slate-400">当月储蓄率</span>
					<span
						:class="[
							'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tabular-nums',
							savingsRatePillClass,
						]"
					>
						{{ savingsRateText }}
					</span>
				</div>
			</div>

			<!-- 主指标 (净结余) + 右侧双辅助指标 (收入 / 支出) -->
			<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
				<!-- 左主焦点：本月净结余 -->
				<div
					class="md:col-span-5 flex flex-col justify-center pr-2 border-0 md:border-r md:border-solid md:border-slate-100"
				>
					<span class="text-xs font-medium text-slate-500 mb-1">
						本月净结余
					</span>
					<div
						:class="[
							'text-3xl font-extrabold font-mono tabular-nums tracking-tight leading-tight',
							(monthBalanceNumber ?? 0) >= 0 ?
								'text-emerald-600'
							:	'text-rose-600',
						]"
					>
						<span class="text-lg font-bold mr-0.5">
							{{ (monthBalanceNumber ?? 0) >= 0 ? '+' : '-' }}¥</span
						>{{ formatAmount(Math.abs(monthBalanceNumber ?? 0)) }}
					</div>
					<span class="text-[11px] text-slate-400 mt-1.5">
						本月总收入减去本月总消费
					</span>
				</div>

				<!-- 右双辅指标：本月收入 & 本月支出 -->
				<div class="md:col-span-7 grid grid-cols-2 gap-3">
					<!-- 本月收入 -->
					<div
						class="bg-slate-50/90 rounded-xl p-3 flex flex-col justify-between"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-slate-500">本月总收入</span>
							<span
								class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600"
							>
								流入
							</span>
						</div>
						<div
							class="text-xl font-bold font-mono tabular-nums tracking-tight text-emerald-600 my-1.5"
						>
							+¥{{ formatAmount(monthIncomeSum) }}
						</div>
						<div
							class="flex items-center gap-2 text-[11px] text-slate-400 font-mono flex-wrap"
						>
							<span>{{ formatTrend(incomeYoyTrend, '同比') }}</span>
							<span class="text-slate-300">·</span>
							<span>{{ formatTrend(incomeMomTrend, '环比') }}</span>
						</div>
					</div>

					<!-- 本月支出 -->
					<div
						class="bg-slate-50/90 rounded-xl p-3 flex flex-col justify-between"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-slate-500">本月总消费</span>
							<span
								class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600"
							>
								流出
							</span>
						</div>
						<div
							class="text-xl font-bold font-mono tabular-nums tracking-tight text-rose-600 my-1.5"
						>
							-¥{{ formatAmount(monthExpenseSum) }}
						</div>
						<div
							class="flex items-center gap-2 text-[11px] text-slate-400 font-mono flex-wrap"
						>
							<span>{{ formatTrend(expenseYoyTrend, '同比') }}</span>
							<span class="text-slate-300">·</span>
							<span>{{ formatTrend(expenseMomTrend, '环比') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 02 · 当前资产净值概览 (P0 资产管理核心，占 5/12) -->
		<div
			class="lg:col-span-5 bg-white p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 flex flex-col justify-between"
		>
			<div class="flex items-center justify-between gap-2 mb-2">
				<div class="flex items-center gap-2">
					<span
						class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
					>
						<WalletOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">资产净值概览</span>
					<span
						class="text-[11px] text-slate-400 font-normal hidden sm:inline"
					>
						存量盘点
					</span>
				</div>
				<div class="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
					<span>{{ formatTrend(yoyTrend, '同比') }}</span>
					<span class="text-slate-300">·</span>
					<span>{{ formatTrend(momTrend, '环比') }}</span>
				</div>
			</div>

			<!-- 总资产净值大字号 -->
			<div class="my-1">
				<div class="flex items-baseline justify-between gap-2">
					<div
						class="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-indigo-600 leading-tight"
					>
						<span class="text-lg font-bold mr-0.5">¥</span>{{
							formatAmount(sumAmount)
						}}
					</div>
					<span class="text-[11px] text-slate-400">
						资产总额 + 专户预存 - 负债
					</span>
				</div>
			</div>

			<!-- 底部三栏构成条：流动资金 + 信用负债 + 专户预存 (严守 129,431.10 恒等式) -->
			<div
				class="grid grid-cols-3 gap-2 pt-3 mt-2 border-0 border-t border-solid border-slate-100"
			>
				<div class="bg-slate-50/80 rounded-xl px-2.5 py-2">
					<div class="text-[11px] text-slate-400 truncate">流动资金</div>
					<div
						class="text-xs font-bold font-mono tabular-nums text-slate-800 mt-0.5"
					>
						¥{{ formatAmount(liquidSubtotal) }}
					</div>
				</div>
				<div class="bg-slate-50/80 rounded-xl px-2.5 py-2">
					<div class="text-[11px] text-slate-400 truncate">信用负债</div>
					<div
						:class="[
							'text-xs font-bold font-mono tabular-nums mt-0.5',
							(creditSubtotal ?? 0) < 0 ? 'text-rose-600' : 'text-slate-800',
						]"
					>
						{{ (creditSubtotal ?? 0) < 0 ? '-' : '' }}¥{{
							formatAmount(Math.abs(creditSubtotal ?? 0))
						}}
					</div>
				</div>
				<div
					class="bg-slate-50/80 rounded-xl px-2.5 py-2"
					title="水电燃气卡及话费账户预存余额"
				>
					<div class="text-[11px] text-slate-400 truncate">水电话费预存</div>
					<div
						class="text-xs font-bold font-mono tabular-nums text-slate-700 mt-0.5"
					>
						¥{{ formatAmount(prepaidSubtotal) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { WalletOutlined, AccountBookOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
	sumAmount?: any;
	yoyTrend?: string;
	momTrend?: string;
	monthIncomeSum?: any;
	incomeYoyTrend?: string;
	incomeMomTrend?: string;
	monthExpenseSum?: any;
	expenseYoyTrend?: string;
	expenseMomTrend?: string;
	monthBalance?: any;
	monthBalanceNumber?: number;
	savingsRateClass?: string;
	savingsRateText?: string;
	liquidSubtotal?: number;
	creditSubtotal?: number;
	prepaidSubtotal?: number;
	formatAmount: (val?: any) => string;
	formatTrend: (trend: string | undefined, defaultPrefix: string) => string;
	getTrendClass: (trend?: string) => string;
}>();

const savingsRatePillClass = computed(() => {
	if (props.savingsRateClass === 'text-green') {
		return 'bg-emerald-500/10 text-emerald-600';
	}
	if (props.savingsRateClass === 'text-danger') {
		return 'bg-rose-500/10 text-rose-600';
	}
	if (props.savingsRateClass === 'text-blue') {
		return 'bg-indigo-500/10 text-indigo-600';
	}
	return 'bg-slate-100 text-slate-500';
});
</script>
