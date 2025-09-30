import type { TableColumnsType } from 'ant-design-vue';
export interface SearchInfo {
	name?: string;
	shop?: string;
	icons?: string;
	source?: string;
}

export const columns = ref<TableColumnsType>([
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

export interface PmsShopWantProductData {
	id?: number;
	name?: string;
	shop?: string;
	icons?: string;
	source?: string;
}

export const sourceTransferList = [
	{ value: 'jd', label: 'jingdong' },
	{ value: 'tb', label: 'taobao' },
];
