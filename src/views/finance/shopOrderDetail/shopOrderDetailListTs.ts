import type { Dayjs } from 'dayjs';
export interface SearchInfo {
	orderId?: number;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	payWay?: string;
	saleNum?: number;
	shopStockId?: number;
}

export const columns = ref<any>([
	{
		title: '订单id',
		dataIndex: 'orderId',
		key: 'orderId',
	},
	{
		title: '商品名称',
		dataIndex: 'shopName',
		key: 'shopName',
	},
	{
		title: '商品编码',
		dataIndex: 'shopCode',
		key: 'shopCode',
	},
	{
		title: '售价',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
	},
	{
		title: '是否有效',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '销售日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
	},
	{
		title: '支付方式',
		dataIndex: 'payWay',
		key: 'payWay',
	},
	{
		title: '个数',
		dataIndex: 'saleNum',
		key: 'saleNum',
	},
	{
		title: '商品库存id',
		dataIndex: 'shopStockId',
		key: 'shopStockId',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	orderId: number;
	shopName: string;
	shopCode: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	payWay: string;
	saleNum: number;
	shopStockId: number;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
