import type { Dayjs } from '@/utils/dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '卡号（关联储值卡）',
		dataIndex: 'cardId',
		key: 'cardId',
		width: 170,
	},
	{
		title: '交易流水号',
		dataIndex: 'orderNo',
		key: 'orderNo',
		width: 190,
	},
	{
		title: '交易金额',
		dataIndex: 'amount',
		key: 'amount',
		align: 'right',
		width: 130,
	},
	{
		title: '交易后余额',
		dataIndex: 'balanceAfter',
		key: 'balanceAfter',
		align: 'right',
		width: 140,
	},
	{
		title: '商户名称',
		dataIndex: 'merchantName',
		key: 'merchantName',
		width: 160,
	},
	{
		title: '交易时间',
		dataIndex: 'consumeTime',
		key: 'consumeTime',
		align: 'center',
		width: 170,
	},
	{
		title: '交易描述',
		dataIndex: 'description',
		key: 'description',
		minWidth: 160,
		ellipsis: true,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 150,
	},
]);

export interface PrepaidConsumeRecordTData {
	id?: string;
	cardId?: string;
	cardName?: string;
	type?: string;
	orderNo?: string;
	amount?: number;
	balanceAfter?: number;
	merchantName?: string;
	consumeTime?: Dayjs | string;
	description?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
