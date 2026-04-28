import type { TableColumnsType } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form/interface';
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
	id?: string;
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
	infoDateStart?: Dayjs | string;
	infoDateEnd?: Dayjs | string;
}

export const fromSourceTransferList = [
	{ value: 'xj', label: 'cash', name: '现金' },
	{ value: 'yhk', label: 'card', name: '银行卡' },
	{ value: 'zfb', label: 'zhifubao', name: '支付宝' },
	{ value: 'wx', label: 'weChat', name: '微信' },
	{ value: 'mt', label: 'meituan', name: '美团' },
	{ value: 'hb', label: 'huabei', name: '花呗' },
	{ value: 'bt', label: 'whiteBar', name: '白条' },
	{ value: 'hf', label: 'telCharge', name: '话费' },
	{ value: 'rqf', label: 'gasCharge', name: '燃气费' },
	{ value: 'sf', label: 'waterCharge', name: '水费' },
	{ value: 'df', label: 'electricCharge', name: '电费' },
	{ value: 'jd', label: 'jingdong', name: '京东' },
	{ value: 'other', label: 'other', name: '其他' },
];

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };

// 明细表单校验规则
export const rulesRef: Record<string, Rule[]> = {
	name: [{ required: true, message: '名称不能为空！' }],
	amount: [{ required: true, message: '金额不能为空！' }],
	typeCode: [{ required: true, message: '类别不能为空！' }],
	fromSource: [{ required: true, message: '支付方式不能为空！' }],
	incomeAndExpenses: [{ required: true, message: '收支类型不能为空！' }],
	isValid: [{ required: true, message: '状态不能为空！' }],
	infoDate: [{ required: true, message: '业务时间不能为空！' }],
	belongTo: [{ required: true, message: '属于不能为空！' }],
};
