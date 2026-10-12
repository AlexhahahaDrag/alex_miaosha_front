import type { Dayjs } from '@/utils/dayjs';

export interface PrepaidConsumeRecordTDetail {
	id?: number;
	cardId?: number | string;
	orderNo?: string;
	amount?: number;
	balanceAfter?: number;
	merchantName?: string;
	consumeTime?: Dayjs | string;
	description?: string;
}
