const labelMap = ref<Record<string, { name: string; label: string }>>({
	orgCode: { name: 'orgCode', label: '机构编码' },
	orgName: { name: 'orgName', label: '机构名称' },
	orgShortName: { name: 'orgShortName', label: '机构简称' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '简介最多150字' },
	status: { name: 'status', label: '状态' },
});

const rulesRef = reactive({
	orgCode: [
		{
			required: true,
			message: '机构编码不能为空！',
		},
	],
	orgName: [
		{
			required: true,
			message: '机构名称不能为空！',
		},
	],
	orgShortName: [
		{
			required: true,
			message: '机构简称不能为空！',
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
			message: '简介最多150字不能为空！',
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

export { labelMap, labelCol, wrapperCol, rulesRef };
