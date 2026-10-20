<template>
	<div class="relationship-graph-container" data-testid="gift-relationship-graph">
		<div class="graph-toolbar">
			<div class="toolbar-title">
				<h4>🕸️ 亲友社交人脉力导向图谱</h4>
				<span class="sub-text">以本人为中心辐射各大圈层 · 节点大小映射礼金体量 · 连线粗细映射往来频次</span>
			</div>
			<div class="toolbar-actions">
				<a-button size="small" @click="resetLayout">重置布局</a-button>
			</div>
		</div>

		<div ref="chartRef" class="graph-canvas" />

		<div class="graph-legend-guide">
			<span class="guide-item"><i class="dot dot-center" /> 本人枢纽</span>
			<span class="guide-item"><i class="dot dot-relative" /> 亲属圈</span>
			<span class="guide-item"><i class="dot dot-colleague" /> 同事情</span>
			<span class="guide-item"><i class="dot dot-friend" /> 好友圈</span>
			<span class="guide-item"><i class="dot dot-classmate" /> 同学情</span>
			<span class="guide-item"><i class="dot dot-other" /> 其他往来</span>
			<span class="guide-tip">（支持鼠标滚轮缩放、节点拖拽；点击亲友节点直接滑出往来流水明细）</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { loadEcharts, type EChartsType } from '@/utils/echarts/loadEcharts';
import type { GiftPersonBalance } from '@/views/finance/gift/config';

const props = withDefaults(
	defineProps<{
		balanceList?: GiftPersonBalance[];
	}>(),
	{
		balanceList: () => [],
	},
);

const emit = defineEmits<{
	(e: 'select-person', person: GiftPersonBalance): void;
}>();

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: EChartsType | null = null;

const categories = [
	{ name: '本人', itemStyle: { color: '#2563eb' } },
	{ name: '亲属圈', itemStyle: { color: '#16a34a' } },
	{ name: '同事情', itemStyle: { color: '#ea580c' } },
	{ name: '好友圈', itemStyle: { color: '#7c3aed' } },
	{ name: '同学情', itemStyle: { color: '#0891b2' } },
	{ name: '其他往来', itemStyle: { color: '#64748b' } },
];

const mapRelationToCategory = (relationType?: string): number => {
	switch (relationType) {
		case 'RELATIVE':
			return 1;
		case 'COLLEAGUE':
			return 2;
		case 'FRIEND':
			return 3;
		case 'CLASSMATE':
			return 4;
		default:
			return 5;
	}
};

const buildGraphData = () => {
	const nodes: any[] = [];
	const links: any[] = [];

	// 1. 本人核心节点
	nodes.push({
		id: 'NODE_ME',
		name: '我 (本人)',
		symbolSize: 48,
		category: 0,
		draggable: true,
		value: 0,
		itemStyle: {
			color: '#2563eb',
			shadowBlur: 12,
			shadowColor: 'rgba(37, 99, 235, 0.4)',
		},
		label: {
			show: true,
			fontWeight: 'bold',
			color: '#ffffff',
		},
	});

	// 2. 5大圈层虚拟 Hub 节点
	const hubMap = new Map<number, string>([
		[1, 'HUB_RELATIVE'],
		[2, 'HUB_COLLEAGUE'],
		[3, 'HUB_FRIEND'],
		[4, 'HUB_CLASSMATE'],
		[5, 'HUB_OTHER'],
	]);

	hubMap.forEach((hubId, catIdx) => {
		nodes.push({
			id: hubId,
			name: categories[catIdx].name,
			symbolSize: 32,
			category: catIdx,
			draggable: true,
			value: 0,
			itemStyle: {
				color: categories[catIdx].itemStyle.color,
				opacity: 0.85,
			},
			label: {
				show: true,
				fontSize: 11,
				color: '#ffffff',
			},
		});

		// 链接 本人 -> Hub
		links.push({
			source: 'NODE_ME',
			target: hubId,
			lineStyle: {
				width: 3,
				color: categories[catIdx].itemStyle.color,
				curveness: 0.05,
			},
		});
	});

	// 3. 亲友叶子节点
	const list = props.balanceList || [];
	list.forEach((item) => {
		const catIdx = mapRelationToCategory(item.relationType);
		const hubId = hubMap.get(catIdx) || 'HUB_OTHER';
		const totalVolume = Number(item.totalReceiveAmount || 0) + Number(item.totalGiveAmount || 0);

		// 半径依据往来体量温和缩放 [18, 40]
		const radius = Math.min(40, Math.max(18, 18 + Math.sqrt(totalVolume) / 5));

		const nodeId = `PERSON_${item.personId}`;
		nodes.push({
			id: nodeId,
			name: item.personName,
			symbolSize: radius,
			category: catIdx,
			draggable: true,
			value: totalVolume,
			raw: item,
			label: {
				show: true,
				fontSize: 11,
				position: 'bottom',
				color: '#334155',
			},
			itemStyle: {
				color: categories[catIdx].itemStyle.color,
				borderColor: item.isImbalancedAlert ? '#ef4444' : '#ffffff',
				borderWidth: item.isImbalancedAlert ? 3 : 1.5,
			},
		});

		links.push({
			source: hubId,
			target: nodeId,
			lineStyle: {
				width: item.isImbalancedAlert ? 2.5 : 1.5,
				type: item.isImbalancedAlert ? 'dashed' : 'solid',
				opacity: 0.65,
			},
		});
	});

	return { nodes, links };
};

const renderChart = async () => {
	if (!chartRef.value) return;

	if (!chartInstance) {
		const echarts = await loadEcharts();
		if (!chartRef.value) return;
		chartInstance = echarts.init(chartRef.value);

		chartInstance.on('click', (params: any) => {
			if (params && params.data && params.data.raw) {
				emit('select-person', params.data.raw as GiftPersonBalance);
			}
		});
	}

	const { nodes, links } = buildGraphData();

	const option = {
		tooltip: {
			formatter: (p: any) => {
				if (p.dataType === 'node') {
					if (p.data.id === 'NODE_ME') return '<strong>我 (人际网络中枢)</strong>';
					if (p.data.raw) {
						const raw = p.data.raw as GiftPersonBalance;
						return `
							<div style="font-size:12px;padding:3px">
								<strong>${raw.personName}</strong> (${raw.relationTypeName || '未分类'})<br/>
								累计收礼：<span style="color:#52c41a">¥${(raw.totalReceiveAmount || 0).toFixed(2)}</span><br/>
								累计随礼：<span style="color:#fa8c16">¥${(raw.totalGiveAmount || 0).toFixed(2)}</span><br/>
								净差额：<span style="color:${raw.netBalance >= 0 ? '#52c41a' : '#fa8c16'}">¥${(raw.netBalance || 0).toFixed(2)}</span><br/>
								状态：${raw.balanceStatus === 'SURPLUS' ? '礼金盈余' : raw.balanceStatus === 'DEFICIT' ? '礼金借出' : '持平'}<br/>
								${raw.isImbalancedAlert ? '<span style="color:#ef4444;font-weight:bold">⚠️ 存在长期未还失衡预警</span><br/>' : ''}
								<span style="color:#2563eb;font-size:11px">▶ 点击查看往来明细</span>
							</div>
						`;
					}
					return `<strong>${p.name}</strong> 聚合枢纽`;
				}
				return '';
			},
		},
		legend: [
			{
				data: categories.map((c) => c.name),
				orient: 'horizontal',
				top: 5,
				textStyle: {
					fontSize: 12,
					color: '#64748b',
				},
			},
		],
		series: [
			{
				type: 'graph',
				layout: 'force',
				data: nodes,
				links: links,
				categories: categories,
				roam: true,
				label: {
					show: true,
				},
				force: {
					repulsion: 180,
					gravity: 0.08,
					edgeLength: [35, 110],
					friction: 0.6,
				},
				lineStyle: {
					color: 'source',
					curveness: 0.1,
				},
				emphasis: {
					focus: 'adjacency',
					lineStyle: {
						width: 4,
					},
				},
			},
		],
	};

	chartInstance.setOption(option);
};

const resetLayout = () => {
	chartInstance?.clear();
	renderChart();
};

const handleResize = () => {
	chartInstance?.resize();
};

watch(
	() => props.balanceList,
	() => {
		nextTick(() => {
			renderChart();
		});
	},
	{ deep: true },
);

onMounted(() => {
	renderChart();
	window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
	chartInstance?.dispose();
	chartInstance = null;
});
</script>

<style scoped lang="less">
.relationship-graph-container {
	background: #ffffff;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	padding: 16px 20px;
	margin-bottom: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

	.graph-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;

		.toolbar-title {
			h4 {
				margin: 0;
				font-size: 15px;
				font-weight: 700;
				color: #0f172a;
			}
			.sub-text {
				font-size: 12px;
				color: #94a3b8;
			}
		}
	}

	.graph-canvas {
		width: 100%;
		height: 420px;
	}

	.graph-legend-guide {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		font-size: 12px;
		color: #64748b;
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px dashed #f1f5f9;

		.guide-item {
			display: inline-flex;
			align-items: center;
			gap: 4px;
		}

		.dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			display: inline-block;

			&.dot-center { background: #2563eb; }
			&.dot-relative { background: #16a34a; }
			&.dot-colleague { background: #ea580c; }
			&.dot-friend { background: #7c3aed; }
			&.dot-classmate { background: #0891b2; }
			&.dot-other { background: #64748b; }
		}

		.guide-tip {
			color: #94a3b8;
			font-size: 11px;
			margin-left: auto;
		}
	}
}
</style>
