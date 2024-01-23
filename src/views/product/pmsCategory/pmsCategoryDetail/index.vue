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
      <a-form ref="formRef" name="PmsCategoryForm" class="ant-advanced-search-form" :model="formState" @finish="onFinish"
        @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="分类名称">
              <a-input v-model:value="formState.name" placeholder="请填写分类名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="parentCid" label="父分类id">
              <a-input v-model:value="formState.parentCid" placeholder="请填写父分类id"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="catLevel" label="层级">
              <a-input v-model:value="formState.catLevel" placeholder="请填写层级"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="showStatus" label="是否显示[0-不显示，1显示]">
              <a-input v-model:value="formState.showStatus" placeholder="请填写是否显示[0-不显示，1显示]"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="sort" label="排序">
              <a-input v-model:value="formState.sort" placeholder="请填写排序"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="icon" label="图标地址">
              <a-input v-model:value="formState.icon" placeholder="请填写图标地址"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="productUnit" label="计量单位">
              <a-input v-model:value="formState.productUnit" placeholder="请填写计量单位"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="productCount" label="商品数量">
              <a-input v-model:value="formState.productCount" placeholder="请填写商品数量"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { PmsCategoryDetail } from "./pmsCategoryDetailTs";
import {
  getPmsCategoryDetail,
  addOrEditPmsCategory,
} from "@/api/product/pmsCategory/pmsCategoryTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsCategoryListTs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  name: [
    {
      required: true,
      message: '分类名称不能为空！',
    },
  ],
  parentCid: [
    {
      required: true,
      message: '父分类id不能为空！',
    },
  ],
  catLevel: [
    {
      required: true,
      message: '层级不能为空！',
    },
  ],
  showStatus: [
    {
      required: true,
      message: '是否显示[0-不显示，1显示]不能为空！',
    },
  ],
  sort: [
    {
      required: true,
      message: '排序不能为空！',
    },
  ],
  icon: [
    {
      required: true,
      message: '图标地址不能为空！',
    },
  ],
  productUnit: [
    {
      required: true,
      message: '计量单位不能为空！',
    },
  ],
  productCount: [
    {
      required: true,
      message: '商品数量不能为空！',
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

let formState = ref<PmsCategoryDetail>({});

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePmsCategoryManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存商品三级分类信息
function savePmsCategoryManager() {
  let method = "";
  if (formState.value.catId) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsCategory(method, formState.value)
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
        message.error((data?.message) || "保存失败！");
      }
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
      getPmsCategoryDetail(props.modelInfo.id)
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
            message.error((data?.message) || "查询失败！");
          }
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