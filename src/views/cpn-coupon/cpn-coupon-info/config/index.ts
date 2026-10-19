import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from '@/utils/dayjs';
import { formatTime } from '@/utils/dayjs';
import { rulesRef } from '@/views/cpn-coupon/cpn-coupon-info/cpn-coupon-info-detail/config';

export { rulesRef };

export const columns = ref<TableColumnsType>([
	{
		title: '消费券名称',
		dataIndex: 'couponName',
		key: 'couponName',
		width: 220,
		ellipsis: true,
	},
	{
		title: '面值 / 门槛',
		dataIndex: 'unitValue',
		key: 'unitValue',
		align: 'right',
		width: 150,
	},
	{
		title: '剩余 / 发行量',
		dataIndex: 'remainingQuantity',
		key: 'remainingQuantity',
		align: 'center',
		width: 150,
	},
	{
		title: '有效期至',
		dataIndex: 'endDate',
		key: 'endDate',
		align: 'center',
		width: 170,
		customRender: ({ text }) =>
			text ? formatTime(text, 'YYYY-MM-DD HH:mm') : '—',
	},
	{
		title: '临期状态',
		dataIndex: 'expireStatus',
		key: 'expireStatus',
		align: 'center',
		width: 130,
	},
	{
		title: '支付状态',
		dataIndex: 'paymentStatus',
		key: 'paymentStatus',
		align: 'center',
		width: 110,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 185,
	},
]);

export interface CpnCouponInfoData {
	id?: string;
	couponName?: string;
	totalQuantity?: number;
	startDate?: Dayjs | string;
	endDate?: Dayjs | string;
	unitValue?: number;
	minSpend?: number;
	expireStatus?: string;
	expireRangeStatus?: number;
	remainingQuantity?: number;
	consumedQuantity?: number;
	paymentStatus?: number;
	onlyValidAndNotFullyRedeemed?: boolean | null;
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	couponName: { name: 'couponName', label: '消费券名称' },
	totalQuantity: { name: 'totalQuantity', label: '发行总数量' },
	startDate: { name: 'startDate', label: '有效期开始时间' },
	endDate: { name: 'endDate', label: '有效期截止时间' },
	unitValue: { name: 'unitValue', label: '消费券面值' },
	minSpend: { name: 'minSpend', label: '最低消费门槛' },
	paymentStatus: { name: 'paymentStatus', label: '支付状态' },
	onlyValidAndNotFullyRedeemed: {
		name: 'onlyValidAndNotFullyRedeemed',
		label: '有效状态',
	},
});

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
