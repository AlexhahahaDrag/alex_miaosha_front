<template>
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
		<!-- 01 · 本月财务状况 (左侧核心主卡，Tailwind 柔和微渐变 + 独立无框子卡，占 7/12) -->
		<div
			class="lg:col-span-7 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/60 p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/70 flex flex-col justify-between"
		>
			<div class="flex items-center justify-between gap-2 mb-3.5">
				<div class="flex items-center gap-2 flex-wrap">
					<span
						class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
					>
						<AccountBookOutlined class="text-xs" />
					</span>
					<span class="text-sm font-bold text-slate-800">本月财务状况</span>
					<span
						class="text-[11px] font-medium tracking-wider text-indigo-500/70 uppercase hidden sm:inline"
					>
						Monthly Overview
					</span>
				</div>
				<span
					v-if="loading"
					class="inline-block w-16 h-5 rounded-full bg-slate-200/70 animate-pulse"
				></span>
				<span
					v-else
					:class="[
						'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
						(monthBalanceNumber ?? 0) < 0 ?
							'bg-rose-500/10 text-rose-600'
						: (monthBalanceNumber ?? 0) > 0 ?
							'bg-emerald-500/10 text-emerald-600'
						:	'bg-slate-500/10 text-slate-600',
					]"
				>
					{{
						(monthBalanceNumber ?? 0) < 0 ? '本月赤字'
						: (monthBalanceNumber ?? 0) > 0 ? '本月盈余'
						: '收支平衡'
					}}
				</span>
			</div>

			<!-- 内部三区域：左侧纯白微阴影主卡(净结余) + 右侧双色无框软胶囊卡(收入 / 支出) -->
			<div class="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
				<!-- 区域 1：本月净结余（纯白独立展示区，无硬边框） -->
				<div
					class="md:col-span-5 bg-white rounded-2xl p-4 border-0 shadow-xs shadow-indigo-500/5 flex flex-col justify-between"
				>
					<div>
						<div class="flex items-center justify-between gap-1">
							<span class="text-xs font-medium text-slate-500">
								本月净结余
							</span>
							<span class="text-[11px] text-slate-400">
								收入 - 消费
							</span>
						</div>
						<div
							v-if="loading"
							class="h-8 w-32 bg-slate-200/80 rounded-lg animate-pulse my-3"
						></div>
						<div
							v-else
							:class="[
								'text-3xl font-extrabold font-mono tabular-nums tracking-tight leading-none my-3',
								(monthBalanceNumber ?? 0) < 0 ?
									'text-rose-600'
								: (monthBalanceNumber ?? 0) > 0 ?
									'text-emerald-600'
								:	'text-slate-900',
							]"
						>
							<span class="text-lg font-bold mr-0.5">{{
								(monthBalanceNumber ?? 0) < 0 ? '-'
								: (monthBalanceNumber ?? 0) > 0 ? '+'
								: ''
							}}¥</span
							>{{ formatAmount(Math.abs(monthBalanceNumber ?? 0)) }}
						</div>
					</div>

					<div
						class="pt-2.5 border-0 border-t border-solid border-slate-100 flex items-center justify-between text-xs"
					>
						<span class="text-slate-400">当月储蓄率</span>
						<div
							v-if="loading"
							class="h-4 w-14 bg-slate-200/70 rounded animate-pulse"
						></div>
						<div v-else class="flex items-center gap-1.5">
							<span class="font-mono font-bold text-slate-800">
								{{ savingsRateDisplay }}
							</span>
							<span
								v-if="isZeroIncomeDeficit"
								class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600"
							>
								超支赤字
							</span>
						</div>
					</div>
				</div>

				<!-- 区域 2 & 3：本月总收入（Emerald 软底）+ 本月总消费（Rose 软底） -->
				<div class="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
					<!-- 本月总收入 -->
					<div
						class="bg-emerald-500/[0.07] rounded-2xl p-4 border-0 flex flex-col justify-between"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-slate-600">
								本月总收入
							</span>
							<span
								class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/12 text-emerald-600"
							>
								资金流入
							</span>
						</div>
						<div
							v-if="loading"
							class="h-7 w-28 bg-emerald-500/20 rounded-lg animate-pulse my-2"
						></div>
						<div
							v-else
							class="text-2xl font-extrabold font-mono tabular-nums tracking-tight text-emerald-600 my-2"
						>
							¥{{ formatAmount(monthIncomeSum) }}
						</div>
						<div
							v-if="loading"
							class="h-3.5 w-24 bg-slate-200/60 rounded animate-pulse"
						></div>
						<div
							v-else
							class="flex items-center gap-2 text-[11px] text-slate-500 font-mono flex-wrap"
						>
							<span>{{ formatTrend(incomeYoyTrend, '同比') }}</span>
							<span class="text-slate-300">·</span>
							<span>{{ formatTrend(incomeMomTrend, '环比') }}</span>
						</div>
					</div>

					<!-- 本月总消费 -->
					<div
						class="bg-rose-500/[0.07] rounded-2xl p-4 border-0 flex flex-col justify-between"
					>
						<div class="flex items-center justify-between">
							<span class="text-xs font-medium text-slate-600">
								本月总消费
							</span>
							<span
								class="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500/12 text-rose-600"
							>
								资金流出
							</span>
						</div>
						<div
							v-if="loading"
							class="h-7 w-28 bg-rose-500/20 rounded-lg animate-pulse my-2"
						></div>
						<div
							v-else
							class="text-2xl font-extrabold font-mono tabular-nums tracking-tight text-rose-600 my-2"
						>
							¥{{ formatAmount(monthExpenseSum) }}
						</div>
						<div
							v-if="loading"
							class="h-3.5 w-24 bg-slate-200/60 rounded animate-pulse"
						></div>
						<div
							v-else
							class="flex items-center gap-2 text-[11px] text-slate-500 font-mono flex-wrap"
						>
							<span>{{ formatTrend(expenseYoyTrend, '同比') }}</span>
							<span class="text-slate-300">·</span>
							<span>{{ formatTrend(expenseMomTrend, '环比') }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 02 · 资产净值概览 (右侧核心主卡，Tailwind 柔和微渐变 + 3 个独立无框纯白小卡，占 5/12) -->
		<div
			class="lg:col-span-5 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/60 p-5 rounded-2xl border-0 shadow-sm shadow-slate-200/70 flex flex-col justify-between"
		>
			<div>
				<div class="flex items-center justify-between gap-2 mb-3">
					<div class="flex items-center gap-2 flex-wrap">
						<span
							class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center shrink-0"
						>
							<WalletOutlined class="text-xs" />
						</span>
						<span class="text-sm font-bold text-slate-800">资产净值概览</span>
						<span
							class="text-[11px] font-medium tracking-wider text-indigo-500/70 uppercase hidden sm:inline"
						>
							Asset Overview
						</span>
					</div>
					<span
						class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600"
					>
						存量盘点
					</span>
				</div>

				<!-- 总资产净值核心大数字 + 同环比胶囊 -->
				<div class="flex items-baseline justify-between gap-3 flex-wrap my-1">
					<div
						v-if="loading"
						class="h-8 w-36 bg-slate-200/80 rounded-lg animate-pulse my-1"
					></div>
					<div
						v-else
						class="text-3xl font-extrabold font-mono tabular-nums tracking-tight text-slate-900 leading-none"
					>
						<span class="text-lg font-bold text-indigo-600 mr-0.5">¥</span>{{
							formatAmount(sumAmount)
						}}
					</div>
					<div
						v-if="loading"
						class="h-5 w-24 bg-white/70 rounded-full animate-pulse"
					></div>
					<div
						v-else
						class="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-white/90 shadow-2xs px-2.5 py-1 rounded-full"
					>
						<span>{{ formatTrend(yoyTrend, '同比') }}</span>
						<span class="text-slate-300">·</span>
						<span>{{ formatTrend(momTrend, '环比') }}</span>
					</div>
				</div>
			</div>

			<!-- 底部三个独立纯白无框小卡片：可动产(indigo) / 不动产(emerald) / 生活缴费(amber) -->
			<div class="grid grid-cols-3 gap-2.5 mt-4">
				<div
					class="bg-white rounded-2xl p-3 border-0 shadow-xs shadow-indigo-500/5"
					title="银行卡、微信、花呗、白条日常周转账户"
				>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<span
							class="w-2 h-2 rounded-full bg-indigo-500 inline-block shrink-0"
						></span>
						<span class="truncate">可动产</span>
					</div>
					<div
						v-if="loading"
						class="h-4 w-16 bg-indigo-500/20 rounded animate-pulse mt-1.5"
					></div>
					<div
						v-else
						:class="[
							'text-sm font-extrabold font-mono tabular-nums mt-1.5 truncate',
							(liquidSubtotal ?? 0) < 0 ? 'text-rose-600' : 'text-indigo-600',
						]"
					>
						{{ (liquidSubtotal ?? 0) < 0 ? '-' : '' }}¥{{
							formatAmount(Math.abs(liquidSubtotal ?? 0))
						}}
					</div>
				</div>

				<div
					class="bg-white rounded-2xl p-3 border-0 shadow-xs shadow-indigo-500/5"
					title="现金、支付宝、京东储备资产账户"
				>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<span
							class="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"
						></span>
						<span class="truncate">不动产</span>
					</div>
					<div
						v-if="loading"
						class="h-4 w-16 bg-emerald-500/20 rounded animate-pulse mt-1.5"
					></div>
					<div
						v-else
						:class="[
							'text-sm font-extrabold font-mono tabular-nums mt-1.5 truncate',
							(creditSubtotal ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-600',
						]"
					>
						{{ (creditSubtotal ?? 0) < 0 ? '-' : '' }}¥{{
							formatAmount(Math.abs(creditSubtotal ?? 0))
						}}
					</div>
				</div>

				<div
					class="bg-white rounded-2xl p-3 border-0 shadow-xs shadow-indigo-500/5"
					title="水电燃气及话费生活缴费账户"
				>
					<div class="flex items-center gap-1.5 text-xs text-slate-500">
						<span
							class="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0"
						></span>
						<span class="truncate">生活缴费</span>
					</div>
					<div
						v-if="loading"
						class="h-4 w-16 bg-amber-500/20 rounded animate-pulse mt-1.5"
					></div>
					<div
						v-else
						class="text-sm font-extrabold font-mono tabular-nums text-amber-600 mt-1.5 truncate"
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
	loading?: boolean;
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

const incomeNumeric = computed(() => {
	const raw = props.monthIncomeSum;
	if (raw == null) return 0;
	if (typeof raw === 'number') return raw;
	if (typeof raw === 'string') return Number(raw) || 0;
	if (typeof raw.toNumber === 'function') return raw.toNumber() || 0;
	return Number(raw) || 0;
});

const expenseNumeric = computed(() => {
	const raw = props.monthExpenseSum;
	if (raw == null) return 0;
	if (typeof raw === 'number') return raw;
	if (typeof raw === 'string') return Number(raw) || 0;
	if (typeof raw.toNumber === 'function') return raw.toNumber() || 0;
	return Number(raw) || 0;
});

// 收入为 0 时储蓄率展示横杠 —，不显示无意义的 -100% 或 0.0%
const savingsRateDisplay = computed(() => {
	if (incomeNumeric.value <= 0) {
		return '—';
	}
	return props.savingsRateText || '—';
});

const isZeroIncomeDeficit = computed(
	() => incomeNumeric.value <= 0 && expenseNumeric.value > 0,
);
</script>
