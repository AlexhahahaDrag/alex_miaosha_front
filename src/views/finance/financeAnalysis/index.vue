<template>
  <div class="page-info">
    <div class="search">
      <div class="search-box">
        <a-space>
          <a-date-picker v-model:value="searchDateTime" picker="month" :locale="locale" @change="changeMonth" />
          <a-select style="width: 100px" ref="select" v-model:value="searchUser"
            :field-names="{ label: 'nickName', value: 'id' }" :options="userList" placeholder="请选择用户"
            @change="changeMonth">
          </a-select>
        </a-space>
      </div>
    </div>

    <div class="content">
      <div style="background-color: #ececec; padding: 20px">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-card :bordered="false" class="stat-card">
              <div class="stat-title">总金额</div>
              <div class="stat-value text-blue">{{ sumAmount }}</div>
              <div class="stat-footer">
                <span class="text-gray">-10.1% | 较上月</span>
                <span class="text-gray" style="margin-left: 10px">
                  4.7%同比
                </span>
              </div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card :bordered="false" class="stat-card">
              <div class="stat-title">月总消费</div>
              <div class="stat-value text-orange">{{ monthExpenseSum }}</div>
              <div class="stat-footer">
                <span class="text-green">+3.1%同比 | +0.7% 环比</span>
              </div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card :bordered="false" class="stat-card">
              <div class="stat-title">月总收入</div>
              <div class="stat-value text-green">{{ monthIncomeSum }}</div>
              <div class="stat-footer">
                <span class="text-gray">0同比 | 0环比</span>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="24" style="margin-top: 20px">
          <a-col :span="6" v-for="(config, index) in listConfigs" :key="index">
            <a-card :bordered="false" class="list-card" :bodyStyle="{
              padding: '10px 12px',
              minHeight: '250px',
              backgroundColor: '#f7f9fc',
            }">
              <template #title>
                <div class="list-header">
                  <span>{{ config.title }}</span>
                  <down-outlined class="text-gray" />
                </div>
              </template>
              <div class="list-container">
                <div v-for="(item, itemIndex) in config.list" :key="itemIndex" class="list-item">
                  <span class="item-name">{{ item.typeName }}</span>
                  <span class="item-value" :class="config.valueClass">
                    {{ item.amount }}
                  </span>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="24" style="padding-top: 20px">
          <a-col :span="12">
            <div class="chart-card">
              <pie-chart title="当月收入分析" height="100%" width="100%" :data="pieIncomeData" :tooltip="tooltip">
              </pie-chart>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="chart-card">
              <pie-chart title="当月支出分析" height="100%" width="100%" :data="pieExpenseData" :tooltip="tooltip">
              </pie-chart>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="24" style="padding-top: 10px">
          <a-col :span="12">
            <div class="chart-card">
              <bar-chart height="100%" width="100%" title="日消费" :data="dayData" :config="dayConfig">
              </bar-chart>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="chart-card">
              <bar-chart height="100%" width="100%" title="月消费" :data="monthData" :config="monthConfig">
              </bar-chart>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';
import type { FinanceManagerData } from '@/views/finance/financeManager/config';
import * as math from 'mathjs';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from './chart/bar';
import { dateFormatter, tooltip, type ItemInfo } from './analysis/index';
import {
  getBalance,
  getIncomeAndExpense,
  getDayExpense,
  getMonthExpense,
} from '@/views/finance/financeAnalysis/api';
import { useUserStore } from '@/store/modules/user/user';
import { useUserInfo } from '@/composables/useUserInfo';

// 用户信息
const userInfo = useUserStore()?.getUserInfo;

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();
// 余额列表
const balanceList = ref<FinanceManagerData[]>([]);

// 总金额
let sumAmount = computed(() => {
  return (
    balanceList.value?.reduce(
      (acc: math.BigNumber, item: FinanceManagerData) => {
        return math.add(acc, math.bignumber(item.amount ? item.amount : 0));
      },
      math.bignumber(0),
    ) || math.bignumber(0)
  );
});
// 月消费总金额
let monthExpenseSum = ref<math.BigNumber>(math.bignumber(0));
// 月收入总金额
let monthIncomeSum = ref<math.BigNumber>(math.bignumber(0));

let searchUser = ref<number>(userInfo?.id || 0);
let searchDateTime = ref<Dayjs>(dayjs());

// 余额列表配置
const listConfigs = computed(() => [
  {
    title: '账户',
    list:
      getBalanceDetailData(balanceList.value, ['zfb', 'wx', 'yhk', 'xj']) || [],
    valueClass: '',
  },
  {
    title: '消费',
    list: getBalanceDetailData(balanceList.value, ['jd', 'hb', 'bt']) || [],
    valueClass: 'text-orange',
  },
  {
    title: '生活缴费',
    list:
      getBalanceDetailData(balanceList.value, ['sf', 'rqf', 'dfw', 'dfm']) ||
      [],
    valueClass: '',
  },
  {
    title: '话费',
    list: getBalanceDetailData(balanceList.value, ['hf']) || [],
    valueClass: '',
  },
]);
// 初始化用户列表，添加"所有人"选项
userList.value = [{ id: 0, nickName: '所有人' }];
// 支出分析数据
let pieExpenseData = ref<ItemInfo[]>([]);
// 收入分析数据
let pieIncomeData = ref<ItemInfo[]>([]);

// 获取余额信息
const getBalanceInfo = async (userId: number, dateStr: string) => {
  const {
    code,
    data,
    message: messageInfo,
  } = await getBalance(userId, dateStr);
  if (code == '200') {
    // 余额列表数据
    balanceList.value = data?.list || [];
  } else {
    message.error(messageInfo || '查询列表失败！');
  }
};

// 获取余额明细列表数据
const getBalanceDetailData = (
  data: FinanceManagerData[],
  keywords: string[],
): FinanceManagerData[] => {
  if (!data?.length) {
    return [];
  }
  return (
    data.filter(
      (item: FinanceManagerData) =>
        item?.typeCode &&
        keywords.some(
          (k: string) => item?.typeCode && item?.typeCode.indexOf(k) > -1,
        ),
    ) || []
  );
};

// 获取收入和支出信息
const getIncomeAndExpenseInfo = async (userId: number, dateStr: string) => {
  const {
    code,
    data,
    message: messageInfo,
  } = await getIncomeAndExpense(userId, dateStr);
  if (code == '200') {
    if (data?.length) {
      monthExpenseSum.value = math.bignumber(0);
      monthIncomeSum.value = math.bignumber(0);
      let dd: ItemInfo[] = [];
      data
        .filter(
          (item: FinanceManagerData) => item.incomeAndExpenses == 'income',
        )
        .forEach((item: FinanceManagerData) => {
          dd.push({ name: item.typeCode || '', value: item.amount || 0 });
          monthIncomeSum.value = math.add(
            monthIncomeSum.value,
            math.bignumber(item.amount ? item.amount : 0),
          );
        });
      pieIncomeData.value = dd;
      let expense: ItemInfo[] = [];
      data
        .filter(
          (item: FinanceManagerData) => item.incomeAndExpenses == 'expense',
        )
        .forEach((item: FinanceManagerData) => {
          expense.push({ name: item.typeCode || '', value: item.amount || 0 });
          monthExpenseSum.value = math.add(
            monthExpenseSum.value,
            math.bignumber(item.amount ? item.amount : 0),
          );
        });
      pieExpenseData.value = expense;
    }
  } else {
    message.error(messageInfo || '查询列表失败！');
  }
};

// 日消费数据
let dayData = ref<any>([]);
// 日消费配置
let dayConfig = ref<barItem>({
  xAxis: [],
  series: [],
  xTile: '天数',
  yTitle: '金钱(元)',
  yNameGap: 30,
  tooltip: {},
  legend: [],
  color: '#aa55ff',
});

// 月消费数据
let monthData = ref<any>([]);
// 月消费配置
let monthConfig = ref<barItem>({
  xAxis: [],
  series: [],
  xTile: '月份',
  yTitle: '金钱(元)',
  yNameGap: 30,
  tooltip: {},
  legend: [],
  color: '#5555ff',
});

const getDayExpenseInfo = async (userId: number, dateStr: string) => {
  getDayExpense(userId, dateStr).then(
    (res: { code: string; data: any[]; message: any }) => {
      if (res.code == '200') {
        if (res.data) {
          let series = [] as any;
          let xAxis = [] as any;
          res.data.forEach((item) => {
            series.push(item.amount);
            xAxis.push(item.infoDate);
          });
          dayConfig.value = {
            xAxis: xAxis,
            series: series,
            xTile: '天数',
            yTitle: '金钱(元)',
            yNameGap: 50,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
              formatter(param: any) {
                let tip = '';
                let unit = '元';
                let name = '花费';
                tip += `<p style="margin: 0">${param[0].axisValue}日</p>`;
                param.forEach(
                  (element: {
                    axisValue: any;
                    marker: any;
                    value: any;
                    seriesName: any;
                  }) => {
                    tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
                  },
                );
                return tip;
              },
            },
            color: '#aa55ff',
          };
          dayData.value = series;
        }
      } else {
        message.error((res && res.message) || '查询列表失败！');
      }
    },
  );
};

const getMonthExpenseInfo = async (userId: number, dateStr: string) => {
  getMonthExpense(userId, dateStr).then(
    (res: { code: string; data: any[]; message: any }) => {
      if (res.code == '200') {
        if (res.data) {
          let series = [] as any;
          let xAxis = [] as any;
          res.data.forEach((item) => {
            series.push(item.amount);
            xAxis.push(item.infoDate);
          });
          monthConfig.value = {
            xAxis: xAxis,
            series: series,
            yTitle: '金钱(元)',
            xTile: '月份',
            yNameGap: 50,
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
              },
              formatter(param: any) {
                let tip = '';
                let unit = '元';
                let name = '花费';
                tip += `<p style="margin: 0">${param[0].axisValue}月</p>`;
                param.forEach(
                  (element: {
                    axisValue: any;
                    marker: any;
                    value: any;
                    seriesName: any;
                  }) => {
                    tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
                  },
                );
                return tip;
              },
            },
            color: '#5555ff',
          };
          monthData.value = series;
        }
      } else {
        message.error((res && res.message) || '查询列表失败！');
      }
    },
  );
};

const changeMonth = () => {
  getInfo();
};

function getInfo() {
  // 获取日期
  let dateStr = searchDateTime.value.format(dateFormatter);
  // 获取余额信息
  getBalanceInfo(searchUser.value, dateStr);
  // 获取收入和支出信息
  getIncomeAndExpenseInfo(searchUser.value, dateStr);
  // 获取日消费信息
  getDayExpenseInfo(searchUser.value, dateStr);
  // 获取月消费信息
  getMonthExpenseInfo(searchUser.value, dateStr);
}

onMounted(() => {
  getInfo();
});
</script>
<style lang="scss" scoped>
  .page-info {
    width: 100%;

    .search {
      background: rgb(237, 240, 237);
      border-radius: 10px 10px 10px 10px;
    }

    .search-box {
      padding-top: 15px;
      padding-left: 20px;
      padding-bottom: 10px;
    }

    .button {
      margin-top: 10px;
    }

    .content {
      margin-top: 10px;
    }
  }
</style>

<style lang="scss" scoped>
  .text-blue {
    color: #1a3c75;
  }

  .text-orange {
    color: #e67e22;
  }

  .text-green {
    color: #52c41a;
  }

  .text-gray {
    color: #8c8c8c;
  }

  .stat-card {
    border-radius: 8px;

    :deep(.ant-card-body) {
      padding: 24px;
    }

    .stat-title {
      font-size: 16px;
      color: #1a3c75;
      font-weight: bold;
      margin-bottom: 12px;
    }

    .stat-value {
      font-size: 36px;
      font-weight: bold;
      line-height: 1.2;
      margin-bottom: 8px;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
        Arial, sans-serif;
    }

    .stat-footer {
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .list-card {
    border-radius: 8px;

    :deep(.ant-card-head) {
      min-height: 48px;
      border-bottom: none;
      padding: 0 24px;
      background-color: #f7f9fc;
    }

    :deep(.ant-card-head-title) {
      padding: 16px 0 0 0;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #1a3c75;
    }

    .list-container {
      min-height: 130px;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #ffffff;
      border-radius: 4px;
      margin-top: 8px;

      &:first-child {
        margin-top: 0;
      }

      .item-name {
        color: #333;
        font-size: 14px;
        color: #666;
      }

      .item-value {
        font-weight: bold;
        font-size: 16px;
        color: #1a3c75;
      }
    }
  }

  .chart-card {
    background: #ffffff;
    border-radius: 8px;
    padding: 16px;
    height: 350px;
  }
</style>
