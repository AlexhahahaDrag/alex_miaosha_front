<template>
  <div>
    <a-modal :visible="props.visible" :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '3000px'"
      :title="props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'
        " @ok="handleOk" okText="保存" :confirmLoading="modelConfig.confirmLoading"
      :destroyOnClose="modelConfig.destroyOnClose" @cancel="handleCancel">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">保存</a-button>
      </template>
      <a-form ref="formRef" name="PmsShopProductForm" class="ant-advanced-search-form" disabled :model="formState"
        @finish="onFinish" @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol"
        :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="name">
              <span>{{ formState.name }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="image" label="图片url">
              <a-image :width="120" :src="formState.image" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="price" label="价格">
              <span v-if="formState.comparePrice && formState.price && formState.price < formState.comparePrice"
                style="font-weight: 900; font-style: oblique; color: red;">
                {{ formState.price }}</span>
              <span v-else>{{ formState.price }}</span>
            </a-form-item>
            <a-col :span="12">
              <a-form-item name="comparePrice" label="对比价格">
                <span>{{ formState.comparePrice }}</span>
              </a-form-item>
            </a-col>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="lowestPrice" label="历史最低价格">
              <span>{{ formState.lowestPrice }}</span>
            </a-form-item>
            <a-col :span="12">
              <a-form-item name="hignestPrice" label="历史最高价格">
                <span>{{ formState.hignestPrice }}</span>
              </a-form-item>
            </a-col>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="icons" label="标签">
              <span>{{ formState.icons }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="productUrl" label="产品连接">
              <a :href="formState.productUrl">查看商城商品信息</a>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="shop" label="商铺">
              <span>{{ formState.shop }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="source" label="来源">
              <span> {{ sourceName }}</span>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, reactive, Ref } from "vue";
import { PmsShopProductDetail } from "./pmsShopProductDetailTs";
import {
  getPmsShopProductDetail,
  addOrEditPmsShopProduct,
} from "@/api/product/pmsShopProduct/pmsShopProductTs";
import { message, FormInstance } from "ant-design-vue";
import { ModelInfo } from "../pmsShopProductListTs";
import { getDictList } from "@/api/finance/dict/dictManager";
import { dictInfo } from "@/views/finance/dict/dict";

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

function getDictInfoList() {
  getDictList("shop_type");
}

function getDetail(id: number) {
  getPmsShopProductDetail(id)
}

let sourceName = ref<string>('');

function init() {
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      Promise.all([getDictInfoList, getDetail(props.modelInfo.id)]).then((res: any[]) => {
        if (res[0].code == "200" && res[0].data?.length && res[1].data) {
          res[0].data.array.forEach((item: { typeCode: string; typeName: Ref<string>; }) => {
            if (item.typeCode == res[1].data.source) {
              sourceName = item.typeName;
            }
          });

        } else {
          message.error((res[0] && res[0].message) || "查询列表失败！");
        }
        if (res[1].code == "200") {
          formState.value = res[1].data;
          modelConfig.confirmLoading = false;
        } else {
          message.error((res[1] && res[1].message) || "查询失败！");
        }
      })
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