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
      :maskClosable="false"
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
        name="financeForm"
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
            <a-form-item name="name" label="名称">
              <a-input
                v-model:value="formState.name"
                placeholder="请填写名称"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="typeCode" label="类别">
              <a-input
                v-model:value="formState.typeCode"
                placeholder="请填写类别"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="amount" label="金额">
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
            <a-form-item name="fromSource" label="支付方式">
              <a-select
                ref="select"
                v-model:value="formState.fromSource"
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
            <a-form-item name="incomeAndExpenses" label="收支类型">
              <a-select
                ref="select"
                v-model:value="formState.incomeAndExpenses"
                placeholder="请输入收支类型"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="incomeAndExpensesList"
                :allowClear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="isValid" label="状态">
              <a-select
                ref="select"
                v-model:value="formState.isValid"
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
            <a-form-item name="infoDate" label="业务时间">
              <a-date-picker
                v-model:value="formState.infoDate"
                :format="dateFormatter"
                :getPopupContainer="(triggerNode: any) => { return triggerNode.parentNode }"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="belongTo" label="属于">
              <a-select
                ref="select"
                v-model:value="formState.belongTo"
                :field-names="{ label: 'nickName', value: 'id' }"
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
import { FinanceDetail } from "./detail";
import {
  getFinanceMangerDetail,
  addOrEditFinanceManger,
} from "@/api/finance/financeManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message, FormInstance } from "ant-design-vue";
import { dictInfo, ModelInfo } from "@/views/finance/dict/dict";
import dayjs from "dayjs";
import { getUserManagerList } from "@/api/user/userManager";
import { useUserStore } from "@/store/modules/user/user";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const dateFormatter = "YYYY-MM-DD";
let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  name: [
    {
      required: true,
      message: "名称不能为空！",
    },
  ],
  amount: [
    {
      required: true,
      message: "金额不能为空！",
    },
  ],
  typeCode: [
    {
      required: true,
      message: "类别不能为空！",
    },
  ],
  fromSource: [
    {
      required: true,
      message: "支付方式不能为空！",
    },
  ],
  incomeAndExpenses: [
    {
      required: true,
      message: "收支类型不能为空！",
    },
  ],
  isValid: [
    {
      required: true,
      message: "状态不能为空！",
    },
  ],
  infoDate: [
    {
      required: true,
      message: "业务时间不能为空！",
    },
  ],
  belongTo: [
    {
      required: true,
      message: "属于不能为空！",
    },
  ],
});

let userList = ref([]);

const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};

interface Props {
  open?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<FinanceDetail>({});
let userInfo = useUserStore()?.getUserInfo;

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value
      .validateFields()
      .then(() => saveFinanceManager())
      .catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存财务信息
function saveFinanceManager() {
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditFinanceManger(method, formState.value)
    .then((res) => {
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
    })
    .finally(() => {
      loading.value = false;
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

let validList = ref<dictInfo[]>([]);

function getDictInfoList() {
  getDictList("pay_way,income_expense_type,is_valid").then((res) => {
    if (res.code == "200") {
      fromSourceList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "pay_way"
      );
      incomeAndExpensesList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "income_expense_type"
      );
      validList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function getUserInfoList() {
  getUserManagerList({}).then((res) => {
    if (res.code == "200") {
      userList.value = res.data;
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  //获取用户信息
  getUserInfoList();
  //获取字典信息
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
        isValid: "1",
        incomeAndExpenses: "expense",
        infoDate: dayjs(),
        belongTo: userInfo ? userInfo.id + "" : "2",
      };
    }
  }
}

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
