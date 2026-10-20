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

			<section
				v-if="showAiInsight"
				class="ai-insight-mount"
				data-testid="gift-analysis-ai-insight"
			>
				<gift-ai-insight-panel
					:overview="aiOverview"
					:trend="trendRows"
					:relation-distribution="relationRows"
					:event-ranking="eventRanking"
					:person-ranking="personRanking"
					:disabled="loading"
				/>
			</section>

			<div class="main-grid">
				<section class="panel trend-panel" data-testid="gift-analysis-trend-panel">
					<div class="panel-head">
						<div class="panel-head-title">
							<h3>{{ period === 'year' ? '年度收支与顺逆差走势' : '月度收支与顺逆差走势' }}</h3>
							<span class="sub-tip">折线呈现人情收支净差额态势 (收礼 - 随礼)</span>
						</div>
					</div>
					<div
						v-if="trendRows.length === 0"
						class="empty-state"
						data-testid="gift-analysis-trend-empty"
					>
						暂无趋势数据
					</div>
					<div
						v-else
						ref="trendChartRef"
						class="echarts-trend-box"
						data-testid="gift-analysis-trend-chart"
					/>
				</section>

				<section class="panel relation-panel" data-testid="gift-analysis-relation-panel">
					<div class="panel-head">
						<div class="panel-head-title">
							<h3>亲友圈层亲密度分布</h3>
							<span class="sub-tip">点击扇区可联动过滤下方平衡矩阵</span>
						</div>
					</div>
					<div v-if="relationRows.length === 0" class="empty-state">
						暂无分布数据
					</div>
					<div
						v-else
						ref="relationChartRef"
						class="echarts-relation-box"
						data-testid="gift-analysis-relation-chart"
					/>
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

			<!-- 亲友互赠收支平衡矩阵 -->
			<section
				class="panel balance-matrix-panel"
				data-testid="gift-balance-matrix-section"
			>
				<div class="panel-head">
					<div class="panel-head-title">
						<h3>亲友人情互赠平衡矩阵 (收送对账)</h3>
						<span class="sub-tip">自动核算双向礼金流向、礼金盈余/借出与失衡预警</span>
					</div>
					<a-space>
						<a-select
							v-model:value="matrixRelationFilter"
							placeholder="关系圈层"
							style="width: 120px"
							@change="loadBalanceMatrix"
						>
							<a-select-option value="all">全部圈子</a-select-option>
							<a-select-option value="relatives">亲属圈</a-select-option>
							<a-select-option value="colleague">同事情</a-select-option>
							<a-select-option value="friend">好友圈</a-select-option>
							<a-select-option value="classmate">同学情</a-select-option>
						</a-select>
						<a-input-search
							v-model:value="matrixSearchKey"
							placeholder="搜索亲友姓名"
							style="width: 150px"
							@search="loadBalanceMatrix"
						/>
						<a-button @click="loadBalanceMatrix">刷新矩阵</a-button>
						<a-button
							v-if="hasPermission('gift:export')"
							:loading="exportingMatrix"
							data-testid="gift-balance-matrix-export"
							@click="exportMatrix"
						>
							导出对账单
						</a-button>
					</a-space>
				</div>

				<a-table
					:data-source="balanceMatrixRows"
					:columns="balanceColumns"
					:pagination="{ pageSize: 6 }"
					row-key="personId"
					size="middle"
					class="matrix-table"
					data-testid="gift-balance-matrix-table"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'personName'">
							<span class="font-medium">{{ record.personName }}</span>
							<a-tag
								v-if="record.relationTypeName"
								class="ml-1"
								size="small"
							>
								{{ record.relationTypeName }}
							</a-tag>
						</template>
						<template v-else-if="column.key === 'totalReceiveAmount'">
							<span class="text-green font-mono">¥{{ (record.totalReceiveAmount || 0).toFixed(2) }}</span>
						</template>
						<template v-else-if="column.key === 'totalGiveAmount'">
							<span class="text-orange font-mono">¥{{ (record.totalGiveAmount || 0).toFixed(2) }}</span>
						</template>
						<template v-else-if="column.key === 'netBalance'">
							<span :class="record.netBalance >= 0 ? 'text-green font-bold' : 'text-orange font-bold'">
								{{ record.netBalance >= 0 ? '+' : '' }}¥{{ (record.netBalance || 0).toFixed(2) }}
							</span>
						</template>
						<template v-else-if="column.key === 'balanceStatus'">
							<a-tag :color="record.balanceStatus === 'SURPLUS' ? 'green' : record.balanceStatus === 'DEFICIT' ? 'orange' : 'default'">
								{{ record.balanceStatus === 'SURPLUS' ? '礼金盈余 (多收)' : record.balanceStatus === 'DEFICIT' ? '礼金借出 (多送)' : '基本持平' }}
							</a-tag>
							<a-tooltip
								v-if="record.isImbalancedAlert"
								:title="record.alertReason || '该亲友长期大额礼金未回礼，建议关注维护关系'"
							>
								<a-tag
									color="error"
									class="cursor-pointer"
								>
									⚠️ 失衡预警
								</a-tag>
							</a-tooltip>
						</template>
						<template v-else-if="column.key === 'action'">
							<a-space size="small">
								<a-button
									type="link"
									size="small"
									data-testid="btn-view-person-detail"
									@click="openPersonDetail(record)"
								>
									往来明细
								</a-button>
								<a-button
									type="link"
									size="small"
									data-testid="btn-calc-return-gift"
									@click="openCalculator(record)"
								>
									AI 测算回礼
								</a-button>
							</a-space>
						</template>
					</template>
				</a-table>
			</section>

			<!-- 亲友往来流水明细时间轴抽屉 -->
			<gift-person-detail-drawer
				v-model:open="personDetailOpen"
				:person="selectedPersonForDetail"
				@open-calculator="openCalculatorFromDrawer"
			/>

			<!-- AI 智能回礼测算抽屉 -->
			<gift-return-calculator-drawer
				v-model:open="calculatorOpen"
				:person="selectedPerson"
			/>
		</div>
	</a-spin>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import GiftAiInsightPanel from '@/views/finance/gift/ai/GiftAiInsightPanel.vue';
import { hasMeaningfulOverview } from '@/views/finance/gift/ai/hasMeaningfulOverview';
import { usePermission } from '@/composables/usePermission';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import GiftPersonDetailDrawer from './components/GiftPersonDetailDrawer.vue';
import {
	getGiftAnalysisEventRanking,
	getGiftAnalysisOverview,
	getGiftAnalysisPersonRanking,
	getGiftAnalysisRelationDistribution,
	getGiftAnalysisTrend,
	getGiftBalanceMatrix,
	exportGiftBalanceMatrix,
} from '@/views/finance/gift/api';
import type {
	GiftAmountTrend,
	GiftRankingItem,
	GiftRecordSummary,
	GiftRelationDistribution,
	GiftPersonBalance,
} from '@/views/finance/gift/config';
import GiftReturnCalculatorDrawer from './components/GiftReturnCalculatorDrawer.vue';
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

const loading = ref<boolean>(false);
const { hasPermission } = usePermission();
const period = ref<'month' | 'year'>('month');
const analysisType = ref<'all' | 'receive' | 'give'>('all');
const overview = ref<GiftRecordSummary>({});
const trendRows = ref<GiftAmountTrend[]>([]);
const relationRows = ref<GiftRelationDistribution[]>([]);
const eventRanking = ref<GiftRankingItem[]>([]);
const personRanking = ref<GiftRankingItem[]>([]);
const balanceMatrixRows = ref<GiftPersonBalance[]>([]);
const matrixRelationFilter = ref<string>('all');
const matrixSearchKey = ref<string>('');
const exportingMatrix = ref<boolean>(false);
const calculatorOpen = ref<boolean>(false);
const selectedPerson = ref<GiftPersonBalance | null>(null);

const balanceColumns = [
	{ title: '亲友姓名', dataIndex: 'personName', key: 'personName' },
	{ title: 'TA 送我总额', dataIndex: 'totalReceiveAmount', key: 'totalReceiveAmount', align: 'right' as const },
	{ title: '我送 TA 总额', dataIndex: 'totalGiveAmount', key: 'totalGiveAmount', align: 'right' as const },
	{ title: '人情净差', dataIndex: 'netBalance', key: 'netBalance', align: 'right' as const },
	{ title: '平衡状态', dataIndex: 'balanceStatus', key: 'balanceStatus' },
	{ title: '最近互动', dataIndex: 'latestRecordTime', key: 'latestRecordTime' },
	{ title: '操作', key: 'action', align: 'center' as const, width: 120 },
];

const loadBalanceMatrix = async () => {
	try {
		const { code, data } = await getGiftBalanceMatrix({
			relationType: matrixRelationFilter.value !== 'all' ? matrixRelationFilter.value : undefined,
			searchKey: matrixSearchKey.value ? matrixSearchKey.value.trim() : undefined,
		});
		if (code === '200' || code === '00000') {
			balanceMatrixRows.value = data || [];
		}
	} catch (e) {
		console.warn('Failed to load balance matrix:', e);
	}
};

const exportMatrix = async () => {
	if (exportingMatrix.value) return;
	exportingMatrix.value = true;
	try {
		const response = await exportGiftBalanceMatrix({
			relationType: matrixRelationFilter.value !== 'all' ? matrixRelationFilter.value : undefined,
			searchKey: matrixSearchKey.value ? matrixSearchKey.value.trim() : undefined,
		});
		const blob = new Blob([response.data], {
			type: String(
				response.headers?.['content-type'] ||
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			),
		});
		const disposition = String(response.headers?.['content-disposition'] || '');
		const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
		const fallbackMatch = disposition.match(/filename="?([^";]+)"?/i);
		const rawName = utf8Match ? utf8Match[1] : fallbackMatch ? fallbackMatch[1] : '';
		const fileName =
			rawName ? decodeURIComponent(rawName) : `人情往来互赠平衡对账单_${Date.now()}.xlsx`;
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		link.click();
		URL.revokeObjectURL(url);
		message.success('导出对账单成功');
	} catch {
		message.error('导出失败，请稍后重试');
	} finally {
		exportingMatrix.value = false;
	}
};

const personDetailOpen = ref(false);
const selectedPersonForDetail = ref<GiftPersonBalance | null>(null);

const openPersonDetail = (person: any) => {
	selectedPersonForDetail.value = person as GiftPersonBalance;
	personDetailOpen.value = true;
};

const openCalculatorFromDrawer = (person: GiftPersonBalance) => {
	personDetailOpen.value = false;
	openCalculator(person);
};

const openCalculator = (person: any) => {
	selectedPerson.value = person as GiftPersonBalance;
	calculatorOpen.value = true;
};

const trendChartRef = ref<HTMLElement>();
const relationChartRef = ref<HTMLElement>();
let trendChartInstance: EChartsType | null = null;
let relationChartInstance: EChartsType | null = null;

const renderTrendChart = async () => {
	if (!trendChartRef.value) return;
	const echarts = await loadEcharts();
	if (!trendChartRef.value) return;

	if (!trendChartInstance) {
		trendChartInstance = echarts.init(trendChartRef.value);
	}

	const source = trendRows.value;
	if (source.length === 0) {
		trendChartInstance.clear();
		return;
	}

	const xData = source.map((item) => item.label || '-');
	const receiveSeries = source.map((item) => Number(item.receiveAmount || 0));
	const giveSeries = source.map((item) => Number(item.giveAmount || 0));
	const gapSeries = source.map(
		(item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0),
	);

	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
			formatter: (params: any) => {
				if (!Array.isArray(params) || params.length === 0) return '';
				const date = params[0].axisValue;
				let str = `<div style="font-weight:600;margin-bottom:4px;">${date}</div>`;
				params.forEach((p: any) => {
					const val =
						typeof p.value === 'number' ? p.value.toLocaleString() : p.value;
					str += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;">
						<span>${p.marker} ${p.seriesName}</span>
						<strong>¥${val}</strong>
					</div>`;
				});
				return str;
			},
		},
		legend: {
			data: ['收礼金额 (元)', '随礼支出 (元)', '人情顺逆差 (元)'],
			top: 0,
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			top: '42px',
			outerBoundsMode: 'same',
		},
		xAxis: {
			type: 'category',
			data: xData,
			axisLabel: { interval: 0, rotate: xData.length > 8 ? 25 : 0 },
		},
		yAxis: [
			{
				type: 'value',
				name: '金额 (元)',
				splitLine: { lineStyle: { type: 'dashed' } },
			},
			{
				type: 'value',
				name: '顺逆差',
				splitLine: { show: false },
			},
		],
		series: [
			{
				name: '收礼金额 (元)',
				type: 'bar',
				barWidth: 16,
				data: receiveSeries,
				itemStyle: {
					color: '#52c41a',
					borderRadius: [4, 4, 0, 0],
				},
			},
			{
				name: '随礼支出 (元)',
				type: 'bar',
				barWidth: 16,
				data: giveSeries,
				itemStyle: {
					color: '#fa8c16',
					borderRadius: [4, 4, 0, 0],
				},
			},
			{
				name: '人情顺逆差 (元)',
				type: 'line',
				yAxisIndex: 1,
				smooth: true,
				data: gapSeries,
				itemStyle: { color: '#1890ff' },
				lineStyle: { width: 3 },
				symbolSize: 6,
			},
		],
	};

	trendChartInstance.setOption(option, true);
};

const renderRelationChart = async () => {
	if (!relationChartRef.value) return;
	const echarts = await loadEcharts();
	if (!relationChartRef.value) return;

	if (!relationChartInstance) {
		relationChartInstance = echarts.init(relationChartRef.value);
		relationChartInstance.on('click', (params: any) => {
			if (params?.data?.rawType) {
				matrixRelationFilter.value = params.data.rawType;
				void loadBalanceMatrix();
				message.info(`已联动筛选「${params.name}」圈层亲友对账`);
			}
		});
	}

	const source = relationRows.value;
	if (source.length === 0) {
		relationChartInstance.clear();
		return;
	}

	const pieData = source.map((item) => ({
		name: relationLabel(item.relationType),
		value: Number(item.count || 0),
		rawType: item.relationType,
	}));

	const option = {
		tooltip: {
			trigger: 'item',
			formatter: '{b}: <strong>{c} 人</strong> ({d}%)',
		},
		legend: {
			orient: 'vertical',
			right: '5%',
			top: 'middle',
		},
		series: [
			{
				name: '圈层分布',
				type: 'pie',
				radius: ['45%', '72%'],
				center: ['40%', '50%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 6,
					borderColor: '#fff',
					borderWidth: 2,
				},
				label: {
					show: false,
					position: 'center',
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 14,
						fontWeight: 'bold',
					},
				},
				labelLine: {
					show: false,
				},
				data: pieData,
			},
		],
	};

	relationChartInstance.setOption(option, true);
};

const handleWindowResize = () => {
	trendChartInstance?.resize();
	relationChartInstance?.resize();
};

const disposeCharts = () => {
	window.removeEventListener('resize', handleWindowResize);
	trendChartInstance?.dispose();
	relationChartInstance?.dispose();
	trendChartInstance = null;
	relationChartInstance = null;
};

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

const hasOverviewData = computed(() => hasMeaningfulOverview(overview.value));

const showAiInsight = computed(
	() => hasPermission('gift:view') && hasOverviewData.value,
);

const aiOverview = computed(
	() => ({ ...overview.value }) as Record<string, unknown>,
);

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
		await loadBalanceMatrix();
		await nextTick();
		void renderTrendChart();
		void renderRelationChart();
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	window.addEventListener('resize', handleWindowResize);
	await loadRelationOptions();
	loadData();
});

onUnmounted(() => {
	disposeCharts();
});

// 筛选条件变化即刷新（保留"刷新"按钮作显式重查入口）
watch([period, analysisType], () => {
	loadData();
});
</script>

<style scoped lang="less">
.echarts-trend-box,
.echarts-relation-box {
	height: 280px;
	width: 100%;
}

.gift-screen {
	min-height: 100%;
	padding: 18px;
	background: #f8fafc;
	color: #0f172a;
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
		color: #0f172a;
		letter-spacing: -0.02em;
	}

	p {
		margin: 6px 0 0;
		color: #64748b;
		font-size: 13px;
	}
}

.light-action {
	color: #2563eb;
	border-color: #bfdbfe;

	&:hover {
		color: #1d4ed8;
		border-color: #93c5fd;
	}
}

.filter-panel,
.panel,
.metric-card {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow:
		0 1px 3px 0 rgba(0, 0, 0, 0.05),
		0 1px 2px -1px rgba(0, 0, 0, 0.05);
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
	color: #2563eb;
	background: #eff6ff;
	border: 1px solid #dbeafe;
	border-radius: 8px;
	font-size: 12px;
	line-height: 20px;
	font-weight: 500;
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.ai-insight-mount {
	margin-bottom: 16px;
}

.metric-card {
	min-height: 116px;
	padding: 18px;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.08);
	}

	span {
		color: #475569;
		font-size: 13px;
		font-weight: 600;
	}

	i {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		font-style: normal;
		font-weight: 800;
		font-size: 16px;
		transition: all 0.2s ease;
	}

	strong {
		display: block;
		margin-top: 18px;
		font-size: 24px;
		line-height: 1;
		font-weight: 800;
		color: #0f172a;
	}

	p {
		margin: 8px 0 0;
		color: #64748b;
		font-size: 12px;
	}
}

.metric-card-green strong {
	color: #0f172a;
}

.metric-card-green i {
	color: #059669;
	background: #ecfdf5;
	border: 1px solid #a7f3d0;
}

.metric-card-red strong {
	color: #0f172a;
}

.metric-card-red i {
	color: #e11d48;
	background: #fff1f2;
	border: 1px solid #fecdd3;
}

.metric-card-blue strong {
	color: #0f172a;
}

.metric-card-blue i {
	color: #2563eb;
	background: #eff6ff;
	border: 1px solid #dbeafe;
}

.metric-card-gold strong {
	color: #0f172a;
}

.metric-card-gold i {
	color: #d97706;
	background: #fffbeb;
	border: 1px solid #fde68a;
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
	padding: 16px 20px 10px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
		color: #0f172a;
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
	border-radius: 6px 6px 0 0;
	transition: height 0.3s ease;
}

.bar-income {
	background: #2563eb;
}

.bar-expense {
	background: #f43f5e;
}

.bar-label {
	margin-top: 10px;
	color: #64748b;
	font-size: 12px;
	font-weight: 500;
}

.legend-row {
	display: flex;
	justify-content: center;
	gap: 28px;
	padding-bottom: 16px;
	color: #475569;
	font-size: 12px;
	font-weight: 500;
}

.legend-dot {
	display: inline-block;
	width: 8px;
	height: 8px;
	margin-right: 6px;
	border-radius: 50%;
}

.legend-income {
	background: #2563eb;
}

.legend-expense {
	background: #f43f5e;
}

.relation-list,
.ranking-list {
	padding: 8px 20px 20px;
}

.relation-item,
:deep(.ranking-item) {
	margin-bottom: 16px;
}

.relation-row,
:deep(.rank-row) {
	margin-bottom: 6px;
	color: #0f172a;
	font-size: 13px;
	font-weight: 700;
}

.rank-track {
	height: 8px;
	overflow: hidden;
	background: #f1f5f9;
	border-radius: 9999px;
}

.rank-progress {
	height: 100%;
	background: linear-gradient(90deg, #10b981, #059669);
	border-radius: 9999px;
	transition: width 0.3s ease;
}

:deep(.rank-index) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 26px;
	height: 26px;
	margin-right: 10px;
	border-radius: 50%;
	background: #eff6ff;
	color: #2563eb;
	border: 1px solid #dbeafe;
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
	color: #0f172a;
	font-weight: 700;
}

:deep(.rank-amount) {
	color: #059669;
	font-weight: 800;
}

.empty-state {
	padding: 36px 0;
	color: #94a3b8;
	text-align: center;
}

.balance-matrix-panel {
	margin-top: 18px;

	.panel-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;

		.panel-head-title {
			display: flex;
			align-items: baseline;
			gap: 10px;

			h3 {
				margin: 0;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
			}

			.sub-tip {
				font-size: 12px;
				color: #64748b;
			}
		}
	}

	.matrix-table {
		background: #ffffff;
		border-radius: 8px;
	}
}

.font-medium {
	font-weight: 600;
}

.font-bold {
	font-weight: 700;
}

.font-mono {
	font-family: monospace;
}

.text-green {
	color: #16a34a;
}

.text-orange {
	color: #ea580c;
}

.cursor-pointer {
	cursor: pointer;
}
</style>
