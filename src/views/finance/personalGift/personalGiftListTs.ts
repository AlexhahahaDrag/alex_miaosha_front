import type { Dayjs } from 'dayjs';
export interface SearchInfo {
	eventName?: string;
	amount?: number;
	otherPerson?: string;
	eventTime?: Dayjs | string;
	remarks?: string;
	action?: number;
	noticeNum?: number;
}

export const columns = ref<any>([
	{
		title: '事件名称',
		dataIndex: 'eventName',
		key: 'eventName',
	},
	{
		title: '其他人',
		dataIndex: 'otherPerson',
		key: 'otherPerson',
	},
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
	},
	{
		title: '动作',
		dataIndex: 'action',
		key: 'action',
	},
	{
		title: '随礼时间',
		dataIndex: 'eventTime',
		key: 'eventTime',
	},
	{
		title: '备注',
		dataIndex: 'remarks',
		key: 'remarks',
	},
	{
		title: '通知次数',
		dataIndex: 'noticeNum',
		key: 'noticeNum',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	eventName: string;
	amount: number;
	otherPerson: string;
	eventTime?: Dayjs | string;
	remarks: string;
	action: number;
	noticeNum: number;
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
