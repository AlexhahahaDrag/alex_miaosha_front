import { ref } from "vue";

export interface SearchInfo {
    goodsName ?: string;
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
      title: "是否原创",
      dataIndex: "isOriginal",
      key: "isOriginal",
      align: "center",
    },
    {
      title: "标题图",
      dataIndex: "fileId",
      key: "fileId",
      width: "10%",
      ellipsis: true,
    },
    {
      title: "标题",
      dataIndex: "title",
      width: "12%",
      key: "title",
      ellipsis: true,
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "分类",
      dataIndex: "blogSortList",
      key: "blogSortList",
    },
    {
      title: "标签",
      dataIndex: "tagList",
      width: "12%",
      key: "tagList",
    },
    {
      title: "推荐等级",
      dataIndex: "level",
      key: "level",
      align: "center",
    },
    {
      title: "点击数",
      dataIndex: "clickCount",
      key: "clickCount",
      align: "center",
    },
    {
      title: "开启评论",
      dataIndex: "openComment",
      key: "openComment",
      align: "center",
    },
    {
      title: "发布状态",
      dataIndex: "isPublish",
      key: "isPublish",
      align: "center",
    },
    {
      title: "操作时间",
      dataIndex: "operateTime",
      key: "operateTime",
      width: "15%",
    },
    {
      title: "操作",
      key: "operation",
      fixed: "right",
      width: 200,
    },
  ];