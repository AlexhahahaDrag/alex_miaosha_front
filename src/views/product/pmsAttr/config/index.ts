import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '属性名',
		dataIndex: 'attrName',
		key: 'attrName',
	},
	{
		title: '是否需要检索[0-不需要，1-需要]',
		dataIndex: 'searchType',
		key: 'searchType',
	},
	{
		title: '属性图标',
		dataIndex: 'icon',
		key: 'icon',
	},
	{
		title: '可选值列表[用逗号分隔]',
		dataIndex: 'valueSelect',
		key: 'valueSelect',
	},
	{
		title: '属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]',
		dataIndex: 'attrType',
		key: 'attrType',
	},
	{
		title: '启用状态[0 - 禁用，1 - 启用]',
		dataIndex: 'enable',
		key: 'enable',
	},
	{
		title: '所属分类',
		dataIndex: 'catelogId',
		key: 'catelogId',
	},
	{
		title: '快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整',
		dataIndex: 'showDesc',
		key: 'showDesc',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface PmsAttrData {
	attrName?: string;
	searchType?: number;
	icon?: string;
	valueSelect?: string;
	attrType?: number;
	enable?: number;
	catelogId?: number;
	showDesc?: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
