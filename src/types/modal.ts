/**
 * 通用弹窗模态框配置与状态接口
 */
export interface ModelInfo {
	id?: string | null | undefined;
	open?: boolean;
	title?: string;
	width?: string;
	parentId?: string | null;
	confirmLoading?: boolean;
	readonly?: boolean;
	extraData?: any;
}
