import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	name?: string;
	avliDate?: Dayjs | string;
	amount?: number;
	account?: string;
}

export const columns = [
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
];

export interface DataItem {
	name: string;
	avliDate?: Dayjs | string;
	amount: number;
	account: string;
	isSend: number;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}
