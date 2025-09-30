import type { Dayjs } from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
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

export interface ShopOrderDetailData {
	orderId?: number;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string | undefined;
	payWay?: string;
	saleNum?: number;
	shopStockId?: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
