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
		title: '状态',
		dataIndex: 'status',
		key: 'status',
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
	userId: { name: 'userId', label: '领取用户ID' },
	couponId: {
		name: 'couponId',
		label: '对应的消费券ID (外键关联 cpn_coupon_info_t.id)',
	},
	status: { name: 'status', label: '状态（UNUSED, USED, EXPIRED）' },
	receiveTime: { name: 'receiveTime', label: '领取时间' },
	expireTime: { name: 'expireTime', label: '有效期截止时间' },
});
