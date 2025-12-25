import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '消费券名称',
		dataIndex: 'couponName',
		key: 'couponName',
	},
	{
		title: '核销用户',
		dataIndex: 'userName',
		key: 'userName',
	},
	{
		title: '本次核销数量',
		dataIndex: 'redemptionQuantity',
		key: 'redemptionQuantity',
	},
	{
		title: '核销时间',
		dataIndex: 'redemptionTime',
		key: 'redemptionTime',
	},
	{
		title: '核销备注',
		dataIndex: 'remarks',
		key: 'remarks',
	},
]);

export interface CpnRedemptionRecordInfoData {
	id?: number;
	couponName?: string;
	userName?: string;
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
	remarks: { name: 'remarks', label: '核销备注' },
	couponName: { name: 'couponName', label: '消费券名称' },
	userName: { name: 'userName', label: '核销用户' },
});
