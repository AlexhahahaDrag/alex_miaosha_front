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
const dateFormatYYYYMM = 'YYYY-MM';

dayjs.prototype.toISOString = function () {
	return this.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

/**
 * 支持的日期/时间入参类型
 */
export type DateInput = string | number | Date | Dayjs | null | undefined;

/**
 * 转换为 Dayjs 对象（不传参数时默认返回当前时间的 Dayjs 对象）
 * @param date 时间输入
 * @returns Dayjs 对象
 */
const formatDayjs = (date?: DateInput): Dayjs => {
	return date ? dayjs(date) : dayjs();
};

/**
 * 获取当前时间的 Dayjs 实例
 */
const nowDayjs = (): Dayjs => dayjs();

/**
 * 按天数进行增减运算（默认基准为当前时间）
 * @param days 增加的天数（负数代表减少）
 * @param baseDate 基准时间（可选，默认当前时间）
 */
const addDays = (days: number, baseDate?: DateInput): Dayjs => {
	return (baseDate ? dayjs(baseDate) : dayjs()).add(days, 'day');
};

/**
 * 格式化日期
 * @param date 日期
 * @param dateFormat 日期格式（可选，默认 YYYY-MM-DD）
 * @returns 格式化后的日期 YYYY-MM-DD
 */
const formatDate = (
	date?: DateInput,
	dateFormat: string = defaultDateFormat,
) => {
	if (!date) {
		return '';
	}
	return dayjs(date).format(dateFormat);
};

/**
 * 格式化时间
 * @param date 时间
 * @param dateFormat 时间格式
 * @returns 格式化后的时间
 */
const formatTime = (
	date?: DateInput,
	dateFormat: string = defaultTimeFormat,
) => {
	return formatDate(date, dateFormat);
};

/**
 * 格式化月份 (YYYY-MM)
 * @param date 时间（可选，默认当前时间）
 */
const formatMonth = (date?: DateInput): string => {
	return (date ? dayjs(date) : dayjs()).format(dateFormatYYYYMM);
};

/**
 * 获取指定月份的起止日期字符串 [月初, 月末]
 * @param dateOrOffset 支持月份偏移量（如 -1 上月, 0 本月, 1 下月）或指定日期/月份
 * @returns [月初, 月末] 格式为 YYYY-MM-DD
 */
const getMonthRange = (dateOrOffset: number | string | Dayjs = 0) => {
	const target =
		typeof dateOrOffset === 'number'
			? dayjs().add(dateOrOffset, 'month')
			: dayjs(dateOrOffset);
	return [
		target.startOf('month').format(defaultDateFormat),
		target.endOf('month').format(defaultDateFormat),
	] as const;
};

/**
 * 获取指定月份的起止 Dayjs 对象 [月初, 月末]（专供 RangePicker 组件 presets 绑定）
 * @param dateOrOffset 支持月份偏移量（如 -1 上月, 0 本月）或指定日期/月份
 */
const getMonthRangeDayjs = (dateOrOffset: number | string | Dayjs = 0): [Dayjs, Dayjs] => {
	const target =
		typeof dateOrOffset === 'number'
			? dayjs().add(dateOrOffset, 'month')
			: dayjs(dateOrOffset);
	return [target.startOf('month'), target.endOf('month')];
};

// 导出类型与方法（坚决不导出 dayjs 实例）
export type { Dayjs, DateInput };
export {
	defaultDateFormat,
	defaultTimeFormat,
	dateFormatYYYYMM,
	formatDate,
	formatDayjs,
	formatTime,
	formatMonth,
	getMonthRange,
	getMonthRangeDayjs,
	nowDayjs,
	addDays,
};
