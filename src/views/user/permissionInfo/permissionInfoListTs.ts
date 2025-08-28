export interface SearchInfo {
	permissionCode?: string;
	permissionName?: string;
	summary?: string;
	status?: string;
	options?: string;
}

export const columns = ref<any>([
	{
		title: '权限编码',
		dataIndex: 'permissionCode',
		key: 'permissionCode',
	},
	{
		title: '权限名称',
		dataIndex: 'permissionName',
		key: 'permissionName',
	},
	{
		title: '描述',
		dataIndex: 'summary',
		key: 'summary',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: 'url',
		dataIndex: 'options',
		key: 'options',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export const labelMap = ref<any>({
	permissionCode: { name: 'permissionCode', label: '权限编码' },
	permissionName: { name: 'permissionName', label: '权限名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
	options: { name: 'options', label: 'url' },
});

export interface DataItem {
	permissionCode: string;
	permissionName: string;
	summary: string;
	status: string;
	options: string;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}
