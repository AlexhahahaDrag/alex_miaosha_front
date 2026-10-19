import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '商品图片',
		dataIndex: 'image',
		key: 'image',
		width: 100,
		align: 'center',
	},
	{
		title: '商品名称',
		dataIndex: 'name',
		key: 'name',
		width: 260,
		ellipsis: true,
	},
	{
		title: '当前价格',
		dataIndex: 'price',
		key: 'price',
		width: 130,
		align: 'right',
	},
	{
		title: '所属商铺',
		dataIndex: 'shop',
		key: 'shop',
		width: 160,
		ellipsis: true,
	},
	{
		title: '促销标签',
		dataIndex: 'icons',
		key: 'icons',
		width: 150,
		ellipsis: true,
	},
	{
		title: '来源平台',
		dataIndex: 'source',
		key: 'source',
		width: 110,
		align: 'center',
	},
	{
		title: '商城直达',
		dataIndex: 'productUrl',
		key: 'productUrl',
		width: 120,
		align: 'center',
	},
	{
		title: '更新时间',
		dataIndex: 'operateTime',
		key: 'operateTime',
		width: 170,
		align: 'center',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
	},
]);

export interface PmsShopProductData {
	id?: string;
	skuId?: string;
	image?: string;
	price?: number;
	comparePrice?: number;
	lowestPrice?: number;
	highestPrice?: number;
	name?: string;
	shop?: string;
	icons?: string;
	productUrl?: string;
	source?: string;
	operateTime?: string;
}

export const sourceTransferList = [
	{ value: 'jd', label: 'jingdong', name: '京东商城' },
	{ value: 'tb', label: 'taobao', name: '淘宝/天猫' },
];

export const DEFAULT_SHOP_SOURCE_OPTIONS = [
	{ typeCode: 'jd', typeName: '京东商城' },
	{ typeCode: 'tb', typeName: '淘宝/天猫' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
