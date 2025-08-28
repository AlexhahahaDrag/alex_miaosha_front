import type { Dayjs } from 'dayjs';
export interface SearchInfo {
	cardId?: number;
	orderNo?: string;
	amount?: number;
	balanceAfter?: number;
	merchantName?: string;
	consumeTime?: Dayjs | string;
	description?: string;
}

export const columns = ref<any>([
	{
		title: '卡号（关联prepaid_card_info_t.card_id）',
		dataIndex: 'cardId',
		key: 'cardId',
	},
	{
		title: '交易流水号（业务唯一）',
		dataIndex: 'orderNo',
		key: 'orderNo',
	},
	{
		title: '交易金额（正消费，负充值）',
		dataIndex: 'amount',
		key: 'amount',
	},
	{
		title: '交易后余额',
		dataIndex: 'balanceAfter',
		key: 'balanceAfter',
	},
	{
		title: '商户名称',
		dataIndex: 'merchantName',
		key: 'merchantName',
	},
	{
		title: '交易时间',
		dataIndex: 'consumeTime',
		key: 'consumeTime',
	},
	{
		title: '交易描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	cardId: number;
	orderNo: string;
	amount: number;
	balanceAfter: number;
	merchantName: string;
	consumeTime?: Dayjs | string;
	description: string;
}
