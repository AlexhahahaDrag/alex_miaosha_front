export interface SearchInfo {
	name?: string;
	path?: string;
	title?: string;
	component?: string;
	redirect?: string;
	icon?: string;
	hideInMenu?: string;
	parentId?: number;
	summary?: string;
	status?: string;
	orderBy?: number;
}

export const columns = ref<any>([
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
		title: '是否隐藏菜单',
		dataIndex: 'hideInMenu',
		key: 'hideInMenu',
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

export interface DataItem {
	name: string;
	path: string;
	title: string;
	component: string;
	redirect: string;
	icon: string;
	hideInMenu: string;
	parentId: number;
	summary: string;
	status: string;
	orderBy: number;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}

export const labelMap = ref<any>({
	name: { name: 'name', label: '菜单名称' },
	path: { name: 'path', label: '菜单路径' },
	title: { name: 'title', label: '菜单标题' },
	component: { name: 'component', label: '组件' },
	redirect: { name: 'redirect', label: '跳转' },
	icon: { name: 'icon', label: '菜单图标' },
	hideInMenu: { name: 'hideInMenu', label: '是否隐藏菜单' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '备注' },
	status: { name: 'status', label: '状态' },
	orderBy: { name: 'orderBy', label: '排序' },
});
