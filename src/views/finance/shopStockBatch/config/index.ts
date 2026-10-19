import type { Dayjs } from '@/utils/dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '批次编码',
		dataIndex: 'batchCode',
		key: 'batchCode',
		width: 170,
	},
	{
		title: '批次名称',
		dataIndex: 'batchName',
		key: 'batchName',
		width: 220,
		ellipsis: true,
	},
	{
		title: '货品成本',
		dataIndex: 'cost',
		key: 'cost',
		width: 130,
		align: 'right',
	},
	{
		title: '差旅费用',
		dataIndex: 'travelExpense',
		key: 'travelExpense',
		width: 130,
		align: 'right',
	},
	{
		title: '进货日期',
		dataIndex: 'purchaseDate',
		key: 'purchaseDate',
		width: 150,
		align: 'center',
	},
	{
		title: '有效状态',
		dataIndex: 'isValid',
		key: 'isValid',
		width: 110,
		align: 'center',
	},
	{
		title: '批次描述',
		dataIndex: 'description',
		key: 'description',
		width: 220,
		ellipsis: true,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
		align: 'center',
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
	purchaseDate?: Dayjs | string;
}

export const DEFAULT_VALID_OPTIONS = [
	{ typeCode: '1', typeName: '有效' },
	{ typeCode: '0', typeName: '失效' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	batchCode: { name: 'batchCode', label: '批次编码' },
	batchName: { name: 'batchName', label: '批次名称' },
	isValid: { name: 'isValid', label: '有效状态' },
	description: { name: 'description', label: '批次描述' },
	cost: { name: 'cost', label: '货品成本 (元)' },
	travelExpense: { name: 'travelExpense', label: '差旅费用 (元)' },
	purchaseDate: { name: 'purchaseDate', label: '进货日期' },
});

export const rulesRef = reactive({
	batchCode: [{ required: true, message: '批次编码不能为空！' }],
	batchName: [{ required: true, message: '批次名称不能为空！' }],
	isValid: [{ required: true, message: '有效状态不能为空！' }],
	description: [{ required: true, message: '批次描述不能为空！' }],
});
