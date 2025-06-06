import { Dayjs } from 'dayjs';
export interface SearchInfo {
	cardId?: number;
	cardName?: string;
	userId?: string;
	initialBalance?: number;
	currentBalance?: number;
	expireDate?: Dayjs | string;
	cardStatus?: string;
	version?: number;
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

export interface DataItem {
	cardId: number;
	cardName: string;
	userId: string;
	initialBalance: number;
	currentBalance: number;
	expireDate: Dayjs | string;
	cardStatus: string;
	version: number;
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
