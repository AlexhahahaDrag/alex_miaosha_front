import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '机构编码',
		dataIndex: 'orgCode',
		key: 'orgCode',
	},
	{
		title: '机构名称',
		dataIndex: 'orgName',
		key: 'orgName',
	},
	{
		title: '机构简称',
		dataIndex: 'orgShortName',
		key: 'orgShortName',
	},
	{
		title: '父级机构',
		dataIndex: 'parentOrgName',
		key: 'parentOrgName',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface OrgInfoData {
	id?: number;
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: number;
	parentOrgName?: string;
	summary?: string;
	status?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
