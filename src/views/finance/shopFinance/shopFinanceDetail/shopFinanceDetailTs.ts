import type { Dayjs } from 'dayjs';

export interface ShopFinanceDetail {
	id?: number;
	shopName?: string;
	shopCode?: string;
	saleAmount?: number;
	isValid?: string;
	saleDate?: Dayjs | string;
	incomeAndExpenses?: string;
	payWay?: string;
	saleNum?: number;
}
