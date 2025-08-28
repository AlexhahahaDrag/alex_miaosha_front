export interface SearchInfo {
	name?: string;
	typeCode?: string;
	fromSource?: string;
	isValid?: number;
	pageNo?: number;
	pageSize?: number;
	incomeAndExpenses?: string;
	belongTo?: number;
	infoDateStart?: string | null;
	infoDateEnd?: string | null;
}

export const columns = ref<any>([
	// {
	//   title: "id",
	//   dataIndex: "id",
	//   key: "id",
	// },
	{
		title: '名称',
		dataIndex: 'name',
		key: 'name',
		// width: '6',
	},
	{
		title: '类别',
		dataIndex: 'typeCode',
		key: 'typeCode',
		// width: '4',
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
		// width: '4',
		key: 'fromSource',
	},
	{
		title: '收支类型',
		dataIndex: 'incomeAndExpenses',
		align: 'center',
		// width: '4',
		key: 'incomeAndExpenses',
	},
	{
		title: '属于',
		dataIndex: 'belongToName',
		// width: '4',
		key: 'belongToName',
	},
	{
		title: '状态',
		dataIndex: 'isValid',
		align: 'center',
		// width: '4',
		key: 'isValid',
	},
	{
		title: '业务时间',
		dataIndex: 'infoDate',
		key: 'infoDate',
		// width: '15',
	},
	{
		title: '操作',
		key: 'operation',
		// fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	name: string;
	typeCode: string;
	typeName: string;
	amount: number;
	fromSource: string;
	fromSourceName: string;
	isValid: number;
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
