<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form
          :model="searchInfo"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                :name="labelMap['name'].name"
                :label="labelMap['name'].label"
              >
                <a-input
                  v-model:value="searchInfo.name"
                  :placeholder="'请选择' + labelMap['name'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['title'].name"
                :label="labelMap['title'].label"
              >
                <a-input
                  v-model:value="searchInfo.title"
                  :placeholder="'请选择' + labelMap['title'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                :name="labelMap['component'].name"
                :label="labelMap['component'].label"
              >
                <a-input
                  v-model:value="searchInfo.component"
                  :placeholder="'请选择' + labelMap['component'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['redirect'].name"
                :label="labelMap['redirect'].label"
              >
                <a-input
                  v-model:value="searchInfo.redirect"
                  :placeholder="'请选择' + labelMap['redirect'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['icon'].name"
                :label="labelMap['icon'].label"
              >
                <a-input
                  v-model:value="searchInfo.icon"
                  :placeholder="'请选择' + labelMap['icon'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                :name="labelMap['hideInMenu'].name"
                :label="labelMap['hideInMenu'].label"
              >
                <a-select
                  ref="select"
                  v-model:value="searchInfo.hideInMenu"
                  :placeholder="'请输入' + labelMap['hideInMenu'].label"
                  :field-names="{ label: 'typeName', value: 'typeCode' }"
                  :options="hideInMenuList"
                  :allowClear="true"
                >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['parentId'].name"
                :label="labelMap['parentId'].label"
              >
                <a-input
                  v-model:value="searchInfo.parentId"
                  :placeholder="'请选择' + labelMap['parentId'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['summary'].name"
                :label="labelMap['summary'].label"
              >
                <a-input
                  v-model:value="searchInfo.summary"
                  :placeholder="'请选择' + labelMap['summary'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                :name="labelMap['status'].name"
                :label="labelMap['status'].label"
              >
                <a-select
                  ref="select"
                  v-model:value="searchInfo.status"
                  :placeholder="'请输入' + labelMap['status'].label"
                  :field-names="{ label: 'typeName', value: 'typeCode' }"
                  :options="statusList"
                  :allowClear="true"
                >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['orderBy'].name"
                :label="labelMap['orderBy'].label"
              >
                <a-input
                  v-model:value="searchInfo.orderBy"
                  :placeholder="'请选择' + labelMap['orderBy'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="20" style="text-align: right">
              <a-space>
                <a-button type="primary" @click="query"> 查找</a-button>
                <a-button type="primary" @click="cancelQuery">清空</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="button">
      <a-space>
        <a-button type="primary" @click="editMenuInfo('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelMenuInfo"
          >删除</a-button
        >
      </a-space>
    </div>
    <div class="content">
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :loading="loading"
        :row-key="(record) => record.id"
        :pagination="pagination"
        @change="handleTableChange"
        :scroll="{ x: 1100 }"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="editMenuInfo('update', record.id)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delMenuInfo(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
        </template>
      </a-table>
      <MenuInfoDetail
        ref="editInfo"
        :open="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></MenuInfoDetail>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  SearchInfo,
  pagination,
  columns,
  DataItem,
  ModelInfo,
  pageInfo,
} from "./menuInfoListTs";
import {
  getMenuInfoPage,
  deleteMenuInfo,
} from "@/api/user/menuInfo/menuInfoTs";
import { message } from "ant-design-vue";
import { getDictList } from "@/api/finance/dict/dictManager";
import { dictInfo } from "@/views/finance/dict/dict";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds = [] as any;

const rowSelection = ref({
  checkStrictly: false,
  onChange: (
    selectedRowKeys: (string | number)[],
    _selectedRows: DataItem[]
  ) => {
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (
    selected: boolean,
    selectedRows: DataItem[],
    changeRows: DataItem[]
  ) => {
    console.log(selected, selectedRows, changeRows);
  },
});

const labelMap = ref<any>({
  name: { name: "name", label: "菜单名称" },
  path: { name: "path", label: "菜单路径" },
  title: { name: "title", label: "菜单标题" },
  component: { name: "component", label: "组件" },
  redirect: { name: "redirect", label: "跳转" },
  icon: { name: "icon", label: "菜单图标" },
  hideInMenu: { name: "hideInMenu", label: "是否隐藏菜单" },
  parentId: { name: "parentId", label: "父级机构id" },
  summary: { name: "summary", label: "备注" },
  status: { name: "status", label: "状态" },
  orderBy: { name: "orderBy", label: "排序" },
});

let searchInfo = ref<SearchInfo>({});

let hideInMenuList = ref<dictInfo[]>([]);
let statusList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList("true_or_false,is_valid").then((res) => {
    if (res.code == "200") {
      hideInMenuList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "true_or_false"
      );
      statusList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
};

function cancelQuery() {
  searchInfo.value = {};
}

function query() {
  getMenuInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getMenuInfoListPage(searchInfo.value, pagination);
}

function delMenuInfo(ids: string) {
  deleteMenuInfo(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getMenuInfoListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelMenuInfo() {
  let ids = "";
  if (rowIds && rowIds.length > 0) {
    rowIds.forEach((item: string) => {
      ids += item + ",";
    });
    ids = ids.substring(0, ids.length - 1);
  } else {
    message.warning("请先选择数据！", 3);
    return;
  }
  delMenuInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

function getMenuInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getMenuInfoPage(param, cur.current, cur.pageSize)
    .then((res) => {
      if (res.code == "200") {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function init() {
  getDictInfoList();
  //获取菜单管理表页面数据
  getMenuInfoListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editMenuInfo(type: string, id?: number) {
  if (type == "add") {
    modelInfo.value.title = "新增明细";
    modelInfo.value.id = undefined;
  } else if (type == "update") {
    modelInfo.value.title = "修改明细";
    modelInfo.value.id = id;
  }
  modelInfo.value.confirmLoading = true;
  visible.value = true;
}

const handleOk = (v: boolean) => {
  visible.value = v;
  getMenuInfoListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
