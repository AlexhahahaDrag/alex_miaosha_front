import type { TableColumnsType } from 'ant-design-vue';
import type { PermissionInfo } from '@/views/user/permissionInfo/config';

export const columns: TableColumnsType = [
	{
		title: '角色信息 (名称 / 职责说明)',
		dataIndex: 'roleName',
		key: 'roleName',
		width: 220,
		ellipsis: true,
	},
	{
		title: '角色编码 (Code)',
		dataIndex: 'roleCode',
		key: 'roleCode',
		width: 170,
		ellipsis: true,
	},
	{
		title: '绑定机构',
		dataIndex: 'orgNames',
		key: 'orgNames',
		width: 210,
		ellipsis: true,
	},
	{
		title: '授权与成员规模',
		key: 'metrics',
		width: 190,
		align: 'center',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		width: 95,
		align: 'center',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 265,
		align: 'center',
	},
];

export interface RolePermissionItem {
	id?: string;
	roleId?: string;
	permissionId?: string;
	status?: string;
}

export interface RoleUserItem {
	id?: string;
	roleId?: string;
	userId?: string;
	status?: string;
}

export interface RoleInfoData {
	id?: string;
	roleCode?: string;
	roleName?: string;
	summary?: string;
	status?: string;
	orgIds?: string[];
	orgNames?: string;
	boundUserCount?: number | string;
	permissionCount?: number | string;
	permissionList?: PermissionInfo[];
	rolePermissionInfoVoList?: RolePermissionItem[];
	roleUserInfoVoList?: RoleUserItem[];
}

export const rulesRef = reactive({
	roleCode: [{ required: true, message: '角色编码不能为空！' }],
	roleName: [{ required: true, message: '角色名称不能为空！' }],
	status: [{ required: true, message: '状态不能为空！' }],
	orgIds: [
		{
			required: true,
			type: 'array' as const,
			min: 1,
			message: '请至少绑定一个机构！',
		},
	],
});
