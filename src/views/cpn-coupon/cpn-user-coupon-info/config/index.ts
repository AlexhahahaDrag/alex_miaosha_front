import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '消费券',
		dataIndex: 'couponName',
		key: 'couponName',
	},
	{
		title: '核销用户',
		dataIndex: 'userName',
		key: 'userName',
	},
	{
		title: '核销数量',
		dataIndex: 'redemptionQuantity',
		key: 'redemptionQuantity',
	},
	{
		title: '核销时间',
		dataIndex: 'receiveTime',
		key: 'receiveTime',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface CpnUserCouponInfoData {
	id?: number;
	userId?: number;
	// AI Agent：关联用户表返回
	userName?: string;
	couponId?: number;
	// AI Agent：关联消费券表返回
	couponName?: string;
	status?: string;
	// AI Agent：按数量核销本次消耗数量
	redemptionQuantity?: number;
	receiveTime?: Dayjs | string;
	expireTime?: Dayjs | string;
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	userName: { name: 'userName', label: '核销用户' },
	couponName: { name: 'couponName', label: '消费券' },
	redemptionQuantity: { name: 'redemptionQuantity', label: '核销数量' },
	receiveTime: { name: 'receiveTime', label: '核销时间' },
});

// AI Agent：消费券核销数量请求（按数量核销）
export interface CpnUserCouponRedeemReq {
	userId: number;
	couponId: number;
	// AI Agent：券明细ID（对应后端 userCouponId，用于取消核销）
	userCouponId?: number;
	redemptionQuantity: number;
	remarks?: string;
	// 其他后端支持的字段（如 orderId/merchantId/redemptionValue/redemptionTime）暂不在该页面使用
}
