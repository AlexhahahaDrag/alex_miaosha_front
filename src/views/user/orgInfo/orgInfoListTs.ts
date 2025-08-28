export interface SearchInfo {
	orgCode?: string;
	orgName?: string;
	orgShortName?: string;
	parentId?: number;
	summary?: string;
	status?: string;
}

export const columns = ref<any>([
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

export interface DataItem {
	orgCode: string;
	orgName: string;
	orgShortName: string;
	parentId: number;
	summary: string;
	status: string;
}
