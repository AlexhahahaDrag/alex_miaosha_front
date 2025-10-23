import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '类别编码',
		dataIndex: 'typeCode',
		key: 'typeCode',
	},
	{
		title: '类别',
		dataIndex: 'typeName',
		key: 'typeName',
	},
	{
		title: '分类编码',
		dataIndex: 'belongTo',
		key: 'belongTo',
	},
	{
		title: '分类',
		dataIndex: 'belongToName',
		key: 'belongToName',
	},
	{
		title: '排序',
		dataIndex: 'orderBy',
		align: 'center',
		key: 'orderBy',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		align: 'center',
		key: 'isValid',
	},
	{
		title: '业务时间',
		dataIndex: 'operateTime',
		key: 'operateTime',
	},
	{
		title: '操作',
		key: 'operation',
		width: 200,
	},
]);

export interface DictInfo {
	id?: number | undefined;
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
	belongTo?: string | number | undefined;
	belongToName?: string | undefined;
	orderBy?: number | undefined;
	isValid?: number | undefined;
	operateTime?: string | undefined;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
