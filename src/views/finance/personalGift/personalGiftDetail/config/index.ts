import type { Rule } from 'ant-design-vue/es/form';

export const labelMap: Record<string, { name: string; label: string }> = {
	eventName: { name: 'eventName', label: '事件名称' },
	amount: { name: 'amount', label: '金额' },
	otherPerson: { name: 'otherPerson', label: '其他人' },
	eventTime: { name: 'eventTime', label: '随礼时间' },
	remarks: { name: 'remarks', label: '备注' },
	action: { name: 'action', label: '动作' },
	noticeNum: { name: 'noticeNum', label: '通知次数' },
};

export const rulesRef: Record<string, Rule[]> = {
	eventName: [
		{
			required: true,
			message: '事件名称不能为空！',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
		},
	],
	otherPerson: [
		{
			required: true,
			message: '其他人不能为空！',
		},
	],
	eventTime: [
		{
			required: true,
			message: '随礼时间不能为空！',
		},
	],
	action: [
		{
			required: true,
			message: '动作不能为空！',
		},
	],
};

export const labelCol: { span: number } = { span: 5 };

export const wrapperCol: { span: number } = { span: 19 };
