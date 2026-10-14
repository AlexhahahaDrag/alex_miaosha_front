<template>
	<div class="stats-overview-section">
		<a-row :gutter="[16, 16]">
			<!-- KPI 1: 支出 / 成员 -->
			<a-col :xs="24" :sm="12" :md="6">
				<a-card
					:bordered="false"
					class="kpi-card"
					:class="{ 'clickable-card': isFamilyContext }"
					data-testid="dash-org-kpi-expense"
					@click="
						isFamilyContext &&
						navigateTo('/finance/financeManager', { type: 'expense' })
					"
				>
					<div class="kpi-top-row">
						<div class="kpi-title">
							{{ isFamilyContext ? '本月综合总支出' : '本机构在册员工' }}
						</div>
						<div
							:class="['kpi-icon-badge', isFamilyContext ? 'orange' : 'blue']"
						>
							<fall-outlined v-if="isFamilyContext" />
							<team-outlined v-else />
						</div>
					</div>
					<div class="kpi-value-row">
						<span class="kpi-currency" v-if="isFamilyContext">¥</span>
						<span class="kpi-number">{{
							isFamilyContext ?
								formatMoney(familyStats.totalExpense)
							:	orgStats.memberCount
						}}</span>
						<span class="kpi-unit" v-if="!isFamilyContext">人</span>
					</div>
					<div class="kpi-bottom-row" v-if="isFamilyContext">
						<div class="kpi-breakdown-capsule">
							<span>日常 ¥{{ formatMoney(familyStats.dailyExpense) }}</span>
							<span class="dot-divider">·</span>
							<span>随礼 ¥{{ formatMoney(familyStats.giftExpense) }}</span>
						</div>
						<a-tooltip
							v-if="familyStats.expenseMomTrend"
							:title="`较上月环比: ${familyStats.expenseMomTrend} · 较去年同期同比: ${familyStats.expenseYoyTrend || '持平'}`"
						>
							<div
								:class="[
									'kpi-trend-badge',
									isTrendGood('expense', familyStats.expenseMomTrend) ? 'good'
									:	'warn',
								]"
							>
								<fall-outlined
									v-if="isNegativeTrend(familyStats.expenseMomTrend)"
								/>
								<rise-outlined v-else />
								<span>环比 {{ familyStats.expenseMomTrend }}</span>
							</div>
						</a-tooltip>
					</div>
					<div class="kpi-bottom-row" v-else>
						<div class="kpi-trend-badge good">
							<check-circle-outlined />
							<span>全员绑定有效机构</span>
						</div>
					</div>
				</a-card>
			</a-col>

			<!-- KPI 2: 收入 / 商品 -->
			<a-col :xs="24" :sm="12" :md="6">
				<a-card
					:bordered="false"
					class="kpi-card"
					:class="{ 'clickable-card': isFamilyContext }"
					data-testid="dash-org-kpi-income"
					@click="
						isFamilyContext &&
						navigateTo('/finance/financeManager', { type: 'income' })
					"
				>
					<div class="kpi-top-row">
						<div class="kpi-title">
							{{ isFamilyContext ? '本月综合总收入' : '管辖商品/秒杀在售' }}
						</div>
						<div
							:class="['kpi-icon-badge', isFamilyContext ? 'cyan' : 'cyan']"
						>
							<rise-outlined v-if="isFamilyContext" />
							<appstore-outlined v-else />
						</div>
					</div>
					<div class="kpi-value-row">
						<span class="kpi-currency" v-if="isFamilyContext">¥</span>
						<span class="kpi-number">{{
							isFamilyContext ?
								formatMoney(familyStats.totalIncome)
							:	orgStats.productCount
						}}</span>
						<span class="kpi-unit" v-if="!isFamilyContext">件</span>
					</div>
					<div class="kpi-bottom-row" v-if="isFamilyContext">
						<div class="kpi-breakdown-capsule">
							<span>日常 ¥{{ formatMoney(familyStats.dailyIncome) }}</span>
							<span class="dot-divider">·</span>
							<span>收礼 ¥{{ formatMoney(familyStats.giftIncome) }}</span>
						</div>
						<a-tooltip
							v-if="familyStats.incomeMomTrend"
							:title="`较上月环比: ${familyStats.incomeMomTrend} · 较去年同期同比: ${familyStats.incomeYoyTrend || '持平'}`"
						>
							<div
								:class="[
									'kpi-trend-badge',
									isTrendGood('income', familyStats.incomeMomTrend) ? 'good'
									:	'warn',
								]"
							>
								<rise-outlined
									v-if="!isNegativeTrend(familyStats.incomeMomTrend)"
								/>
								<fall-outlined v-else />
								<span>环比 {{ familyStats.incomeMomTrend }}</span>
							</div>
						</a-tooltip>
					</div>
					<div class="kpi-bottom-row" v-else>
						<div class="kpi-trend-badge good">
							<arrow-up-outlined />
							<span>上架率 94.2%</span>
						</div>
					</div>
				</a-card>
			</a-col>

			<!-- KPI 3: 净结余 / 成交额 -->
			<a-col :xs="24" :sm="12" :md="6">
				<a-card
					:bordered="false"
					class="kpi-card"
					:class="{ 'clickable-card': isFamilyContext }"
					data-testid="dash-org-kpi-balance"
					@click="isFamilyContext && navigateTo('/finance/financeAnalysis')"
				>
					<div class="kpi-top-row">
						<div class="kpi-title">
							{{ isFamilyContext ? '本月家庭净结余' : '本月成交额' }}
						</div>
						<div
							:class="[
								'kpi-icon-badge',
								isFamilyContext ?
									familyStats.netBalance >= 0 ?
										'pink'
									:	'danger-badge'
								:	'orange',
							]"
						>
							<wallet-outlined v-if="isFamilyContext" />
							<dollar-outlined v-else />
						</div>
					</div>
					<div class="kpi-value-row">
						<span class="kpi-currency">¥</span>
						<span
							:class="[
								'kpi-number',
								isFamilyContext && familyStats.netBalance < 0 ?
									'text-rose-600'
								:	'',
							]"
						>
							{{
								isFamilyContext ?
									formatMoney(familyStats.netBalance)
								:	orgStats.monthlySales.toLocaleString()
							}}
						</span>
					</div>
					<div class="kpi-bottom-row" v-if="isFamilyContext">
						<div
							:class="[
								'kpi-breakdown-capsule',
								familyStats.netBalance < 0 ? 'danger' : '',
							]"
						>
							<span v-if="familyStats.netBalance >= 0"
								>储蓄率 {{ familyStats.savingsRate }}% · 结余充裕</span
							>
							<span v-else
								>当月超支 ¥{{
									formatMoney(Math.abs(familyStats.netBalance))
								}}</span
							>
						</div>
						<a-tooltip
							v-if="familyStats.balanceMomTrend"
							:title="`结余较上月环比: ${familyStats.balanceMomTrend} · 较去年同期同比: ${familyStats.balanceYoyTrend || '持平'}`"
						>
							<div
								:class="[
									'kpi-trend-badge',
									isTrendGood('income', familyStats.balanceMomTrend) ? 'good'
									:	'warn',
								]"
							>
								<rise-outlined
									v-if="!isNegativeTrend(familyStats.balanceMomTrend)"
								/>
								<fall-outlined v-else />
								<span>环比 {{ familyStats.balanceMomTrend }}</span>
							</div>
						</a-tooltip>
					</div>
					<div class="kpi-bottom-row" v-else>
						<div class="kpi-trend-badge good">
							<arrow-up-outlined />
							<span>环比增长 +9.4%</span>
						</div>
					</div>
				</a-card>
			</a-col>

			<!-- KPI 4: 家庭规模活跃度 / 机构礼金 -->
			<a-col :xs="24" :sm="12" :md="6">
				<a-card
					:bordered="false"
					class="kpi-card"
					:class="{ 'clickable-card': isFamilyContext }"
					data-testid="dash-org-kpi-scale"
					@click="isFamilyContext && navigateTo('/finance/gift/person')"
				>
					<div class="kpi-top-row">
						<div class="kpi-title">
							{{ isFamilyContext ? '家庭在册亲友' : '机构礼金往来总额' }}
						</div>
						<div
							:class="['kpi-icon-badge', isFamilyContext ? 'blue' : 'pink']"
						>
							<team-outlined v-if="isFamilyContext" />
							<account-book-outlined v-else />
						</div>
					</div>
					<div class="kpi-value-row">
						<span class="kpi-currency" v-if="!isFamilyContext">¥</span>
						<span class="kpi-number">{{
							isFamilyContext ?
								familyStats.memberCount
							:	orgStats.giftTurnover.toLocaleString()
						}}</span>
						<span class="kpi-unit" v-if="isFamilyContext">人</span>
					</div>
					<div class="kpi-bottom-row" v-if="isFamilyContext">
						<div class="kpi-breakdown-capsule">
							<span>本月人情 {{ familyStats.monthEventCount }} 场</span>
							<span class="dot-divider">·</span>
							<span>记账 {{ familyStats.dailyCount }} 笔</span>
						</div>
						<div class="kpi-trend-badge info">
							<check-circle-outlined />
							<span>在册建档</span>
						</div>
					</div>
					<div class="kpi-bottom-row" v-else>
						<div class="kpi-trend-badge good">
							<check-circle-outlined />
							<span>累计收礼32笔/随礼26笔</span>
						</div>
					</div>
				</a-card>
			</a-col>
		</a-row>
	</div>
</template>

<script setup lang="ts">
import {
	TeamOutlined,
	AppstoreOutlined,
	DollarOutlined,
	AccountBookOutlined,
	ArrowUpOutlined,
	CheckCircleOutlined,
	FallOutlined,
	RiseOutlined,
	WalletOutlined,
} from '@ant-design/icons-vue';

interface OrgStats {
	memberCount: number;
	productCount: number;
	monthlySales: number;
	giftTurnover: number;
}

interface FamilyStats {
	memberCount: number;
	monthEventCount: number;
	eventCount: number;
	dailyExpense: number;
	dailyIncome: number;
	dailyCount: number;
	giftExpense: number;
	giftIncome: number;
	totalExpense: number;
	totalIncome: number;
	netBalance: number;
	savingsRate: number;
	expenseMomTrend: string;
	expenseYoyTrend: string;
	incomeMomTrend: string;
	incomeYoyTrend: string;
	balanceMomTrend: string;
	balanceYoyTrend: string;
}

interface Props {
	isFamilyContext: boolean;
	orgStats: OrgStats;
	familyStats: FamilyStats;
}

const props = defineProps<Props>();

const router = useRouter();

const isNegativeTrend = (trend?: string) => {
	if (!trend) return false;
	return trend.trim().startsWith('-');
};

const isTrendGood = (type: 'expense' | 'income', trend?: string) => {
	if (!trend) return true;
	const isNeg = isNegativeTrend(trend);
	if (type === 'expense') {
		return isNeg;
	}
	return !isNeg;
};

const formatMoney = (
	val: number | string | undefined,
	decimals = 2,
): string => {
	const num = Number(val);
	if (isNaN(num)) return '0.00';
	return num.toLocaleString('zh-CN', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	});
};

const navigateTo = (path: string, query?: Record<string, string>) => {
	void router.push({ path, query });
};
</script>

<style scoped lang="scss">
.stats-overview-section {
	margin-bottom: 20px;

	.kpi-card {
		border-radius: 16px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			box-shadow:
				0 10px 15px -3px rgba(0, 0, 0, 0.06),
				0 4px 6px -4px rgba(0, 0, 0, 0.04);
			border-color: #cbd5e1;
		}

		&.clickable-card {
			cursor: pointer;

			&:hover {
				transform: translateY(-3px);
				box-shadow:
					0 12px 20px -4px rgba(0, 0, 0, 0.08),
					0 4px 6px -2px rgba(0, 0, 0, 0.03);
				border-color: #94a3b8;

				.kpi-icon-badge {
					transform: scale(1.08);
				}
			}
		}

		:deep(.ant-card-body) {
			padding: 18px 20px;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			min-height: 146px;
		}

		.kpi-top-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 8px;

			.kpi-title {
				font-size: 13px;
				font-weight: 600;
				color: #64748b;
				letter-spacing: -0.2px;
			}
		}

		.kpi-icon-badge {
			width: 40px;
			height: 40px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;
			flex-shrink: 0;
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			&.blue {
				background: #eff6ff;
				color: #2563eb;
				border: 1px solid #dbeafe;
			}

			&.cyan {
				background: #ecfdf5;
				color: #059669;
				border: 1px solid #a7f3d0;
			}

			&.orange {
				background: #fffbeb;
				color: #d97706;
				border: 1px solid #fde68a;
			}

			&.pink {
				background: #faf5ff;
				color: #9333ea;
				border: 1px solid #f3e8ff;
			}

			&.danger-badge {
				background: #fff1f2;
				color: #e11d48;
				border: 1px solid #fecdd3;
			}
		}

		.kpi-value-row {
			display: flex;
			align-items: baseline;
			gap: 4px;
			margin-bottom: 10px;

			.kpi-currency {
				font-size: 18px;
				font-weight: 700;
				color: #0f172a;
			}

			.kpi-number {
				font-size: 28px;
				font-weight: 800;
				color: #0f172a;
				letter-spacing: -0.8px;
				font-variant-numeric: tabular-nums;
			}

			.kpi-unit {
				font-size: 13px;
				font-weight: 600;
				color: #64748b;
			}
		}

		.kpi-bottom-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			flex-wrap: wrap;

			.kpi-breakdown-capsule {
				font-size: 12px;
				font-weight: 500;
				color: #475569;
				background: #f8fafc;
				border: 1px solid #f1f5f9;
				padding: 2px 8px;
				border-radius: 9999px;
				display: inline-flex;
				align-items: center;
				gap: 4px;

				.dot-divider {
					color: #cbd5e1;
				}

				&.danger {
					background: #fff1f2;
					color: #e11d48;
					border-color: #ffe4e6;
				}
			}

			.kpi-trend-badge {
				font-size: 11px;
				font-weight: 600;
				display: inline-flex;
				align-items: center;
				gap: 3px;
				padding: 2px 7px;
				border-radius: 9999px;
				white-space: nowrap;
				transition: all 0.2s ease;
				cursor: pointer;

				&.good {
					background: #ecfdf5;
					color: #047857;
					border: 1px solid #a7f3d0;
				}

				&.warn {
					background: #fff7ed;
					color: #c2410c;
					border: 1px solid #ffedd5;
				}

				&.info {
					background: #eff6ff;
					color: #2563eb;
					border: 1px solid #dbeafe;
				}
			}
		}
	}
}
</style>
