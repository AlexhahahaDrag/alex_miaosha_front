import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';

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
	},
	{
		title: '有效期结束时间',
		dataIndex: 'endDate',
		key: 'endDate',
	},
	{
		title: '消费券单张面值',
		dataIndex: 'unitValue',
		key: 'unitValue',
	},
	{
		title: '最低消费门槛',
		dataIndex: 'minSpend',
		key: 'minSpend',
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
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	couponName: { name: 'couponName', label: '消费券名称' },
	totalQuantity: { name: 'totalQuantity', label: '消费券总发行数量' },
	startDate: { name: 'startDate', label: '有效期开始时间' },
	endDate: { name: 'endDate', label: '有效期结束时间' },
	unitValue: { name: 'unitValue', label: '消费券单张面值' },
	minSpend: { name: 'minSpend', label: '最低消费门槛' },
});
