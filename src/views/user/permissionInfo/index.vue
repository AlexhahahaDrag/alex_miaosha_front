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
                :name="labelMap['permissionCode'].name"
                :label="labelMap['permissionCode'].label"
              >
                <a-input
                  v-model:value="searchInfo.permissionCode"
                  :placeholder="'请选择' + labelMap['permissionCode'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['permissionName'].name"
                :label="labelMap['permissionName'].label"
              >
                <a-input
                  v-model:value="searchInfo.permissionName"
                  :placeholder="'请选择' + labelMap['permissionName'].label"
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
                :name="labelMap['options'].name"
                :label="labelMap['options'].label"
              >
                <a-input
                  v-model:value="searchInfo.options"
                  :placeholder="'请选择' + labelMap['options'].label"
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
        <a-button type="primary" @click="editPermissionInfo('add')"
          >新增</a-button
        >
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelPermissionInfo"
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
                @click="editPermissionInfo('update', record.id)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delPermissionInfo(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
        </template>
      </a-table>
      <PermissionInfoDetail
        ref="editInfo"
        :open="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></PermissionInfoDetail>
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
} from "./permissionInfoListTs";
import {
  getPermissionInfoPage,
  deletePermissionInfo,
} from "@/api/user/permissionInfo/permissionInfoTs";
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
  permissionCode: { name: "permissionCode", label: "权限编码" },
  permissionName: { name: "permissionName", label: "权限名称" },
  summary: { name: "summary", label: "描述" },
  status: { name: "status", label: "状态" },
  options: { name: "options", label: "url" },
});

let searchInfo = ref<SearchInfo>({});

let statusList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList("is_valid").then((res) => {
    if (res.code == "200") {
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
  getPermissionInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getPermissionInfoListPage(searchInfo.value, pagination);
}

function delPermissionInfo(ids: string) {
  deletePermissionInfo(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getPermissionInfoListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelPermissionInfo() {
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
  delPermissionInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

function getPermissionInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getPermissionInfoPage(param, cur.current, cur.pageSize)
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
  //获取权限信息表页面数据
  getPermissionInfoListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPermissionInfo(type: string, id?: number) {
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
  getPermissionInfoListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped></style>
