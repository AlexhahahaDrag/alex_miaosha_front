import type { TableColumnsType } from 'ant-design-vue';

export interface SearchInfo {
	roleCode?: string;
	roleName?: string;
	summary?: string;
	status?: string;
}

export const columns = ref<TableColumnsType>([
	{
		title: '角色编码',
		dataIndex: 'roleCode',
		key: 'roleCode',
	},
	{
		title: '角色名称',
		dataIndex: 'roleName',
		key: 'roleName',
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
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export const labelMap = ref<any>({
	orgId: { name: 'orgId', label: '公司角色id' },
	userId: { name: 'userId', label: '用户id' },
	roleCode: { name: 'roleCode', label: '角色编码' },
	roleName: { name: 'roleName', label: '角色名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
});

export interface DataItem {
	roleCode: string;
	roleName: string;
	summary: string;
	status: string;
}
