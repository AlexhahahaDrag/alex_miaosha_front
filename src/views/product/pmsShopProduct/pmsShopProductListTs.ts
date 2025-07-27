export interface SearchInfo {
	price?: number;
	name?: string;
	shop?: string;
	icons?: string;
	source?: string;
}

export interface pageInfo {
	current?: number;
	pageSize?: number;
	total?: number;
	showTotal: Function;
	showSizeChanger: boolean;
	pageSizeOptions: string[];
	showSizeChange: Function;
	size: string;
	showQuickJumper: boolean;
	defaultPageSize: number;
}

export let pagination = ref<any>({
	// 数据总数
	total: 0,
	// 当前页数
	current: 1,
	// 每页条数
	pageSize: 10,
	// 展示总数
	showTotal: (total: number) => `共 ${total} 条`,
	// 是否可以改变pageSize
	showSizeChanger: true,
	// 设置每页可以展示多少条的选项
	pageSizeOptions: ['10', '20', '50', '100'],
	// 改变pageSize后触发
	showSizeChange: (current: number, pageSize: any) => (
		(pagination.value.current = current), (pagination.value.pageSize = pageSize)
	),
	// 小尺寸分页
	size: 'small',
	// 是否可以快速跳转至某页
	showQuickJumper: true,
	//默认条数
	defaultPageSize: 10,
});

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
