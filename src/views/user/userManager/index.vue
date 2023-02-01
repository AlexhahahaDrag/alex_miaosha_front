<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="username" label="用户名">
                <a-input v-model:value="searchInfo.username" placeholder="用户名" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6"></a-col>
            <a-col :span="6" style="text-align: right">
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
        <a-button type="primary" @click="editUser('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="danger" @click="batchDelUserManager">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1400 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editUser('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除用户信息?" ok-text="确认" cancel-text="取消" @confirm="delUser(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'birthday'">
            <span>
              {{ record.birthday ?  String(record.birthday).substring(0, 10) : '' }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :key="record.status" :color="record.status == 1 ? '#87d068' : 'grey'">
              {{ record.status == 1 ? "有效" : "失效" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'gender'">
            <a-tag :key="record.gender" :color="record.gender == 1 ? 'green' : 'red'">
              {{ record.gender == 0 ? "" : (record.gender == 1 ? "男" : "女") }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'fromSource'">
            <div v-for="fromSource in fromSourceTransferList">
              <svgIcon v-if="record.fromSource == fromSource.value && fromSource.value != ''" :name="fromSource.label"
                class="svg" style="
                  width: 1.5em;
                  height: 1.5em;
                  font-size: 18px;
                  cursor: pointer;
                  verticle-align: middle;
                "></svgIcon>
            </div>
          </template>
        </template>
      </a-table>
      <Detail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel">
      </Detail>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {
  SearchInfo,
  pagination,
  columns,
  DataItem,
  ModelInfo,
  fromSourceTransferList,
  dictInfo,
  pageInfo,
} from "./userManager";
import { getUserManagerPage, deleteUserManager } from "@/api/user/userManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message } from "ant-design-vue";
import Detail from "./detail/index.vue";
import svgIcon from "@v/common/icons/svgIcon.vue";

let rowIds = [] as any;

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const fromSourceList = ref<dictInfo[]>([]);

const incomeAndExpensesList = ref<dictInfo[]>([]);

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys: (string | number)[], selectedRows: DataItem[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected: boolean, selectedRows: DataItem[], changeRows: DataItem[]) => {
    console.log(selected, selectedRows, changeRows);
  },
});

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
  searchInfo.value = {};
}

function query() {
  getUserPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getUserPage(searchInfo.value, pagination);
}

function delUser(ids: string) {
  deleteUserManager(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getUserPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelUserManager() {
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
  delUser(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

function getUserPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getUserManagerPage(param, cur.current, cur.pageSize)
    .then((res) => {
      if (res.code == "200") {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    }).catch(() => {
      pagination.value.current = 0;
      pagination.value.pageSize = 10;
      pagination.value.total = 0;
    }).finally(() => {
      loading.value = false;
    });
}

function getDictInfoList() {
  loading.value = true;
  getDictList("pay_way,income_expense_type").then((res) => {
    if (res.code == "200") {
      fromSourceList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "pay_way"
      );
      incomeAndExpensesList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "income_expense_type"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  //获取字典列表
  getDictInfoList();
  //获取财务管理页面数据
  getUserPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editUser(type: string, id?: number) {
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
  getUserPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
