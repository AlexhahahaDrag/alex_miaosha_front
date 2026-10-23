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
					:sparkline-data="item.sparklineData"
					:sub="item.sub"
				/>
			</div>

			<div class="main-grid">
				<!-- 月度收支趋势解耦子组件 -->
				<gift-dashboard-trend-card
					v-model:trend-scope="trendScope"
					:trend-rows="trendRows"
					:record-path="recordPath"
				/>

				<!-- 往来密切联系人排行解耦子组件 -->
				<gift-dashboard-ranking-card
					:ranking-rows="rankingRows"
					:person-path="personPath"
					@go-person="goPerson"
				/>
			</div>

			<!-- 最近往来记录明细解耦子组件 -->
			<gift-dashboard-recent-table
				:records="records"
				:display-records="displayRecords"
				:record-path="recordPath"
				:can-add="hasPermission('gift:add')"
				@go-record="goRecord"
			/>

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

			<section
				v-if="showAiInsight"
				class="ai-insight-mount"
				data-testid="gift-dashboard-ai-insight"
			>
				<gift-ai-insight-panel
					:overview="aiOverview"
					:trend="trendRows"
					:person-ranking="personRanking"
					:disabled="loading"
				/>
			</section>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
	AccountBookOutlined,
	ClockCircleOutlined,
	DollarOutlined,
	FallOutlined,
} from '@ant-design/icons-vue';
import GiftMetricCard, {
	type SparklineData,
} from '@/views/finance/gift/gift-dashboard/components/GiftMetricCard.vue';
import GiftAiInsightPanel from '@/views/finance/gift/ai/GiftAiInsightPanel.vue';
import { hasMeaningfulOverview } from '@/views/finance/gift/ai/hasMeaningfulOverview';
import { calcMomTrend } from '@/views/finance/gift/gift-dashboard/utils/metrics';
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
import { money } from '@/views/finance/gift/config';
import GiftDashboardTrendCard from './components/GiftDashboardTrendCard.vue';
import GiftDashboardRankingCard from './components/GiftDashboardRankingCard.vue';
import GiftDashboardRecentTable from './components/GiftDashboardRecentTable.vue';

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
	sparklineData: SparklineData;
}

const recordPath = '/finance/gift/record';
const personPath = '/finance/gift/person';
const analysisPath = '/finance/gift/analysis';

const router = useRouter();
const loading = ref<boolean>(false);
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

const trendLabels = computed(() =>
	scopedTrendRows.value.map((item) => item.label || '-'),
);

const metricCards = computed<MetricCardView[]>(() => {
	const labels = trendLabels.value;
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
			sparklineData: { labels, values: receiveSeries.value },
		},
		{
			title: '累计支出',
			value: money(giveAmount),
			sub: giveTrend.direction === 'none' ? '' : '支出趋势',
			icon: FallOutlined,
			tone: 'expense',
			trendText: giveTrend.text,
			trendDirection: giveTrend.direction,
			sparklineData: { labels, values: giveSeries.value },
		},
		{
			title: '结余总计',
			value: money(balanceAmount),
			sub: balanceAmount >= 0 ? '净资产健康增长' : '建议关注回礼安排',
			icon: AccountBookOutlined,
			tone: 'balance',
			trendText: balanceTrend.text,
			trendDirection: balanceTrend.direction,
			sparklineData: { labels, values: netSeries.value },
		},
		{
			title: '待办礼金',
			value: pendingAmount > 0 ? money(pendingAmount) : '¥0.00',
			sub:
				pendingAmount > 0
					? '待处理回礼金额'
					: `${personSummary.value.personCount || 0} 位联系人`,
			icon: ClockCircleOutlined,
			tone: 'todo',
			trendText: pendingAmount > 0 ? '建议优先处理待回礼' : '暂无待办回礼',
			trendDirection: 'none',
			sparklineData: {
				labels,
				values: netSeries.value.length > 0 ? netSeries.value : [pendingAmount],
			},
		},
	];
});

const rankingRows = computed(() => {
	const source = personRanking.value.slice(0, 5);
	const maxAmount = Math.max(
		...source.map((item) => Number(item.amount || 0)),
		1,
	);
	return source.map((item, index) => {
		const amount = Number(item.amount || 0);
		return {
			index: index + 1,
			name: item.name || '未命名联系人',
			amount,
			percent: Math.min(100, Math.round((amount / maxAmount) * 100)),
		};
	});
});

const displayRecords = computed(() => records.value.slice(0, 6));

const todayRecordCount = computed(() => {
	const today = new Date().toISOString().slice(0, 10);
	return records.value.filter((item) => (item.payTime || '').startsWith(today))
		.length;
});

const aiOverview = computed(() => ({
	totalReceiveAmount: summary.value.receiveAmount,
	totalGiveAmount: summary.value.giveAmount,
	netAmount: summary.value.netAmount,
	receiveAmount: summary.value.receiveAmount,
	giveAmount: summary.value.giveAmount,
	returnAmount: summary.value.returnAmount,
	recordCount: summary.value.recordCount,
	pendingReturnAmount: personSummary.value.pendingReturnAmount,
	todayRecordCount: todayRecordCount.value,
}));

const showAiInsight = computed(() =>
	hasMeaningfulOverview(aiOverview.value),
);

const aiSuggestionText = computed(() => {
	const pending = Number(personSummary.value.pendingReturnAmount || 0);
	const balance = Number(summary.value.netAmount || 0);
	if (pending > 0) {
		return `您当前有 ${money(pending)} 的待办回礼事项，建议优先规划近期人情往来预算。`;
	}
	if (balance >= 0) {
		return '当前礼金结余保持正向增长，人情往来维持在健康合理的水平。';
	}
	return '近期支出略大于收入，可通过人情往来预测提前预留礼金流动资金。';
});

const goRecord = () => {
	router.push(recordPath);
};

const goPerson = () => {
	router.push(personPath);
};

const goAnalysis = () => {
	router.push(analysisPath);
};

const loadDashboard = async () => {
	loading.value = true;
	try {
		const [summaryRes, personRes, trendRes, rankingRes, recordRes] =
			await Promise.all([
				getGiftRecordSummary(),
				getGiftPersonSummary(),
				getGiftAnalysisTrend(),
				getGiftAnalysisPersonRanking(),
				getGiftRecordPage({}, 1, 10),
			]);

		if (summaryRes.code === '200') summary.value = summaryRes.data || {};
		if (personRes.code === '200')
			personSummary.value = personRes.data || {};
		if (trendRes.code === '200') trendRows.value = trendRes.data || [];
		if (rankingRes.code === '200')
			personRanking.value = rankingRes.data || [];
		if (recordRes.code === '200')
			records.value = recordRes.data?.records || [];
	} catch (error) {
		console.error('加载礼尚往来仪表盘失败', error);
		message.error('礼尚往来数据加载失败');
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	void loadDashboard();
});
</script>

<style scoped lang="less">
.gift-dashboard {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 24px;
	background: #f8fafc;
	min-height: 100vh;
}

.dashboard-header {
	display: flex;
	justify-content: space-between;
	align-items: center;

	h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.02em;
	}

	p {
		margin: 4px 0 0;
		color: #64748b;
		font-size: 14px;
	}

	.today-summary {
		display: inline-block;
		margin-left: 8px;
		color: #2563eb;
		font-weight: 600;
	}
}

.primary-action {
	height: 40px;
	padding: 0 20px;
	border-radius: 10px;
	font-weight: 600;
	background: #2563eb;
	box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
}

.main-grid {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 16px;
}

.ai-panel {
	border-radius: 16px;
	padding: 20px 24px;
	background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
	border: 1px solid #dbeafe;
	display: flex;
	justify-content: space-between;
	align-items: center;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #1e40af;
	}

	p {
		margin: 4px 0 0;
		color: #3b82f6;
		font-size: 13.5px;
	}

	.ai-action {
		background: #fff;
		color: #2563eb;
		border: 1px solid #bfdbfe;
		font-weight: 600;
		border-radius: 8px;
		box-shadow: 0 2px 6px rgba(37, 99, 235, 0.08);

		&:hover {
			background: #2563eb;
			color: #fff;
		}
	}
}
</style>
