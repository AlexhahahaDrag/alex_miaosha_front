import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
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
		width: '10%',
		key: 'source',
	},
	{
		title: '时间',
		dataIndex: 'operateTime',
		width: '10%',
		key: 'operateTime',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface PmsShopProductData {
	image?: string;
	price?: number;
	name?: string;
	shop?: string;
	icons?: string;
	productUrl?: string;
	source?: string;
	operateTime?: string;
}

export const sourceTransferList = [
	{ value: 'jd', label: 'jingdong' },
	{ value: 'tb', label: 'taobao' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
