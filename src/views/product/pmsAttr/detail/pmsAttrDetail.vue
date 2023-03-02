<template>
  <div>
    <a-modal :visible="props.visible"
      :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '1000px'" :title="
        props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
      " @ok="handleOk" okText="保存" :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose" @cancel="handleCancel">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="formRef" name="PmsAttrForm" class="ant-advanced-search-form" :model="formState" @finish="onFinish"
        @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="attrName" label="属性名">
              <a-input v-model:value="formState.attrName" placeholder="请填写属性名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="searchType" label="是否需要检索[0-不需要，1-需要]">
              <a-input v-model:value="formState.searchType" placeholder="请填写是否需要检索[0-不需要，1-需要]"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="icon" label="属性图标">
              <a-input v-model:value="formState.icon" placeholder="请填写属性图标"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="valueSelect" label="可选值列表[用逗号分隔]">
              <a-input v-model:value="formState.valueSelect" placeholder="请填写可选值列表[用逗号分隔]"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="attrType" label="属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]">
              <a-input v-model:value="formState.attrType" placeholder="请填写属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="enable" label="启用状态[0 - 禁用，1 - 启用]">
              <a-input v-model:value="formState.enable" placeholder="请填写启用状态[0 - 禁用，1 - 启用]"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="catelogId" label="所属分类">
              <a-input v-model:value="formState.catelogId" placeholder="请填写所属分类"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="showDesc" label="快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整">
              <a-input v-model:value="formState.showDesc" placeholder="请填写快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { PmsAttrDetail } from "./pmsAttrDetailTs";
import {
  getPmsAttrDetail,
  addOrEditPmsAttr,
} from "@/api/product/pmsAttr/pmsAttrTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsAttrListTs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  attrName: [
    {
      required: true,
      message: '属性名不能为空！',
    },
  ],
  searchType: [
    {
      required: true,
      message: '是否需要检索[0-不需要，1-需要]不能为空！',
    },
  ],
  icon: [
    {
      required: true,
      message: '属性图标不能为空！',
    },
  ],
  valueSelect: [
    {
      required: true,
      message: '可选值列表[用逗号分隔]不能为空！',
    },
  ],
  attrType: [
    {
      required: true,
      message: '属性类型[0-销售属性，1-基本属性，2-既是销售属性又是基本属性]不能为空！',
    },
  ],
  enable: [
    {
      required: true,
      message: '启用状态[0 - 禁用，1 - 启用]不能为空！',
    },
  ],
  catelogId: [
    {
      required: true,
      message: '所属分类不能为空！',
    },
  ],
  showDesc: [
    {
      required: true,
      message: '快速展示【是否展示在介绍上；0-否 1-是】，在sku中仍然可以调整不能为空！',
    },
  ],
});

const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};

interface Props {
  visible?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<PmsAttrDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePmsAttrManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存商品属性信息
function savePmsAttrManager() {
  let method = "";
  if (formState.value.attrId) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsAttr(method, formState.value)
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
    }).finally(() => {
      loading.value = false;
    });
}

const onFinish = (values: any) => {
  console.log("Success:", values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

function init() {
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getPmsAttrDetail(props.modelInfo.id)
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
      formState.value = {
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
<style lang="scss" scoped>
@import "@/style/index.scss";
</style>