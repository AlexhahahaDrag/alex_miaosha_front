<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item name="name" label="name">
                <a-input v-model:value="searchInfo.name" placeholder="name" @change="initPage" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="shop" label="商铺">
                <a-input v-model:value="searchInfo.shop" placeholder="商铺" @change="initPage" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item name="source" label="来源">
                <a-select ref="select" v-model:value="searchInfo.source" mode="combobox" placeholder="请输入来源类型"
                  :field-names="{ label: 'typeName', value: 'typeCode' }" :options="sourceList" @change="initPage" 
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
        <a-button type="primary" @click="editPmsShopProduct('add')">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <a-button type="danger" @click="batchDelPmsShopProduct">删除</a-button>
      </a-space>
    </div>
    <div class="content">
      <a-table :dataSource="dataSource" :columns="columns" :loading="loading" :row-key="(record) => record.id"
        :pagination="pagination" @change="handleTableChange" :scroll="{ x: 1100 }" :row-selection="rowSelection">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small" @click="editPmsShopProduct('update', record.id)">编辑</a-button>
              <a-popconfirm title="确认删除?" ok-text="确认" cancel-text="取消" @confirm="delPmsShopProduct(record.id)"
                @cancel="cancel">
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'image' && record.image">
            <a-image :width="80" :src=record.image />
          </template>
          <template v-else-if="column.key === 'productUrl' && record.productUrl">
            <a :href=record.productUrl target="_blank">查看商城商品信息</a>
          </template>
          <template v-else-if="column.key === 'price' && record.price">
            <span v-if="record.comparePrice && record.price && record.price < record.comparePrice"
              style="font-weight: 900; font-style: oblique; color: red;">
              {{ record.price }}</span>
            <span v-else>{{ record.price }}</span>
          </template>
          <template v-else-if="column.key === 'source'">
            <div v-for="source in sourceTransferList">
              <svgIcon v-if="record.source.indexOf(source.value) >= 0 && source.value != ''" :name="source.label"
                class="svg" style="
                    width: 1.5em;
                    height: 1.5em;
                    font-size: 18px;
                    cursor: pointer;
                    verticle-align: middle;"></svgIcon>
            </div>
          </template>
          <template v-else-if="column.key === 'operateTime' && record.operateTime">
            <span>
              {{ record.operateTime ? dayjs(record.operateTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </span>
          </template>
        </template>
      </a-table>
      <PmsShopProductDetail ref="editInfo" :visible="visible" :modelInfo="modelInfo" @handleOk="handleOk" @handleCancel="handleCancel">
      </PmsShopProductDetail>
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
  sourceTransferList,
} from "./pmsShopProductListTs";
import { getNewestPmsShopProductPage, deletePmsShopProduct } from "@/api/product/pmsShopProduct/pmsShopProductTs";
import { message } from "ant-design-vue";
import dayjs from 'dayjs';
import svgIcon from "@v/common/icons/svgIcon.vue";
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
}

function query() {
  getPmsShopProductListPage(searchInfo.value, pagination.value);
}

function handleTableChange(pagination) {
  getPmsShopProductListPage(searchInfo.value, pagination);
}

function delPmsShopProduct(ids: string) {
  deletePmsShopProduct(ids).then((res) => {
    if (res.code == "200") {
      message.success((res && "删除" + res.message) || "删除成功！", 3);
      getPmsShopProductListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || "删除失败！", 3);
    }
  });
}

function batchDelPmsShopProduct() {
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
  delPmsShopProduct(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const sourceList = ref<dictInfo[]>([{ typeName: '请选择', typeCode: '' }]);

const cancel = (e: MouseEvent) => {
  console.log(e);
}

function getPmsShopProductListPage(param: SearchInfo, cur: pageInfo) {
  loading.value = true;
  getNewestPmsShopProductPage(param, cur.current, cur.pageSize)
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
  getDictList("shop_type").then((res) => {
    if (res.code == "200") {
      sourceList.value = sourceList.value.concat(res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "shop_type"
      ));
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  //获取商品网上商品信息页面数据
  getPmsShopProductListPage(searchInfo.value, pagination.value);
  //获取字典信息
  getDictInfoList();
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPmsShopProduct(type: string, id?: number) {
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
  getPmsShopProductListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean) => {
  visible.value = v;
};

const initPage = () => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
}
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
