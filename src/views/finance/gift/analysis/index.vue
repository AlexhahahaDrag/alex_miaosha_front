<template>
	<a-spin :spinning="loading">
		<div class="gift-screen">
			<div class="screen-header">
				<div>
					<h2>统计报表</h2>
					<p>从趋势、关系、事由和亲友维度分析人情往来表现。</p>
				</div>
				<a-space>
					<a-button v-if="hasPermission('gift:export')">导出报表</a-button>
					<a-button v-if="hasPermission('gift:export')" class="light-action">
						打印
					</a-button>
				</a-space>
			</div>

			<section class="filter-panel">
				<a-form layout="inline">
					<a-form-item label="统计周期">
						<a-radio-group v-model:value="period">
							<a-radio-button value="month">月度</a-radio-button>
							<a-radio-button value="year">年度</a-radio-button>
						</a-radio-group>
					</a-form-item>
					<a-form-item label="统计类型">
						<a-select v-model:value="analysisType" class="filter-select">
							<a-select-option value="all">全部往来</a-select-option>
							<a-select-option value="receive">收礼分析</a-select-option>
							<a-select-option value="give">随礼分析</a-select-option>
						</a-select>
					</a-form-item>
					<a-form-item>
						<a-button type="primary" @click="loadData">刷新</a-button>
					</a-form-item>
					<a-form-item>
						<div class="report-tip">报表已按当前组织数据实时生成</div>
					</a-form-item>
				</a-form>
			</section>

			<div class="metric-grid">
				<div class="metric-card metric-card-green">
					<div class="metric-top">
						<span>收礼总额</span>
						<i>↗</i>
					</div>
					<strong>{{ money(overview.receiveAmount) }}</strong>
					<p>收入类礼金总额</p>
				</div>
				<div class="metric-card metric-card-red">
					<div class="metric-top">
						<span>随礼总额</span>
						<i>↘</i>
					</div>
					<strong>{{ money(overview.giveAmount) }}</strong>
					<p>支出类礼金总额</p>
				</div>
				<div class="metric-card metric-card-blue">
					<div class="metric-top">
						<span>人情净值</span>
						<i>□</i>
					</div>
					<strong>{{ money(overview.netAmount) }}</strong>
					<p>综合收支净额</p>
				</div>
				<div class="metric-card metric-card-gold">
					<div class="metric-top">
						<span>记录数量</span>
						<i>#</i>
					</div>
					<strong>{{ overview.recordCount || 0 }} 笔</strong>
					<p>全部往来流水</p>
				</div>
			</div>

			<div class="main-grid">
				<section class="panel trend-panel">
					<div class="panel-head">
						<h3>{{ period === 'year' ? '年度趋势' : '月度趋势' }}</h3>
					</div>
					<div
						v-if="chartRows.length === 0"
						class="empty-state"
						data-testid="gift-analysis-trend-empty"
					>
						暂无趋势数据
					</div>
					<div v-else class="bar-chart" data-testid="gift-analysis-trend-chart">
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
						<span><i class="legend-dot legend-income" />收礼</span>
						<span><i class="legend-dot legend-expense" />随礼</span>
					</div>
				</section>

				<section class="panel relation-panel">
					<div class="panel-head">
						<h3>关系分布</h3>
					</div>
					<div v-if="relationRows.length === 0" class="empty-state">
						暂无分布数据
					</div>
					<div v-else class="relation-list">
						<div
							v-for="item in relationRows"
							:key="item.relationType"
							class="relation-item"
						>
							<div class="relation-row">
								<span>{{ relationLabel(item.relationType) }}</span>
								<strong>{{ item.count || 0 }} 人</strong>
							</div>
							<div class="rank-track">
								<div
									class="rank-progress"
									:style="{ width: `${relationPercent(item.count)}%` }"
								/>
							</div>
						</div>
					</div>
				</section>
			</div>

			<div class="ranking-grid">
				<section class="panel">
					<div class="panel-head">
						<h3>事由排行</h3>
					</div>
					<ranking-list :rows="eventRankingRows" />
				</section>
				<section class="panel">
					<div class="panel-head">
						<h3>亲友排行</h3>
					</div>
					<ranking-list :rows="personRankingRows" />
				</section>
			</div>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { usePermission } from '@/composables/usePermission';
import {
	getGiftAnalysisEventRanking,
	getGiftAnalysisOverview,
	getGiftAnalysisPersonRanking,
	getGiftAnalysisRelationDistribution,
	getGiftAnalysisTrend,
} from '@/views/finance/gift/api';
import type {
	GiftAmountTrend,
	GiftRankingItem,
	GiftRecordSummary,
	GiftRelationDistribution,
} from '@/views/finance/gift/config';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { money } from '@/views/finance/gift/config';

const { relationLabel, loadRelationOptions } = useGiftRelationOptions();

interface RankingRow {
	index: number;
	name: string;
	amount: number;
	count: number;
	percent: number;
}

const RankingList = defineComponent({
	props: {
		rows: {
			type: Array as PropType<RankingRow[]>,
			default: () => [],
		},
	},
	setup(props: { rows: RankingRow[] }) {
		return () =>
			props.rows.length === 0 ?
				h('div', { class: 'empty-state' }, '暂无排行数据')
			:	h(
					'div',
					{ class: 'ranking-list' },
					props.rows.map((item) =>
						h('div', { class: 'ranking-item', key: item.name }, [
							h('span', { class: 'rank-index' }, item.index),
							h('div', { class: 'rank-main' }, [
								h('div', { class: 'rank-row' }, [
									h(
										'span',
										{ class: 'rank-name' },
										`${item.name} · ${item.count} 笔`,
									),
									h('span', { class: 'rank-amount' }, money(item.amount)),
								]),
								h('div', { class: 'rank-track' }, [
									h('div', {
										class: 'rank-progress',
										style: { width: `${item.percent}%` },
									}),
								]),
							]),
						]),
					),
				);
	},
});

const loading = ref(false);
const { hasPermission } = usePermission();
const period = ref<'month' | 'year'>('month');
const analysisType = ref<'all' | 'receive' | 'give'>('all');
const overview = ref<GiftRecordSummary>({});
const trendRows = ref<GiftAmountTrend[]>([]);
const relationRows = ref<GiftRelationDistribution[]>([]);
const eventRanking = ref<GiftRankingItem[]>([]);
const personRanking = ref<GiftRankingItem[]>([]);

const chartRows = computed(() => {
	// 无数据时直接返回空数组走空态展示，严禁渲染硬编码假数据误导用户
	const source = trendRows.value;
	if (source.length === 0) {
		return [];
	}
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

const toRankingRows = (rows: GiftRankingItem[]) => {
	const maxAmount = Math.max(
		1,
		...rows.map((item) => Number(item.amount || 0)),
	);
	return rows.slice(0, 5).map((item, index) => ({
		index: index + 1,
		name: item.name || '-',
		amount: Number(item.amount || 0),
		count: Number(item.count || 0),
		percent: Math.max(18, (Number(item.amount || 0) / maxAmount) * 100),
	}));
};

const eventRankingRows = computed(() => toRankingRows(eventRanking.value));
const personRankingRows = computed(() => toRankingRows(personRanking.value));

const relationPercent = (count?: number) => {
	const maxCount = Math.max(
		1,
		...relationRows.value.map((item) => Number(item.count || 0)),
	);
	return Math.max(18, (Number(count || 0) / maxCount) * 100);
};

const assertOk = (code: string, msg?: string) => {
	if (code !== '200') {
		message.error(msg || '统计加载失败');
		return false;
	}
	return true;
};

// 统计类型 → 后端 direction 白名单值（all 不传，由后端聚合全部方向）
const directionParam = computed(() => {
	if (analysisType.value === 'receive') return 'RECEIVE' as const;
	if (analysisType.value === 'give') return 'GIVE' as const;
	return undefined;
});

const loadData = async () => {
	loading.value = true;
	try {
		const analysisParams = {
			period: period.value,
			direction: directionParam.value,
		};
		const [overviewRes, trendRes, relationRes, eventRes, personRes] =
			await Promise.all([
				getGiftAnalysisOverview(analysisParams),
				getGiftAnalysisTrend(analysisParams),
				getGiftAnalysisRelationDistribution(),
				getGiftAnalysisEventRanking(),
				getGiftAnalysisPersonRanking(),
			]);
		if (assertOk(overviewRes.code, overviewRes.message))
			overview.value = overviewRes.data || {};
		if (assertOk(trendRes.code, trendRes.message))
			trendRows.value = trendRes.data || [];
		if (assertOk(relationRes.code, relationRes.message))
			relationRows.value = relationRes.data || [];
		if (assertOk(eventRes.code, eventRes.message))
			eventRanking.value = eventRes.data || [];
		if (assertOk(personRes.code, personRes.message))
			personRanking.value = personRes.data || [];
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	await loadRelationOptions();
	loadData();
});

// 筛选条件变化即刷新（保留"刷新"按钮作显式重查入口）
watch([period, analysisType], () => {
	loadData();
});
</script>

<style scoped lang="less">
.gift-screen {
	min-height: 100%;
	padding: 18px;
	background: #f3f6fa;
	color: #17233d;
}

.screen-header,
.panel-head,
.metric-top,
.rank-row,
.relation-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.screen-header {
	margin-bottom: 16px;

	h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 800;
	}

	p {
		margin: 6px 0 0;
		color: #667085;
		font-size: 13px;
	}
}

.light-action {
	color: #006bb6;
	border-color: #b7d9f6;
}

.filter-panel,
.panel,
.metric-card {
	background: #fff;
	border: 1px solid #e5eaf1;
	border-radius: 7px;
	box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
}

.filter-panel {
	margin-bottom: 16px;
	padding: 16px 18px;
}

.filter-select {
	width: 160px;
}

.report-tip {
	min-height: 32px;
	padding: 5px 12px;
	color: #1478d4;
	background: #e9f2ff;
	border-radius: 4px;
	font-size: 12px;
	line-height: 22px;
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.metric-card {
	min-height: 116px;
	padding: 18px;

	span {
		color: #344054;
		font-size: 13px;
		font-weight: 700;
	}

	i {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 6px;
		font-style: normal;
		font-weight: 800;

		&::after {
			position: absolute;
			inset: 7px;
			border: 2px solid currentcolor;
			border-radius: 3px;
			content: '';
			opacity: 0.24;
		}
	}

	strong {
		display: block;
		margin-top: 20px;
		font-size: 22px;
		line-height: 1;
	}

	p {
		margin: 8px 0 0;
		color: #667085;
		font-size: 12px;
	}
}

.metric-card-green strong,
.metric-card-green i {
	color: #14803c;
}

.metric-card-green i {
	background: #ddf6df;
}

.metric-card-red strong,
.metric-card-red i {
	color: #d92d20;
}

.metric-card-red i {
	background: #ffe7e7;
}

.metric-card-blue strong,
.metric-card-blue i {
	color: #1478d4;
}

.metric-card-blue i {
	background: #dcecff;
}

.metric-card-gold strong,
.metric-card-gold i {
	color: #9a6712;
}

.metric-card-gold i {
	background: #f5ead5;
}

.main-grid {
	display: grid;
	grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
	gap: 16px;
	margin-bottom: 16px;
}

.ranking-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
}

.panel-head {
	padding: 16px 18px 8px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
	}
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
	color: #667085;
	font-size: 12px;
}

.legend-row {
	display: flex;
	justify-content: center;
	gap: 28px;
	padding-bottom: 16px;
	color: #344054;
	font-size: 12px;
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

.relation-list,
.ranking-list {
	padding: 8px 18px 18px;
}

.relation-item,
:deep(.ranking-item) {
	margin-bottom: 16px;
}

.relation-row,
:deep(.rank-row) {
	margin-bottom: 6px;
	color: #101828;
	font-size: 13px;
	font-weight: 700;
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

:deep(.rank-index) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	margin-right: 10px;
	border-radius: 50%;
	background: #e9f2ff;
	color: #177ddc;
	font-size: 12px;
	font-weight: 800;
}

:deep(.ranking-item) {
	display: flex;
	align-items: center;
}

:deep(.rank-main) {
	flex: 1;
	min-width: 0;
}

:deep(.rank-name) {
	color: #101828;
	font-weight: 700;
}

:deep(.rank-amount) {
	color: #2f7d32;
	font-weight: 800;
}

.empty-state {
	padding: 36px 0;
	color: #98a2b3;
	text-align: center;
}
</style>
