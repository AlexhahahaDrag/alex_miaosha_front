const labelMap = ref<Record<string, { name: string; label: string }>>({
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

const rulesRef = reactive({
	name: [
		{
			required: true,
			message: '菜单名称不能为空！',
		},
	],
	path: [
		{
			required: true,
			message: '菜单路径不能为空！',
		},
	],
	title: [
		{
			required: true,
			message: '菜单标题不能为空！',
		},
	],
	component: [
		{
			required: true,
			message: '组件不能为空！',
		},
	],
	redirect: [
		{
			required: true,
			message: '跳转不能为空！',
		},
	],
	icon: [
		{
			required: true,
			message: '菜单图标不能为空！',
		},
	],
	hideInMenu: [
		{
			required: true,
			message: '是否隐藏菜单不能为空！',
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
			message: '备注不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	orderBy: [
		{
			required: true,
			message: '排序不能为空！',
		},
	],
});

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

export { labelMap, labelCol, wrapperCol, rulesRef };
