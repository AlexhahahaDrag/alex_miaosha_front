<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="name" label="名称">
                <a-input v-model:value="searchInfo.name" placeholder="名称" @change="initPage" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="typeCode" label="类别">
                <a-input v-model:value="searchInfo.typeCode" placeholder="请输入类别" @change="initPage" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="fromSource" label="来源">
                <a-select ref="select" v-model:value="searchInfo.fromSource" placeholder="请输入来源"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="fromSourceList" @change="initPage"
                  :allowClear="true"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="incomeAndExpenses" label="收支类型">
                <a-select ref="select" v-model:value="searchInfo.incomeAndExpenses" placeholder="请输入收支类型"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="incomeAndExpensesList"
                  @change="initPage" :allowClear="true"></a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="belongTo" label="属于">
                <a-select ref="select" v-model:value="searchInfo.belongTo" placeholder="请选择归属人"
                  :field-names="{ label: 'nickName', value: 'id' }" :options="userList" @change="initPage"
                  :allowClear="true"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="infoDateStart" label="业务时间从">
                <a-date-picker v-model:value="infoDateStart" @change="initPage" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="infoDateEnd" label="至">
                <a-date-picker v-model:value="infoDateEnd" @change="initPage" />
              </a-form-item>
            </a-col>
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
        <a-button type="primary" @click="editFinance('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelFinanceManager">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editFinance('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delFinance(record.id)" @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'amount'">
            <span>
              {{
                String(record.amount.toFixed(2)).replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ','
                ).replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') }} </span>
          </template>
          <template v-else-if="column.key === 'isValid'">
            <a-tag :key="record.isValid" :color="record.isValid == 1 ? '#87d068' : 'grey'">
              {{ record.isValid == 1 ? "有效" : "失效" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'incomeAndExpenses'">
            <a-tag :key="record.incomeAndExpenses" :color="record.incomeAndExpenses == 'income' ? 'green' : 'red'">
              {{ record.incomeAndExpenses == "income" ? "收入" : "支出" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'infoDate'">
            <span>
              {{ record.infoDate ? String(record.infoDate).substring(0, 10) : '' }}
            </span>
          </template>
          <template v-else-if="column.key === 'fromSource'">
            <div v-for="(fromSource, index) in fromSourceTransferList" :key="index">
              <MySvgIcon v-if="record.fromSource.indexOf(fromSource.value) >= 0 && fromSource.value != ''"
                :name="fromSource.label" class="svg" style="
                    width: 1.5em;
                    height: 1.5em;
                    font-size: 18px;
                    cursor: pointer;
                    vertical-align: middle;"></MySvgIcon>
            </div>
          </template>
        </template>
      </a-table>
      <FinanceManagerDetail ref="editInfo" :open="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel">
      </FinanceManagerDetail>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  SearchInfo,
  pagination,
  columns,
  DataItem,
  fromSourceTransferList,
  pageInfo,
} from "./financeManager";
import { getFinanceMangerPage, deleteFinanceManger } from "@/api/finance/financeManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message } from "ant-design-vue";
import { getUserManagerList } from "@/api/user/userManager";
import dayjs, { Dayjs } from 'dayjs'
import { dictInfo, ModelInfo } from "@/views/finance/dict/dict";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let userList = ref([]);

let rowIds = [] as any;

const fromSourceList = ref<dictInfo[]>([]);

const incomeAndExpensesList = ref<dictInfo[]>([]);

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys: (string | number)[], _selectedRows: DataItem[]) => {
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected: boolean, selectedRows: DataItem[], changeRows: DataItem[]) => {
    console.log(selected, selectedRows, changeRows);
  },
})

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
  searchInfo.value = {};
  infoDateStart.value = '';
  infoDateEnd.value = '';
}

let infoDateStart = ref<string | Dayjs>();
let infoDateEnd = ref<string | Dayjs>();

function query() {
  searchInfo.value.infoDateStart = infoDateStart.value ? dayjs(infoDateStart.value).format('YYYY-MM-DD') : null;
  searchInfo.value.infoDateEnd = infoDateEnd.value ? dayjs(infoDateEnd.value).format('YYYY-MM-DD') : null;
  getFinancePage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination: any) {
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
}

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

function getUserInfoList() {
  getUserManagerList({}).then((res) => {
    if (res.code == "200") {
      userList.value = res.data;
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

const initPage = () => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
}

function init() {
  initPage();
  //获取字典列表
  getDictInfoList();
  //获取财务管理页面数据
  getFinancePage(searchInfo.value, pagination.value);
  //获取用户信息
  getUserInfoList();
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
