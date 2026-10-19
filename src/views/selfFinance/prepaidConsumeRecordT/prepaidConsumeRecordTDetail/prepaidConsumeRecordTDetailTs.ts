import type { Dayjs } from '@/utils/dayjs';

export interface PrepaidConsumeRecordTDetail {
	id?: string;
	cardId?: string;
	orderNo?: string;
	amount?: number;
	balanceAfter?: number;
	merchantName?: string;
	consumeTime?: Dayjs | string;
	description?: string;
}
