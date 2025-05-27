import { Dayjs } from 'dayjs';

export interface PrepaidCardInfoTDetail {
  id?: number,
  cardId?: number;
  cardName?: string;
  userId?: string;
  initialBalance?: number;
  currentBalance?: number;
  expireDate?: localDate;
  cardStatus?: string;
  version?: number;
}