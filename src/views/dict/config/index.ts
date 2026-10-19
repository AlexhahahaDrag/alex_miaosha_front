import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '类别名称',
		dataIndex: 'typeName',
		key: 'typeName',
		width: 180,
	},
	{
		title: '类别编码 (Code)',
		dataIndex: 'typeCode',
		key: 'typeCode',
		width: 160,
	},
	{
		title: '所属分类',
		dataIndex: 'belongToName',
		key: 'belongToName',
		width: 160,
	},
	{
		title: '分类编码 (BelongTo)',
		dataIndex: 'belongTo',
		key: 'belongTo',
		width: 180,
	},
	{
		title: '排序',
		dataIndex: 'orderBy',
		align: 'center',
		key: 'orderBy',
		width: 90,
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		align: 'center',
		key: 'isValid',
		width: 100,
	},
	{
		title: '业务时间',
		dataIndex: 'operateTime',
		key: 'operateTime',
		width: 170,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 210,
	},
]);

export interface DictInfo {
	id?: string;
	typeCode?: string | number;
	typeName?: string;
	belongTo?: string | number;
	belongToName?: string;
	orderBy?: number;
	isValid?: number | string;
	operateTime?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
