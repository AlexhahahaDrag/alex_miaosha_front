<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <div class="search-box-in">
          <a-form layout="inline" @keyup.enter.native="searchInfo">
            <a-space>
              <a-input v-model:value="searchInfo.name" placeholder="名称" allow-clear />
              <a-select
                ref="select"
                v-model:value="searchInfo.fromSource"
                mode="combobox"
                placeholder="请输入来源"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="fromSourceList"
                :allowClear="true"
              ></a-select>
              <a-select
                ref="select"
                v-model:value="searchInfo.incomeAndExpenses"
                mode="combobox"
                placeholder="请输入收支类型"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="incomeAndExpensesList"
                :allowClear="true"
              ></a-select>
              <a-select
                style="width: 100px"
                ref="select"
                v-model:value="searchInfo.belongTo"
                mode="combobox"
                :field-names="{ label: 'username', value: 'id' }"
                :options="userList"
              ></a-select>
              <a-range-picker
                v-model:value="times"
                style="width: 400px"
                :ranges="ranges"
                show-time
                format="YYYY/MM/DD"
              />
              <a-button type="primary" @click="query"> 查找</a-button>
              <a-button type="primary" @click="cancelQuery">清空</a-button>
            </a-space>
          </a-form>
        </div>
      </div>
    </div>
    <div class="button">
      <a-space>
        <a-button type="primary" @click="editFinance('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="danger" @click="batchDelFinanceManager">删除</a-button>
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
        :scroll="{ x: 1200 }"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="editFinance('update', record.id)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确认删除博客?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delFinance(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'isValid'">
            <a-tag
              :key="record.isValid"
              :color="record.isValid == 1 ? '#87d068' : 'grey'"
            >
              {{ record.isValid == 1 ? "有效" : "失效" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'incomeAndExpenses'">
            <a-tag
              :key="record.incomeAndExpenses"
              :color="record.incomeAndExpenses == 'income' ? 'green' : 'red'"
            >
              {{ record.incomeAndExpenses == "income" ? "收入" : "支出" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'fromSource'">
            <div v-for="fromSource in fromSourceTransferList">
              <svgIcon
                v-if="record.fromSource.indexOf(fromSource.value) >= 0  && fromSource.value != ''"
                :name="fromSource.label"
                class="svg"
                style="
                  width: 1.5em;
                  height: 1.5em;
                  font-size: 18px;
                  cursor: pointer;
                  verticle-align: middle;"
              ></svgIcon>
            </div>
          </template>
        </template>
      </a-table>
      <Detail
        ref="editInfo"
        :visible="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></Detail>
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
} from "./financeManager";
import dayjs, { Dayjs } from "dayjs";
import { getFinanceMangerPage, deleteFinanceManger } from "@/api/finance/financeManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message } from "ant-design-vue";
import Detail from "./detail/index.vue";
import svgIcon from "@v/common/icons/svgIcon.vue";

let userList = ref([
  { id: 1, username: "mj" },
  { id: 2, username: "臭屁宝" },
]);

let rowIds = [] as any;

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

type RangeValue = [Dayjs, Dayjs];

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
  searchInfo.value = {};
}

function query() {
  getFinancePage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getFinancePage(searchInfo.value, pagination);
}

function delFinance(ids: string) {
  deleteFinanceManger(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getFinancePage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelFinanceManager() {
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
  delFinance(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

let times = ref<RangeValue>();

const ranges = {
  Today: [dayjs(), dayjs()] as RangeValue,
};

function getFinancePage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getFinanceMangerPage(param, cur.current, cur.pageSize)
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
  getFinancePage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editFinance(type: string, id?: number) {
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
  getFinancePage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
