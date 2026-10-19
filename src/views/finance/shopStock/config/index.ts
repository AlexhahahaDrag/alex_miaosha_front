import type { Dayjs } from '@/utils/dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '商品名称',
		dataIndex: 'shopName',
		key: 'shopName',
		width: 200,
		ellipsis: true,
	},
	{
		title: '商品编码',
		dataIndex: 'shopCode',
		key: 'shopCode',
		width: 150,
	},
	{
		title: '商品类别',
		dataIndex: 'category',
		key: 'category',
		width: 130,
		align: 'center',
	},
	{
		title: '成本价',
		dataIndex: 'costAmount',
		key: 'costAmount',
		width: 120,
		align: 'right',
	},
	{
		title: '零售价',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
		width: 120,
		align: 'right',
	},
	{
		title: '库存数量',
		dataIndex: 'saleNum',
		key: 'saleNum',
		width: 110,
		align: 'center',
	},
	{
		title: '进货地点',
		dataIndex: 'purchasePlace',
		key: 'purchasePlace',
		width: 140,
		align: 'center',
	},
	{
		title: '进货日期',
		dataIndex: 'saleDate',
		key: 'saleDate',
		width: 140,
		align: 'center',
	},
	{
		title: '有效状态',
		dataIndex: 'isValid',
		key: 'isValid',
		width: 100,
		align: 'center',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
	},
]);

export interface ShopStockData {
	id?: string;
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

export type SearchInfo = ShopStockData;
export type ShopStockDetail = ShopStockData;

export interface DataItem {
	id?: string;
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

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
