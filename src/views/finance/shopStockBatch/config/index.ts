import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '订单编码',
		dataIndex: 'batchCode',
		key: 'batchCode',
	},
	{
		title: '订单名称',
		dataIndex: 'batchName',
		key: 'batchName',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		key: 'isValid',
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '成本',
		dataIndex: 'cost',
		key: 'cost',
	},
	{
		title: '差旅费',
		dataIndex: 'travelExpense',
		key: 'travelExpense',
	},
	{
		title: '进货日期',
		dataIndex: 'purchaseDate',
		key: 'purchaseDate',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface ShopStockBatchData {
	id?: string;
	batchCode?: string;
	batchName?: string;
	isValid?: string;
	description?: string;
	cost?: number;
	travelExpense?: number;
	purchaseDate?: string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	batchCode: { name: 'batchCode', label: '订单编码' },
	batchName: { name: 'batchName', label: '订单名称' },
	isValid: { name: 'isValid', label: '状态' },
	description: { name: 'description', label: '描述' },
	cost: { name: 'cost', label: '成本' },
	travelExpense: { name: 'travelExpense', label: '差旅费' },
	purchaseDate: { name: 'purchaseDate', label: '进货日期' },
});

export const rulesRef = reactive({
	batchCode: [
		{
			required: true,
			message: '订单编码不能为空！',
		},
	],
	batchName: [
		{
			required: true,
			message: '订单名称不能为空！',
		},
	],
	isValid: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
	description: [
		{
			required: true,
			message: '描述不能为空！',
		},
	],
	cost: [
		{
			required: false,
			message: '成本不能为空！',
		},
	],
	travelExpense: [
		{
			required: false,
			message: '差旅费不能为空！',
		},
	],
	purchaseDate: [
		{
			required: false,
			message: '进货日期不能为空！',
		},
	],
});
