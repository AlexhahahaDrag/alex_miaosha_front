import type { Dayjs } from 'dayjs';
export interface SearchInfo {
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	saleAmountFrom?: number;
	saleAmountEnd?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	saleDateFrom?: Dayjs | string | null;
	saleDateEnd?: Dayjs | string | null;
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
		title: '售价',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
	},
	{
		title: '销售件数',
		dataIndex: 'saleNum',
		key: 'saleNum',
	},
	{
		title: '收支类型',
		dataIndex: 'incomeAndExpenses',
		key: 'incomeAndExpenses',
	},
	{
		title: '支付方式',
		dataIndex: 'payWay',
		key: 'payWay',
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
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	shopName: string;
	shopCode: string;
	saleAmount: number;
	isValid: string;
	saleDate?: Dayjs | string;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash' },
	{ value: 'zfb', label: 'zhifubao' },
	{ value: 'wx', label: 'weChat' },
	{ value: 'other', label: '' },
];
