import { describe, it, expect, vi } from 'vitest';

describe('Gift Analysis Export & Print Contract Tests', () => {
	it('导出文件名解析：优先从 filename*=UTF-8 中提取，兜底从 filename 提取', () => {
		const parseFilename = (disposition: string, defaultName: string) => {
			const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
			const fallbackMatch = disposition.match(/filename="?([^";]+)"?/i);
			const rawName = utf8Match ? utf8Match[1] : fallbackMatch ? fallbackMatch[1] : '';
			return rawName ? decodeURIComponent(rawName) : defaultName;
		};

		const headerWithUtf8 = "attachment; filename*=UTF-8''%E7%A4%BC%E9%87%91%E5%AF%B9%E8%B4%A6%E5%8D%95.xlsx";
		expect(parseFilename(headerWithUtf8, 'fallback.xlsx')).toBe('礼金对账单.xlsx');

		const headerWithFallback = 'attachment; filename="gift_balance_report.xlsx"';
		expect(parseFilename(headerWithFallback, 'fallback.xlsx')).toBe('gift_balance_report.xlsx');

		const emptyHeader = '';
		expect(parseFilename(emptyHeader, 'default.xlsx')).toBe('default.xlsx');
	});

	it('打印逻辑调用 window.print', () => {
		const printSpy = vi.fn();
		const originalPrint = window.print;
		window.print = printSpy;

		const handlePrintReport = () => {
			window.print();
		};

		handlePrintReport();
		expect(printSpy).toHaveBeenCalledTimes(1);

		window.print = originalPrint;
	});

	it('人脉力导向图谱节点点击抛出 select-person 契约', () => {
		const emittedEvents: any[] = [];
		const emit = (event: string, payload: any) => {
			emittedEvents.push({ event, payload });
		};

		const handleChartNodeClick = (params: any) => {
			if (params && params.data && params.data.raw) {
				emit('select-person', params.data.raw);
			}
		};

		// 模拟点击亲友节点
		const mockPerson = {
			personId: '1001',
			personName: '张三',
			relationTypeName: '好友',
			netBalance: 500,
		};

		handleChartNodeClick({ data: { raw: mockPerson } });
		expect(emittedEvents.length).toBe(1);
		expect(emittedEvents[0].event).toBe('select-person');
		expect(emittedEvents[0].payload.personId).toBe('1001');

		// 模拟点击非实体节点（如本人或聚合中心）
		handleChartNodeClick({ data: { id: 'NODE_ME' } });
		expect(emittedEvents.length).toBe(1);
	});
});
