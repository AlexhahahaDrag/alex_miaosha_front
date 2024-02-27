<template>
  <div>
    <a-modal :open='props.open' :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '1000px'"
      :title="props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'" @ok='handleOk' okText='保存'
      :confirmLoading='modelConfig.confirmLoading' :destroyOnClose='modelConfig.destroyOnClose' @cancel='handleCancel'>
      <template #footer>
        <a-button key='back' @click='handleCancel'>取消</a-button>
        <a-button key='submit' type='primary' :loading='loading' @click='handleOk'>保存</a-button>
      </template>
      <a-form ref='formRef' name='ShopFinanceForm' class='ant-advanced-search-form' :model='formState' @finish='onFinish'
        @finishFailed='onFinishFailed' :rules='rulesRef' :label-col='labelCol' :wrapper-col='wrapperCol'>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['shopName'].name" :label="labelMap['shopName'].label">
              <a-input v-model:value='formState.shopName' :placeholder="'请填写' + labelMap['shopName'].label"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item :name="labelMap['shopCode'].name" :label="labelMap['shopCode'].label">
              <a-input v-model:value='formState.shopCode' :placeholder="'请填写' + labelMap['shopCode'].label"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['saleAmount'].name" :label="labelMap['saleAmount'].label">
              <a-input v-model:value='formState.saleAmount' :placeholder="'请填写' + labelMap['saleAmount'].label"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item :name="labelMap['isValid'].name" :label="labelMap['isValid'].label">
              <a-select ref="select" v-model:value="formState.isValid" placeholder="请输入有效状态"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="validList" :allowClear="true">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['saleDate'].name" :label="labelMap['saleDate'].label">
              <a-date-picker v-model:value="formState.saleDate" :format="dateFormatter"
                :getPopupContainer="(triggerNode: any) => { return triggerNode.parentNode }" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang='ts' setup>
import { ShopFinanceDetail } from './shopFinanceDetailTs';
import {
  getShopFinanceDetail,
  addOrEditShopFinance,
} from '@/api/finance/shopFinance/shopFinanceTs';
import { message, FormInstance } from 'ant-design-vue';
import { ModelInfo } from '../shopFinanceListTs';
import { getDictList } from "@/api/finance/dict/dictManager";
import dayjs from "dayjs";

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>(
  {
    shopName: { name: 'shopName', label: '商品名称' },
    shopCode: { name: 'shopCode', label: '商品编码' },
    saleAmount: { name: 'saleAmount', label: '售价' },
    isValid: { name: 'isValid', label: '是否有效' },
    saleDate: { name: 'saleDate', label: '销售日期' },
  });

const rulesRef = reactive({
  saleAmount: [
    {
      required: true,
      message: '售价不能为空！',
    },
  ],
  isValid: [
    {
      required: true,
      message: '是否有效不能为空！',
    },
  ],
  saleDate: [
    {
      required: true,
      message: '销售日期不能为空！',
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

let formState = ref<ShopFinanceDetail>({});


const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => saveShopFinanceManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit('handleCancel', false);
};

//保存商店财务表信息
function saveShopFinanceManager() {
  let method = '';
  if (formState.value.id) {
    method = 'put';
  } else {
    method = 'post';
  }
  addOrEditShopFinance(method, formState.value)
    .then((res) => {
      if (res.code == '200') {
        message.success((res && res.message) || '保存成功！');
        emit('handleOk', false);
      } else {
        message.error((res && res.message) || '保存失败！');
      }
      formState.value = {};
    })
    .catch((error: any) => {
      let data = error?.response?.data;
      if (data) {
        message.error((data?.message) || '保存失败！');
      }
    }).finally(() => {
      loading.value = false;
    });
}

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

let validList = ref<dictInfo[]>([]);

function getDictInfoList() {
  getDictList("is_valid").then((res) => {
    if (res.code == "200") {
      validList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

function init() {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getShopFinanceDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == '200') {
            formState.value = res.data;
            formState.value.saleDate = dayjs(formState.value.saleDate);
            modelConfig.confirmLoading = false;
          } else {
            message.error((res && res.message) || '查询失败！');
          }
        })
        .catch((error: any) => {
          let data = error?.response?.data;
          if (data) {
            message.error((data?.message) || '查询失败！');
          }
        });
    } else {
      modelConfig.confirmLoading = false;
      formState.value = {
        isValid: '1',
        saleDate: dayjs(),
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
<style lang='scss' scoped>
@import '@/style/index.scss';
</style>