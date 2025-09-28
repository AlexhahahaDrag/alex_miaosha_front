import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.locale('zh-cn');

const defaultDateFormat = 'YYYY-MM-DD';

const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';

const formatDayjs = (date: string) => {
	return dayjs.utc(date);
};

const formatDate = (date: string) => {
	return dayjs.utc(date).format(defaultDateFormat);
};

const formatTime = (date: string, dateFormat: string = defaultTimeFormat) => {
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
