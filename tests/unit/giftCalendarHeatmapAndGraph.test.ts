import { describe, it, expect } from 'vitest';
import type { GiftPersonBalance, GiftAmountTrend } from '@/views/finance/gift/config';

describe('Gift Calendar Heatmap & Relationship Graph Tests', () => {
	describe('日历热力图数据派生算法 (Calendar Heatmap Algorithm)', () => {
		const generateDailyHeatmapData = (trends: GiftAmountTrend[]) => {
			const result: { date: string; receive: number; give: number; net: number; count: number }[] = [];
			if (!trends || trends.length === 0) return result;

			trends.forEach((t) => {
				const label = t.label || '';
				if (!label.includes('-')) return;
				const receive = Number(t.receiveAmount || 0);
				const give = Number(t.giveAmount || 0);

				const days = ['06', '08', '16', '18', '28'];
				const recShares = [0.3, 0.25, 0.2, 0.15, 0.1];
				const giveShares = [0.15, 0.35, 0.2, 0.2, 0.1];

				days.forEach((day, idx) => {
					const dayReceive = Number((receive * recShares[idx]).toFixed(2));
					const dayGive = Number((give * giveShares[idx]).toFixed(2));
					if (dayReceive > 0 || dayGive > 0) {
						result.push({
							date: `${label}-${day}`,
							receive: dayReceive,
							give: dayGive,
							net: Number((dayReceive - dayGive).toFixed(2)),
							count: (dayReceive > 0 ? 1 : 0) + (dayGive > 0 ? 1 : 0),
						});
					}
				});
			});

			return result;
		};

		it('空趋势列表应返回空数组', () => {
			const res = generateDailyHeatmapData([]);
			expect(res).toEqual([]);
		});

		it('月度数据应平滑映射为吉日分布且收送总额与差额计算准确', () => {
			const mockTrends: GiftAmountTrend[] = [
				{ label: '2026-05', receiveAmount: 1000, giveAmount: 500 },
			];
			const res = generateDailyHeatmapData(mockTrends);
			expect(res.length).toBe(5);

			// 第 1 笔：05-06
			expect(res[0].date).toBe('2026-05-06');
			expect(res[0].receive).toBe(300); // 1000 * 0.3
			expect(res[0].give).toBe(75); // 500 * 0.15
			expect(res[0].net).toBe(225); // 300 - 75

			// 第 2 笔：05-08
			expect(res[1].date).toBe('2026-05-08');
			expect(res[1].receive).toBe(250); // 1000 * 0.25
			expect(res[1].give).toBe(175); // 500 * 0.35
			expect(res[1].net).toBe(75);
		});
	});

	describe('亲友社交人脉力导向图构建算法 (Relationship Force Graph Builder)', () => {
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

		const buildGraphData = (list: GiftPersonBalance[]) => {
			const nodes: any[] = [];
			const links: any[] = [];

			// 本人核心中枢
			nodes.push({
				id: 'NODE_ME',
				name: '我 (本人)',
				category: 0,
				symbolSize: 48,
			});

			const hubMap = new Map<number, string>([
				[1, 'HUB_RELATIVE'],
				[2, 'HUB_COLLEAGUE'],
				[3, 'HUB_FRIEND'],
				[4, 'HUB_CLASSMATE'],
				[5, 'HUB_OTHER'],
			]);

			hubMap.forEach((hubId, catIdx) => {
				nodes.push({ id: hubId, category: catIdx, symbolSize: 32 });
				links.push({ source: 'NODE_ME', target: hubId });
			});

			list.forEach((item) => {
				const catIdx = mapRelationToCategory(item.relationType);
				const hubId = hubMap.get(catIdx) || 'HUB_OTHER';
				const totalVolume = Number(item.totalReceiveAmount || 0) + Number(item.totalGiveAmount || 0);
				const radius = Math.min(40, Math.max(18, 18 + Math.sqrt(totalVolume) / 5));
				const nodeId = `PERSON_${item.personId}`;

				nodes.push({
					id: nodeId,
					name: item.personName,
					category: catIdx,
					symbolSize: radius,
					raw: item,
					isAlert: item.isImbalancedAlert,
				});

				links.push({
					source: hubId,
					target: nodeId,
				});
			});

			return { nodes, links };
		};

		it('应正确生成中枢我、5个圈层Hub以及亲友节点', () => {
			const mockPersons: GiftPersonBalance[] = [
				{
					personId: '1001',
					personName: '二舅',
					relationType: 'RELATIVE',
					totalReceiveAmount: 2000,
					totalGiveAmount: 1000,
					netBalance: 1000,
					balanceStatus: 'SURPLUS',
				},
				{
					personId: '1002',
					personName: '张总',
					relationType: 'COLLEAGUE',
					totalReceiveAmount: 200,
					totalGiveAmount: 800,
					netBalance: -600,
					balanceStatus: 'DEFICIT',
					isImbalancedAlert: true,
				},
			];

			const { nodes, links } = buildGraphData(mockPersons);

			// 节点数 = 1(我) + 5(Hub) + 2(人) = 8
			expect(nodes.length).toBe(8);
			// 连线数 = 5(我到Hub) + 2(Hub到人) = 7
			expect(links.length).toBe(7);

			const uncleNode = nodes.find((n) => n.id === 'PERSON_1001');
			expect(uncleNode).toBeDefined();
			expect(uncleNode.name).toBe('二舅');
			expect(uncleNode.category).toBe(1); // 亲属圈

			const bossNode = nodes.find((n) => n.id === 'PERSON_1002');
			expect(bossNode).toBeDefined();
			expect(bossNode.category).toBe(2); // 同事情
			expect(bossNode.isAlert).toBe(true);
		});

		it('节点半径随往来金额平滑缩放并受区间约束 [18, 40]', () => {
			const largeVolumePerson: GiftPersonBalance = {
				personId: '9999',
				personName: '百亿大亨',
				relationType: 'FRIEND',
				totalReceiveAmount: 5000000,
				totalGiveAmount: 5000000,
				netBalance: 0,
				balanceStatus: 'BALANCED',
			};
			const zeroVolumePerson: GiftPersonBalance = {
				personId: '0000',
				personName: '点赞之交',
				relationType: 'CLASSMATE',
				totalReceiveAmount: 0,
				totalGiveAmount: 0,
				netBalance: 0,
				balanceStatus: 'BALANCED',
			};

			const { nodes } = buildGraphData([largeVolumePerson, zeroVolumePerson]);
			const maxNode = nodes.find((n) => n.id === 'PERSON_9999');
			const minNode = nodes.find((n) => n.id === 'PERSON_0000');

			expect(maxNode.symbolSize).toBe(40); // 截断上限 40
			expect(minNode.symbolSize).toBe(18); // 截断下限 18
		});
	});
});
