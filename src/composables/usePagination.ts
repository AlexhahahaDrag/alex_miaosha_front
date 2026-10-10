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

export interface UsePaginationOptions extends Partial<PageInfo> {
	/** 分页或每页条数变化时的业务回调（如触发 query 查询） */
	onChange?: (pagination: PageInfo) => void;
}

export const usePagination = (initialConfig?: UsePaginationOptions) => {
	// 默认配置
	const defaultConfig: PageInfo = {
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

	const { onChange, ...restConfig } = initialConfig || {};

	// 合并配置
	const paginationConfig = reactive<PageInfo>({
		...defaultConfig,
		...restConfig,
	});

	// 分页变化处理
	const handleTableChange = (pagination: PageInfo) => {
		paginationConfig.current = pagination.current;
		paginationConfig.pageSize = pagination.pageSize;
		if (onChange) {
			onChange(pagination);
		}
	};

	// 重置分页
	const resetPagination = () => {
		paginationConfig.current = 1;
		paginationConfig.total = 0;
	};

	// 设置总数
	const setTotal = (total: number) => {
		paginationConfig.total = total;
	};

	// 设置当前页
	const setCurrent = (current: number) => {
		paginationConfig.current = current;
	};

	// 设置每页条数
	const setPageSize = (pageSize: number) => {
		paginationConfig.pageSize = pageSize;
	};

	// 获取分页参数（用于API调用）
	const getPaginationParams = () => {
		return {
			pageNum: paginationConfig.current,
			pageSize: paginationConfig.pageSize,
		};
	};

	// 更新分页配置
	const updatePagination = (config: Partial<PageInfo>) => {
		Object.assign(paginationConfig, config);
	};

	return {
		pagination: paginationConfig,
		handleTableChange,
		resetPagination,
		setTotal,
		setCurrent,
		setPageSize,
		getPaginationParams,
		updatePagination,
	};
};

export interface UseRowSelectionOptions {
	/** 额外的 Table.rowSelection 原生配置透传（如 checkStrictly 等） */
	config?: Record<string, any>;
	/** 勾选变化时的业务回调 */
	onChange?: (selectedRowKeys: string[], selectedRows?: any[]) => void;
}

/**
 * 通用表格行选择 Composable（严格保障 ID 统一映射为 string，防止雪花算法 ID 精度丢失）
 */
export const useRowSelection = (options?: UseRowSelectionOptions) => {
	const selectedRowKeys = ref<string[]>([]);

	const rowSelection = computed(() => ({
		...options?.config,
		selectedRowKeys: selectedRowKeys.value,
		onChange: (keys: (string | number)[], selectedRows?: any[]) => {
			const stringKeys = keys.map(String);
			selectedRowKeys.value = stringKeys;
			options?.onChange?.(stringKeys, selectedRows);
		},
	}));

	const clearSelected = () => {
		selectedRowKeys.value = [];
	};

	return {
		selectedRowKeys,
		rowSelection,
		clearSelected,
	};
};

