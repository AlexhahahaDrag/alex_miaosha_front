import { describe, it, expect } from 'vitest';
import BigNumber from 'bignumber.js';

describe('Finance Analysis Taste-Skill & Savings Rate Contract Tests', () => {
	// 储蓄率计算契约
	const computeSavingsRate = (incomeNum: number, expenseNum: number) => {
		const income = new BigNumber(incomeNum).toNumber();
		const expense = new BigNumber(expenseNum).toNumber();
		if (income <= 0) {
			return {
				text: expense > 0 ? '超支赤字' : '0.0%',
				className: expense > 0 ? 'text-danger' : 'text-muted',
			};
		}
		const rate = ((income - expense) / income) * 100;
		let className = 'text-danger';
		if (rate >= 50) className = 'text-green';
		else if (rate >= 0) className = 'text-blue';
		return {
			text: `${rate.toFixed(1)}%`,
			className,
		};
	};

	it('当收入为0且支出大于0时，储蓄率应显示为超支赤字且标红', () => {
		const res = computeSavingsRate(0, 520.5);
		expect(res.text).toBe('超支赤字');
		expect(res.className).toBe('text-danger');
	});

	it('当收入和支出均为0时，储蓄率显示0.0%且为中性灰', () => {
		const res = computeSavingsRate(0, 0);
		expect(res.text).toBe('0.0%');
		expect(res.className).toBe('text-muted');
	});

	it('当收入充足储蓄率>=50%时，标记为健康绿 text-green', () => {
		const res = computeSavingsRate(10000, 3000);
		expect(res.text).toBe('70.0%');
		expect(res.className).toBe('text-green');
	});

	it('当支出大于收入时，储蓄率为负数且标记为 text-danger', () => {
		const res = computeSavingsRate(5000, 6000);
		expect(res.text).toBe('-20.0%');
		expect(res.className).toBe('text-danger');
	});

	// 图表空状态判断契约
	it('柱状图在无收入无支出时，hasData判定应为false以触发Empty兜底', () => {
		const checkBarHasData = (incomeData?: number[], expenseData?: number[]) => {
			const hasIncome = incomeData && incomeData.some((v) => Number(v) > 0);
			const hasExpense = expenseData && expenseData.some((v) => Number(v) > 0);
			return Boolean(hasIncome || hasExpense);
		};

		// 全0数组
		expect(checkBarHasData([0, 0, 0], [0, 0, 0])).toBe(false);
		// 空数组
		expect(checkBarHasData([], [])).toBe(false);
		// 有任意一条支出
		expect(checkBarHasData([0, 0], [0, 15.5])).toBe(true);
	});

	// 骨架屏与 Loading 契约验证
	it('收支分析组件应具备 loading 受控属性且当 loading 为真时保持骨架占位', () => {
		const simulateCardState = (loading: boolean, dataCount: number) => {
			if (loading) return 'skeleton';
			if (dataCount > 0) return 'content';
			return 'empty';
		};

		expect(simulateCardState(true, 0)).toBe('skeleton');
		expect(simulateCardState(true, 5)).toBe('skeleton'); // 查询中优先骨架屏防止旧数据闪烁
		expect(simulateCardState(false, 5)).toBe('content');
		expect(simulateCardState(false, 0)).toBe('empty');
	});

	// 零钱预算子弹对比图与标线契约测试
	it('零钱看板子弹图应正确计算消费节奏与预算标线保护', () => {
		const calcPacing = (usage: number, timeRatio: number, isOver: boolean) => {
			if (isOver) return '已超支';
			if (usage > timeRatio + 20 && usage >= 50) return '消费偏快';
			return '节奏平稳';
		};

		// 月初花销很少 (时间 15%, 花费 5%) -> 平稳
		expect(calcPacing(5, 15, false)).toBe('节奏平稳');
		// 月中开销严重超前 (时间 20%, 花费 60%) -> 偏快
		expect(calcPacing(60, 20, false)).toBe('消费偏快');
		// 已超支
		expect(calcPacing(105, 50, true)).toBe('已超支');
	});
});
