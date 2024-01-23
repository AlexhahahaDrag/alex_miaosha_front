import { Dayjs } from 'dayjs';

export interface AccountRecordInfoDetail {
  id?:number;
  name?: string;
  avliDate?: Dayjs | string;
  amount?: number;
  account?: string;
}