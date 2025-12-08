const labelMap = ref<Record<string, { name: string; label: string }>>({
	permissionCode: { name: 'permissionCode', label: '权限编码' },
	permissionName: { name: 'permissionName', label: '权限名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
	options: { name: 'options', label: 'url' },
});

const rulesRef = reactive({
	permissionCode: [
		{
			required: true,
			message: '权限编码不能为空！',
		},
	],
	permissionName: [
		{
			required: true,
			message: '权限名称不能为空！',
		},
	],
	summary: [
		{
			required: true,
			message: '描述不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	options: [
		{
			required: true,
			message: 'url不能为空！',
		},
	],
});

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

export { labelMap, rulesRef, labelCol, wrapperCol };
