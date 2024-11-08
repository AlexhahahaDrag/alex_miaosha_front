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
            <a-col :span="6">
              <a-form-item name="name" label="分类名称">
                <a-input
                  v-model:value="searchInfo.name"
                  placeholder="分类名称"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="parentCid" label="父分类id">
                <a-input
                  v-model:value="searchInfo.parentCid"
                  placeholder="父分类id"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="catLevel" label="层级">
                <a-input
                  v-model:value="searchInfo.catLevel"
                  placeholder="层级"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="showStatus" label="是否显示[0-不显示，1显示]">
                <a-input
                  v-model:value="searchInfo.showStatus"
                  placeholder="是否显示[0-不显示，1显示]"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="sort" label="排序">
                <a-input
                  v-model:value="searchInfo.sort"
                  placeholder="排序"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="icon" label="图标地址">
                <a-input
                  v-model:value="searchInfo.icon"
                  placeholder="图标地址"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="productUnit" label="计量单位">
                <a-input
                  v-model:value="searchInfo.productUnit"
                  placeholder="计量单位"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="productCount" label="商品数量">
                <a-input
                  v-model:value="searchInfo.productCount"
                  placeholder="商品数量"
                  @change="initPage"
                  allow-clear
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
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
        <a-button type="primary" @click="editPmsCategory('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="primary" danger @click="batchDelPmsCategory"
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
                @click="editPmsCategory('update', record.id)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delPmsCategory(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
        </template>
      </a-table>
      <PmsCategoryDetail
        ref="editInfo"
        :open="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></PmsCategoryDetail>
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
} from "./pmsCategoryListTs";
import {
  getPmsCategoryPage,
  deletePmsCategory,
} from "@/api/product/pmsCategory/pmsCategoryTs";
import { message } from "ant-design-vue";

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

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
  searchInfo.value = {};
}

function query() {
  getPmsCategoryListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getPmsCategoryListPage(searchInfo.value, pagination);
}

function delPmsCategory(ids: string) {
  deletePmsCategory(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getPmsCategoryListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelPmsCategory() {
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
  delPmsCategory(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

function getPmsCategoryListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getPmsCategoryPage(param, cur.current, cur.pageSize)
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
  //获取商品三级分类页面数据
  getPmsCategoryListPage(searchInfo.value, pagination.value);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsCategory(type: string, id?: number) {
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
  getPmsCategoryListPage(searchInfo.value, pagination.value);
};

const initPage = () => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};
</script>
<style lang="scss" scoped></style>
