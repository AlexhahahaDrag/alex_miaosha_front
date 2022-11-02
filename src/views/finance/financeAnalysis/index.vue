<template>
  <div style="background-color: #ececec; padding: 10px">
    <a-row :gutter="16" >
      <a-col :span="6">
        <a-card title="总金额" :bordered="false">
          <p style="font-size:20px">{{sum}}</p>
        </a-card>
      </a-col>
      <a-col :span="6" v-for="item in balanceList.slice(0, 3)">
        <a-card :title="item.typeName" :bordered="false">
          <p style="font-size:20px">{{item.amount}}</p>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" style="padding-top:10px">
      <a-col :span="4" v-for="item in balanceList.slice(4, 12)">
        <a-card :title="item.typeName" :bordered="false">
          <p style="font-size:20px">{{item.amount}}</p>
        </a-card>
      </a-col>
    </a-row>
    
    <div style="width: 600px; height: 400px">
    <div id="mainBar" style="width: 600px; height: 400px"></div>
    <div id="main" style="width: 600px; height: 400px"></div>
    <div id="main1" style="width: 600px; height: 400px"></div>
  </div>
  </div>
  
</template>
<script setup lang="ts">
import * as echarts from "echarts";
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { getBalance, getIncomeAndExpense } from "@/api/finance/financeAnalysis";
import { FinanceDetail } from "@/views/finance/financeManager/detail/detail";
import * as math from 'mathjs'
import { ItemInfo } from "./analysis";

function getBalanceBar(xAxis: string[], data: number[]) {
  type EChartsOption = echarts.EChartsOption;
  var chartDom = document.getElementById("mainBar")!;
  var myChart = echarts.init(chartDom);
  var option: EChartsOption;

  option = {
    xAxis: {
      type: "category",
      data: xAxis,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: data,
        type: "bar",
      },
    ],
  };

  option && myChart.setOption(option);
}

// 基于准备好的dom，初始化echarts实例
function getBalancePie(data) {
  var chartDom = document.getElementById("main")!;
  var myChart = echarts.init(chartDom);
  type EChartsOption = echarts.EChartsOption;
  var option: EChartsOption;
  // 绘制图表
  option = {
    title: {
      text: "Referer of a Website",
      subtext: "Fake Data",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  function getBalancePie1(data) {
  var chartDom = document.getElementById("main1")!;
  var myChart = echarts.init(chartDom);
  type EChartsOption = echarts.EChartsOption;
  var option: EChartsOption;
  // 绘制图表
  option = {
    title: {
      text: "Referer of a Website",
      subtext: "Fake Data",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
}

  option && myChart.setOption(option);
  //   根据页面大小自动响应图表大小
  window.addEventListener("resize", function () {
    myChart.resize();
  });
}

const balanceList = ref<FinanceDetail|any>([]);

let sum = ref<any>(0);

onMounted(() => {
  setTimeout(() => {
    getIncomeAndExpense(2, "2022-10").then((res: { code: string; data: any[]; message: any }) => {
      if (res.code == "200") {
        if(res.data) {
          let dd: ItemInfo[] = [];
        res.data.filter(item => item.incomeAndExpenses == 'income').forEach((item: { typeCode: any; amount: any }) => {
          dd.push({ name: item.typeCode, value: item.amount });
        });
        getBalancePie(dd);
        let expense: ItemInfo[] = [];
        res.data.filter(item => item.incomeAndExpenses == 'expense').forEach((item: { typeCode: any; amount: any }) => {
          expense.push({ name: item.typeCode, value: item.amount });
        });
        getBalancePie1(expense);
        }
        
        // let xAxis: string[] = [];
        // let data: number[] = [];
        // res.data.filter(item => item.incomeExpenseType == 'expense').forEach((item: { typeCode: any; amount: any }) => {
        //   xAxis.push(item.typeCode);
        //   data.push(item.amount);
        // });
        // getBalanceBar(xAxis, data);
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    });
  }, 1000);

  setTimeout(() => {
    getBalance(2, "2022-10").then((res: { code: string; data: FinanceDetail[]; message: any }) => {
      if (res.code == "200") {
        balanceList.value = res.data;
        if (res.data && res.data.length) {
          res.data.forEach(item => sum.value = math.add(sum.value, math.bignumber(item.amount ? item.amount : 0)));
        }
      } else {
        message.error((res && res.message) || "查询列表失败！");
      }
    });
  }, 1000);
});
</script>
