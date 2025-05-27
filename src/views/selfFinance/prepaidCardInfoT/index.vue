<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['cardId'].name" :label="labelMap['cardId'].label">
                <a-input v-model:value="searchInfo.cardId" :placeholder="'请选择' + labelMap['cardId'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['cardName'].name" :label="labelMap['cardName'].label">
                <a-input v-model:value="searchInfo.cardName" :placeholder="'请选择' + labelMap['cardName'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['userId'].name" :label="labelMap['userId'].label">
                <a-input v-model:value="searchInfo.userId" :placeholder="'请选择' + labelMap['userId'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['initialBalance'].name" :label="labelMap['initialBalance'].label">
                <a-input v-model:value="searchInfo.initialBalance" :placeholder="'请选择' + labelMap['initialBalance'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['currentBalance'].name" :label="labelMap['currentBalance'].label">
                <a-input v-model:value="searchInfo.currentBalance" :placeholder="'请选择' + labelMap['currentBalance'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['expireDate'].name" :label="labelMap['expireDate'].label">
                <a-input v-model:value="searchInfo.expireDate" :placeholder="'请选择' + labelMap['expireDate'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['cardStatus'].name" :label="labelMap['cardStatus'].label">
                <a-input v-model:value="searchInfo.cardStatus" :placeholder="'请选择' + labelMap['cardStatus'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['version'].name" :label="labelMap['version'].label">
                <a-input v-model:value="searchInfo.version" :placeholder="'请选择' + labelMap['version'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
            <a-row :gutter="24">
                <a-col :span="20" style="text-align: right; margin-bottom: 20px;">
                  <a-space>
                    <a-button type="primary" @click="query"> 查找</a-button>
                    <a-button type="primary" @click="cancelQuery">清空</a-button>
                  </a-space>
                </a-col>
            </a-row>
        </a-form>
      </div>
    </div>
    <div class="button" style="margin-left: 10px;">
      <a-space>
        <a-button type="primary" @click="editPrepaidCardInfoT('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelPrepaidCardInfoT">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editPrepaidCardInfoT('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delPrepaidCardInfoT(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      <PrepaidCardInfoTDetail ref="editInfo" :open="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel"></PrepaidCardInfoTDetail>
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
} from "./prepaidCardInfoTListTs";
import { getPrepaidCardInfoTPage, deletePrepaidCardInfoT } from "@/api/selfFinance/prepaidCardInfoT/prepaidCardInfoTTs";
import { message } from "ant-design-vue";

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
    cardId: {name: 'cardId', label: '卡号（业务唯一标识）123'},
    cardName: {name: 'cardName', label: '卡名称111'},
    userId: {name: 'userId', label: '持卡人ID'},
    initialBalance: {name: 'initialBalance', label: '初始金额'},
    currentBalance: {name: 'currentBalance', label: '当前余额'},
    expireDate: {name: 'expireDate', label: '过期日期'},
    cardStatus: {name: 'cardStatus', label: '状态（正常/冻结/挂失/过期）'},
    version: {name: 'version', label: '版本'},
});

let searchInfo = ref<SearchInfo>({});


const cancelQuery = (): void => {
  searchInfo.value = {};
}

const query = (): void => {
  getPrepaidCardInfoTListPage(searchInfo.value, pagination.value);
}

const handleTableChange = (pagination): void => {
  getPrepaidCardInfoTListPage(searchInfo.value, pagination);
}

const delPrepaidCardInfoT = (ids: string): void => {
  deletePrepaidCardInfoT(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getPrepaidCardInfoTListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

const batchDelPrepaidCardInfoT = (): void => {
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
  delPrepaidCardInfoT(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
  console.log(e);
}

const getPrepaidCardInfoTListPage = (param: SearchInfo, cur: pageInfo): void => {
  loading.value = true;
  getPrepaidCardInfoTPage(param, cur.current, cur.pageSize)
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

const init = (): void => {
  //获取消费卡信息表页面数据
  getPrepaidCardInfoTListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editPrepaidCardInfoT = (type: string, id?: number): void => {
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

const handleOk = (v: boolean): void => {
  visible.value = v;
  getPrepaidCardInfoTListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean): void => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
</style>
