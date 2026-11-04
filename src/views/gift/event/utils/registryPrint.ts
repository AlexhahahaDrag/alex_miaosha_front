/**
 * 礼簿台账打印与排版相关工具函数
 */

export interface RegistryPrintMetrics {
	totalCount: number;
	totalAmount: number;
	totalAmountText: string;
	avgAmountText: string;
	totalChineseAmount: string;
}

/**
 * 格式化金额千分位，保留 2 位小数
 */
export function formatRegistryMoney(amount?: number | string): string {
	const val = Number(amount) || 0;
	return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * 人民币数字转中文大写汉字
 */
export function toChineseCurrency(numInput?: number | string): string {
	const num = Number(numInput) || 0;
	if (num === 0) return '零元整';
	const fraction = ['角', '分'];
	const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
	const unit = [
		['元', '万', '亿'],
		['', '拾', '佰', '仟'],
	];
	const head = num < 0 ? '欠' : '';
	let n = Math.abs(num);

	let s = '';
	for (let i = 0; i < fraction.length; i++) {
		s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
	}
	s = s || '整';
	n = Math.floor(n);

	for (let i = 0; i < unit[0].length && n > 0; i++) {
		let p = '';
		for (let j = 0; j < unit[1].length && n > 0; j++) {
			p = digit[n % 10] + unit[1][j] + p;
			n = Math.floor(n / 10);
		}
		s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
	}
	return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

/**
 * 是否属于大额随礼贺金（默认阈值 ¥1000）
 */
export function isLargeAmountRegistry(amount?: number | string, threshold: number = 1000): boolean {
	const val = Number(amount) || 0;
	return val >= threshold;
}

/**
 * 计算礼簿汇总指标
 */
export function calculateRegistryMetrics(
	records: Array<{ amount?: number | string }>,
): RegistryPrintMetrics {
	const totalCount = records.length;
	const totalAmount = records.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
	const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

	return {
		totalCount,
		totalAmount,
		totalAmountText: `¥ ${formatRegistryMoney(totalAmount)}`,
		avgAmountText: `¥ ${avgAmount.toFixed(2)}`,
		totalChineseAmount: toChineseCurrency(totalAmount),
	};
}