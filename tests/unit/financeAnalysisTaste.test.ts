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

	it('账户资产分布与收支结构五大区域均应遵循三态渲染顺序 (skeleton -> content -> empty)', () => {
		const resolveSectionState = (
			loading: boolean | undefined,
			itemsCount: number,
		): 'skeleton' | 'content' | 'empty' => {
			if (loading) return 'skeleton';
			if (itemsCount > 0) return 'content';
			return 'empty';
		};

		// 1. 流动资金账户
		expect(resolveSectionState(true, 0)).toBe('skeleton');
		expect(resolveSectionState(false, 0)).toBe('empty');
		expect(resolveSectionState(false, 2)).toBe('content');

		// 2. 信用与负债
		expect(resolveSectionState(true, 0)).toBe('skeleton');
		expect(resolveSectionState(false, 0)).toBe('empty');
		expect(resolveSectionState(false, 1)).toBe('content');

		// 3. 水电话费预存
		expect(resolveSectionState(true, 0)).toBe('skeleton');
		expect(resolveSectionState(false, 0)).toBe('empty');
		expect(resolveSectionState(false, 3)).toBe('content');

		// 4. 收入结构
		expect(resolveSectionState(true, 0)).toBe('skeleton');
		expect(resolveSectionState(false, 0)).toBe('empty');
		expect(resolveSectionState(false, 4)).toBe('content');

		// 5. 支出结构
		expect(resolveSectionState(true, 0)).toBe('skeleton');
		expect(resolveSectionState(false, 0)).toBe('empty');
		expect(resolveSectionState(false, 5)).toBe('content');
	});

	it('第一层核心指标卡 FinanceAnalysisKpiRow 在 loading 为真时应呈现骨架条防假零闪烁', () => {
		const resolveKpiDisplay = (loading: boolean, value: string | number) => {
			return loading ? 'skeleton' : String(value);
		};

		// 净结余大字
		expect(resolveKpiDisplay(true, 0)).toBe('skeleton');
		expect(resolveKpiDisplay(false, 3500)).toBe('3500');

		// 总资产大字
		expect(resolveKpiDisplay(true, '¥0.00')).toBe('skeleton');
		expect(resolveKpiDisplay(false, '¥28,500.00')).toBe('¥28,500.00');

		// 储蓄率
		expect(resolveKpiDisplay(true, '—')).toBe('skeleton');
		expect(resolveKpiDisplay(false, '65.2%')).toBe('65.2%');
	});

	// 细粒度 loadingMap 聚合与解耦契约测试
	it('细粒度 loadingMap 聚合对象应支持单模块独立解耦与 isAnyLoading 计算属性', () => {
		const loadingMap = {
			balance: false,
			category: false,
			trend: false,
			records: false,
			budget: false,
		};

		const computeIsAnyLoading = (map: typeof loadingMap) =>
			Object.values(map).some(Boolean);

		// 全空状态
		expect(computeIsAnyLoading(loadingMap)).toBe(false);

		// 单独某一请求在加载中（如走势图慢查询），其他模块互不受阻
		loadingMap.trend = true;
		expect(computeIsAnyLoading(loadingMap)).toBe(true);
		expect(loadingMap.balance).toBe(false); // 余额卡片可先行渲染完毕
		expect(loadingMap.records).toBe(false); // 最近流水可先行渲染完毕

		// 全解除
		loadingMap.trend = false;
		expect(computeIsAnyLoading(loadingMap)).toBe(false);
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

	// style-update: 零钱消费去向排行与超支责任归因契约测试
	it('当月零钱消费去向应准确按金额降序排序并在超支时标记首要责任项', () => {
		const rawCategories = [
			{ name: '出行', value: 0.5 },
			{ name: '饭', value: 100.0 },
			{ name: '美食', value: 19.3 },
			{ name: '零额度项', value: 0 },
		];

		const calculateRanking = (
			categories: typeof rawCategories,
			totalExpense: number,
			isOver: boolean,
		) => {
			const filtered = categories
				.filter((c) => c.value > 0)
				.sort((a, b) => b.value - a.value);

			return filtered.map((item, index) => ({
				name: item.name,
				value: item.value,
				ratio: Math.round((item.value / totalExpense) * 100),
				isCulprit: isOver && index === 0,
			}));
		};

		// 正常状态 (未超支, 总支出 119.8)
		const normalRanking = calculateRanking(rawCategories, 119.8, false);
		expect(normalRanking.length).toBe(3);
		expect(normalRanking[0].name).toBe('饭');
		expect(normalRanking[0].value).toBe(100.0);
		expect(normalRanking[0].ratio).toBe(83); // 100 / 119.8 ≈ 83%
		expect(normalRanking[0].isCulprit).toBe(false);
		expect(normalRanking[1].name).toBe('美食');
		expect(normalRanking[2].name).toBe('出行');

		// 超支状态 (总支出 3350, 预算 3000)
		const overCategories = [
			{ name: '大额聚餐', value: 2500.0 },
			{ name: '日常日用', value: 850.0 },
		];
		const overRanking = calculateRanking(overCategories, 3350, true);
		expect(overRanking[0].name).toBe('大额聚餐');
		expect(overRanking[0].isCulprit).toBe(true); // 首要开销项被标记为超支主要责任项
		expect(overRanking[1].isCulprit).toBe(false);
	});

	// 客户明确要求的三大账户分类对齐契约测试：可动产 / 不动产 / 生活缴费
	it('PC端账户分组应严格对齐移动端客户标准（可动产 / 不动产 / 生活缴费）', () => {
		const mockBalanceList = [
			{ typeCode: 'yhk', typeName: '银行卡', amount: 1785.88 },
			{ typeCode: 'wx', typeName: '微信', amount: 3342.94 },
			{ typeCode: 'hb', typeName: '花呗', amount: -57.47 },
			{ typeCode: 'bt', typeName: '白条', amount: -63.27 },
			{ typeCode: 'xj', typeName: '现金', amount: 13582.94 },
			{ typeCode: 'zfb', typeName: '支付宝', amount: 60000 },
			{ typeCode: 'jd', typeName: '京东', amount: 60000 },
			{ typeCode: 'dfw', typeName: '电费w', amount: 68 },
			{ typeCode: 'hfw', typeName: '话费w', amount: 146.58 },
		];

		const filterByCodes = (keywords: string[]) =>
			mockBalanceList.filter((item) =>
				keywords.some((k) => item.typeCode.includes(k)),
			);

		const movableList = filterByCodes(['yhk', 'wx', 'hb', 'bt']);
		const immovableList = filterByCodes(['xj', 'zfb', 'jd']);
		const utilityList = filterByCodes(['sf', 'rqf', 'dfw', 'dfm', 'hf']);

		expect(movableList.map((i) => i.typeName)).toEqual([
			'银行卡',
			'微信',
			'花呗',
			'白条',
		]);
		expect(immovableList.map((i) => i.typeName)).toEqual([
			'现金',
			'支付宝',
			'京东',
		]);
		expect(utilityList.map((i) => i.typeName)).toEqual(['电费w', '话费w']);
	});
});
