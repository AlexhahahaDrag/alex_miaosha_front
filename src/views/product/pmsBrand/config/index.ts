import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '品牌名',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'logo',
		dataIndex: 'logoUrl',
		key: 'logoUrl',
	},
	{
		title: '显示状态',
		dataIndex: 'showStatus',
		key: 'showStatus',
	},
	{
		title: '检索首字母',
		dataIndex: 'firstLetter',
		key: 'firstLetter',
	},
	{
		title: '排序',
		dataIndex: 'sort',
		key: 'sort',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface PmsBrandData {
	id?: string | number;
	brandId?: number;
	name?: string;
	logo?: number | string | null;
	logoUrl?: string;
	descript?: string;
	showStatus?: number;
	firstLetter?: string;
	sort?: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
