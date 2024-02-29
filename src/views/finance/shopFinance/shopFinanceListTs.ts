import { Dayjs } from 'dayjs';
export interface SearchInfo {
  shopName?: string;
  shopCode?: string;
  saleAmount?: number;
  saleAmountFrom?: number;
  saleAmountEnd?: number;
  isValid?: string;
  saleDate?: Dayjs | string;
  saleDateFrom?: Dayjs | string | null;
  saleDateEnd?: Dayjs | string | null;
}

export interface pageInfo {
  current?: number;
  pageSize?: number;
  total?: number;
  showTotal: Function;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
  showSizeChange: Function;
  size: string;
  showQuickJumper: boolean;
  defaultPageSize: number;
}

export let pagination = ref<any>({
  // 数据总数
  total: 0,
  // 当前页数
  current: 1,
  // 每页条数
  pageSize: 10,
  // 展示总数
  showTotal: (total: number) => `共 ${total} 条`,
  // 是否可以改变pageSize
  showSizeChanger: true,
  // 设置每页可以展示多少条的选项
  pageSizeOptions: ['10', '20', '50', '100'],
  // 改变pageSize后触发
  showSizeChange: (current: number, pageSize: any) => (
    (pagination.value.current = current), (pagination.value.pageSize = pageSize)
  ),
  // 小尺寸分页
  size: 'small',
  // 是否可以快速跳转至某页
  showQuickJumper: true,
  //默认条数
  defaultPageSize: 10,
});

export const columns = ref<any>([
  {
    title: '商品名称',
    dataIndex: 'shopName',
    key: 'shopName',
  },
  {
    title: '商品编码',
    dataIndex: 'shopCode',
    key: 'shopCode',
  },
  {
    title: '售价',
    dataIndex: 'saleAmount',
    key: 'saleAmount',
  },
  {
    title: '销售件数',
    dataIndex: 'saleNum',
    key: 'saleNum',
  },
  {
    title: '收支类型',
    dataIndex: 'incomeAndExpenses',
    key: 'incomeAndExpenses',
  },
  {
    title: '支付方式',
    dataIndex: 'payWay',
    key: 'payWay',
  },
  {
    title: '是否有效',
    dataIndex: 'isValid',
    key: 'isValid',
  },
  {
    title: '销售日期',
    dataIndex: 'saleDate',
    key: 'saleDate',
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: '8',
  },
]);


export interface DataItem {
  shopName: string;
  shopCode: string;
  saleAmount: number;
  isValid: string;
  saleDate?: Dayjs | string;
}

export interface ModelInfo {
  title?: string;
  width?: string;
  id?: number | undefined;
  confirmLoading?: boolean;
}

export interface dictInfo {
  typeCode?: string | number | undefined,
  typeName?: string | undefined,
}

export const fromSourceTransferList = [
  { value: "xj", label: "cash" },
  { value: "zfb", label: "zhifubao" },
  { value: "wx", label: "weChat" },
  { value: "other", label: "" },
]