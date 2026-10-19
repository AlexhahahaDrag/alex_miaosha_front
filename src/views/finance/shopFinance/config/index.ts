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
		title: '销售金额',
		dataIndex: 'saleAmount',
		key: 'saleAmount',
		width: 130,
		align: 'right',
	},
	{
		title: '销售件数',
		dataIndex: 'saleNum',
		key: 'saleNum',
		width: 110,
		align: 'center',
	},
	{
		title: '收支类型',
		dataIndex: 'incomeAndExpenses',
		key: 'incomeAndExpenses',
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
		width: 100,
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
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
	},
]);

export interface ShopFinanceData {
	id?: string;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	saleAmountFrom?: number;
	saleAmountEnd?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	saleDateFrom?: Dayjs | string | null;
	saleDateEnd?: Dayjs | string | null;
	saleNum?: number;
	incomeAndExpenses?: string;
	payWay?: string;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash', name: '现金' },
	{ value: 'zfb', label: 'zhifubao', name: '支付宝' },
	{ value: 'wx', label: 'weChat', name: '微信支付' },
	{ value: 'other', label: '', name: '其他渠道' },
];

export const DEFAULT_PAY_WAY_OPTIONS = [
	{ typeCode: 'wx', typeName: '微信支付' },
	{ typeCode: 'zfb', typeName: '支付宝' },
	{ typeCode: 'xj', typeName: '现金' },
	{ typeCode: 'other', typeName: '其他渠道' },
];

export const DEFAULT_INCOME_EXPENSE_OPTIONS = [
	{ typeCode: 'income', typeName: '收入' },
	{ typeCode: 'expense', typeName: '支出' },
];

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
