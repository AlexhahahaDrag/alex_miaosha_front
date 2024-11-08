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
        name="PmsSkuInfoForm"
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
            <a-form-item name="spuId" label="spuId">
              <a-input
                v-model:value="formState.spuId"
                placeholder="请填写spuId"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="skuName" label="sku名称">
              <a-input
                v-model:value="formState.skuName"
                placeholder="请填写sku名称"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="skuDesc" label="sku介绍描述">
              <a-input
                v-model:value="formState.skuDesc"
                placeholder="请填写sku介绍描述"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="catalogId" label="所属分类id">
              <a-input
                v-model:value="formState.catalogId"
                placeholder="请填写所属分类id"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="brandId" label="品牌id">
              <a-input
                v-model:value="formState.brandId"
                placeholder="请填写品牌id"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="skuDefaultImg" label="默认图片">
              <a-input
                v-model:value="formState.skuDefaultImg"
                placeholder="请填写默认图片"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="skuTitle" label="标题">
              <a-input
                v-model:value="formState.skuTitle"
                placeholder="请填写标题"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="skuSubtitle" label="副标题">
              <a-input
                v-model:value="formState.skuSubtitle"
                placeholder="请填写副标题"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="price" label="价格">
              <a-input
                v-model:value="formState.price"
                placeholder="请填写价格"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="saleCount" label="销量">
              <a-input
                v-model:value="formState.saleCount"
                placeholder="请填写销量"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { PmsSkuInfoDetail } from "./pmsSkuInfoDetailTs";
import {
  getPmsSkuInfoDetail,
  addOrEditPmsSkuInfo,
} from "@/api/product/pmsSkuInfo/pmsSkuInfoTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsSkuInfoListTs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  spuId: [
    {
      required: true,
      message: "spuId不能为空！",
    },
  ],
  skuName: [
    {
      required: true,
      message: "sku名称不能为空！",
    },
  ],
  skuDesc: [
    {
      required: true,
      message: "sku介绍描述不能为空！",
    },
  ],
  catalogId: [
    {
      required: true,
      message: "所属分类id不能为空！",
    },
  ],
  brandId: [
    {
      required: true,
      message: "品牌id不能为空！",
    },
  ],
  skuDefaultImg: [
    {
      required: true,
      message: "默认图片不能为空！",
    },
  ],
  skuTitle: [
    {
      required: true,
      message: "标题不能为空！",
    },
  ],
  skuSubtitle: [
    {
      required: true,
      message: "副标题不能为空！",
    },
  ],
  price: [
    {
      required: true,
      message: "价格不能为空！",
    },
  ],
  saleCount: [
    {
      required: true,
      message: "销量不能为空！",
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

let formState = ref<PmsSkuInfoDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value
      .validateFields()
      .then(() => savePmsSkuInfoManager())
      .catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存sku信息信息
function savePmsSkuInfoManager() {
  let method = "";
  if (formState.value.skuId) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsSkuInfo(method, formState.value)
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
      getPmsSkuInfoDetail(props.modelInfo.id)
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
