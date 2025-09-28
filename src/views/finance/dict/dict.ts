import type { TableColumnsType } from 'ant-design-vue';

export interface SearchInfo {
	typeName?: string;
	belongToName?: string;
}

export const columns = ref<TableColumnsType>([
	// {
	//   title: "id",
	//   dataIndex: "id",
	//   key: "id",
	// },
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

export interface DataItem {
	name: string;
	typeCode: string;
	typeName: string;
	amount: number;
	fromSource: string;
	fromSourceName: string;
	isValid: number;
}

export interface DictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
