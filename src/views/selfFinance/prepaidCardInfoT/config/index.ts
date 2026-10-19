import type { Dayjs } from '@/utils/dayjs';
import type { TableColumnsType } from 'ant-design-vue';

// 充值/消费表单
export interface IRechargeForm {
	id?: string;
	cardId?: string;
	cardName?: string;
	consumeAmount?: number;
	type?: string;
	userId?: string;
	description?: string;
}

// 交易流水表格列定义（对应 PrepaidConsumeRecordTVo）
export const columns = ref<TableColumnsType>([
	{
		title: '储值卡名称',
		dataIndex: 'cardName',
		key: 'cardName',
		width: 160,
	},
	{
		title: '交易类型',
		dataIndex: 'type',
		key: 'type',
		align: 'center',
		width: 110,
	},
	{
		title: '变动金额',
		dataIndex: 'amount',
		key: 'amount',
		align: 'right',
		width: 140,
	},
	{
		title: '变动后余额',
		dataIndex: 'balanceAfter',
		key: 'balanceAfter',
		align: 'right',
		width: 140,
	},
	{
		title: '交易流水号',
		dataIndex: 'orderNo',
		key: 'orderNo',
		width: 190,
		ellipsis: true,
	},
	{
		title: '交易描述 / 商户',
		dataIndex: 'description',
		key: 'description',
		minWidth: 180,
		ellipsis: true,
	},
	{
		title: '交易时间',
		dataIndex: 'consumeTime',
		key: 'consumeTime',
		align: 'center',
		width: 170,
	},
]);

export interface PrepaidCardInfoTData {
	id?: string;
	cardId?: string;
	cardName?: string;
	userId?: string;
	initialBalance?: number;
	currentBalance?: number;
	expireDate?: Dayjs | string;
	cardStatus?: string;
	version?: number;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
