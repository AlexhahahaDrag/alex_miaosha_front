<template>
  <chart :options="options" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { defineProps, onMounted, watch, PropType, ref } from "vue";
import chart from "@/views/model/chart/index.vue";
import { barItem } from "./bar";

const props = defineProps({
  config: {
    type: Object as PropType<barItem>,
    default: () => {},
  },
  title: {
    type: String,
    default: "title",
  },
  tooltip: {
    type: Object,
    default: {},
  },
  data: {
    type: Array,
    default: [],
  },
  width: {
    type: String,
    default: "600px",
  },
  height: {
    type: String,
    default: "400px",
  },
});

const setOption = (data: any[]) => {
  console.log(data);
  let { xAxis, yTitle, yNameGap, tooltip, legend } = props.config;
  options.value = {
    title: {
      text: props.title,
    },
    color: [
      "#55aaff",
      "#5555ff",
      "#aa55ff",
      "#ff9933",
      "#dd4444",
      "#bb2222",
      "#dd4488",
      "#22ff99",
      "#ffcc66",
      "#7777dd",
      "rgb(217, 0, 27)",
      "#777fff",
    ],
    tooltip: tooltip || {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: xAxis ? xAxis : [],
      axisTick: {
        alignWithLabel: true,
      },
    },
    legend: {
      data: legend || [],
    },
    yAxis: {
      type: "value",
      name: yTitle ? yTitle : "",
      nameLocation: "center",
      nameGap: yNameGap ? yNameGap : 28,
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [] as any,
  };
  if (data) {
    data.forEach((item, index) => {
      let se = {
        name: legend ? legend[index] : index,
        type: "bar",
        data: item,
      };
      options.value.series[index] = se;
    });
  }
};

const chartOption = {
  title: {
    text: "",
  },
  color: [] as string[],
  legend: {},
  tooltip: {} as Object,
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [] as string[],
    axisTick: {
      alignWithLabel: true,
    },
  },
  yAxis: {
    type: "value",
    name: "",
    nameLocation: "center",
    nameGap: 28,
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    splitNumber: 4,
    splitLine: {
      lineStyle: {
        type: "dashed",
      },
    },
  },
  series: [] as any,
};

const options = ref(chartOption);
// const options = {
//   title: {
//     text: props.title,
//   },
//   tooltip: {
//     trigger: "axis",
//   },
//   legend: {
//     data: ["Rainfall", "Evaporation"],
//   },
//   calculable: true,
//   xAxis: [
//     {
//       type: "category",
//       // prettier-ignore
//       data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//     },
//   ],
//   yAxis: [
//     {
//       type: "value",
//     },
//   ],
//   series: [
//     {
//       name: "Rainfall",
//       type: "bar",
//       data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
//       markPoint: {
//         data: [
//           { type: "max", name: "Max" },
//           { type: "min", name: "Min" },
//         ],
//       },
//       markLine: {
//         data: [{ type: "average", name: "Avg" }],
//       },
//     },
//     {
//       name: "Evaporation",
//       type: "bar",
//       data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
//       markPoint: {
//         data: [
//           { name: "Max", value: 182.2, xAxis: 7, yAxis: 183 },
//           { name: "Min", value: 2.3, xAxis: 11, yAxis: 3 },
//         ],
//       },
//       markLine: {
//         data: [{ type: "average", name: "Avg" }],
//       },
//     },
//   ],
// };

onMounted(() => {
  watch(
    () => props.data,
    () => {
      setOption(props.data);
    },
    { deep: true, flush: "post" }
  );
});
</script>

<style lang="less" scoped></style>
