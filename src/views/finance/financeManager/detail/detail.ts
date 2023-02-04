import { Dayjs } from 'dayjs';
export interface FinanceDetail {
  id?: number;
  name?: string;
  typeCode?: string;
  amount?: number;
  fromSource?: string;
  fromSourceName?: string;
  isValid?: string;
  infoDate?: Dayjs | string;
  incomeAndExpenses?: string;
  belongTo?: string;
}
