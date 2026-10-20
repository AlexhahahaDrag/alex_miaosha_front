import { describe, it, expect } from 'vitest';
import { normalizeGiftIds } from '@/views/finance/gift/api/normalize';
import type {
	GiftPersonBalance,
	GiftReturnRecommendationReq,
	GiftReturnRecommendationVo,
} from '@/views/finance/gift/config';

/**
 * 客户端人情互赠平衡与失衡预警推算函数
 */
export function evaluateGiftBalanceStatus(
	receiveAmount: number,
	giveAmount: number,
	lastRecordDaysAgo: number = 0,
): {
	netBalance: number;
	balanceStatus: 'SURPLUS' | 'DEFICIT' | 'BALANCED';
	isImbalancedAlert: boolean;
	alertReason?: string;
} {
	const netBalance = Math.round((receiveAmount - giveAmount) * 100) / 100;
	let balanceStatus: 'SURPLUS' | 'DEFICIT' | 'BALANCED' = 'BALANCED';

	if (netBalance > 200) {
		balanceStatus = 'SURPLUS';
	} else if (netBalance < -200) {
		balanceStatus = 'DEFICIT';
	}

	let isImbalancedAlert = false;
	let alertReason: string | undefined;

	if (netBalance >= 800 && lastRecordDaysAgo > 180) {
		isImbalancedAlert = true;
		alertReason = `该亲友累计礼金盈余达 ¥${netBalance}，且已超半年无后续往来，建议适时体面回礼`;
	}

	return { netBalance, balanceStatus, isImbalancedAlert, alertReason };
}

describe('人情往来智能洞察报告与互赠收支平衡矩阵契约测试', () => {
	describe('1. 亲友互赠收支平衡状态机与失衡预警', () => {
		it('收礼大于随礼超过 200 元应判定为 SURPLUS (礼金盈余)', () => {
			const res = evaluateGiftBalanceStatus(1200, 500, 30);
			expect(res.netBalance).toBe(700);
			expect(res.balanceStatus).toBe('SURPLUS');
			expect(res.isImbalancedAlert).toBe(false);
		});

		it('随礼大于收礼超过 200 元应判定为 DEFICIT (礼金借出)', () => {
			const res = evaluateGiftBalanceStatus(200, 800, 20);
			expect(res.netBalance).toBe(-600);
			expect(res.balanceStatus).toBe('DEFICIT');
			expect(res.isImbalancedAlert).toBe(false);
		});

		it('收送差额在 ±200 元以内应判定为 BALANCED (基本持平)', () => {
			const res = evaluateGiftBalanceStatus(600, 500, 10);
			expect(res.netBalance).toBe(100);
			expect(res.balanceStatus).toBe('BALANCED');
			expect(res.isImbalancedAlert).toBe(false);

			const res2 = evaluateGiftBalanceStatus(450, 600, 10);
			expect(res2.netBalance).toBe(-150);
			expect(res2.balanceStatus).toBe('BALANCED');
		});

		it('净差额 >= 800 且距最近往来超过 180 天应触发失衡预警', () => {
			const res = evaluateGiftBalanceStatus(1500, 500, 200);
			expect(res.netBalance).toBe(1000);
			expect(res.balanceStatus).toBe('SURPLUS');
			expect(res.isImbalancedAlert).toBe(true);
			expect(res.alertReason).toContain('1000');
		});
	});

	describe('2. 大数雪花 ID 深度规范化与防精度丢失 (normalizeGiftIds)', () => {
		it('请求参数中的 personId 应稳定转为 string 类型', () => {
			const req: GiftReturnRecommendationReq = {
				personId: 1847192837192837192n as any,
				eventType: 'WEDDING',
			};

			const normalized = normalizeGiftIds(req);
			expect(typeof normalized.personId).toBe('string');
			expect(normalized.personId).toBe('1847192837192837192');
			expect(normalized.eventType).toBe('WEDDING');
		});

		it('矩阵实体中的 personId 应转换为 string 类型', () => {
			const balanceVo: GiftPersonBalance = {
				personId: 100862001002003004n as any,
				personName: '表叔',
				totalReceiveAmount: 2000,
				totalGiveAmount: 800,
				netBalance: 1200,
				balanceStatus: 'SURPLUS',
			};

			const normalized = normalizeGiftIds(balanceVo);
			expect(typeof normalized.personId).toBe('string');
			expect(normalized.personId).toBe('100862001002003004');
		});
	});

	describe('3. AI 推荐回礼档位阶梯约束', () => {
		it('推荐响应中的三档金额应严格呈非递减阶梯', () => {
			const mockVo: GiftReturnRecommendationVo = {
				personName: '张伟',
				historicalBaseAmount: 800,
				minDecentAmount: 600,
				recommendedAmount: 888,
				generousAmount: 1200,
				auspiciousTierList: [200, 500, 600, 800, 888, 1000, 1200, 1688, 2000],
				ruleSummary: 'AI 规则推导演算',
				blessingWords: '百年好合，永结同心！',
			};

			expect(mockVo.minDecentAmount).toBeLessThanOrEqual(mockVo.recommendedAmount);
			expect(mockVo.recommendedAmount).toBeLessThanOrEqual(mockVo.generousAmount);
			expect(mockVo.auspiciousTierList).toContain(mockVo.recommendedAmount);
			expect(mockVo.blessingWords).toBeTruthy();
		});
	});

	describe('4. 导出亲友互赠平衡对账单文件名与参数安全性', () => {
		it('导出参数中的 personId 应保证被 string 化', () => {
			const query = {
				relationType: 'friend',
				searchKey: '王五',
				personId: 987654321012345678n as any,
			};
			const normalized = normalizeGiftIds(query);
			expect(typeof normalized.personId).toBe('string');
			expect(normalized.personId).toBe('987654321012345678');
		});

		it('从 Content-Disposition 响应头能正确解析出 utf-8 中文文件名', () => {
			const header = "attachment; filename=gift_balance_matrix.xlsx; filename*=UTF-8''%E4%BA%BA%E6%83%85%E5%BE%80%E6%9D%A5%E4%BA%92%E8%B5%A0%E5%B9%B3%E8%A1%A1%E5%AF%B9%E8%B4%A6%E5%8D%95_1710000000.xlsx";
			const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
			const fallbackMatch = header.match(/filename="?([^";]+)"?/i);
			const rawFileName = utf8Match ? utf8Match[1] : fallbackMatch ? fallbackMatch[1] : '';
			const fileName = decodeURIComponent(rawFileName);
			expect(fileName).toContain('人情往来');
			expect(fileName.endsWith('.xlsx')).toBe(true);
		});
	});
});
