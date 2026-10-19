import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from '@/utils/dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '消费券名称',
		dataIndex: 'couponName',
		key: 'couponName',
		width: 240,
		ellipsis: true,
	},
	{
		title: '核销用户',
		dataIndex: 'userName',
		key: 'userName',
		width: 160,
	},
	{
		title: '核销数量',
		dataIndex: 'redemptionQuantity',
		key: 'redemptionQuantity',
		align: 'center',
		width: 130,
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		align: 'center',
		width: 130,
	},
	{
		title: '核销时间',
		dataIndex: 'receiveTime',
		key: 'receiveTime',
		align: 'center',
		width: 180,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 140,
	},
]);

export interface CpnUserCouponInfoData {
	id?: string;
	userId?: string;
	userName?: string;
	couponId?: string;
	couponName?: string;
	status?: string;
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

export interface CpnUserCouponRedeemReq {
	userId: string;
	couponId: string;
	userCouponId?: string;
	redemptionQuantity: number;
	remarks?: string;
}
