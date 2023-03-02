import { ref } from "vue";

export interface SearchInfo {
  name?: string;
  logo?: string;
  descript?: string;
  showStatus?: number;
  firstLetter?: string;
  sort?: number;
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
    title: "品牌名",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "品牌logo",
    dataIndex: "logo",
    key: "logo",
  },
  {
    title: "显示状态",
    dataIndex: "showStatus",
    key: "showStatus",
  },
  {
    title: "检索首字母",
    dataIndex: "firstLetter",
    key: "firstLetter",
  },
  {
    title: "排序",
    dataIndex: "sort",
    key: "sort",
  },
  {
    title: "操作",
    key: "operation",
    fixed: 'right',
    width: '8',
  },
];


export interface DataItem {
  brandId: number;
  name: string;
  logo: string;
  descript: string;
  showStatus: number;
  firstLetter: string;
  sort: number;
}