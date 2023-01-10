<template>
  <div>
    <a-modal
      :visible="props.visible"
      :width="props.modelInfo && props.modelInfo.width ? props.modelInfo : '1000px'"
      :title="
        props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
      "
      @ok="handleOk"
      okText="保存"
      :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose"
      @cancel="handleCancel"
    >
      <a-form
        name="financeForm"
        class="ant-advanced-search-form"
        :model="formState"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="name"
              label="名称"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-input v-model:value="formState.name" placeholder="请填写名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="typeCode"
              label="类别"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-input
                v-model:value="formState.typeCode"
                placeholder="请填写类别"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="amount"
              label="金额"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-input
                v-model:value="formState.amount"
                type="number"
                placeholder="请填写金额"
                prefix="￥"
                suffix="RMB"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="fromSource"
              label="支付方式"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-select
                ref="select"
                v-model:value="formState.fromSource"
                mode="combobox"
                placeholder="请输入来源"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="fromSourceList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="incomeAndExpenses"
              label="收支类型"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-select
                ref="select"
                v-model:value="formState.incomeAndExpenses"
                mode="combobox"
                placeholder="请输入收支类型"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="incomeAndExpensesList"
                :allowClear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="isValid"
              label="状态"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-select
                ref="select"
                v-model:value="formState.isValid"
                mode="combobox"
                placeholder="请输入有效状态"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="validList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="infoDate"
              label="业务时间"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-date-picker v-model:value="formState.infoDate" :format="dateFormatter" :locale="zhCN" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="belongTo"
              label="属于"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-select
                style="width: 100px"
                ref="select"
                v-model:value="formState.belongTo"
                mode="combobox"
                :field-names="{ label: 'username', value: 'id' }"
                :options="userList"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { FinanceDetail } from "./detail";
import {
  getFinanceMangerDetail,
  addOrEditFinanceManger,
} from "@/api/finance/financeManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message } from "ant-design-vue";
import { ModelInfo, dictInfo } from "../financeManager";
import dayjs from "dayjs";
import zhCN from "ant-design-vue/es/locale/zh_CN";

const dateFormatter = "YYYY-MM-DD HH:mm:ss";

let userList = ref([
  { id: 1, username: "mj" },
  { id: 2, username: "臭屁宝" },
]);

const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};

interface Props {
  visible?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<FinanceDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  saveFinanceManager();
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存财务信息
function saveFinanceManager() {
  modelConfig.confirmLoading = true;
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditFinanceManger(method, formState.value)
    .then((res) => {
      modelConfig.confirmLoading = false;
      if (res.code == "200") {
        message.success((res && res.message) || "保存成功！");
        emit("handleOk", false);
      } else {
        message.error((res && res.message) || "保存失败！");
      }
      formState.value = {};
    })
    .catch(() => {
      message.error("系统问题，请联系管理员！");
    });
}

const onFinish = (values: any) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

let fromSourceList = ref<dictInfo[]>([]);

let incomeAndExpensesList = ref<dictInfo[]>([]);

let validList = [
  { typeCode: 0, typeName: "无效" },
  { typeCode: 1, typeName: "有效" },
];

function getDictInfoList() {
  getDictList("pay_way,income_expense_type,is_valid").then((res) => {
    if (res.code == "200") {
      fromSourceList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "pay_way"
      );
      incomeAndExpensesList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "income_expense_type"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getFinanceMangerDetail(props.modelInfo.id)
      .then((res) => {
        if (res.code == "200") {
          formState.value = res.data;
          formState.value.infoDate = dayjs(formState.value.infoDate);
          modelConfig.confirmLoading = false;
        } else {
          message.error((res && res.message) || "查询失败！");
        }
      })
      .catch(() => {
        message.error("系统问题，请联系管理员！");
      });
    } else {
      modelConfig.confirmLoading = false;
      formState.value = {
        isValid: 1,
        incomeAndExpenses: "expense",
        infoDate: dayjs(),
        belongTo: 2,
      };
    }
  }
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      init();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

defineExpose({ handleOk, handleCancel });
</script>
