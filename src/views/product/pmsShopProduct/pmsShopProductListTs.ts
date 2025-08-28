export interface SearchInfo {
	price?: number;
	name?: string;
	shop?: string;
	icons?: string;
	source?: string;
}

export const columns = ref<any>([
	{
		title: 'name',
		dataIndex: 'name',
		key: 'name',
		width: '20%',
		ellipsis: true,
	},
	{
		title: '图片',
		dataIndex: 'image',
		key: 'image',
	},
	{
		title: '价格',
		dataIndex: 'price',
		width: '5%',
		key: 'price',
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
		title: '产品连接',
		dataIndex: 'productUrl',
		key: 'productUrl',
	},
	{
		title: '来源',
		dataIndex: 'source',
		with: '10%',
		key: 'source',
	},
	{
		title: '时间',
		dataIndex: 'operateTime',
		with: '10%',
		key: 'operateTime',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	image: string;
	price: number;
	name: string;
	shop: string;
	icons: string;
	productUrl: string;
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
