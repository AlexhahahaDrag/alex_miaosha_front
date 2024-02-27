export interface SearchInfo {
  name?: string;
  path?: string;
  title?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  hideInMenu?: string;
  parentId?: number;
  summary?: string;
  status?: string;
  orderBy?: number;
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

export const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '菜单路径',
    dataIndex: 'path',
    key: 'path',
  },
  {
    title: '菜单标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component',
  },
  {
    title: '跳转',
    dataIndex: 'redirect',
    key: 'redirect',
  },
  {
    title: '菜单图标',
    dataIndex: 'icon',
    key: 'icon',
  },
  {
    title: '是否隐藏菜单',
    dataIndex: 'hideInMenu',
    key: 'hideInMenu',
  },
  {
    title: '父级机构id',
    dataIndex: 'parentId',
    key: 'parentId',
  },
  {
    title: '备注',
    dataIndex: 'summary',
    key: 'summary',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '排序',
    dataIndex: 'orderBy',
    key: 'orderBy',
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: '8',
  },
];


export interface DataItem {
  name: string;
  path: string;
  title: string;
  component: string;
  redirect: string;
  icon: string;
  hideInMenu: string;
  parentId: number;
  summary: string;
  status: string;
  orderBy: number;
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