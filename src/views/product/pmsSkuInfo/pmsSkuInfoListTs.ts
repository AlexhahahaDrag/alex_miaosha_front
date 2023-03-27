import { ref } from "vue";

export interface SearchInfo {
  spuId?: number;
  skuName?: string;
  skuDesc?: string;
  catalogId?: number;
  brandId?: number;
  skuDefaultImg?: string;
  skuTitle?: string;
  skuSubtitle?: string;
  price?: number;
  saleCount?: number;
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

export let pagination = ref<pageInfo>({
  // 数据总数
  total: 50,
  // 当前页数
  current: 1,
  // 每页条数
  pageSize: 10,
  // 展示总数
  showTotal: (total: number) => `共 ${total} 条`,
  // 是否可以改变pageSize
  showSizeChanger: true,
  // 设置每页可以展示多少条的选项
  pageSizeOptions: ["10", "20", "50", "100"],
  // 改变pageSize后触发
  showSizeChange: (current: number, pageSize: any) => (
    (pagination.value.current = current), (pagination.value.pageSize = pageSize)
  ),
  // 小尺寸分页
  size: "small",
  // 是否可以快速跳转至某页
  showQuickJumper: true,
  //默认条数
  defaultPageSize: 10,
});

export const columns = [
  {
    title: "spuId",
    dataIndex: "spuId",
    key: "spuId",
  },
  {
    title: "sku名称",
    dataIndex: "skuName",
    key: "skuName",
  },
  {
    title: "sku介绍描述",
    dataIndex: "skuDesc",
    key: "skuDesc",
  },
  {
    title: "所属分类id",
    dataIndex: "catalogId",
    key: "catalogId",
  },
  {
    title: "品牌id",
    dataIndex: "brandId",
    key: "brandId",
  },
  {
    title: "默认图片",
    dataIndex: "skuDefaultImg",
    key: "skuDefaultImg",
  },
  {
    title: "标题",
    dataIndex: "skuTitle",
    key: "skuTitle",
  },
  {
    title: "副标题",
    dataIndex: "skuSubtitle",
    key: "skuSubtitle",
  },
  {
    title: "价格",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "销量",
    dataIndex: "saleCount",
    key: "saleCount",
  },
  {
    title: "操作",
    key: "operation",
    fixed: 'right',
    width: '8',
  },
];


export interface DataItem {
  skuId: number;
  spuId: number;
  skuName: string;
  skuDesc: string;
  catalogId: number;
  brandId: number;
  skuDefaultImg: string;
  skuTitle: string;
  skuSubtitle: string;
  price: number;
  saleCount: number;
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