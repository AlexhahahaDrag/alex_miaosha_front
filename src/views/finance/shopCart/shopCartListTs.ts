export interface SearchInfo {
	shopId?: number;
	userId?: number;
	customerId?: number;
	isValid?: string;
	saleNum?: number;
}

export const columns = ref<any>([
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
