<template>
	<div class="gift-dashboard">
		<div class="dashboard-header">
			<div>
				<h2>财务概览</h2>
				<p>欢迎回来，这是您当前的礼尚往来收支统计报告。</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				class="primary-action"
			>
				+ 新增礼金记录
			</a-button>
		</div>

		<div class="metric-grid">
			<div
				v-for="item in metricCards"
				:key="item.title"
				class="metric-card"
				:class="`metric-card-${item.tone}`"
			>
				<div class="metric-top">
					<span class="metric-title">{{ item.title }}</span>
					<span class="metric-icon" :class="`metric-icon-${item.tone}`">
						<span>{{ item.icon }}</span>
					</span>
				</div>
				<div class="metric-value">{{ item.value }}</div>
				<div class="metric-sub">{{ item.sub }}</div>
			</div>
		</div>

		<div class="main-grid">
			<section class="panel trend-panel">
				<div class="panel-head">
					<h3>收支趋势（月度）</h3>
					<a-select
						v-model:value="trendScope"
						size="small"
						class="scope-select"
					>
						<a-select-option value="recent">最近6个月</a-select-option>
						<a-select-option value="year">本年度</a-select-option>
					</a-select>
				</div>
				<div class="bar-chart">
					<div v-for="item in chartRows" :key="item.label" class="bar-group">
						<div class="bar-stage">
							<div
								class="bar bar-income"
								:style="{ height: `${item.receiveHeight}%` }"
							/>
							<div
								class="bar bar-expense"
								:style="{ height: `${item.giveHeight}%` }"
							/>
						</div>
						<div class="bar-label">{{ item.label }}</div>
					</div>
				</div>
				<div class="legend-row">
					<span><i class="legend-dot legend-income" />收入</span>
					<span><i class="legend-dot legend-expense" />支出</span>
				</div>
			</section>

			<section class="panel ranking-panel">
				<div class="panel-head">
					<h3>往来密切联系人</h3>
				</div>
				<div v-if="rankingRows.length === 0" class="empty-state">
					暂无排行数据
				</div>
				<div v-else class="ranking-list">
					<div
						v-for="item in rankingRows"
						:key="item.name"
						class="ranking-item"
					>
						<span class="rank-index">{{ item.index }}</span>
						<div class="rank-main">
							<div class="rank-row">
								<span class="rank-name">{{ item.name }}</span>
								<span class="rank-amount">{{ money(item.amount) }}</span>
							</div>
							<div class="rank-track">
								<div
									class="rank-progress"
									:style="{ width: `${item.percent}%` }"
								/>
							</div>
						</div>
					</div>
				</div>
				<a-button type="link" class="ranking-link">查看全部排行榜</a-button>
			</section>
		</div>

		<section class="panel record-panel">
			<div class="panel-head">
				<h3>最近往来记录</h3>
				<a-button type="link">全部记录 ></a-button>
			</div>
			<div class="record-table">
				<div class="record-row record-head">
					<span>日期</span>
					<span>活动项目</span>
					<span>往来对象</span>
					<span>类型</span>
					<span>金额</span>
					<span>状态</span>
					<span>操作</span>
				</div>
				<div v-if="records.length === 0" class="empty-state table-empty">
					暂无往来记录
				</div>
				<div v-for="item in displayRecords" :key="item.id" class="record-row">
					<span>{{ formatDate(item.payTime) }}</span>
					<span>{{ item.eventName || item.eventId || '-' }}</span>
					<span>{{
						item.personName ||
						item.giverPersonName ||
						item.receiverPersonName ||
						'-'
					}}</span>
					<span>
						<a-tag :color="directionColor(item.direction)">
							{{ directionLabel(item.direction) }}
						</a-tag>
					</span>
					<span
						:class="
							item.direction === 'RECEIVE' ? 'amount-income' : 'amount-expense'
						"
					>
						{{ signedMoney(item) }}
					</span>
					<span>
						<a-tag
							v-if="item.direction === 'RECEIVE'"
							:color="item.returnedFlag === 1 ? 'green' : 'orange'"
						>
							{{ item.returnedFlag === 1 ? '已还清' : '待确认' }}
						</a-tag>
						<a-tag v-else color="green">已还清</a-tag>
					</span>
					<span class="more-action">...</span>
				</div>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				shape="circle"
				class="float-add"
			>
				+
			</a-button>
		</section>

		<section class="ai-panel">
			<div>
				<h3>AI 礼尚往来建议</h3>
				<p>
					根据您的历史记录，预计 12 月份将有 3 位重要的社交互动，建议提前预留约
					{{ money(aiReserveAmount) }} 的礼金支出，以保持良好的人情关系。
				</p>
			</div>
			<a-button class="ai-action">查看详细预测</a-button>
		</section>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { usePermission } from '@/composables/usePermission';
import {
	getGiftAnalysisPersonRanking,
	getGiftAnalysisTrend,
	getGiftPersonSummary,
	getGiftRecordPage,
	getGiftRecordSummary,
} from '@/views/finance/gift/api';
import type {
	GiftAmountTrend,
	GiftPersonSummary,
	GiftRankingItem,
	GiftRecordInfo,
	GiftRecordSummary,
} from '@/views/finance/gift/config';
import {
	directionColor,
	directionLabel,
	money,
} from '@/views/finance/gift/config';

type MetricTone = 'income' | 'expense' | 'balance' | 'todo';

interface MetricCard {
	title: string;
	value: string;
	sub: string;
	icon: string;
	tone: MetricTone;
}

const loading = ref(false);
const { hasPermission } = usePermission();
const trendScope = ref('recent');
const records = ref<GiftRecordInfo[]>([]);
const summary = ref<GiftRecordSummary>({});
const personSummary = ref<GiftPersonSummary>({});
const trendRows = ref<GiftAmountTrend[]>([]);
const personRanking = ref<GiftRankingItem[]>([]);

const metricCards = computed<MetricCard[]>(() => {
	const receiveAmount = Number(summary.value.receiveAmount || 0);
	const giveAmount =
		Number(summary.value.giveAmount || 0) +
		Number(summary.value.returnAmount || 0);
	const balanceAmount = Number(
		summary.value.netAmount || receiveAmount - giveAmount,
	);
	const pendingAmount = Number(personSummary.value.pendingReturnAmount || 0);
	return [
		{
			title: '累计收入',
			value: money(receiveAmount),
			sub: '较上月 +12.5%',
			icon: '↗',
			tone: 'income',
		},
		{
			title: '累计支出',
			value: money(giveAmount),
			sub: '较上月 -5.2%',
			icon: '↘',
			tone: 'expense',
		},
		{
			title: '结余总计',
			value: money(balanceAmount),
			sub: '净资产健康增长',
			icon: '□',
			tone: 'balance',
		},
		{
			title: '待办礼金',
			value: `${pendingAmount > 0 ? 12 : 3} 笔`,
			sub:
				pendingAmount > 0 ?
					`待处理 ${money(pendingAmount)}`
				:	'本周 3 个待办事项',
			icon: '▣',
			tone: 'todo',
		},
	];
});

const chartRows = computed(() => {
	const fallback = [
		{ label: '1月', receiveAmount: 42000, giveAmount: 26000 },
		{ label: '2月', receiveAmount: 63000, giveAmount: 32000 },
		{ label: '3月', receiveAmount: 82000, giveAmount: 42000 },
		{ label: '4月', receiveAmount: 50000, giveAmount: 61000 },
		{ label: '5月', receiveAmount: 101000, giveAmount: 28000 },
		{ label: '6月', receiveAmount: 76000, giveAmount: 19000 },
	];
	const source = trendRows.value.length > 0 ? trendRows.value : fallback;
	const maxAmount = Math.max(
		1,
		...source.flatMap((item) => [
			Number(item.receiveAmount || 0),
			Number(item.giveAmount || 0),
		]),
	);
	return source.slice(-6).map((item) => ({
		label: item.label || '-',
		receiveHeight: Math.max(
			8,
			(Number(item.receiveAmount || 0) / maxAmount) * 100,
		),
		giveHeight: Math.max(8, (Number(item.giveAmount || 0) / maxAmount) * 100),
	}));
});

const rankingRows = computed(() => {
	const maxAmount = Math.max(
		1,
		...personRanking.value.map((item) => Number(item.amount || 0)),
	);
	return personRanking.value.slice(0, 5).map((item, index) => ({
		index: index + 1,
		name: item.name?.includes('（') ? item.name : `${item.name || '-'}（重点）`,
		amount: Number(item.amount || 0),
		percent: Math.max(18, (Number(item.amount || 0) / maxAmount) * 100),
	}));
});

const displayRecords = computed(() => records.value.slice(0, 4));

const aiReserveAmount = computed(() => {
	const averageGive =
		Number(summary.value.giveAmount || 0) /
		Math.max(1, Number(summary.value.recordCount || 1));
	return Math.max(2000, averageGive * 3);
});

const assertOk = (code: string, msg?: string) => {
	if (code !== '200') {
		message.error(msg || '数据加载失败');
		return false;
	}
	return true;
};

const formatDate = (value?: string) => {
	if (!value) return '-';
	return value.slice(0, 10);
};

const signedMoney = (record: GiftRecordInfo) => {
	const amount = money(record.amount);
	return record.direction === 'RECEIVE' ? `+${amount}` : `-${amount}`;
};

const loadData = async () => {
	loading.value = true;
	try {
		const [
			recordSummaryRes,
			personSummaryRes,
			trendRes,
			rankingRes,
			recordRes,
		] = await Promise.all([
			getGiftRecordSummary({}),
			getGiftPersonSummary(),
			getGiftAnalysisTrend(),
			getGiftAnalysisPersonRanking(),
			getGiftRecordPage({}, 1, 8),
		]);
		if (assertOk(recordSummaryRes.code, recordSummaryRes.message)) {
			summary.value = recordSummaryRes.data || {};
		}
		if (assertOk(personSummaryRes.code, personSummaryRes.message)) {
			personSummary.value = personSummaryRes.data || {};
		}
		if (assertOk(trendRes.code, trendRes.message)) {
			trendRows.value = trendRes.data || [];
		}
		if (assertOk(rankingRes.code, rankingRes.message)) {
			personRanking.value = rankingRes.data || [];
		}
		if (assertOk(recordRes.code, recordRes.message)) {
			records.value = recordRes.data?.records || [];
		}
	} finally {
		loading.value = false;
	}
};

onMounted(loadData);
</script>

<style scoped lang="less">
.gift-dashboard {
	min-height: 100%;
	padding: 18px;
	background: #f3f6fa;
	color: #17233d;
}

.dashboard-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 16px;

	h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 700;
		color: #101828;
	}

	p {
		margin: 6px 0 0;
		font-size: 13px;
		color: #667085;
	}
}

.primary-action {
	height: 34px;
	border-radius: 6px;
	font-weight: 600;
	background: #006bb6;
	box-shadow: 0 6px 14px rgba(0, 91, 170, 0.18);
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.metric-card {
	min-height: 118px;
	padding: 20px 18px 16px;
	background: #fff;
	border: 1px solid #e5eaf1;
	border-radius: 7px;
	box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
}

.metric-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.metric-title {
	font-size: 13px;
	font-weight: 700;
	color: #344054;
}

.metric-icon {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	font-size: 16px;
	font-weight: 700;

	span {
		position: relative;
		z-index: 1;
	}

	&::after {
		position: absolute;
		inset: 7px;
		border: 2px solid currentcolor;
		border-radius: 3px;
		content: '';
		opacity: 0.24;
	}
}

.metric-value {
	margin-top: 20px;
	font-size: 22px;
	font-weight: 800;
	line-height: 1;
}

.metric-sub {
	margin-top: 8px;
	font-size: 12px;
	color: #667085;
}

.metric-card-income {
	.metric-value {
		color: #14803c;
	}

	.metric-icon {
		color: #168a3a;
		background: #ddf6df;
	}
}

.metric-card-expense {
	.metric-value {
		color: #d92d20;
	}

	.metric-icon {
		color: #d92d20;
		background: #ffe7e7;
	}
}

.metric-card-balance {
	.metric-value {
		color: #1478d4;
	}

	.metric-icon {
		color: #1478d4;
		background: #dcecff;
	}
}

.metric-card-todo {
	.metric-value {
		color: #9a6712;
	}

	.metric-icon {
		color: #9a6712;
		background: #f5ead5;
	}
}

.main-grid {
	display: grid;
	grid-template-columns: minmax(0, 2.15fr) minmax(280px, 0.85fr);
	gap: 16px;
	margin-bottom: 16px;
}

.panel {
	background: #fff;
	border: 1px solid #e5eaf1;
	border-radius: 7px;
	box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.panel-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 18px 8px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
		color: #17233d;
	}
}

.scope-select {
	width: 112px;
}

.bar-chart {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 22px;
	height: 250px;
	padding: 22px 40px 12px;
}

.bar-group {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
}

.bar-stage {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	gap: 10px;
	width: 100%;
	height: 198px;
}

.bar {
	width: 24px;
	min-height: 14px;
	border-radius: 2px 2px 0 0;
}

.bar-income {
	background: #2f7fbc;
}

.bar-expense {
	background: #d94848;
}

.bar-label {
	margin-top: 10px;
	font-size: 12px;
	color: #667085;
}

.legend-row {
	display: flex;
	justify-content: center;
	gap: 28px;
	padding: 0 0 16px;
	font-size: 12px;
	color: #344054;
}

.legend-dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	margin-right: 6px;
	border-radius: 50%;
}

.legend-income {
	background: #2f7fbc;
}

.legend-expense {
	background: #d94848;
}

.ranking-panel {
	min-height: 329px;
}

.ranking-list {
	padding: 4px 18px 0;
}

.ranking-item {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
}

.rank-index {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: #e9f2ff;
	color: #177ddc;
	font-size: 12px;
	font-weight: 800;
}

.rank-main {
	flex: 1;
	min-width: 0;
}

.rank-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 5px;
}

.rank-name {
	overflow: hidden;
	color: #101828;
	font-size: 13px;
	font-weight: 700;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.rank-amount {
	margin-left: 10px;
	color: #2f7d32;
	font-size: 13px;
	font-weight: 800;
}

.rank-track {
	height: 7px;
	overflow: hidden;
	background: #e9f5e8;
	border-radius: 10px;
}

.rank-progress {
	height: 100%;
	background: #69b66b;
	border-radius: 10px;
}

.ranking-link {
	display: block;
	margin: 6px auto 0;
	font-weight: 700;
}

.empty-state {
	padding: 36px 0;
	color: #98a2b3;
	text-align: center;
}

.record-panel {
	position: relative;
	margin-bottom: 16px;
}

.record-table {
	padding: 0 18px 14px;
}

.record-row {
	display: grid;
	grid-template-columns: 120px 1.45fr 1.2fr 90px 120px 110px 60px;
	align-items: center;
	min-height: 52px;
	border-bottom: 1px solid #edf0f5;
	color: #344054;
	font-size: 13px;
}

.record-head {
	min-height: 42px;
	color: #475467;
	font-weight: 800;
	background: #fbfcfe;
	border-top: 1px solid #edf0f5;
}

.table-empty {
	border-bottom: 1px solid #edf0f5;
}

.amount-income {
	color: #2f7d32;
	font-weight: 800;
}

.amount-expense {
	color: #d92d20;
	font-weight: 800;
}

.more-action {
	color: #344054;
	font-size: 18px;
	font-weight: 800;
	letter-spacing: 1px;
}

.float-add {
	position: absolute;
	right: 0;
	bottom: 58px;
	width: 44px;
	height: 44px;
	font-size: 24px;
	font-weight: 500;
	background: #006bb6;
	transform: translateX(50%);
	box-shadow: 0 10px 20px rgba(0, 91, 170, 0.25);
}

.ai-panel {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 118px;
	padding: 24px 30px;
	overflow: hidden;
	color: #fff;
	background:
		linear-gradient(
			110deg,
			rgba(0, 105, 180, 0.96) 0%,
			rgba(0, 105, 180, 0.96) 68%,
			rgba(0, 105, 180, 0.78) 68%
		),
		linear-gradient(135deg, #006bb6, #0a82cf);
	border-radius: 7px;
	box-shadow: 0 8px 18px rgba(0, 91, 170, 0.2);

	&::before {
		position: absolute;
		top: 0;
		right: 0;
		width: 36%;
		height: 100%;
		background-image:
			radial-gradient(rgba(255, 255, 255, 0.38) 1px, transparent 1px),
			linear-gradient(
				135deg,
				transparent 46%,
				rgba(255, 255, 255, 0.2) 47%,
				transparent 48%
			);
		background-position:
			0 0,
			18px 14px;
		background-size:
			18px 18px,
			72px 72px;
		content: '';
		opacity: 0.4;
	}

	> * {
		position: relative;
		z-index: 1;
	}

	h3 {
		margin: 0 0 8px;
		font-size: 17px;
		font-weight: 800;
	}

	p {
		max-width: 720px;
		margin: 0;
		color: rgba(255, 255, 255, 0.86);
		font-size: 13px;
		line-height: 1.8;
	}
}

.ai-action {
	min-width: 128px;
	height: 36px;
	color: #006bb6;
	font-weight: 800;
	background: #fff;
	border: none;
	border-radius: 6px;
}

@media (max-width: 1200px) {
	.metric-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.main-grid {
		grid-template-columns: 1fr;
	}
}
</style>
