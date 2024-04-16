import { Dayjs } from 'dayjs';

export interface ShopOrderDetailDetail {
  id?: number,
  orderId?: number;
  shopName?: string;
  shopCode?: string;
  saleAmount?: number;
  isValid?: string;
  saleDate?: Dayjs | string;
  payWay?: string;
  saleNum?: number;
  shopStockId?: number;
}