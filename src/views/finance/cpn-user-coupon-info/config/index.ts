import type { TableColumnsType } from 'ant-design-vue';

import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '领取用户ID',
		dataIndex: 'userId',
		key: 'userId',
	},
	{
		title: '对应的消费券ID (外键关联 cpn_coupon_info_t.id)',
		dataIndex: 'couponId',
		key: 'couponId',
	},
	{
		title: '状态（UNUSED, USED, EXPIRED）',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: '领取时间',
		dataIndex: 'receiveTime',
		key: 'receiveTime',
	},
	{
		title: '有效期截止时间',
		dataIndex: 'expireTime',
		key: 'expireTime',
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
	couponId?: number;
	status?: string;
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
