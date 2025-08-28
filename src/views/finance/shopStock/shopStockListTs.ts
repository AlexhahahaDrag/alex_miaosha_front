import type { Dayjs } from 'dayjs';
export interface SearchInfo {
	shopName?: string;
	shopCode?: string;
	costAmount?: number;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	category?: string;
	purchasePlace?: string;
	saleNum?: number;
}

export const columns = ref<any>([
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
		title: '成本价',
		dataIndex: 'costAmount',
		key: 'costAmount',
	},
	{
		title: '零售价',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '进货日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
	},
	{
		title: '类别',
		dataIndex: 'category',
		key: 'category',
	},
	{
		title: '进货地点',
		dataIndex: 'purchasePlace',
		key: 'purchasePlace',
	},
	{
		title: '数量',
		dataIndex: 'saleNum',
		key: 'saleNum',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
	},
]);

export interface DataItem {
	shopName: string;
	shopCode: string;
	costAmount: number;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
	category: string;
	purchasePlace: string;
	saleNum: number;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}
