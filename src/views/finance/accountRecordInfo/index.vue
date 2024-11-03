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
              <a-form-item name="account" label="账号">
                <a-select ref="select" v-model:value="searchInfo.account" placeholder="请输入账号"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="accountList" @change="initPage"
                  :allowClear="true"></a-select>
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
        <a-button type="primary" @click="editAccountRecordInfo('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelAccountRecordInfo">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :rowKey="(record: any) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :rowSelection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editAccountRecordInfo('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delAccountRecordInfo(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'amount'">
            <span>
              {{
                String(record?.amount?.toFixed(2) || '').replace(/(?<!\.\d*)\B(?=(\d{3})+(?!\d)) /g, ','
                ).replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3') }} </span>
          </template>
          <template v-else-if="column.key === 'isSend'">
            <a-tag :key="record.isSend" :color="record.isSend == 1 ? 'grey' : '#87d068'">
              {{ record.isSend == 1 ? "是" : "否" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'avliDate'">
            <span>
              {{ record.avliDate ? dayjs(record.avliDate).format("YYYY-MM-DD") : '' }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :key="record.status" :color="record.status == 0 ? '#C0C0C0' : record.status == 1 ? '#f50' : '#87d068'">
              {{ record.status == 0 ? '过期' : record.status == 1 ? '待过期' : '有效' }}
            </a-tag>
          </template>
        </template>
      </a-table>
      <AccountRecordInfoDetail ref="editInfo" :open="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel">
      </AccountRecordInfoDetail>
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
} from "./accountRecordInfoListTs";
import { getAccountRecordInfoPage, deleteAccountRecordInfo } from "@/api/finance/accountRecordInfo/accountRecordInfoTs";
import { message } from "ant-design-vue";
import dayjs, { Dayjs } from 'dayjs'
import { dictInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";

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
})

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
  searchInfo.value = {};
  infoDateStart.value = null;
  infoDateEnd.value = null;
}

let infoDateStart = ref<Dayjs | null>();
let infoDateEnd = ref<Dayjs | null>();

function query() {
  getAccountRecordInfoListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getAccountRecordInfoListPage(searchInfo.value, pagination);
}

function delAccountRecordInfo(ids: string) {
  deleteAccountRecordInfo(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getAccountRecordInfoListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelAccountRecordInfo() {
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
  delAccountRecordInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
}

function getAccountRecordInfoListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getAccountRecordInfoPage(param, cur.current, cur.pageSize)
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

const accountList = ref<dictInfo[]>([]);

function getDictInfoList() {
  getDictList("account_type").then((res) => {
    if (res.code == "200") {
      accountList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "account_type"
      );
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
  //获取页面数据
  getAccountRecordInfoListPage(searchInfo.value, pagination.value);
  getDictInfoList();
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editAccountRecordInfo(type: string, id?: number) {
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
  getAccountRecordInfoListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>

</style>
