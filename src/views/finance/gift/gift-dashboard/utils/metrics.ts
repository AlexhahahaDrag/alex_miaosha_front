export type TrendDirection = 'up' | 'down' | 'flat' | 'none';

export interface MomTrend {
	direction: TrendDirection;
	text: string;
	pct: number | null;
}

export const buildSparklinePoints = (
	values: number[],
	width = 92,
	height = 36,
): string => {
	if (values.length === 0) return '';
	const max = Math.max(1, ...values);
	const min = Math.min(...values);
	const range = max - min || 1;
	return values
		.map((value, index) => {
			const x = (index / Math.max(1, values.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		})
		.join(' ');
};

export const calcMomTrend = (values: number[]): MomTrend => {
	if (values.length < 2) {
		return { direction: 'none', text: '暂无对比数据', pct: null };
	}
	const previous = values[values.length - 2];
	const current = values[values.length - 1];
	if (previous === 0 && current === 0) {
		return { direction: 'flat', text: '较上月持平', pct: 0 };
	}
	if (previous === 0) {
		return { direction: 'up', text: '较上月新增', pct: null };
	}
	const pct = ((current - previous) / Math.abs(previous)) * 100;
	const direction: TrendDirection =
		pct > 0 ? 'up'
		: pct < 0 ? 'down'
		: 'flat';
	const sign = pct > 0 ? '+' : '';
	return {
		direction,
		pct,
		text: `${sign}${pct.toFixed(1)}% 较上月`,
	};
};

export const averageOf = (values: number[]) => {
	if (values.length === 0) return 0;
	return values.reduce((sum, item) => sum + item, 0) / values.length;
};
