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
		title: '消费券总发行数量',
		dataIndex: 'totalQuantity',
		key: 'totalQuantity',
	},
	{
		title: '有效期开始时间',
		dataIndex: 'startDate',
		key: 'startDate',
		customRender: ({ text }) => formatTime(text),
	},
	{
		title: '有效期结束时间',
		dataIndex: 'endDate',
		key: 'endDate',
		customRender: ({ text }) => formatTime(text),
	},
	{
		title: '过期状态',
		dataIndex: 'expireStatus',
		key: 'expireStatus',
	},
	{
		title: '消费券单张面值',
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
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	couponName: { name: 'couponName', label: '名称' },
	totalQuantity: { name: 'totalQuantity', label: '消费券总发行数量' },
	startDate: { name: 'startDate', label: '有效期开始时间' },
	endDate: { name: 'endDate', label: '有效期' },
	unitValue: { name: 'unitValue', label: '消费券单张面值' },
	minSpend: { name: 'minSpend', label: '最低消费门槛' },
});
