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
		title: '本次核销数量',
		dataIndex: 'redemptionQuantity',
		key: 'redemptionQuantity',
		align: 'center',
		width: 140,
	},
	{
		title: '核销时间',
		dataIndex: 'redemptionTime',
		key: 'redemptionTime',
		align: 'center',
		width: 180,
	},
	{
		title: '核销备注',
		dataIndex: 'remarks',
		key: 'remarks',
		minWidth: 200,
		ellipsis: true,
	},
]);

export interface CpnRedemptionRecordInfoData {
	id?: string;
	couponName?: string;
	userName?: string;
	userId?: string;
	orderId?: string;
	redemptionQuantity?: number;
	redemptionValue?: number;
	redemptionTime?: Dayjs | string;
	merchantId?: string;
	remarks?: string;
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	userCouponId: {
		name: 'userCouponId',
		label: '被核销券实例ID',
	},
	userId: { name: 'userId', label: '核销用户ID' },
	orderId: { name: 'orderId', label: '关联订单ID' },
	redemptionQuantity: {
		name: 'redemptionQuantity',
		label: '本次核销数量',
	},
	redemptionValue: { name: 'redemptionValue', label: '核销面值' },
	redemptionTime: { name: 'redemptionTime', label: '核销时间' },
	merchantId: { name: 'merchantId', label: '核销商家ID' },
	remarks: { name: 'remarks', label: '核销备注' },
	couponName: { name: 'couponName', label: '消费券名称' },
	userName: { name: 'userName', label: '核销用户' },
});
