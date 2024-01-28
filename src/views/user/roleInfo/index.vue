<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="8">
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
              <a-form-item :name="labelMap['orgId'].name" :label="labelMap['orgId'].label">
                <a-input v-model:value="searchInfo.orgId" :placeholder="'请选择' + labelMap['orgId'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['userId'].name" :label="labelMap['userId'].label">
                <a-input v-model:value="searchInfo.userId" :placeholder="'请选择' + labelMap['userId'].label" allow-clear />
========
              <a-form-item :name="labelMap['roleCode'].name" :label="labelMap['roleCode'].label">
                <a-input v-model:value="searchInfo.roleCode" :placeholder="'请选择' + labelMap['roleCode'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['roleName'].name" :label="labelMap['roleName'].label">
                <a-input v-model:value="searchInfo.roleName" :placeholder="'请选择' + labelMap['roleName'].label" allow-clear />
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['summary'].name" :label="labelMap['summary'].label">
                <a-input v-model:value="searchInfo.summary" :placeholder="'请选择' + labelMap['summary'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['status'].name" :label="labelMap['status'].label">
                <a-select ref="select" v-model:value="searchInfo.status" mode="combobox" :placeholder="'请输入' + labelMap['status'].label"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="statusList" :allowClear="true">
                </a-select>
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
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
        <a-button type="primary" @click="editOrgUserInfo('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelOrgUserInfo">删除</a-button>
========
        <a-button type="primary" @click="editRoleInfo('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelRoleInfo">删除</a-button>
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
              <a-button type="primary" size="small" @click="editOrgUserInfo('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delOrgUserInfo(record.id)"
========
              <a-button type="primary" size="small" @click="editRoleInfo('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delRoleInfo(record.id)"
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
        </template>
      </a-table>
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
      <OrgUserInfoDetail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel"></OrgUserInfoDetail>
========
      <RoleInfoDetail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel"></RoleInfoDetail>
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
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
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
} from "./orgUserInfoListTs";
import { getOrgUserInfoPage, deleteOrgUserInfo } from "@/api/user/orgUserInfo/orgUserInfoTs";
========
} from "./roleInfoListTs";
import { getRoleInfoPage, deleteRoleInfo } from "@/api/user/roleInfo/roleInfoTs";
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
import { message } from "ant-design-vue";
import { getDictList } from "@/api/finance/dict/dictManager";
import { dictInfo } from "@/views/finance/dict/dict";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds = [] as any;

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys: (string | number)[], selectedRows: DataItem[]) => {
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected: boolean, selectedRows: DataItem[], changeRows: DataItem[]) => {
    console.log(selected, selectedRows, changeRows);
  },
});

const labelMap = ref<any>(
{
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
    orgId: {name: 'orgId', label: '公司角色id'},
    userId: {name: 'userId', label: '用户id'},
========
    roleCode: {name: 'roleCode', label: '角色编码'},
    roleName: {name: 'roleName', label: '角色名称'},
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
    summary: {name: 'summary', label: '描述'},
    status: {name: 'status', label: '状态'},
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
}

function cancelQuery() {
  searchInfo.value = {};
}

function query() {
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
  getOrgUserInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getOrgUserInfoListPage(searchInfo.value, pagination);
}

function delOrgUserInfo(ids: string) {
  deleteOrgUserInfo(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getOrgUserInfoListPage(searchInfo.value, pagination.value);
========
  getRoleInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getRoleInfoListPage(searchInfo.value, pagination);
}

function delRoleInfo(ids: string) {
  deleteRoleInfo(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getRoleInfoListPage(searchInfo.value, pagination.value);
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
function batchDelOrgUserInfo() {
========
function batchDelRoleInfo() {
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
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
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
  delOrgUserInfo(ids);
========
  delRoleInfo(ids);
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
}

<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
function getOrgUserInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getOrgUserInfoPage(param, cur.current, cur.pageSize)
========
function getRoleInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getRoleInfoPage(param, cur.current, cur.pageSize)
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
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
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
  //获取用户公司信息表页面数据
  getOrgUserInfoListPage(searchInfo.value, pagination.value);
========
  //获取角色信息表页面数据
  getRoleInfoListPage(searchInfo.value, pagination.value);
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
function editOrgUserInfo(type: string, id?: number) {
========
function editRoleInfo(type: string, id?: number) {
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
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
<<<<<<<< HEAD:src/views/user/orgUserInfo/index.vue
  getOrgUserInfoListPage(searchInfo.value, pagination.value);
========
  getRoleInfoListPage(searchInfo.value, pagination.value);
>>>>>>>> 54af0292239fa3880682f9412554cfa4368522ba:src/views/user/roleInfo/index.vue
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
