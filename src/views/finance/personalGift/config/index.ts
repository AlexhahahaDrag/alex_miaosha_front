import type { Dayjs } from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
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

export interface PersonalGiftInfo {
	id?: number;
	eventName?: string;
	amount?: number;
	otherPerson?: string;
	eventTime?: Dayjs | string;
	remarks?: string;
	action?: number;
	noticeNum?: number;
}

// 表单布局配置
export const labelCol = ref({ span: 5 });
// 表单布局配置
export const wrapperCol = ref({ span: 19 });

// 表单标签映射
export const labelMap = ref<Record<string, { name: string; label: string }>>({
	eventName: { name: 'eventName', label: '事件名称' },
	amount: { name: 'amount', label: '金额' },
	otherPerson: { name: 'otherPerson', label: '其他人' },
	eventTime: { name: 'eventTime', label: '随礼时间' },
	remarks: { name: 'remarks', label: '备注' },
	action: { name: 'action', label: '动作' },
	noticeNum: { name: 'noticeNum', label: '通知次数' },
});
