import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '被核销的券实例ID (外键关联 cpn_user_coupon_info_t.id)',
		dataIndex: 'userCouponId',
		key: 'userCouponId',
	},
	{
		title: '核销用户ID',
		dataIndex: 'userId',
		key: 'userId',
	},
	{
		title: '关联的订单ID',
		dataIndex: 'orderId',
		key: 'orderId',
	},
	{
		title: '本次核销数量 (固定为1)',
		dataIndex: 'redemptionQuantity',
		key: 'redemptionQuantity',
	},
	{
		title: '核销券的面值（参考）',
		dataIndex: 'redemptionValue',
		key: 'redemptionValue',
	},
	{
		title: '核销时间',
		dataIndex: 'redemptionTime',
		key: 'redemptionTime',
	},
	{
		title: '核销商家ID',
		dataIndex: 'merchantId',
		key: 'merchantId',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface CpnRedemptionRecordInfoData {
	id?: number;
	userCouponId?: number;
	userId?: number;
	orderId?: number;
	redemptionQuantity?: number;
	redemptionValue?: number;
	redemptionTime?: Dayjs | string;
	merchantId?: number;
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	userCouponId: {
		name: 'userCouponId',
		label: '被核销的券实例ID (外键关联 cpn_user_coupon_info_t.id)',
	},
	userId: { name: 'userId', label: '核销用户ID' },
	orderId: { name: 'orderId', label: '关联的订单ID' },
	redemptionQuantity: {
		name: 'redemptionQuantity',
		label: '本次核销数量 (固定为1)',
	},
	redemptionValue: { name: 'redemptionValue', label: '核销券的面值（参考）' },
	redemptionTime: { name: 'redemptionTime', label: '核销时间' },
	merchantId: { name: 'merchantId', label: '核销商家ID' },
});
