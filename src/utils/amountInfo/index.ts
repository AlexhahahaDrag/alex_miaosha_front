// 格式化金额的工具函数
export function formatAmount(amount: number): string {
	if (amount === undefined || amount === null) {
		return '0.00';
	}
	return String(amount.toFixed(2))
		.replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d))/g, ',')
		.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
}
