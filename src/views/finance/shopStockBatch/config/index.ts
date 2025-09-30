import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '订单编码',
		dataIndex: 'batchCode',
		key: 'batchCode',
	},
	{
		title: '订单名称',
		dataIndex: 'batchName',
		key: 'batchName',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface ShopStockBatchData {
	batchCode?: string;
	batchName?: string;
	isValid?: string;
	description?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
