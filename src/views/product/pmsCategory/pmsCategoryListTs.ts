export interface SearchInfo {
	name?: string;
	parentCid?: number;
	catLevel?: number;
	showStatus?: number;
	sort?: number;
	icon?: string;
	productUnit?: string;
	productCount?: number;
}

export const columns = ref<any>([
	{
		title: '分类名称',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: '父分类id',
		dataIndex: 'parentCid',
		key: 'parentCid',
	},
	{
		title: '层级',
		dataIndex: 'catLevel',
		key: 'catLevel',
	},
	{
		title: '是否显示[0-不显示，1显示]',
		dataIndex: 'showStatus',
		key: 'showStatus',
	},
	{
		title: '排序',
		dataIndex: 'sort',
		key: 'sort',
	},
	{
		title: '图标地址',
		dataIndex: 'icon',
		key: 'icon',
	},
	{
		title: '计量单位',
		dataIndex: 'productUnit',
		key: 'productUnit',
	},
	{
		title: '商品数量',
		dataIndex: 'productCount',
		key: 'productCount',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	catId: number;
	name: string;
	parentCid: number;
	catLevel: number;
	showStatus: number;
	sort: number;
	icon: string;
	productUnit: string;
	productCount: number;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}
