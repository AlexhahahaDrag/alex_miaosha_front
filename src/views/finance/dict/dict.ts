export interface SearchInfo {
  typeName ?: string;
  belongToName?: string;
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
  // {
  //   title: "id",
  //   dataIndex: "id",
  //   key: "id",
  // },
  {
    title: "类别编码",
    dataIndex: "typeCode",
    key: "typeCode",
  },
  {
    title: "类别",
    dataIndex: "typeName",
    key: "typeName",
  },
  {
    title: "分类编码",
    dataIndex: "belongTo",
    key: "belongTo",
  },
  {
    title: "分类",
    dataIndex: "belongToName",
    key: "belongToName",
  },
  {
    title: "排序",
    dataIndex: "orderBy",
    align: 'center',
    key: "orderBy",
  },
  {
    title: "状态",
    dataIndex: "isValid",
    align: 'center',
    key: "isValid",
  },
  {
    title: "业务时间",
    dataIndex: "operateTime",
    key: "operateTime",
  },
  {
    title: "操作",
    key: "operation",
    width: 200,
  },
];


export interface DataItem {
  name: string;
  typeCode: string;
  typeName: string;
  amount: number;
  fromSource: string;
  fromSourceName: string;
  isValid: number;
}

export interface ModelInfo {
  title?: string;
  width?: string;
  id?: number | undefined;
  confirmLoading ?: boolean;
}

export interface dictInfo {
  typeCode?: string|number|undefined,
  typeName?: string|undefined,
}