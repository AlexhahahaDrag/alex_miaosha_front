import type { TableColumnsType } from 'ant-design-vue';

export const columns: TableColumnsType = [
	{
		title: '机构名称',
		dataIndex: 'orgName',
		key: 'orgName',
		width: 260,
	},
	{
		title: '机构编码',
		dataIndex: 'orgCode',
		key: 'orgCode',
		width: 140,
	},
	{
		title: '机构简称',
		dataIndex: 'orgShortName',
		key: 'orgShortName',
		width: 130,
	},
	{
		title: '父级机构',
		dataIndex: 'parentOrgName',
		key: 'parentOrgName',
		width: 160,
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		width: 100,
		align: 'center',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 250,
		align: 'center',
	},
];

export interface OrgInfoData {
	id?: string;
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: string;
	parentOrgName?: string;
	summary?: string;
	status?: string;
	// 机构树接口（/org-info/tree）返回的子机构列表
	children?: OrgInfoData[];
	disabled?: boolean;
	createTime?: string;
	updateTime?: string;
	creator?: string;
	updater?: string;
}

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	orgCode: { name: 'orgCode', label: '机构编码' },
	orgName: { name: 'orgName', label: '机构名称' },
	orgShortName: { name: 'orgShortName', label: '机构简称' },
	parentId: { name: 'parentId', label: '父级机构' },
	summary: { name: 'summary', label: '机构简介' },
	status: { name: 'status', label: '机构状态' },
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
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
});

export const labelCol = { span: 5 };
export const wrapperCol = { span: 19 };
