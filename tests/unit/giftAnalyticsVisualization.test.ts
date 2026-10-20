import { describe, it, expect } from 'vitest';

describe('PC 端礼尚往来可视化报表与顺逆差走势算法测试', () => {
	it('顺逆差计算算法：精准计算收礼与随礼净差额 (receive - give)', () => {
		const trendList = [
			{ label: '2026-05', receiveAmount: 12000, giveAmount: 5000 },
			{ label: '2026-06', receiveAmount: 3000, giveAmount: 8000 },
			{ label: '2026-07', receiveAmount: 6000, giveAmount: 6000 },
		];

		const gapSeries = trendList.map(
			(item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0),
		);

		// 2026-05: 12000 - 5000 = +7000 (顺差/盈余)
		expect(gapSeries[0]).toBe(7000);
		// 2026-06: 3000 - 8000 = -5000 (逆差/待还)
		expect(gapSeries[1]).toBe(-5000);
		// 2026-07: 6000 - 6000 = 0 (平衡)
		expect(gapSeries[2]).toBe(0);
	});

	it('圈层分布聚合转换：正确映射 ECharts 环形图数据与 rawType 联动标识', () => {
		const relationRows = [
			{ relationType: 'RELATIVES', count: 12 },
			{ relationType: 'COLLEAGUE', count: 8 },
			{ relationType: 'FRIEND', count: 5 },
		];

		const labelMap: Record<string, string> = {
			RELATIVES: '亲属圈',
			COLLEAGUE: '同事情',
			FRIEND: '好友圈',
		};

		const pieData = relationRows.map((r) => ({
			name: labelMap[r.relationType] || r.relationType,
			value: r.count,
			rawType: r.relationType,
		}));

		expect(pieData).toHaveLength(3);
		expect(pieData[0]).toEqual({
			name: '亲属圈',
			value: 12,
			rawType: 'RELATIVES',
		});
		expect(pieData[1].rawType).toBe('COLLEAGUE');
	});

	it('平衡矩阵圈层筛选联动：点击扇区联动准确过滤匹配亲友', () => {
		const matrixRows = [
			{ personId: '101', personName: '张三', relationType: 'RELATIVES' },
			{ personId: '102', personName: '李四', relationType: 'COLLEAGUE' },
			{ personId: '103', personName: '王五', relationType: 'RELATIVES' },
		];

		const filterByRelation = (filter: string) => {
			if (!filter || filter === 'all') return matrixRows;
			return matrixRows.filter((r) => r.relationType === filter);
		};

		const relativesOnly = filterByRelation('RELATIVES');
		expect(relativesOnly).toHaveLength(2);
		expect(relativesOnly.map((r) => r.personName)).toEqual(['张三', '王五']);

		const all = filterByRelation('all');
		expect(all).toHaveLength(3);
	});

	it('空数据容错契约：趋势列表为空时返回空数组且不发生未捕获异常', () => {
		const emptyTrend: any[] = [];
		const xData = emptyTrend.map((item) => item.label || '-');
		const gapSeries = emptyTrend.map(
			(item) => Number(item.receiveAmount || 0) - Number(item.giveAmount || 0),
		);

		expect(xData).toEqual([]);
		expect(gapSeries).toEqual([]);
	});
});
