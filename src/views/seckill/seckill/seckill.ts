import { ref } from "vue";

export interface SearchInfo {
  activityName ?: string;
  activityStatus ?: string;
  currentPage?: number;
  pageSize?: number;
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

export const pagination = ref<pageInfo>({
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
    title: "活动id",
    dataIndex: "activityId",
    key: "activityId",
    align: "center",
  },
  {
    title: "活动名称",
    dataIndex: "activityName",
    key: "activityName",
    width: "10%",
    ellipsis: true,
  },
  {
    title: "开始时间",
    dataIndex: "结束时间",
    width: "12%",
    key: "title",
    ellipsis: true,
  },
  {
    title: "活动状态",
    dataIndex: "activityStatus",
    key: "activityStatus",
  },
  {
    title: "申请规则",
    dataIndex: "blogSortList",
    key: "blogSortList",
  },
  {
    title: "操作",
    key: "operation",
    fixed: "right",
    width: 200,
  },
];
