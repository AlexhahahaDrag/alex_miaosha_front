import type { Dayjs } from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export interface SearchInfo {
	saleOrderCode?: string;
	saleOrderName?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	description?: string;
	payWay?: string;
	saleCount?: number;
}

export const columns = ref<TableColumnsType>([
	{
		title: '订单编码',
		dataIndex: 'saleOrderCode',
		key: 'saleOrderCode',
	},
	{
		title: '订单名称',
		dataIndex: 'saleOrderName',
		key: 'saleOrderName',
	},
	{
		title: '总销售金额',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '销售日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '支付方式',
		dataIndex: 'payWay',
		key: 'payWay',
	},
	{
		title: '销售数量',
		dataIndex: 'saleCount',
		key: 'saleCount',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	saleOrderCode: string;
	saleOrderName: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	description: string;
	payWay: string;
	saleCount: number;
}
