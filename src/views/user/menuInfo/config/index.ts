import type { TableColumnsType } from 'ant-design-vue';

export const columns: TableColumnsType = [
	{
		title: '菜单信息 (标题 / 路由名)',
		dataIndex: 'title',
		key: 'title',
		width: 220,
		ellipsis: true,
	},
	{
		title: '所属上级',
		dataIndex: 'parentTitle',
		key: 'parentTitle',
		width: 120,
		ellipsis: true,
	},
	{
		title: '路由与组件 (Path / Component)',
		dataIndex: 'path',
		key: 'path',
		width: 220,
		ellipsis: true,
	},
	{
		title: '权限标识',
		dataIndex: 'permissionCode',
		key: 'permissionCode',
		width: 150,
		ellipsis: true,
	},
	{
		title: '可见性',
		dataIndex: 'hideInMenu',
		key: 'hideInMenu',
		width: 100,
		align: 'center',
	},
	{
		title: '排序',
		dataIndex: 'orderBy',
		key: 'orderBy',
		width: 70,
		align: 'center',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		width: 85,
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

export interface MenuInfoData {
	id?: string;
	key?: string | number;
	name?: string;
	path?: string;
	title?: string;
	component?: string;
	redirect?: string;
	icon?: string;
	permissionCode?: string;
	hideInMenu?: string;
	showInHome?: string;
	parentId?: string;
	summary?: string;
	status?: string;
	orderBy?: string | number;
	parentTitle?: string;
	disabled?: boolean;
	children?: MenuInfoData[];
}

/** 菜单详情表单校验 */
export const rulesRef = reactive({
	name: [{ required: true, message: '菜单名称不能为空！' }],
	title: [{ required: true, message: '菜单标题不能为空！' }],
	permissionCode: [{ required: true, message: '权限标识不能为空！' }],
	status: [{ required: true, message: '状态不能为空！' }],
});
