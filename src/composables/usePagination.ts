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

export const usePagination = (initialConfig?: Partial<PageInfo>) => {
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

	// 合并配置
	const paginationConfig = reactive<PageInfo>({
		...defaultConfig,
		...initialConfig,
	});

	// 分页变化处理
	const handleTableChange = (pagination: {
		current: number;
		pageSize: number;
	}) => {
		paginationConfig.current = pagination.current;
		paginationConfig.pageSize = pagination.pageSize;
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
