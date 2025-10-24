import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

const columns = ref<TableColumnsType>([
	{
		title: '名称',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
	},
	{
		title: '账号',
		dataIndex: 'accountName',
		key: 'accountName',
	},
	{
		title: '有效期',
		dataIndex: 'avliDate',
		key: 'avliDate',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: '操作',
		key: 'operation',
		// fixed: 'right',
		width: '8',
	},
]);

interface AccountRecordInfo {
	id?: number;
	name?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
	isSend?: number;
	status?: string;
	infoDateStart?: Dayjs | string;
	infoDateEnd?: Dayjs | string;
}

const labelCol: { span: number } = { span: 5 };
const wrapperCol: { span: number } = { span: 19 };

export { AccountRecordInfo, columns, labelCol, wrapperCol };
