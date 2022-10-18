<template>
  <div>
    <a-modal
      :visible="props.visible"
      :width="props.modelInfo && props.modelInfo.width ? props.modelInfo : '1000px'"
      :title="
        props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
      "
      @ok="handleOk"
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
                placeholder="请填写金额"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="fromSource"
              label="来源"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-input
                v-model:value="formState.fromSource"
                placeholder="请填写来源"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="isValid"
              label="状态"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-input
                v-model:value="formState.isValid"
                placeholder="请填写状态"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="operateTime"
              label="操作时间"
              :rules="[{ required: true, message: 'input something' }]"
            >
              <a-date-picker
                v-model:value="formState.operateTime"
                format="YYYY-MM-DD HH:mm:ss"
                :show-time="{ defaultValue: dayjs() }"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { FinanceDetail } from "./detail";
import {
  getFinanceMangerDetail,
  addOrEditFinanceManger,
} from "@/api/finance/financeManager/financeManager";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

interface ModelInfo {
  title?: String;
  width?: string;
}

const modelConfig = {
  "confirmLoading": true,
  "destroyOnClose": true,
}

interface Props {
  visible?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

const formState = reactive<FinanceDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  saveFinanceManager();
};

const handleCancel = () => {
  emit("handleCancel", false);
}

//保存财务信息
function saveFinanceManager() {
  let method = "";
  if (formState.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditFinanceManger(method, formState)
    .then((res) => {
      debugger;
      if (res.code == "200") {
        message.success((res && res.message) || "保存成功！");
        debugger;
        emit("handleOk", false);
      } else {
        message.error((res && res.message) || "保存失败！");
      }
    })
    .catch(() => {
      debugger;
      message.error("系统问题，请联系管理员！");
    });
}

const onFinish = (values: any) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any) => {
  debugger;
  console.log("Failed:", errorInfo);
};

defineExpose({ handleOk, handleCancel });
</script>
