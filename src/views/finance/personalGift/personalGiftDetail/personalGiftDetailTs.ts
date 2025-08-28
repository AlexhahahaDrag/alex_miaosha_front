import type { Dayjs } from 'dayjs';

export interface PersonalGiftDetail {
	id?: number;
	eventName?: string;
	amount?: number;
	otherPerson?: string;
	eventTime?: Dayjs | string;
	remarks?: string;
	action?: number;
	noticeNum?: number;
}
