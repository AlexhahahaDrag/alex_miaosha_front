import zhCn from 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(zhCn);

// 设置默认时区为中国
dayjs.tz.setDefault('Asia/Shanghai');

const defaultDateFormat = 'YYYY-MM-DD';
const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * 格式化时间 - 自动使用中国时区
 * @param date 时间
 * @returns 格式化后的时间
 */
const formatDayjs = (date: string | Dayjs | undefined | null): Dayjs | string | undefined => {
	if (!date) {
		return undefined;
	}
	const result = dayjs(date);
	return result.isValid() ? result : undefined;
};

/**
 * 格式化日期
 * @param date 日期
 * @returns 格式化后的日期
 */
const formatDate = (date: string | Dayjs | undefined | null) => {
	if (!date) {
		return '';
	}
	return dayjs(date).format(defaultDateFormat);
};

/**
 * 格式化时间 - 自动使用中国时区
 * @param date 时间
 * @param dateFormat 时间格式
 * @returns 格式化后的时间
 */
const formatTime = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultTimeFormat,
) => {
	if (!date) {
		return '';
	}
	return dayjs(date).format(dateFormat);
};

/**
 * 保存数据时格式化时间 - 确保为中国时区
 * @param date 时间
 * @param dateFormat 时间格式
 * @returns 格式化后的时间字符串
 */
const formatTimeForSave = (
	date: string | Dayjs | undefined | null,
	dateFormat: string = defaultTimeFormat,
) => {
	if (!date) {
		return null;
	}
	// 明确转换为中国时区并格式化为字符串
	return dayjs(date).format(dateFormat);
};

// 导出所有工具函数和常量
export {
	defaultDateFormat,
	defaultTimeFormat,
	formatDate,
	formatDayjs,
	formatTime,
	formatTimeForSave,
};
