<template>
	<a-spin :spinning="loading">
		<div class="gift-dashboard">
			<div class="dashboard-header">
				<div>
					<h2>财务概览</h2>
					<p>
						欢迎回来，这是您当前的礼尚往来收支统计报告。
						<span v-if="todayRecordCount > 0" class="today-summary">
							今日新增 {{ todayRecordCount }} 笔礼金记录
						</span>
					</p>
				</div>
				<a-button
					v-if="hasPermission('gift:add')"
					type="primary"
					class="primary-action"
					data-testid="gift-dashboard-add-record"
					@click="goRecord"
				>
					+ 新增礼金记录
				</a-button>
			</div>

			<div class="metric-grid">
				<gift-metric-card
					v-for="item in metricCards"
					:key="item.title"
					:title="item.title"
					:value="item.value"
					:tone="item.tone"
					:icon="item.icon"
					:trend-text="item.trendText"
					:trend-direction="item.trendDirection"
					:sparkline-points="item.sparklinePoints"
					:sub="item.sub"
				/>
			</div>

			<div class="main-grid">
				<section class="panel panel-secondary trend-panel">
					<div class="panel-head">
						<div>
							<h3>收支趋势（月度）</h3>
							<div v-if="trendStats" class="panel-stats">
								<span>平均收入 {{ money(trendStats.avgReceive) }}</span>
								<span>平均支出 {{ money(trendStats.avgGive) }}</span>
								<span>净增长率 {{ trendStats.netGrowthText }}</span>
							</div>
						</div>
						<a-select
							v-model:value="trendScope"
							size="small"
							class="scope-select"
						>
							<a-select-option value="recent">最近6个月</a-select-option>
							<a-select-option value="year">本年度</a-select-option>
						</a-select>
					</div>
					<gift-empty-state
						v-if="chartRows.length === 0"
						title="暂无趋势数据"
						description="录入礼金记录后，这里会展示近几个月的收支变化。"
						action-text="去记一笔礼金 →"
						:to="recordPath"
						:icon="BarChartOutlined"
					/>
					<template v-else>
						<div class="bar-chart">
							<div
								v-for="item in chartRows"
								:key="item.label"
								class="bar-group"
							>
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
					</template>
				</section>

				<section class="panel panel-secondary ranking-panel">
					<div class="panel-head">
						<h3>往来密切联系人</h3>
					</div>
					<gift-empty-state
						v-if="rankingRows.length === 0"
						title="暂无往来联系人"
						description="添加联系人并记录礼金往来后，这里会展示互动最密切的亲友排行。"
						action-text="去添加联系人 →"
						:to="personPath"
						:icon="TeamOutlined"
					/>
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
					<a-button
						type="link"
						class="ranking-link"
						data-testid="gift-dashboard-ranking-all"
						@click="goPerson"
					>
						查看全部排行榜
					</a-button>
				</section>
			</div>

			<section class="panel panel-tertiary record-panel">
				<div class="panel-head">
					<h3>最近往来记录</h3>
					<a-button
						type="link"
						data-testid="gift-dashboard-record-all"
						@click="goRecord"
					>
						全部记录 >
					</a-button>
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
					<gift-empty-state
						v-if="records.length === 0"
						title="暂无往来记录"
						description="开始记录第一笔随礼或收礼，方便随时查看人情往来。"
						action-text="去记一笔礼金 →"
						:to="recordPath"
						:icon="FileTextOutlined"
					/>
					<div
						v-for="item in displayRecords"
						:key="item.id"
						class="record-row record-row-body"
					>
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
								item.direction === 'RECEIVE' ?
									'amount-income'
								:	'amount-expense'
							"
						>
							{{ signedMoney(item) }}
						</span>
						<span>
							<a-tag
								v-if="item.direction === 'RECEIVE'"
								:color="item.returnedFlag === 1 ? 'green' : 'orange'"
							>
								{{ item.returnedFlag === 1 ? '已完成' : '待确认' }}
							</a-tag>
							<a-tag v-else color="green">已完成</a-tag>
						</span>
						<span>
							<a-button type="link" size="small" @click="goRecord">
								查看
							</a-button>
						</span>
					</div>
				</div>
				<a-button
					v-if="hasPermission('gift:add')"
					type="primary"
					shape="circle"
					class="float-add"
					data-testid="gift-dashboard-float-add"
					@click="goRecord"
				>
					+
				</a-button>
			</section>

			<section class="ai-panel">
				<div>
					<h3>AI 礼尚往来建议</h3>
					<p>{{ aiSuggestionText }}</p>
				</div>
				<a-button
					class="ai-action"
					data-testid="gift-dashboard-ai-detail"
					@click="goAnalysis"
				>
					查看详细预测
				</a-button>
			</section>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import {
	AccountBookOutlined,
	BarChartOutlined,
	ClockCircleOutlined,
	DollarOutlined,
	FileTextOutlined,
	FallOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';
import GiftEmptyState from '@/views/finance/gift/gift-dashboard/components/GiftEmptyState.vue';
import GiftMetricCard from '@/views/finance/gift/gift-dashboard/components/GiftMetricCard.vue';
import {
	averageOf,
	buildSparklinePoints,
	calcMomTrend,
} from '@/views/finance/gift/gift-dashboard/utils/metrics';
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

defineOptions({
	name: 'GiftDashboard',
});

type MetricTone = 'income' | 'expense' | 'balance' | 'todo';

interface MetricCardView {
	title: string;
	value: string;
	sub: string;
	tone: MetricTone;
	icon: typeof DollarOutlined;
	trendText: string;
	trendDirection: 'up' | 'down' | 'flat' | 'none';
	sparklinePoints: string;
}

const recordPath = '/finance/gift/record';
const personPath = '/finance/gift/person';
const analysisPath = '/finance/gift/analysis';

const router = useRouter();
const loading = ref(false);
const { hasPermission } = usePermission();
const trendScope = ref<'recent' | 'year'>('recent');
const records = ref<GiftRecordInfo[]>([]);
const summary = ref<GiftRecordSummary>({});
const personSummary = ref<GiftPersonSummary>({});
const trendRows = ref<GiftAmountTrend[]>([]);
const personRanking = ref<GiftRankingItem[]>([]);

const scopedTrendRows = computed(() => {
	if (trendRows.value.length === 0) return [];
	if (trendScope.value === 'year') return trendRows.value;
	return trendRows.value.slice(-6);
});

const receiveSeries = computed(() =>
	scopedTrendRows.value.map((item) => Number(item.receiveAmount || 0)),
);

const giveSeries = computed(() =>
	scopedTrendRows.value.map((item) => Number(item.giveAmount || 0)),
);

const netSeries = computed(() =>
	scopedTrendRows.value.map(
		(item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0),
	),
);

const metricCards = computed<MetricCardView[]>(() => {
	const receiveAmount = Number(summary.value.receiveAmount || 0);
	const giveAmount =
		Number(summary.value.giveAmount || 0) +
		Number(summary.value.returnAmount || 0);
	const balanceAmount = Number(
		summary.value.netAmount ?? receiveAmount - giveAmount,
	);
	const pendingAmount = Number(personSummary.value.pendingReturnAmount || 0);
	const receiveTrend = calcMomTrend(receiveSeries.value);
	const giveTrend = calcMomTrend(giveSeries.value);
	const balanceTrend = calcMomTrend(netSeries.value);

	return [
		{
			title: '累计收入',
			value: money(receiveAmount),
			sub: receiveTrend.direction === 'none' ? '' : '收入趋势',
			icon: DollarOutlined,
			tone: 'income',
			trendText: receiveTrend.text,
			trendDirection: receiveTrend.direction,
			sparklinePoints: buildSparklinePoints(receiveSeries.value),
		},
		{
			title: '累计支出',
			value: money(giveAmount),
			sub: giveTrend.direction === 'none' ? '' : '支出趋势',
			icon: FallOutlined,
			tone: 'expense',
			trendText: giveTrend.text,
			trendDirection: giveTrend.direction,
			sparklinePoints: buildSparklinePoints(giveSeries.value),
		},
		{
			title: '结余总计',
			value: money(balanceAmount),
			sub: balanceAmount >= 0 ? '净资产健康增长' : '建议关注回礼安排',
			icon: AccountBookOutlined,
			tone: 'balance',
			trendText: balanceTrend.text,
			trendDirection: balanceTrend.direction,
			sparklinePoints: buildSparklinePoints(netSeries.value),
		},
		{
			title: '待办礼金',
			value: pendingAmount > 0 ? money(pendingAmount) : '¥0.00',
			sub:
				pendingAmount > 0 ? '待处理回礼金额' : (
					`${personSummary.value.personCount || 0} 位联系人`
				),
			icon: ClockCircleOutlined,
			tone: 'todo',
			trendText: pendingAmount > 0 ? '建议优先处理待回礼' : '暂无待办回礼',
			trendDirection: 'none',
			sparklinePoints: buildSparklinePoints(
				netSeries.value.length > 0 ? netSeries.value : [pendingAmount],
			),
		},
	];
});

const chartRows = computed(() => {
	const source = scopedTrendRows.value;
	if (source.length === 0) return [];
	const maxAmount = Math.max(
		1,
		...source.flatMap((item) => [
			Number(item.receiveAmount || 0),
			Number(item.giveAmount || 0),
		]),
	);
	return source.map((item) => ({
		label: item.label || '-',
		receiveHeight: Math.max(
			8,
			(Number(item.receiveAmount || 0) / maxAmount) * 100,
		),
		giveHeight: Math.max(8, (Number(item.giveAmount || 0) / maxAmount) * 100),
	}));
});

const trendStats = computed(() => {
	const source = scopedTrendRows.value;
	if (source.length === 0) return null;
	const avgReceive = averageOf(receiveSeries.value);
	const avgGive = averageOf(giveSeries.value);
	const netTrend = calcMomTrend(netSeries.value);
	return {
		avgReceive,
		avgGive,
		netGrowthText:
			netTrend.pct === null ?
				netTrend.text
			:	netTrend.text.replace('较上月', ''),
	};
});

const rankingRows = computed(() => {
	const maxAmount = Math.max(
		1,
		...personRanking.value.map((item) => Number(item.amount || 0)),
	);
	return personRanking.value.slice(0, 5).map((item, index) => ({
		index: index + 1,
		name: item.name || '-',
		amount: Number(item.amount || 0),
		percent: Math.max(18, (Number(item.amount || 0) / maxAmount) * 100),
	}));
});

const displayRecords = computed(() => records.value.slice(0, 4));

const todayRecordCount = computed(() => {
	const today = dayjs().format('YYYY-MM-DD');
	return records.value.filter((item) => item.payTime?.startsWith(today)).length;
});

const aiReserveAmount = computed(() => {
	const averageGive =
		Number(summary.value.giveAmount || 0) /
		Math.max(1, Number(summary.value.recordCount || 1));
	return Math.max(2000, averageGive * 3);
});

const aiSuggestionText = computed(() => {
	const personCount = Number(personSummary.value.personCount || 0);
	if (personCount === 0) {
		return '添加联系人并积累礼金记录后，系统会基于历史往来给出更精准的礼金预算与回礼提醒。';
	}
	return `根据您的历史记录，建议为近期重要往来预留约 ${money(aiReserveAmount.value)} 的礼金支出，以保持良好的人情关系。`;
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

const goRecord = async () => {
	await router.push(recordPath);
};

const goPerson = async () => {
	await router.push(personPath);
};

const goAnalysis = async () => {
	await router.push(analysisPath);
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

.today-summary {
	margin-left: 8px;
	padding-left: 8px;
	border-left: 1px solid #d0d5dd;
	color: #1677ff;
	font-weight: 600;
}

.primary-action {
	height: 34px;
	border-radius: 8px;
	font-weight: 600;
	background: #1677ff;
	border-color: #1677ff;
	box-shadow: 0 6px 14px rgba(22, 119, 255, 0.18);
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
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
}

.panel-secondary {
	border-radius: 10px;
	box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
}

.panel-tertiary {
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.panel-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 16px 18px 8px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
		color: #17233d;
	}
}

.panel-stats {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-top: 8px;
	font-size: 12px;
	color: #667085;
}

.scope-select {
	width: 112px;
}

.bar-chart {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 22px;
	height: 200px;
	padding: 16px 40px 12px;
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
	height: 160px;
}

.bar {
	width: 24px;
	min-height: 14px;
	border-radius: 2px 2px 0 0;
}

.bar-income {
	background: #1677ff;
}

.bar-expense {
	background: #f97066;
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
	background: #1677ff;
}

.legend-expense {
	background: #f97066;
}

.ranking-panel {
	min-height: 320px;
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
	background: rgba(22, 119, 255, 0.1);
	color: #1677ff;
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
	color: #14803c;
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
	background: #fafafa;
	border-top: 1px solid #edf0f5;
}

.record-row-body {
	transition: background-color 0.2s ease;

	&:hover {
		background: #f8fbff;
	}
}

.amount-income {
	color: #14803c;
	font-weight: 800;
}

.amount-expense {
	color: #d92d20;
	font-weight: 800;
}

.float-add {
	position: absolute;
	right: 0;
	bottom: 58px;
	width: 44px;
	height: 44px;
	font-size: 24px;
	font-weight: 500;
	background: #1677ff;
	border-color: #1677ff;
	transform: translateX(50%);
	box-shadow: 0 10px 20px rgba(22, 119, 255, 0.25);
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
			rgba(22, 119, 255, 0.96) 0%,
			rgba(22, 119, 255, 0.96) 68%,
			rgba(64, 150, 255, 0.78) 68%
		),
		linear-gradient(135deg, #1677ff, #4096ff);
	border-radius: 12px;
	box-shadow: 0 10px 24px rgba(22, 119, 255, 0.2);

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
	color: #1677ff;
	font-weight: 800;
	background: #fff;
	border: none;
	border-radius: 8px;
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
