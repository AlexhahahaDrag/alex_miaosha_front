import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from '@/utils/dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '账户/卡券名称',
		dataIndex: 'name',
		key: 'name',
		width: 220,
		ellipsis: true,
	},
	{
		title: '关联账号',
		dataIndex: 'accountName',
		key: 'accountName',
		width: 160,
	},
	{
		title: '面额 / 余额',
		dataIndex: 'amount',
		key: 'amount',
		align: 'right',
		width: 140,
	},
	{
		title: '有效期至',
		dataIndex: 'avliDate',
		key: 'avliDate',
		align: 'center',
		width: 150,
	},
	{
		title: '到期提醒',
		dataIndex: 'isSend',
		key: 'isSend',
		align: 'center',
		width: 110,
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		align: 'center',
		width: 120,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		align: 'center',
		width: 170,
	},
]);

export interface AccountRecordInfo {
	id?: string;
	name?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
	accountName?: string;
	isSend?: number;
	status?: number | string;
	infoDateStart?: Dayjs | string;
	infoDateEnd?: Dayjs | string;
}

export const labelCol: { span: number } = { span: 5 };
export const wrapperCol: { span: number } = { span: 19 };
