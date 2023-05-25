<template>
  <div>
    <a-modal :visible="props.visible" :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '1000px'"
      :title="props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
        " @ok="handleOk" okText="保存" :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose" @cancel="handleCancel">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="formRef" name="PmsShopWantProductForm" class="ant-advanced-search-form" :model="formState"
        @finish="onFinish" @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol"
        :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="商品名称">
              <a-input v-model:value="formState.name" placeholder="请填写商品名称"></a-input>
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
            <a-form-item name="icons" label="标签">
              <a-input v-model:value="formState.icons" placeholder="请填写标签"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="source" label="来源">
              <a-select ref="select" v-model:value="formState.source" mode="combobox" placeholder="请输入来源类型"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="sourceList"
                :allowClear="true"></a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive } from "vue";
import { PmsShopWantProductDetail } from "./pmsShopWantProductDetailTs";
import {
  getPmsShopWantProductDetail,
  addOrEditPmsShopWantProduct,
} from "@/api/product/pmsShopWantProduct/pmsShopWantProductTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsShopWantProductListTs";
import { dictInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  name: [
    {
      required: true,
      message: '商品名称不能为空！',
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

let formState = ref<PmsShopWantProductDetail>({});

const sourceList = ref<dictInfo[]>([{ typeName: '请选择', typeCode: '' }]);

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePmsShopWantProductManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存商品想买网上商品信息信息
function savePmsShopWantProductManager() {
  let method = "";
  if (formState.value.id) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsShopWantProduct(method, formState.value)
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

function getDictInfoList() {
  getDictList("shop_type").then((res) => {
    if (res.code == "200") {
      sourceList.value = sourceList.value.concat(res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "shop_type"
      ));
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getPmsShopWantProductDetail(props.modelInfo.id)
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