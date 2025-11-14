import type { Rule } from 'ant-design-vue/es/form';
import type { Dayjs } from 'dayjs';
import { ref } from 'vue';

// 表单验证规则
export const rulesRef: Record<string, Rule[]> = {
	eventName: [
		{
			required: true,
			message: '事件名称不能为空！',
			trigger: 'blur',
		},
	],
	amount: [
		{
			required: true,
			message: '金额不能为空！',
			trigger: 'blur',
		},
	],
	otherPerson: [
		{
			required: true,
			message: '其他人不能为空！',
			trigger: 'blur',
		},
	],
	eventTime: [
		{
			required: true,
			message: '随礼时间不能为空！',
			trigger: 'change',
		},
	],
	action: [
		{
			required: true,
			message: '动作不能为空！',
			trigger: 'change',
		},
	],
};

export interface PersonalGiftInfo {
	id?: number;
	contactsUserId?: number;
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
