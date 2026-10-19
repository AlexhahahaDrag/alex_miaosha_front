import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '商品 ID',
		dataIndex: 'shopId',
		key: 'shopId',
		width: 180,
	},
	{
		title: '销售人员 ID',
		dataIndex: 'userId',
		key: 'userId',
		width: 180,
	},
	{
		title: '客户 ID',
		dataIndex: 'customerId',
		key: 'customerId',
		width: 180,
	},
	{
		title: '加购数量',
		dataIndex: 'saleNum',
		key: 'saleNum',
		width: 120,
		align: 'center',
	},
	{
		title: '有效状态',
		dataIndex: 'isValid',
		key: 'isValid',
		width: 120,
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

export interface ShopCartData {
	id?: string;
	shopId?: string;
	userId?: string;
	customerId?: string;
	isValid?: string;
	saleNum?: number;
}

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
