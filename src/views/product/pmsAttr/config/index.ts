import type { TableColumnsType } from 'ant-design-vue';
import type { DefaultOptionType } from 'ant-design-vue/es/select';

export const ATTR_TYPE_OPTIONS: (DefaultOptionType & { color?: string })[] = [
	{ label: '销售属性 (SKU)', value: 0, color: 'blue' },
	{ label: '基本属性 (SPU)', value: 1, color: 'cyan' },
	{ label: '销售与基本双重属性', value: 2, color: 'purple' },
];

export const ENABLE_STATUS_OPTIONS: (DefaultOptionType & { status?: string })[] = [
	{ label: '已启用', value: 1, status: 'enabled' },
	{ label: '已禁用', value: 0, status: 'disabled' },
];

export const SEARCH_TYPE_OPTIONS: DefaultOptionType[] = [
	{ label: '支持检索', value: 1 },
	{ label: '无需检索', value: 0 },
];

export const SHOW_DESC_OPTIONS: DefaultOptionType[] = [
	{ label: '快速展示', value: 1 },
	{ label: '默认隐藏', value: 0 },
];

export const columns = ref<TableColumnsType>([
	{
		title: '属性名称',
		dataIndex: 'attrName',
		key: 'attrName',
		width: 180,
		ellipsis: true,
	},
	{
		title: '属性类型',
		dataIndex: 'attrType',
		key: 'attrType',
		width: 160,
		align: 'center',
	},
	{
		title: '可选值列表',
		dataIndex: 'valueSelect',
		key: 'valueSelect',
		width: 240,
	},
	{
		title: '所属分类 ID',
		dataIndex: 'catelogId',
		key: 'catelogId',
		width: 140,
		align: 'center',
	},
	{
		title: '属性图标',
		dataIndex: 'icon',
		key: 'icon',
		width: 120,
		align: 'center',
	},
	{
		title: '检索支持',
		dataIndex: 'searchType',
		key: 'searchType',
		width: 110,
		align: 'center',
	},
	{
		title: '详情快展',
		dataIndex: 'showDesc',
		key: 'showDesc',
		width: 110,
		align: 'center',
	},
	{
		title: '启用状态',
		dataIndex: 'enable',
		key: 'enable',
		width: 110,
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

export interface PmsAttrData {
	id?: string;
	attrName?: string;
	searchType?: number;
	icon?: string;
	valueSelect?: string;
	attrType?: number;
	enable?: number;
	catelogId?: string;
	showDesc?: number;
}

export type SearchInfo = PmsAttrData;
export type PmsAttrDetail = PmsAttrData;

export interface DataItem {
	id?: string;
	attrName: string;
	searchType: number;
	icon: string;
	valueSelect: string;
	attrType: number;
	enable: number;
	catelogId: string;
	showDesc: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
