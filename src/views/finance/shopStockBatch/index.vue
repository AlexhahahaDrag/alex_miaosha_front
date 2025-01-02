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
            <a-col :span="8">
              <a-form-item
                :name="labelMap['batchCode'].name"
                :label="labelMap['batchCode'].label"
              >
                <a-input
                  v-model:value="searchInfo.batchCode"
                  :placeholder="'请选择' + labelMap['batchCode'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :name="labelMap['batchName'].name"
                :label="labelMap['batchName'].label"
              >
                <a-input
                  v-model:value="searchInfo.batchName"
                  :placeholder="'请选择' + labelMap['batchName'].label"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col style="text-align: right">
              <a-space>
                <a-button type="primary" @click="query"> 查找</a-button>
                <a-button type="primary" @click="cancelQuery">清空</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="button" style="margin-left: 10px">
      <a-space>
        <a-button type="primary" @click="editShopStockBatch('add')"
          >新增</a-button
        >
        <a-button type="primary" danger @click="batchDelShopStockBatch"
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
        :scroll="{ x: 1100, y: 470 }"
        :row-selection="rowSelection"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="editShopStockBatch('update', record.id)"
                >编辑</a-button
              >
              <a-popconfirm
                title="确认删除?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="delShopStockBatch(record.id)"
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
              {{ record.isValid == 1 ? '有效' : '失效' }}
            </a-tag>
          </template>
        </template>
      </a-table>
      <ShopStockBatchDetail
        ref="editInfo"
        :open="visible"
        :modelInfo="modelInfo"
        @handleOk="handleOk"
        @handleCancel="handleCancel"
      ></ShopStockBatchDetail>
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
} from './shopStockBatchListTs';
import {
  getShopStockBatchPage,
  deleteShopStockBatch,
} from '@/api/finance/shopStockBatch/shopStockBatchTs';
import { message } from 'ant-design-vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import { dictInfo } from '@/views/finance/dict/dict';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds = [] as any;

const rowSelection = ref({
  checkStrictly: false,
  onChange: (
    selectedRowKeys: (string | number)[],
    _selectedRows: DataItem[],
  ) => {
    rowIds = selectedRowKeys;
  },
  onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (
    selected: boolean,
    selectedRows: DataItem[],
    changeRows: DataItem[],
  ) => {
    console.log(selected, selectedRows, changeRows);
  },
});

const labelMap = ref<any>({
  batchCode: { name: 'batchCode', label: '订单编码' },
  batchName: { name: 'batchName', label: '订单名称' },
  isValid: { name: 'isValid', label: '状态' },
  description: { name: 'description', label: '描述' },
});

let searchInfo = ref<SearchInfo>({});

let isValidList = ref<dictInfo[]>([]);

const getDictInfoList = (): void => {
  getDictList('is_valid').then((res) => {
    if (res.code == '200') {
      isValidList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == 'is_valid',
      );
    } else {
      message.error((res && res.message) || '查询列表失败！');
    }
  });
};

const cancelQuery = (): void => {
  searchInfo.value = {};
};

const query = (): void => {
  getShopStockBatchListPage(searchInfo.value, pagination.value);
};

const handleTableChange = (pagination): void => {
  getShopStockBatchListPage(searchInfo.value, pagination);
};

const delShopStockBatch = (ids: string): void => {
  deleteShopStockBatch(ids).then((res) => {
    if (res.code == '200') {
      message.success((res && '删除' + res.message) || '删除成功！', 3);
      getShopStockBatchListPage(searchInfo.value, pagination.value);
    } else {
      message.error((res && res.message) || '删除失败！', 3);
    }
  });
};

const batchDelShopStockBatch = (): void => {
  let ids = '';
  if (rowIds && rowIds.length > 0) {
    rowIds.forEach((item: string) => {
      ids += item + ',';
    });
    ids = ids.substring(0, ids.length - 1);
  } else {
    message.warning('请先选择数据！', 3);
    return;
  }
  delShopStockBatch(ids);
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
  console.log(e);
};

const getShopStockBatchListPage = (param: SearchInfo, cur: pageInfo): void => {
  loading.value = true;
  getShopStockBatchPage(param, cur.current, cur.pageSize)
    .then((res) => {
      if (res.code == '200') {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        message.error((res && res.message) || '查询列表失败！');
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const init = (): void => {
  getDictInfoList();
  //获取商店库存批次表页面数据
  getShopStockBatchListPage(searchInfo.value, pagination.value);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editShopStockBatch = (type: string, id?: number): void => {
  if (type == 'add') {
    modelInfo.value.title = '新增明细';
    modelInfo.value.id = undefined;
  } else if (type == 'update') {
    modelInfo.value.title = '修改明细';
    modelInfo.value.id = id;
  }
  modelInfo.value.confirmLoading = true;
  visible.value = true;
};

const handleOk = (v: boolean): void => {
  visible.value = v;
  getShopStockBatchListPage(searchInfo.value, pagination.value);
};

const handleCancel = (v: boolean): void => {
  visible.value = v;
};
</script>
<style lang="scss" scoped></style>
