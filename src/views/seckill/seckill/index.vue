<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <div class="search-box-in">
          <a-form layout="inline">
            <a-space>
              <a-input
                v-model:value="searchInfo.activityName"
                placeholder="活动名称"
                allow-clear
              />
              <a-select
                ref="select"
                v-model:value="searchInfo.activityStatus"
                placeholder="请输入标签名"
                :field-names="{ label: 'content', value: 'id' }"
                :options="activityStatusList"
                @change="initPage"
                :allowClear="true"
              ></a-select>
              <a-range-picker
                v-model:value="times"
                style="width: 400px"
                :ranges="ranges"
                show-time
                format="YYYY/MM/DD HH:mm:ss"
                @change="initPage"
              />
              <a-button type="primary" @click="query"> 查找</a-button>
              <a-button type="primary" @click="cancelQuery">清空</a-button>
            </a-space>
          </a-form>
        </div>
      </div>
    </div>
    <div class="content">
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :loading="loading"
        :row-key="(record) => record.id"
        :pagination="pagination"
        :scroll="{ x: 1500 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operation'">
            <a-space>
              <a-button type="primary" size="small">编辑</a-button>
              <a-popconfirm
                title="确认删除博客?"
                ok-text="确认"
                cancel-text="取消"
                @cancel="cancel"
              >
                <a-button type="primary" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
            <span></span>
          </template>
          <template v-else-if="column.key === 'tagList'">
            <span
              v-if="
                record.tagList &&
                record.tagList.length > 0 &&
                record.tagList[0] != null
              "
            >
              <!-- <a-tag
                v-for="(tag, index) in record.tagList"
                :key="tag.id"
                :color="colorInfo[index]"
              >
                {{ tag.content }}
              </a-tag> -->
            </span>
          </template>
          <template v-else-if="column.key === 'blogSortList'">
            <span
              v-if="
                record.blogSortList &&
                record.blogSortList.length > 0 &&
                record.blogSortList[0] != null
              "
            >
              <!-- <a-tag
                v-for="(blogSort, index) in record.blogSortList"
                :key="blogSort.id"
                :color="colorInfo[index]"
              >
                {{ blogSort.sortName }}
              </a-tag> -->
            </span>
          </template>
          <template v-else-if="column.key === 'isOriginal'">
            <a-tag
              :key="record.isOriginal"
              :color="record.isOriginal ? 'red' : 'green'"
            >
              {{ record.isOriginal ? "原创" : "转载" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'openComment'">
            <a-tag
              :key="record.openComment"
              :color="record.openComment ? 'green' : 'red'"
            >
              {{ record.openComment ? "开启" : "关闭" }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'isPublish'">
            <a-tag
              :key="record.isPublish"
              :color="record.isPublish ? 'green' : 'grey'"
            >
              {{ record.isPublish ? "发布" : "下架" }}
            </a-tag>
          </template>
          <!-- <template v-else-if="column.key === 'level'">
            <div v-for="(level, index) in levelInfo">
              <a-tag
                v-if="record.level == level.value && level.value !== ''"
                :key="level"
                :color="colorInfo[index]"
              >
                {{ level.label }}
              </a-tag>
            </div>
          </template> -->
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SearchInfo, pagination, columns } from "./seckill";
import dayjs, { Dayjs } from "dayjs";

type RangeValue = [Dayjs, Dayjs];

let searchInfo = ref<SearchInfo>({});
function cancelQuery() {
  searchInfo.value = {};
}

function query() {}

// const confirm = (id: number) => {
// deleteBlogById(id).then((res) => {
//   if (res.code == "success") {
//     message.success(res.message);
//     blogList(searchInfo.value);
//   } else {
//     message.error(res.message);
//   }
// });
// };

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

const initPage = () => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
};
</script>
<style lang="scss" scoped>
// .content-box {
//   box-sizing: border-box;
//   padding: 10px 20px 0 0;
//   .a-form {
//     width: 100%;
//   }
// }
</style>
