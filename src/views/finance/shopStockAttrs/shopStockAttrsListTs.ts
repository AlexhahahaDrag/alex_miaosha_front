export interface SearchInfo {
	stockId?: number;
	attrCode?: string;
	attrName?: string;
	attrValue?: string;
	isValid?: string;
	description?: string;
}

export const columns = ref<any>([
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

export interface DataItem {
	stockId: number;
	attrCode: string;
	attrName: string;
	attrValue: string;
	isValid: string;
	description: string;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
