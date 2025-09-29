import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '名称',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: '类别',
		dataIndex: 'typeCode',
		key: 'typeCode',
	},
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
		align: 'center',
		width: '4',
	},
	{
		title: '支付方式',
		dataIndex: 'fromSource',
		align: 'center',
		key: 'fromSource',
	},
	{
		title: '收支类型',
		dataIndex: 'incomeAndExpenses',
		align: 'center',
		key: 'incomeAndExpenses',
	},
	{
		title: '属于',
		dataIndex: 'belongToName',
		key: 'belongToName',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		align: 'center',
		key: 'isValid',
	},
	{
		title: '业务时间',
		dataIndex: 'infoDate',
		key: 'infoDate',
	},
	{
		title: '操作',
		key: 'operation',
		// fixed: 'right',
		width: '8',
	},
]);

export interface FinanceManagerData {
	id?: number;
	name?: string;
	typeCode?: string;
	typeName?: string;
	amount?: number;
	fromSource?: string;
	fromSourceName?: string;
	isValid?: string;
	infoDate?: Dayjs | string;
	incomeAndExpenses?: string;
	belongTo?: string;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash' },
	{ value: 'yhk', label: 'card' },
	{ value: 'zfb', label: 'zhifubao' },
	{ value: 'wx', label: 'weChat' },
	{ value: 'mt', label: 'meituan' },
	{ value: 'hb', label: 'huabei' },
	{ value: 'bt', label: 'whiteBar' },
	{ value: 'hf', label: 'telCharge' },
	{ value: 'rqf', label: 'gasCharge' },
	{ value: 'sf', label: 'waterCharge' },
	{ value: 'df', label: 'electricCharge' },
	{ value: 'jd', label: 'jingdong' },
	{ value: 'other', label: '' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
