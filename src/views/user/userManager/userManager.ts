import { ref } from "vue";

export interface SearchInfo {
  username ?: string;
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
    title: "用户名",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "昵称",
    dataIndex: "nickName",
    key: "nickName",
  },
  {
    title: "性别",
    dataIndex: "gender",
    key: "gender",
  },
  {
    title: "个人头像",
    dataIndex: "avatar",
    key: "avatar",
  },
  {
    title: "邮箱",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "生日",
    dataIndex: "birthday",
    key: "birthday",
  },
  {
    title: "手机",
    dataIndex: "mobile",
    key: "mobile",
  },
  {
    title: "QQ",
    dataIndex: "qqNumber",
    key: "qqNumber",
  },
  {
    title: "微信",
    dataIndex: "weChat",
    key: "weChat",
  },
  {
    title: "职业",
    dataIndex: "occupation",
    key: "occupation",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "操作",
    key: "operation",
    fixed: 'right',
    width: 160,
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

export const fromSourceTransferList = [
  { value: "xj", label: "cash" },
  { value: "yhk", label: "card" },
  { value: "zfb", label: "zhifubao" },
  { value: "wx", label: "weChat" },
  { value: "mt", label: "meituan" },
  { value: "other", label: "" },
]