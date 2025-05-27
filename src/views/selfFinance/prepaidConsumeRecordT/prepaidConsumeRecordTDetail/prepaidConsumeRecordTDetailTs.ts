import { Dayjs } from 'dayjs';

export interface PrepaidConsumeRecordTDetail {
  id?: number,
  cardId?: number;
  orderNo?: string;
  amount?: number;
  balanceAfter?: number;
  merchantName?: string;
  consumeTime?: Dayjs | string;
  description?: string;
}