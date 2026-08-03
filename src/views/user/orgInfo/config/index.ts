import type { TableColumnsType } from 'ant-design-vue';

export interface SearchInfo {
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: string;
	summary?: string;
	status?: string;
}

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
	id?: string;
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: string;
	parentOrgName?: string;
	summary?: string;
	status?: string;
}

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	orgCode: { name: 'orgCode', label: '机构编码' },
	orgName: { name: 'orgName', label: '机构名称' },
	orgShortName: { name: 'orgShortName', label: '机构简称' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '简介最多150字' },
	status: { name: 'status', label: '状态' },
});

export const rulesRef = reactive({
	orgCode: [
		{
			required: true,
			message: '机构编码不能为空！',
		},
	],
	orgName: [
		{
			required: true,
			message: '机构名称不能为空！',
		},
	],
	orgShortName: [
		{
			required: true,
			message: '机构简称不能为空！',
		},
	],
	parentId: [
		{
			required: true,
			message: '父级机构id不能为空！',
		},
	],
	summary: [
		{
			required: true,
			message: '简介最多150字不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
});

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });
