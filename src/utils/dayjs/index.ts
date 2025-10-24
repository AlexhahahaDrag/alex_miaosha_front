import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

dayjs.extend(utc);
dayjs.locale('zh-cn');

const defaultDateFormat = 'YYYY-MM-DD';

const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * 格式化时间
 * @param date 时间
 * @returns 格式化后的时间
 */
const formatDayjs = (date: string | Dayjs | undefined | null) => {
	if (!date) {
		return null;
	}
	return dayjs.utc(date);
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
	return dayjs.utc(date).format(defaultDateFormat);
};

/**
 * 格式化时间
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
	return dayjs.utc(date).format(dateFormat);
};

// 导出所有工具函数和常量
export {
	defaultDateFormat,
	defaultTimeFormat,
	formatDate,
	formatDayjs,
	formatTime,
};
