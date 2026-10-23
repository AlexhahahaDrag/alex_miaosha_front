import { message } from 'ant-design-vue';
import type { PageInfo } from './usePagination';

export interface TableConfig<T = unknown, P = unknown> {
	// 数据加载函数
	loadData?: (
		params: P,
		pagination: PageInfo,
	) => Promise<{
		code: string;
		data: {
			records: T[];
			current: number;
			size: number;
			total: number;
		};
		message?: string;
	}>;
	// 初始搜索参数
	initialSearchParams?: P;
	// 分页配置
	paginationConfig?: Partial<PageInfo>;
	// 是否自动加载数据
	autoLoad?: boolean;
}

export const useTable = <T = unknown, P = unknown>(
	config: TableConfig<T, P> = {},
) => {
	const {
		loadData,
		initialSearchParams = {},
		paginationConfig = {},
		autoLoad = true,
	} = config;

	// 分页配置
	const defaultPaginationConfig: PageInfo = {
		total: 0,
		current: 1,
		pageSize: 10,
		showTotal: (total: number) => `共 ${total} 条`,
		showSizeChanger: true,
		pageSizeOptions: ['10', '20', '50', '100'],
		size: 'small',
		showQuickJumper: true,
		defaultPageSize: 10,
	};

	const pagination = reactive<PageInfo>({
		...defaultPaginationConfig,
		...paginationConfig,
	});

	// 表格数据
	const dataSource = ref<T[]>([]);
	const loading = ref<boolean>(false);
	const searchParams = ref<P>(initialSearchParams as P);

	// 行选择（强制保持为 string 保证雪花 ID 安全）
	const selectedRowKeys = ref<string[]>([]);
	const selectedRows = ref<T[]>([]);

	// 行选择配置
	const rowSelection = reactive({
		checkStrictly: false,
		selectedRowKeys: selectedRowKeys,
		onChange: (keys: (string | number)[], rows?: T[]) => {
			selectedRowKeys.value = keys.map(String);
			if (rows) {
				selectedRows.value = rows;
			}
		},
		onSelect: (record: T, selected: boolean, selectedRowsList: T[]) => {
			console.log(record, selected, selectedRowsList);
		},
		onSelectAll: (selected: boolean, selectedRowsList: T[], changeRows: T[]) => {
			console.log(selected, selectedRowsList, changeRows);
		},
	});

	// 加载数据
	const loadTableData = async () => {
		if (!loadData) return;
		loading.value = true;
		try {
			const res = await loadData(searchParams.value as P, pagination);
			const { code, data, message: messageInfo } = res || {};
			if (code === '200' && data) {
				dataSource.value = data.records;
				pagination.total = data.total;
			} else if (messageInfo) {
				message.error(messageInfo);
			}
		} catch (error: unknown) {
			console.error('加载数据时发生错误:', error);
			message.error('加载数据时发生错误');
		} finally {
			loading.value = false;
		}
	};

	// 分页变化处理
	const handleTableChange = (paginationInfo: PageInfo) => {
		pagination.current = paginationInfo.current;
		pagination.pageSize = paginationInfo.pageSize;
		void loadTableData();
	};

	// 搜索
	const search = (params?: P) => {
		if (params) {
			searchParams.value = { ...searchParams.value, ...params };
		}
		pagination.current = 1;
		void loadTableData();
	};

	// 重置搜索
	const resetSearch = () => {
		searchParams.value = initialSearchParams as P;
		pagination.current = 1;
		void loadTableData();
	};

	// 刷新数据
	const refresh = () => {
		void loadTableData();
	};

	// 重置分页
	const resetPagination = () => {
		pagination.current = 1;
		pagination.total = 0;
	};

	// 设置总数
	const setTotal = (total: number) => {
		pagination.total = total;
	};

	// 设置当前页
	const setCurrent = (current: number) => {
		pagination.current = current;
	};

	// 设置每页条数
	const setPageSize = (pageSize: number) => {
		pagination.pageSize = pageSize;
	};

	// 获取分页参数（用于API调用）
	const getPaginationParams = () => {
		return {
			pageNum: pagination.current,
			pageSize: pagination.pageSize,
		};
	};

	// 更新分页配置
	const updatePagination = (configUpdate: Partial<PageInfo>) => {
		Object.assign(pagination, configUpdate);
	};

	// 清空选择
	const clearSelection = () => {
		selectedRowKeys.value = [];
		selectedRows.value = [];
	};

	// 获取选中的行数据
	const getSelectedRows = () => {
		return selectedRows.value;
	};

	// 获取选中的行键
	const getSelectedRowKeys = () => {
		return selectedRowKeys.value;
	};

	// 自动加载数据
	if (autoLoad && loadData) {
		onMounted(() => {
			void loadTableData();
		});
	}

	return {
		// 数据
		dataSource,
		loading,
		searchParams,
		pagination,

		// 选择
		selectedRowKeys,
		selectedRows,
		rowSelection,

		// 方法
		loadTableData,
		handleTableChange,
		search,
		resetSearch,
		refresh,
		resetPagination,
		setTotal,
		setCurrent,
		setPageSize,
		getPaginationParams,
		updatePagination,
		clearSelection,
		getSelectedRows,
		getSelectedRowKeys,
	};
};
