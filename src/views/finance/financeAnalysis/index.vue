<template>
  <div class="search">
    <div class="search-box">
      <div class="search-box-in">
        <a-space>
          <a-date-picker
            v-model:value="searchDateTime"
            picker="month"
            :locale="locale"
            @change="changeMonth"
          />
          <a-select
            style="width: 100px"
            ref="select"
            v-model:value="searchUser"
            mode="combobox"
            :field-names="{ label: 'username', value: 'id' }"
            :options="userList"
            @change="changeMonth"
          >
          </a-select>
        </a-space>
      </div>
    </div>
  </div>
  <div style="background-color: #ececec; padding: 10px">
    <a-row :gutter="16">
      <a-col :span="4">
        <a-card title="总金额" :bordered="false">
          <p style="font-size: 20px">{{ sum }}</p>
        </a-card>
      </a-col>
      <a-col :span="4" v-for="item in balanceList.slice(0, 5)">
        <a-card :title="item.typeName" :bordered="false">
          <p style="font-size: 20px">{{ item.amount }}</p>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" style="padding-top: 10px">
      <a-col :span="4" v-for="item in balanceList.slice(5)">
        <a-card :title="item.typeName" :bordered="false">
          <p style="font-size: 20px">{{ item.amount }}</p>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" style="padding-top: 10px">
      <div class="mainGrid">
        <div class="div1">
          <pie-chart
            title="当月收入分析"
            height="100%"
            width="100%"
            :data="pieIncomeData"
            :tooltip="tooltip"
          >
          </pie-chart>
        </div>
        <div class="div2">
          <pie-chart
            title="当月支出分析"
            height="100%"
            width="100%"
            :data="pieExpenseData"
            :tooltip="tooltip"
          >
          </pie-chart>
        </div>
      </div>
    </a-row>
    <a-row :gutter="16" style="padding-top: 10px">
      <div class="mainGrid">
        <div class="div1">
          <bar-chart height="100%" width="100%" :data="pieIncomeData" :config="dayConfig">
          </bar-chart>
        </div>
        <!-- <div class="div2">
          <pie-chart
            title="当月支出分析"
            height="100%"
            width="100%"
            :data="pieExpenseData"
            :tooltip="tooltip"
          >
          </pie-chart>
        </div> -->
      </div>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  getBalance,
  getIncomeAndExpense,
  getDayExpense,
  getMonthExpense,
} from "@/api/finance/financeAnalysis";
import { FinanceDetail } from "@/views/finance/financeManager/detail/detail";
import * as math from "mathjs";
import { ItemInfo, resultType } from "./analysis";
import dayjs, { Dayjs } from "dayjs";
import barChart from "./chart/barChart.vue";
import pieChart from "./chart/pieChart.vue";
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { barItem } from "./chart/bar";

const dateFormatter = "YYYY-MM";

const balanceList = ref<FinanceDetail | any>([]);

let sum = ref<any>(0);

let searchUser = ref<number>(0);

let userList = ref([
  { id: 0, username: "所有人" },
  { id: 1, username: "mj" },
  { id: 2, username: "臭屁宝" },
]);

let searchDateTime = ref<Dayjs>(dayjs());

function getBalanceInfo(userId: number, dateStr: string) {
  getBalance(userId, dateStr).then(
    (res: { code: string; data: FinanceDetail[]; message: any }) => {
      if (res.code == "200") {
        balanceList.value = res.data;
        if (res.data && res.data.length) {
          res.data.forEach(
            (item) =>
              (sum.value = math.add(
                sum.value,
                math.bignumber(item.amount ? item.amount : 0)
              ))
          );
        }
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    }
  );
}

function getIncomeAndExpenseInfo(userId: number, dateStr: string) {
  getIncomeAndExpense(userId, dateStr).then(
    (res: { code: string; data: any[]; message: any }) => {
      if (res.code == "200") {
        if (res.data) {
          let dd: ItemInfo[] = [];
          res.data
            .filter((item) => item.incomeAndExpenses == "income")
            .forEach((item: { typeCode: any; amount: any }) => {
              dd.push({ name: item.typeCode, value: item.amount });
            });
          pieIncomeData.value = dd;
          let expense: ItemInfo[] = [];
          res.data
            .filter((item) => item.incomeAndExpenses == "expense")
            .forEach((item: { typeCode: any; amount: any }) => {
              expense.push({ name: item.typeCode, value: item.amount });
            });
          pieExpenseData.value = expense;
        }
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    }
  );
}

let dayConfig = ref<barItem>({
  xAxis: [],
  series: [],
  yTitle: "金钱",
  yNameGap: 30,
  tooltip: {},
  legend: [],
});

function getDayExpenseInfo(userId: number, dateStr: string) {
  getDayExpense(userId, dateStr).then(
    (res: { code: string; data: any[]; message: any }) => {
      if (res.code == "200") {
        if (res.data) {
          console.log("1111111111");
          console.log(res.data);
        }
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    }
  );
}

function getMonthExpenseInfo(userId: number, dateStr: string) {
  getMonthExpense(userId, dateStr).then(
    (res: { code: string; data: any[]; message: any }) => {
      if (res.code == "200") {
        if (res.data) {
          console.log("222222222222");
          console.log(res.data);
          let len = getNum(res.data);
          let legend = [len];
          res.data.forEach((item, index) => {
            legend[index] = item.username;
          });
          console.log(legend);
        }
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    }
  );
}

function getNum(data: resultType[]) {
  if (!data) {
    return 0;
  }
  let map = {};
  let num: number = 0;
  data.forEach((item) => {
    if (map[item.userId ? item.userId : "0"]) {
      return num;
    } else {
      num++;
      map[item.userId ? item.userId : "0"] = item.username;
    }
  });
}

function getInfo() {
  let dateStr = searchDateTime.value.format(dateFormatter);
  getBalanceInfo(searchUser.value, dateStr);
  getIncomeAndExpenseInfo(searchUser.value, dateStr);
  getDayExpenseInfo(searchUser.value, dateStr);
  getMonthExpenseInfo(searchUser.value, dateStr);
}

const changeMonth = () => {
  getInfo();
};

onMounted(() => {
  getInfo();
});

let pieExpenseData = ref<object[]>([]);

let pieIncomeData = ref<object[]>([]);

const tooltip = ref({
  trigger: "item",
  formatter: "{b} : {c}元({d}%)",
});
</script>
<style lang="scss" scoped>
.mainGrid {
  width: 100%;
  height: 350px;

  .div1 {
    display: inline-block; /*转为行内块儿 */
    width: 48%;
    height: 95%;
    text-align: center;
    line-height: 100%;
    color: blue;
    background-color: white;
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 5px; /*--调节圆周程度*/
  }

  .div2 {
    display: inline-block; /*转为行内块儿 */
    width: 49%;
    height: 95%;
    text-align: center;
    line-height: 100%;
    color: aliceblue;
    background-color: white;
    margin-right: 10px;
    border-radius: 5px; /*--调节圆周程度*/
  }
}
</style>

<style lang="scss" scoped>
@import "@/style/index.scss";
</style>
