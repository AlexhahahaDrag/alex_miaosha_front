import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '库存 ID',
		dataIndex: 'stockId',
		key: 'stockId',
		width: 170,
	},
	{
		title: '属性编码',
		dataIndex: 'attrCode',
		key: 'attrCode',
		width: 160,
	},
	{
		title: '属性名称',
		dataIndex: 'attrName',
		key: 'attrName',
		width: 180,
		ellipsis: true,
	},
	{
		title: '属性值',
		dataIndex: 'attrValue',
		key: 'attrValue',
		width: 180,
	},
	{
		title: '有效状态',
		dataIndex: 'isValid',
		key: 'isValid',
		width: 110,
		align: 'center',
	},
	{
		title: '属性描述',
		dataIndex: 'description',
		key: 'description',
		width: 220,
		ellipsis: true,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
	},
]);

export interface ShopStockAttrsData {
	id?: string;
	stockId?: string;
	attrCode?: string;
	attrName?: string;
	attrValue?: string;
	isValid?: string;
	description?: string;
}

export type SearchInfo = ShopStockAttrsData;
export type ShopStockAttrsDetail = ShopStockAttrsData;

export interface DataItem {
	id?: string;
	stockId: string;
	attrCode: string;
	attrName: string;
	attrValue: string;
	isValid: string;
	description: string;
}

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
