<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['attrName'].name" :label="labelMap['attrName'].label">
                <a-input v-model:value="searchInfo.attrName" :placeholder="'请选择' + labelMap['attrName'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['searchType'].name" :label="labelMap['searchType'].label">
                <a-input v-model:value="searchInfo.searchType" :placeholder="'请选择' + labelMap['searchType'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['icon'].name" :label="labelMap['icon'].label">
                <a-input v-model:value="searchInfo.icon" :placeholder="'请选择' + labelMap['icon'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['valueSelect'].name" :label="labelMap['valueSelect'].label">
                <a-input v-model:value="searchInfo.valueSelect" :placeholder="'请选择' + labelMap['valueSelect'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['attrType'].name" :label="labelMap['attrType'].label">
                <a-input v-model:value="searchInfo.attrType" :placeholder="'请选择' + labelMap['attrType'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['enable'].name" :label="labelMap['enable'].label">
                <a-input v-model:value="searchInfo.enable" :placeholder="'请选择' + labelMap['enable'].label" allow-clear />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :name="labelMap['catelogId'].name" :label="labelMap['catelogId'].label">
                <a-input v-model:value="searchInfo.catelogId" :placeholder="'请选择' + labelMap['catelogId'].label" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :name="labelMap['showDesc'].name" :label="labelMap['showDesc'].label">
                <a-input v-model:value="searchInfo.showDesc" :placeholder="'请选择' + labelMap['showDesc'].label" allow-clear />
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
        <a-button type="primary" @click="editPmsAttr('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelPmsAttr">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editPmsAttr('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delPmsAttr(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
        </template>
      </a-table>
      <PmsAttrDetail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk"
        @handleCancel="handleCancel"></PmsAttrDetail>
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
} from "./pmsAttrListTs";
import { getPmsAttrPage, deletePmsAttr } from "@/api/product/pmsAttr/pmsAttrTs";
import { message } from "ant-design-vue";

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
    attrName: {name: 'attrName', label: '属性名'},
    searchType: {name: 'searchType', label: '是否需要检索[0-不需要，1-需要]'},
    icon: {name: 'icon', label: '属性图标'},
    valueSelect: {name: 'valueSelect', label: '可选值列表[用逗号分隔]'},
    attrType: {name: 'attrType', label: '属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]'},
    enable: {name: 'enable', label: '启用状态[0 - 禁用，1 - 启用]'},
    catelogId: {name: 'catelogId', label: '所属分类'},
    showDesc: {name: 'showDesc', label: '快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整'},
});

let searchInfo = ref<SearchInfo>({});


function cancelQuery() {
  searchInfo.value = {};
}

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

function init() {
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
