import type { Dayjs } from 'dayjs';

// 表单布局配置
export const labelCol = { span: 5 };
export const wrapperCol = { span: 19 };

// 搜索条件
export interface SearchInfo {
	name?: string;
	typeCode?: string;
	fromSource?: string;
	isValid?: number;
	pageNo?: number;
	pageSize?: number;
	incomeAndExpenses?: string;
	belongTo?: number;
	infoDateStart?: Dayjs | string;
	infoDateEnd?: Dayjs | string;
}
