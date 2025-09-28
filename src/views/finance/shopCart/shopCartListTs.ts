import type { TableColumnsType } from 'ant-design-vue';

export interface SearchInfo {
	shopId?: number;
	userId?: number;
	customerId?: number;
	isValid?: string;
	saleNum?: number;
}

export const columns = ref<TableColumnsType>([
	{
		title: '商品id',
		dataIndex: 'shopId',
		key: 'shopId',
	},
	{
		title: '人员id',
		dataIndex: 'userId',
		key: 'userId',
	},
	{
		title: '客户id',
		dataIndex: 'customerId',
		key: 'customerId',
	},
	{
		title: '是否有效',
		dataIndex: 'isValid',
		key: 'isValid',
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
		width: '8',
	},
]);

export interface DataItem {
	shopId: number;
	userId: number;
	customerId: number;
	isValid: string;
	saleNum: number;
}
