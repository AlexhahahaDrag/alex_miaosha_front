export interface SearchInfo {
	name?: string;
	shop?: string;
	icons?: string;
	source?: string;
}

export const columns = ref<any>([
	{
		title: '商品名称',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: '商铺',
		dataIndex: 'shop',
		key: 'shop',
	},
	{
		title: '标签',
		dataIndex: 'icons',
		key: 'icons',
	},
	{
		title: '来源',
		dataIndex: 'source',
		key: 'source',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	name: string;
	shop: string;
	icons: string;
	source: string;
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

export const sourceTransferList = [
	{ value: 'jd', label: 'jingdong' },
	{ value: 'tb', label: 'taobao' },
];
