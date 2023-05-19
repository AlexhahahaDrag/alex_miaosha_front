<template>
  <div>
    <a-modal :visible="props.visible"
      :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '3000px'" :title="
        props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
      " @ok="handleOk" okText="保存" :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose" @cancel="handleCancel">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="formRef" name="PmsShopProductForm" class="ant-advanced-search-form" disabled :model="formState" @finish="onFinish"
        @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="name">
              <a-textarea v-model:value="formState.name" placeholder="请填写name" :autosize="true"></a-textarea>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="shop" label="商铺">
              <a-input v-model:value="formState.shop" placeholder="请填写商铺"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="image" label="图片url">
              <a-image
    :width="200"
    :src="formState.image"
  />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="price" label="价格">
              <a-input v-model:value="formState.price" placeholder="请填写价格" disabled></a-input>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="icons" label="标签">
              <a-input v-model:value="formState.icons" placeholder="请填写标签"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="productUrl" label="产品连接">
              <a-input v-model:value="formState.productUrl" placeholder="请填写产品连接"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="source" label="来源">
              <a-input v-model:value="formState.source" placeholder="请填写来源"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { PmsShopProductDetail } from "./pmsShopProductDetailTs";
import {
  getPmsShopProductDetail,
  addOrEditPmsShopProduct,
} from "@/api/product/pmsShopProduct/pmsShopProductTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsShopProductListTs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  image: [
    {
      required: true,
      message: '图片url不能为空！',
    },
  ],
  price: [
    {
      required: true,
      message: '价格不能为空！',
    },
  ],
  name: [
    {
      required: true,
      message: 'name不能为空！',
    },
  ],
  shop: [
    {
      required: true,
      message: '商铺不能为空！',
    },
  ],
  icons: [
    {
      required: true,
      message: '标签不能为空！',
    },
  ],
  productUrl: [
    {
      required: true,
      message: '产品连接不能为空！',
    },
  ],
  source: [
    {
      required: true,
      message: '来源不能为空！',
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

let formState = ref<PmsShopProductDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePmsShopProductManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存商品网上商品信息信息
function savePmsShopProductManager() {
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsShopProduct(method, formState.value)
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
      getPmsShopProductDetail(props.modelInfo.id)
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