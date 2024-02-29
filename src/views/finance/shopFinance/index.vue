<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['saleAmountFrom'].name" :label="labelMap['saleAmountFrom'].label">
                <a-input-number v-model:value="searchInfo.saleAmountFrom"
                  :placeholder="'请选择' + labelMap['saleAmountFrom'].label" :formatter="value => `${value}`"
                  style="width: 100%" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['saleAmountEnd'].name" :label="labelMap['saleAmountEnd'].label">
                <a-input-number v-model:value="searchInfo.saleAmountEnd"
                  :placeholder="'请选择' + labelMap['saleAmountEnd'].label" :formatter="value => `${value}`"
                  style="width: 100%" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['saleDateFrom'].name" :label="labelMap['saleDateFrom'].label">
                <a-date-picker v-model:value="saleDateFrom" @change="initPage" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['saleDateEnd'].name" :label="labelMap['saleDateEnd'].label">
                <a-date-picker v-model:value="saleDateEnd" @change="initPage" />
              </a-form-item>
            </a-col>
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
        <a-button type="primary" @click="editShopFinance('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelShopFinance">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editShopFinance('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delShopFinance(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'saleAmount'">
            <span>
              {{
                String(record.saleAmount.toFixed(2)).replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ','
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
          <template v-else-if="column.key === 'saleDate'">
            <span>
              {{ record.saleDate ? String(record.saleDate).substring(0, 10) : '' }}
            </span>
          </template>
          <template v-else-if="column.key === 'payWay'">
            <div v-for="(fromSource, index) in fromSourceTransferList" :key="index">
              <MySvgIcon v-if="record.payWay.indexOf(fromSource.value) >= 0 && fromSource.value != ''"
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
      <ShopFinanceDetail ref="editInfo" :open="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel"></ShopFinanceDetail>
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
  fromSourceTransferList,
} from "./shopFinanceListTs";
import { getShopFinancePage, deleteShopFinance } from "@/api/finance/shopFinance/shopFinanceTs";
import { message } from "ant-design-vue";
import dayjs, { Dayjs } from 'dayjs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds = [] as any;

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
});

const labelMap = ref<any>(
  {
    shopName: { name: 'shopName', label: '商品名称' },
    shopCode: { name: 'shopCode', label: '商品编码' },
    saleAmount: { name: 'saleAmount', label: '售价' },
    saleAmountFrom: { name: 'saleAmountFrom', label: '售价从' },
    saleAmountEnd: { name: 'saleAmountEnd', label: '售价到' },
    isValid: { name: 'isValid', label: '是否有效' },
    saleDate: { name: 'saleDate', label: '销售日期' },
    saleDateFrom: { name: 'saleDateFrom', label: '销售日期从' },
    saleDateEnd: { name: 'saleDateEnd', label: '销售日期到' },
  });

let searchInfo = ref<SearchInfo>({});


function cancelQuery() {
  searchInfo.value = {};
}

let saleDateFrom = ref<string | Dayjs>();
let saleDateEnd = ref<string | Dayjs>();

function query() {
  searchInfo.value.saleDateFrom = saleDateFrom.value ? dayjs(saleDateFrom.value).format('YYYY-MM-DD') : null;
  searchInfo.value.saleDateEnd = saleDateEnd.value ? dayjs(saleDateEnd.value).format('YYYY-MM-DD') : null;
  getShopFinanceListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getShopFinanceListPage(searchInfo.value, pagination);
}

function delShopFinance(ids: string) {
  deleteShopFinance(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getShopFinanceListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelShopFinance() {
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
  delShopFinance(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
}

function getShopFinanceListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getShopFinancePage(param, cur.current, cur.pageSize)
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

const initPage = () => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
}

function init() {
  //获取商店财务表页面数据
  getShopFinanceListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editShopFinance(type: string, id?: number) {
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
  getShopFinanceListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>@import "@/style/index.scss";</style>
