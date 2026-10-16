import type { TableColumnsType } from 'ant-design-vue';

export const columns: TableColumnsType = [
	{
		title: '权限信息 (名称 / 描述)',
		dataIndex: 'permissionName',
		key: 'permissionName',
		width: 240,
		ellipsis: true,
	},
	{
		title: '权限编码 (Code)',
		dataIndex: 'permissionCode',
		key: 'permissionCode',
		width: 220,
		ellipsis: true,
	},
	{
		title: '关联资源 (URL / Options)',
		dataIndex: 'options',
		key: 'options',
		width: 240,
		ellipsis: true,
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
		width: 210,
		align: 'center',
	},
];

export interface SearchInfo {
	permissionCode?: string;
	permissionName?: string;
	summary?: string;
	status?: string;
	options?: string;
}

export interface PermissionInfo {
	id?: string;
	key?: string | number;
	permissionCode?: string;
	permissionName?: string;
	summary?: string;
	status?: string;
	options?: string;
	parentId?: string;
	disabled?: boolean;
	children?: PermissionInfo[];
	createTime?: string;
	updateTime?: string;
}

/** 权限详情表单校验（仅核心必填字段） */
export const rulesRef = reactive({
	permissionCode: [{ required: true, message: '权限编码不能为空！' }],
	permissionName: [{ required: true, message: '权限名称不能为空！' }],
	status: [{ required: true, message: '状态不能为空！' }],
});
