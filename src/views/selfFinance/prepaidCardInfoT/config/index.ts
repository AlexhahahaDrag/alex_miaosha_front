import type { Dayjs } from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';

// 充值表单
export interface IRechargeForm {
	id?: string;
	cardId?: string;
	cardName?: string;
	consumeAmount?: number;
	type?: string;
	userId?: number;
	description?: string;
}

// 表格列定义
export const columns = ref<TableColumnsType>([
	{
		title: '卡号（业务唯一标识）',
		dataIndex: 'cardId',
		key: 'cardId',
	},
	{
		title: '卡名称',
		dataIndex: 'cardName',
		key: 'cardName',
	},
	{
		title: '持卡人ID',
		dataIndex: 'userId',
		key: 'userId',
	},
	{
		title: '初始金额',
		dataIndex: 'initialBalance',
		key: 'initialBalance',
	},
	{
		title: '当前余额',
		dataIndex: 'currentBalance',
		key: 'currentBalance',
	},
	{
		title: '过期日期',
		dataIndex: 'expireDate',
		key: 'expireDate',
	},
	{
		title: '状态（正常/冻结/挂失/过期）',
		dataIndex: 'cardStatus',
		key: 'cardStatus',
	},
	{
		title: '版本',
		dataIndex: 'version',
		key: 'version',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface PrepaidCardInfoTData {
	cardId?: number;
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
