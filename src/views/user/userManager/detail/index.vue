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
    <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form
        ref="formRef"
        name="financeForm"
        :rules="rulesRef"
        :model="formState"
        @finishFailed="onFinishFailed"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="username"
              label="用户名"
            >
              <a-input v-model:value="formState.username" placeholder="请填写用户名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="gender"
              label="性别"
            >
              <a-select
                ref="select"
                v-model:value="formState.gender"
                mode="combobox"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="genderList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="nickName"
              label="昵称"
            >
              <a-input v-model:value="formState.nickName" placeholder="请填写昵称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="weChat"
              label="微信号"
            >
              <a-input v-model:value="formState.weChat" placeholder="请填写微信号"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="qqNumber"
              label="QQ号"
            >
              <a-input v-model:value="formState.qqNumber" placeholder="请填写QQ号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="occupation"
              label="职业"
            >
              <a-input v-model:value="formState.occupation" placeholder="请填写职业"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="email"
              label="邮箱"
            >
              <a-input
                v-model:value="formState.email"
                placeholder="请填写邮箱！"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="birthday"
              label="生日"
            >
              <a-date-picker v-model:value="formState.birthday" width="100%"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              name="mobile"
              label="电话号"
            >
            <a-input v-model:value="formState.mobile" placeholder="请填写电话号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              name="status"
              label="状态"
            >
              <a-select
                ref="select"
                v-model:value="formState.status"
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

        </a-row>
      </a-form>
    </a-modal>
  <!-- `summary` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT NULL COMMENT '自我简介最多150字', -->
  </div>
</template>
<script lang="ts" setup>
import { ref, watch,reactive } from "vue";
import { FinanceDetail } from "./detail";
import {
  getFinanceMangerDetail,
  addOrEditFinanceManger,
} from "@/api/finance/financeManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo, dictInfo } from "../userManager";

const labelCol = ref({span: 5});
const wrapperCol = ref({span: 19}); 

let loading = ref<boolean>(false);

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

const formRef = ref<FormInstance>();
const rulesRef = reactive({
  username: [
        {
          required: true,
          message: '用户名称不能为空！',
        },
      ],
      nickName: [
        {
          required: true,
          message: '昵称不能为空！',
        },
      ],
      mobile: [
        {
          required: true,
          message: '电话号不能为空！',
        },
        {
          message: '输入的电话号不合法！',
          pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
        },
      ],
      email: [
        {
          message: '输入的邮箱不合法！',
          pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.*[a-zA-Z0-9_-]+)+$/,
        },
      ],
    });

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  formRef.value.validateFields().then(() => saveFinanceManager()).catch(()=> {
    loading.value = false;
  });
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
      initForm();
    })
    .catch(() => {
      message.error("系统问题，请联系管理员！");
    }).finally(() => {
      loading.value = false;
    });
}

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

let genderList = ref<dictInfo[]>([]);

let validList = ref<dictInfo[]>([]);

function getDictInfoList() {
  getDictList("is_valid,gender").then((res) => {
    if (res.code == "200") {
      genderList.value = [];
      genderList.value.push({typeCode: 0, typeName: "请选择"});
      res.data.forEach(item => {
        if (item.belongTo == 'gender') {
          genderList.value.push({typeCode: item.typeCode, typeName: item.typeName});
        }
      });
      validList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
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

function initForm() {
  formState.value = {
        status: 1,
        gender: 0,
      };
}

function init() {
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getFinanceMangerDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == "200") {
            formState.value = res.data;
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
      initForm();
    }
  }
  getDictInfoList();
}

defineExpose({ handleOk, handleCancel });
</script>
