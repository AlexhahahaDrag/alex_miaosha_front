<template>
  <div id="modalBox">
    <a-modal :visible="props.visible" :width="props.modelInfo && props.modelInfo.width ? props.modelInfo : '1000px'"
      :title="
        props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
      " @ok="handleOk" okText="保存" :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose" @cancel="handleCancel" :getContainer="getContainer">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="formRef" name="financeForm" :rules="rulesRef" :model="formState" @finishFailed="onFinishFailed"
        :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="username" label="用户名">
              <a-input v-model:value="formState.username" placeholder="请填写用户名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="gender" label="性别">
              <a-select ref="select" v-model:value="formState.gender" mode="combobox"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="genderList" :allowClear="true">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="nickName" label="昵称">
              <a-input v-model:value="formState.nickName" placeholder="请填写昵称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="weChat" label="微信号">
              <a-input v-model:value="formState.weChat" placeholder="请填写微信号"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="qqNumber" label="QQ号">
              <a-input v-model:value="formState.qqNumber" placeholder="请填写QQ号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="occupation" label="职业">
              <a-input v-model:value="formState.occupation" placeholder="请填写职业"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="email" label="邮箱">
              <a-input v-model:value="formState.email" placeholder="请填写邮箱！" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="birthday" label="生日">
              <a-date-picker v-model:value="formState.birthday" :format="dateFormatter"
                :getPopupContainer="triggerNode => { return triggerNode.parentNode }" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="mobile" label="电话号">
              <a-input v-model:value="formState.mobile" placeholder="请填写电话号"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="status" label="状态">
              <a-select ref="select" v-model:value="formState.status" mode="combobox" placeholder="请输入有效状态"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="validList" :allowClear="true">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="avatar" label="头像">
              <myUpload :fromSystem="fromSystem" :fileInfo="fileInfo" @customImageRequest="customImageRequest"></myUpload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item :label-col="{span: 3}" :wrapperCol="{span: 24}" name="summary" label="个人简介">
              <a-textarea v-model:value="formState.summary" placeholder="请添加个人简介"
                :auto-size="{ minRows: 2, maxRows: 5 }" :maxlength="500" show-count />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { UserDetail } from "./detail";
import {
  getUserManagerDetail,
  addOrEditUserManager,
} from "@/api/user/userManager";
import { getDictList } from "@/api/finance/dict/dictManager";
import { message, FormInstance } from "ant-design-vue";
import dayjs from "dayjs";
import myUpload from '@/views/components/myUpload.vue'
import { dictInfo, ModelInfo } from "@/views/finance/dict/dict";
import {FileInfo} from '@/views/components/fileInfo';

interface Props {
  visible?: boolean;
  modelInfo?: ModelInfo;
}

const labelCol = ref({ span: 6 });
const wrapperCol = ref({ span: 18 });
let loading = ref<boolean>(false);
const dateFormatter = "YYYY-MM-DD";
const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};
const props = defineProps<Props>();
let formState = ref<UserDetail>({});
const formRef = ref<FormInstance>();
let genderList = ref<dictInfo[]>([]);
let validList = ref<dictInfo[]>([]);
let fileInfo = ref<FileInfo>({});
let fromSystem = ref<string>('user');

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

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(() => saveUserManager()).catch(() => {
      loading.value = false;
    });
  }
};

const customImageRequest = (file: FileInfo) => {
  formState.value.avatar = file.id;
}

const getContainer = () => {
  return document.getElementById("modalBox");
}

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存财务信息
function saveUserManager() {
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }

  addOrEditUserManager(method, formState.value)
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

function getDictInfoList() {
  getDictList("is_valid,gender").then((res) => {
    if (res.code == "200") {
      genderList.value = [];
      genderList.value.push({ typeCode: 0, typeName: "请选择" });
      res.data.forEach((item: { belongTo: string; typeCode: any; typeName: any; }) => {
        if (item.belongTo == 'gender') {
          genderList.value.push({ typeCode: Number(item.typeCode), typeName: item.typeName });
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
    status: '1',
    gender: 0,
  };
}

function init() {
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getUserManagerDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == "200") {
            formState.value = res.data;
            formState.value.birthday = dayjs(formState.value.birthday);
            modelConfig.confirmLoading = false;
            if (formState.value.avatar) {
              fileInfo.value.id = formState.value.avatar;
              fileInfo.value.url = formState.value.avatarUrl;
            } else {
              fileInfo.value = {};
            }
          } else {
            message.error((res && res.message) || "查询失败！");
          }
        })
        .catch(() => {
          message.error("系统问题，请联系管理员！");
        });
    } else {
      modelConfig.confirmLoading = false;
      fileInfo.value = {};
      initForm();
    }
  }
  getDictInfoList();
}

const emit = defineEmits(["handleOk", "handleCancel"]);
defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>