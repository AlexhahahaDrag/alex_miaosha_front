import { Dayjs } from 'dayjs';
export interface SearchInfo {
	cardId?: number;
	orderNo?: string;
	amount?: number;
	balanceAfter?: number;
	merchantName?: string;
	consumeTime?: Dayjs | string;
	description?: string;
}

export interface pageInfo {
	current?: number;
	pageSize?: number;
	total?: number;
	showTotal: Function;
	showSizeChanger: boolean;
	pageSizeOptions: string[];
	showSizeChange: Function;
	size: string;
	showQuickJumper: boolean;
	defaultPageSize: number;
}

export let pagination = ref<any>({
	// 数据总数
	total: 0,
	// 当前页数
	current: 1,
	// 每页条数
	pageSize: 10,
	// 展示总数
	showTotal: (total: number) => `共 ${total} 条`,
	// 是否可以改变pageSize
	showSizeChanger: true,
	// 设置每页可以展示多少条的选项
	pageSizeOptions: ['10', '20', '50', '100'],
	// 改变pageSize后触发
	showSizeChange: (current: number, pageSize: any) => (
		(pagination.value.current = current), (pagination.value.pageSize = pageSize)
	),
	// 小尺寸分页
	size: 'small',
	// 是否可以快速跳转至某页
	showQuickJumper: true,
	//默认条数
	defaultPageSize: 10,
});

export const columns = ref<any>([
	{
		title: '卡号（关联prepaid_card_info_t.card_id）',
		dataIndex: 'cardId',
		key: 'cardId',
	},
	{
		title: '交易流水号（业务唯一）',
		dataIndex: 'orderNo',
		key: 'orderNo',
	},
	{
		title: '交易金额（正消费，负充值）',
		dataIndex: 'amount',
		key: 'amount',
	},
	{
		title: '交易后余额',
		dataIndex: 'balanceAfter',
		key: 'balanceAfter',
	},
	{
		title: '商户名称',
		dataIndex: 'merchantName',
		key: 'merchantName',
	},
	{
		title: '交易时间',
		dataIndex: 'consumeTime',
		key: 'consumeTime',
	},
	{
		title: '交易描述',
		dataIndex: 'description',
		key: 'description',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: '8',
	},
]);

export interface DataItem {
	cardId: number;
	orderNo: string;
	amount: number;
	balanceAfter: number;
	merchantName: string;
	consumeTime?: Dayjs | string;
	description: string;
}

export interface ModelInfo {
	title?: string;
	width?: string;
	id?: number | undefined;
	confirmLoading?: boolean;
}

export interface dictInfo {
	typeCode?: string | number | undefined;
	typeName?: string | undefined;
}
