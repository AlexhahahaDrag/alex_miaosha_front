import { message } from 'ant-design-vue';

export interface PageInfo {
	current?: number;
	pageSize?: number;
	total?: number;
	showTotal: (total: number) => string;
	showSizeChanger: boolean;
	pageSizeOptions: string[];
	size: 'default' | 'small';
	showQuickJumper: boolean;
	defaultPageSize: number;
}

export interface TableConfig<T = unknown, P = unknown> {
	// 数据加载函数
	loadData: (
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
	config: TableConfig<T, P>,
) => {
	const {
		// loadData,
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
	const loading = ref(false);
	const searchParams = ref<P>(initialSearchParams as P);

	// 行选择
	const selectedRowKeys = ref<(string | number)[]>([]);
	const selectedRows = ref<T[]>([]);

	// 行选择配置
	const rowSelection = reactive({
		checkStrictly: false,
		selectedRowKeys: selectedRowKeys,
		onChange: (keys: (string | number)[]) => {
			selectedRowKeys.value = keys;
		},
		onSelect: (record: T, selected: boolean, selectedRows: T[]) => {
			console.log(record, selected, selectedRows);
		},
		onSelectAll: (selected: boolean, selectedRows: T[], changeRows: T[]) => {
			console.log(selected, selectedRows, changeRows);
		},
	});

	// 加载数据
	const loadTableData = async () => {
		loading.value = true;
		try {
			// const {
			// 	code,
			// 	data,
			// 	message: messageInfo,
			// } = await loadData(searchParams.value, pagination);
			// if (code === '200') {
			// 	dataSource.value = data.records;
			// 	pagination.total = data.total;
			// } else {
			// 	message.error(messageInfo || '查询数据失败！');
			// }
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
		loadTableData();
	};

	// 搜索
	const search = (params?: P) => {
		if (params) {
			searchParams.value = { ...searchParams.value, ...params };
		}
		pagination.current = 1;
		loadTableData();
	};

	// 重置搜索
	const resetSearch = () => {
		searchParams.value = initialSearchParams;
		pagination.current = 1;
		loadTableData();
	};

	// 刷新数据
	const refresh = () => {
		loadTableData();
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
	const updatePagination = (config: Partial<PageInfo>) => {
		Object.assign(pagination, config);
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
	if (autoLoad) {
		onMounted(() => {
			loadTableData();
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
