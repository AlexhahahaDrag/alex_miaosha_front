import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '菜单名称',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: '菜单路径',
		dataIndex: 'path',
		key: 'path',
	},
	{
		title: '菜单标题',
		dataIndex: 'title',
		key: 'title',
	},
	{
		title: '组件',
		dataIndex: 'component',
		key: 'component',
	},
	{
		title: '跳转',
		dataIndex: 'redirect',
		key: 'redirect',
	},
	{
		title: '菜单图标',
		dataIndex: 'icon',
		key: 'icon',
	},
	{
		title: '权限标识',
		dataIndex: 'permissionCode',
		key: 'permissionCode',
	},
	{
		title: '是否隐藏菜单',
		dataIndex: 'hideInMenu',
		key: 'hideInMenu',
	},
	{
		title: '首页展示',
		dataIndex: 'showInHome',
		key: 'showInHome',
	},
	{
		title: '父级机构id',
		dataIndex: 'parentId',
		key: 'parentId',
	},
	{
		title: '备注',
		dataIndex: 'summary',
		key: 'summary',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: '排序',
		dataIndex: 'orderBy',
		key: 'orderBy',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface MenuInfoData {
	id?: string;
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
	orderBy?: string;
}

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	name: { name: 'name', label: '菜单名称' },
	path: { name: 'path', label: '菜单路径' },
	title: { name: 'title', label: '菜单标题' },
	component: { name: 'component', label: '组件' },
	redirect: { name: 'redirect', label: '跳转' },
	icon: { name: 'icon', label: '菜单图标' },
	permissionCode: { name: 'permissionCode', label: '权限标识' },
	hideInMenu: { name: 'hideInMenu', label: '是否隐藏菜单' },
	showInHome: { name: 'showInHome', label: '首页展示' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '备注' },
	status: { name: 'status', label: '状态' },
	orderBy: { name: 'orderBy', label: '排序' },
});

/** 菜单详情表单校验（与 labelMap / a-form-item :name 对齐） */
export const rulesRef = reactive({
	name: [{ required: true, message: '菜单名称不能为空！' }],
	title: [{ required: true, message: '菜单标题不能为空！' }],
	permissionCode: [{ required: true, message: '权限标识不能为空！' }],
	status: [{ required: true, message: '状态不能为空！' }],
});

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
