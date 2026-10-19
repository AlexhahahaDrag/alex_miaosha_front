import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '订单编码',
		dataIndex: 'saleOrderCode',
		key: 'saleOrderCode',
		width: 170,
	},
	{
		title: '订单名称',
		dataIndex: 'saleOrderName',
		key: 'saleOrderName',
		width: 220,
		ellipsis: true,
	},
	{
		title: '总销售金额',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
		width: 140,
		align: 'right',
	},
	{
		title: '销售数量',
		dataIndex: 'saleCount',
		key: 'saleCount',
		width: 110,
		align: 'center',
	},
	{
		title: '支付方式',
		dataIndex: 'payWay',
		key: 'payWay',
		width: 130,
		align: 'center',
	},
	{
		title: '有效状态',
		dataIndex: 'isValid',
		key: 'isValid',
		width: 110,
		align: 'center',
	},
	{
		title: '销售日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
		width: 150,
		align: 'center',
	},
	{
		title: '订单描述',
		dataIndex: 'description',
		key: 'description',
		width: 200,
		ellipsis: true,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
	},
]);

export interface ShopOrderData {
	id?: string;
	saleOrderCode?: string;
	saleOrderName?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: string;
	description?: string;
	payWay?: string;
	saleCount?: number;
}

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
