/**
 * 联系人随礼记录页面配置文件
 */

// ==================== 类型定义 ====================

/**
 * 联系人随礼记录接口
 */
export interface ContactsGiftRecord {
	id?: string | number;
	contactsUserId: string | number;
	contactsUserName: string;
	relationship: 'family' | 'friend' | 'colleague' | 'other';
	lastContactTime?: string;
	giftOutAmount: number; // 随礼总额
	giftInAmount: number; // 收礼总额
	netAmount: number; // 净差额
	giftOutCount: number; // 随礼次数
	giftInCount: number; // 收礼次数
}

/**
 * 表格列配置接口
 */
export interface TableColumnConfig {
	title: string;
	dataIndex: string;
	key: string;
	width?: number;
	align?: 'left' | 'center' | 'right';
}

// ==================== 样式主题颜色 ====================

export const themeColors = {
	primary: '#1f2937',
	secondary: '#6b7280',
	border: '#e5e7eb',
	bgLight: '#f9fafb',
	bgWhite: '#ffffff',
	red: '#ef4444',
	redLight: '#fee2e2',
	green: '#10b981',
	greenLight: '#dcfce7',
	blue: '#3b82f6',
	blueLight: '#dbeafe',
	purple: '#a855f7',
	purpleLight: '#f3e8ff',
};

// ==================== 字体和间距 ====================

export const typography = {
	fontFamily: 'Inter, sans-serif',
	fontSizeSm: '12px',
	fontSizeBase: '14px',
	fontSizeMd: '16px',
	fontSizeLg: '18px',
	fontSizeXl: '24px',
};

export const spacing = {
	xs: '8px',
	sm: '12px',
	md: '16px',
	lg: '20px',
	xl: '24px',
};

// ==================== 关系类型配置 ====================

export const relationshipOptions = [
	{ value: 'family', label: '家人', color: 'blue' },
	{ value: 'friend', label: '朋友', color: 'green' },
	{ value: 'colleague', label: '同事', color: 'purple' },
	{ value: 'other', label: '其他', color: 'default' },
];

/**
 * 获取关系类型颜色
 */
export const getRelationshipColor = (relationship: string): string => {
	const relationshipMap: Record<string, string> = {
		family: 'blue',
		friend: 'green',
		colleague: 'purple',
		other: 'default',
	};
	return relationshipMap[relationship] || 'default';
};

/**
 * 获取关系类型标签
 */
export const getRelationshipLabel = (relationship: string): string => {
	const relationshipMap: Record<string, string> = {
		family: '家人',
		friend: '朋友',
		colleague: '同事',
		other: '其他',
	};
	return relationshipMap[relationship] || '其他';
};

// ==================== 排序选项 ====================

export const sortOptions = [
	{ value: 'date', label: '按时间排序' },
	{ value: 'name', label: '按姓名排序' },
	{ value: 'amount', label: '按金额排序' },
];

// ==================== 分页默认配置 ====================

export const defaultPageConfig = {
	pageNum: 1,
	pageSize: 10,
};

// ==================== 错误提示信息 ====================

export const errorMessages = {
	loadDataFail: '加载数据失败！',
	loadDataException: '加载数据异常！',
	deleteFail: '删除失败！',
	deleteException: '删除异常！',
};
