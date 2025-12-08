const labelMap = ref<Record<string, { name: string; label: string }>>({
	roleCode: { name: 'roleCode', label: '角色编码' },
	roleName: { name: 'roleName', label: '角色名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
});

const rulesRef = reactive({
	roleCode: [
		{
			required: true,
			message: '角色编码不能为空！',
		},
	],
	roleName: [
		{
			required: true,
			message: '角色名称不能为空！',
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
});

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

export { labelMap, rulesRef, labelCol, wrapperCol };
