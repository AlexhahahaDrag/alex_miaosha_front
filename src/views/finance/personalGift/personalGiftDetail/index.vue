<template>
  <div>
    <a-modal
      :open="props.open"
      :width="
        props.modelInfo && props.modelInfo.width
          ? props.modelInfo.width
          : '1000px'
      "
      :title="
        props.modelInfo && props.modelInfo.title
          ? props.modelInfo.title
          : 'Basic Modal'
      "
      @ok="handleOk"
      okText="保存"
      :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose"
      @cancel="handleCancel"
    >
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button
          key="submit"
          type="primary"
          :loading="loading"
          @click="handleOk"
          >保存</a-button
        >
      </template>
      <a-form
        ref="formRef"
        name="PersonalGiftForm"
        class="ant-advanced-search-form"
        :model="formState"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
        :rules="rulesRef"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :name="labelMap['eventName'].name"
              :label="labelMap['eventName'].label"
            >
              <a-input
                v-model:value="formState.eventName"
                :placeholder="'请填写' + labelMap['eventName'].label"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :name="labelMap['amount'].name"
              :label="labelMap['amount'].label"
            >
              <a-input
                v-model:value="formState.amount"
                :placeholder="'请填写' + labelMap['amount'].label"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :name="labelMap['otherPerson'].name"
              :label="labelMap['otherPerson'].label"
            >
              <a-input
                v-model:value="formState.otherPerson"
                :placeholder="'请填写' + labelMap['otherPerson'].label"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :name="labelMap['eventTime'].name"
              :label="labelMap['eventTime'].label"
            >
              <a-date-picker
                v-model:value="formState.eventTime"
                :format="dateFormatter"
                :getPopupContainer="(triggerNode: any) => { return triggerNode.parentNode }"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :name="labelMap['remarks'].name"
              :label="labelMap['remarks'].label"
            >
              <a-input
                v-model:value="formState.remarks"
                :placeholder="'请填写' + labelMap['remarks'].label"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :name="labelMap['action'].name"
              :label="labelMap['action'].label"
            >
              <a-select
                ref="select"
                v-model:value="formState.action"
                :placeholder="'请输入' + labelMap['action'].label"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="actionList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :name="labelMap['noticeNum'].name"
              :label="labelMap['noticeNum'].label"
            >
              <a-input
                v-model:value="formState.noticeNum"
                :placeholder="'请填写' + labelMap['noticeNum'].label"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { PersonalGiftDetail } from "./personalGiftDetailTs";
import {
  getPersonalGiftDetail,
  addOrEditPersonalGift,
} from "@/api/finance/personalGift/personalGiftTs";
import { message, FormInstance } from "ant-design-vue";
import { dictInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";
import { ModelInfo } from "../personalGiftListTs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const dateFormatter = "YYYY-MM-DD";

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
  eventName: { name: "eventName", label: "事件名称" },
  amount: { name: "amount", label: "金额" },
  otherPerson: { name: "otherPerson", label: "其他人" },
  eventTime: { name: "eventTime", label: "随礼时间" },
  remarks: { name: "remarks", label: "备注" },
  action: { name: "action", label: "动作" },
  noticeNum: { name: "noticeNum", label: "通知次数" },
});

const rulesRef = reactive({
  eventName: [
    {
      required: true,
      message: "事件名称不能为空！",
    },
  ],
  amount: [
    {
      required: true,
      message: "金额不能为空！",
    },
  ],
  otherPerson: [
    {
      required: true,
      message: "其他人不能为空！",
    },
  ],
  eventTime: [
    {
      required: true,
      message: "随礼时间不能为空！",
    },
  ],
  action: [
    {
      required: true,
      message: "动作不能为空！",
    },
  ],
});

const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};

interface Props {
  open?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<PersonalGiftDetail>({});

let actionList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList("gift_action").then((res) => {
    if (res.code == "200") {
      actionList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "gift_action"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
};

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = (): void => {
  loading.value = true;
  if (formRef.value) {
    formRef.value
      .validateFields()
      .then(() => savePersonalGiftManager())
      .catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = (): void => {
  emit("handleCancel", false);
};

//保存个人随礼信息表信息
const savePersonalGiftManager = (): void => {
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPersonalGift(method, formState.value)
    .then((res) => {
      if (res.code == "200") {
        message.success((res && res.message) || "保存成功！");
        emit("handleOk", false);
      } else {
        message.error((res && res.message) || "保存失败！");
      }
      formState.value = {};
    })
    .catch((error: any) => {
      let data = error?.response?.data;
      if (data) {
        message.error(data?.message || "保存失败！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = (values: any): void => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any): void => {
  console.log("Failed:", errorInfo);
};

const init = (): void => {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getPersonalGiftDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == "200") {
            formState.value = res.data;
            modelConfig.confirmLoading = false;
          } else {
            message.error((res && res.message) || "查询失败！");
          }
        })
        .catch((error: any) => {
          let data = error?.response?.data;
          if (data) {
            message.error(data?.message || "查询失败！");
          }
        });
    } else {
      modelConfig.confirmLoading = false;
      formState.value = {};
    }
  }
};

watch(
  () => props.open,
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
<style lang="scss" scoped></style>
