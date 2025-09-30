import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '库存id',
		dataIndex: 'stockId',
		key: 'stockId',
	},
	{
		title: '商品属性编码',
		dataIndex: 'attrCode',
		key: 'attrCode',
	},
	{
		title: '商品属性名称',
		dataIndex: 'attrName',
		key: 'attrName',
	},
	{
		title: '商品属性值',
		dataIndex: 'attrValue',
		key: 'attrValue',
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

export interface ShopStockAttrsData {
	stockId?: number;
	attrCode?: string;
	attrName?: string;
	attrValue?: string;
	isValid?: string;
	description?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
