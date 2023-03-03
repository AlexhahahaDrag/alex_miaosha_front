<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="attrName" label="属性名">
                <a-input v-model:value="searchInfo.attrName" placeholder="属性名" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="enable" label="状态">
                <a-select ref="select" v-model:value="searchInfo.enable" mode="combobox" placeholder="请输入状态"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="validList"
                  :allowClear="true"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="catelogId" label="所属分类">
                <a-input v-model:value="searchInfo.catelogId" placeholder="所属分类" allow-clear />
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
        <a-button type="primary" @click="editPmsAttr('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="danger" @click="batchDelPmsAttr">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editPmsAttr('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delPmsAttr(record.id)" @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'enable'">
            <a-tag :key="record.enable" :color="record.enable == '1' ? '#87d068' : 'grey'">
              {{ record.enable == '1' ? "有效" : "失效" }}
            </a-tag>
          </template>
        </template>
      </a-table>
      <Detail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk" @handleCancel="handleCancel">
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
  pageInfo,
} from "./pmsAttrListTs";
import { dictInfo, ModelInfo } from "@/views/finance/dict/dict";
import { getPmsAttrPage, deletePmsAttr } from "@/api/product/pmsAttr/pmsAttrTs";
import { message } from "ant-design-vue";
import Detail from "./detail/pmsAttrDetail.vue";
import { Dayjs } from 'dayjs'
import { getDictList } from "@/api/finance/dict/dictManager";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
let validList = ref<dictInfo[]>([]);
let rowIds = [] as any;

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
  getPmsAttrListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getPmsAttrListPage(searchInfo.value, pagination);
}

function delPmsAttr(ids: string) {
  deletePmsAttr(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getPmsAttrListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelPmsAttr() {
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
  delPmsAttr(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
}

function getPmsAttrListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getPmsAttrPage(param, cur.current, cur.pageSize)
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
  getDictList("is_valid").then((res) => {
    if (res.code == "200") {
      validList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}


function init() {
  //获取字典值
  getDictInfoList();
  //获取商品属性页面数据
  getPmsAttrListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsAttr(type: string, id?: number) {
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
  getPmsAttrListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
