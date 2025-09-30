import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: 'spuId',
		dataIndex: 'spuId',
		key: 'spuId',
	},
	{
		title: 'sku名称',
		dataIndex: 'skuName',
		key: 'skuName',
	},
	{
		title: 'sku介绍描述',
		dataIndex: 'skuDesc',
		key: 'skuDesc',
	},
	{
		title: '所属分类id',
		dataIndex: 'catalogId',
		key: 'catalogId',
	},
	{
		title: '品牌id',
		dataIndex: 'brandId',
		key: 'brandId',
	},
	{
		title: '默认图片',
		dataIndex: 'skuDefaultImg',
		key: 'skuDefaultImg',
	},
	{
		title: '标题',
		dataIndex: 'skuTitle',
		key: 'skuTitle',
	},
	{
		title: '副标题',
		dataIndex: 'skuSubtitle',
		key: 'skuSubtitle',
	},
	{
		title: '价格',
		dataIndex: 'price',
		key: 'price',
	},
	{
		title: '销量',
		dataIndex: 'saleCount',
		key: 'saleCount',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface PmsSkuInfoData {
	skuId?: number;
	spuId?: number;
	skuName?: string;
	skuDesc?: string;
	catalogId?: number;
	brandId?: number;
	skuDefaultImg?: string;
	skuTitle?: string;
	skuSubtitle?: string;
	price?: number;
	saleCount?: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
