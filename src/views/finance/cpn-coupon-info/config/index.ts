import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';
import { formatTime } from '@/utils/dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '消费券名称',
		dataIndex: 'couponName',
		key: 'couponName',
	},
	{
		title: '总数量',
		dataIndex: 'remainingQuantity',
		key: 'remainingQuantity',
	},
	{
		title: '有效期',
		dataIndex: 'endDate',
		key: 'endDate',
		customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm'),
	},
	{
		title: '过期状态',
		dataIndex: 'expireStatus',
		key: 'expireStatus',
	},
	{
		title: '消费券面值',
		dataIndex: 'unitValue',
		key: 'unitValue',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface CpnCouponInfoData {
	id?: number;
	couponName?: string;
	totalQuantity?: number;
	startDate?: Dayjs | string;
	endDate?: Dayjs | string;
	unitValue?: number;
	minSpend?: number;
	expireStatus?: string;
	expireRangeStatus?: number;
	remainingQuantity?: number; // AI Agent：剩余数量
	consumedQuantity?: number; // AI Agent：已核销数量
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	couponName: { name: 'couponName', label: '名称' },
	totalQuantity: { name: 'totalQuantity', label: '总数量' },
	startDate: { name: 'startDate', label: '有效期开始时间' },
	endDate: { name: 'endDate', label: '有效期' },
	unitValue: { name: 'unitValue', label: '面值' },
	minSpend: { name: 'minSpend', label: '最低消费门槛' },
});

// AI Agent：使用 lodash-es 的 debounce，避免输入频繁变化导致接口被高频调用
// 获取过期状态颜色
export const getExpireStatusColor = (status: number | undefined): string => {
	if (status === undefined) return 'default';
	switch (status) {
		case 0:
			return 'red';
		case 1:
			return 'green';
		case 2:
			return 'orange';
		default:
			return 'default';
	}
};
