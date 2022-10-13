<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <div class="search-box-in">
          <a-form layout="inline" @keyup.enter.native="searchInfo">
            <a-space>
              <a-input
                v-model:value="searchInfo.name"
                placeholder="名称"
                allow-clear
              />
              <a-select
                ref="select"
                v-model:value="searchInfo.fromSource"
                mode="combobox"
                placeholder="请输入来源"
                :field-names="{ label: 'content', value: 'id' }"
                :options="activityStatusList"
                :allowClear="true"
              ></a-select>
              <a-range-picker
                v-model:value="times"
                style="width: 400px"
                :ranges="ranges"
                show-time
                format="YYYY/MM/DD HH:mm:ss"
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
        <a-button type="primary" @click="query">新增</a-button>
        <a-button type="primary" @click="query">导入</a-button>
        <!-- <a-button type="danger" @click="delFinanceManager">删除</a-button> -->
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
        :scroll="{ x: 1500 }"
        :row-selection="rowSelection"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small">编辑</a-button>
              <a-popconfirm
                title="确认删除博客?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="confirm(record.id)"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger @click="delFinanceManager(record.id)">删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'isValid'">
            <a-tag :key="record.isValid" :color="record.isValid == 1 ? '#87d068' : 'grey'">
              {{ record.isValid == 1 ? "有效" : "失效" }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { SearchInfo, pageInfo, pagination, columns, DataItem } from "./financeManager";
import dayjs, { Dayjs } from "dayjs";
import { getFinanceMangerPage, deleteFinanceManger } from "@/api/finance/financeManager/financeManager";
import { notification } from "ant-design-vue";

const rowSelection = ref({
  checkStrictly: false,
  onChange: (selectedRowKeys: (string | number)[], selectedRows: DataItem[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
  getFinancePage(searchInfo.value);
}

function delFinanceManager(ids: string) {
  deleteFinanceManger(ids).then((res) => {
    notification.error({
          message: res.code,
          description: (res && res.message) || "删除失败！",
        });
    if (res.code == "200") {
      getFinancePage(searchInfo.value);
    }
  })
}

function handleTableChange(pagination: pageInfo) {
  searchInfo.value.pageNo = pagination.current;
  searchInfo.value.pageSize = pagination.pageSize;
  // blogList(searchInfo.value);
}

const confirm = (id: number) => {
  // deleteBlogById(id).then((res) => {
  //   if (res.code == "success") {
  //     message.success(res.message);
  //     blogList(searchInfo.value);
  //   } else {
  //     message.error(res.message);
  //   }
  // });
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
  console.log(e);
};

const activityStatusList = [];

let times = ref<RangeValue>();
const ranges = {
  Today: [dayjs(), dayjs()] as RangeValue,
  "This Month": [dayjs(), dayjs().endOf("month")] as RangeValue,
};

function getFinancePage(param: SearchInfo) {
  loading.value = true;
  getFinanceMangerPage(param)
    .then((res) => {
      if (res.code == "200") {
        dataSource.value = res.data.records;
        pagination.value.current = res.data.current;
        pagination.value.pageSize = res.data.size;
        pagination.value.total = res.data.total;
      } else {
        notification.error({
          message: res.code,
          description: (res && res.message) || "查询列表失败！",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

//获取财务管理页面数据
getFinancePage(searchInfo.value);
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
