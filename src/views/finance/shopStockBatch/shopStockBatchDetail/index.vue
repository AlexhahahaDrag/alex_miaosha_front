<template>
  <div>
    <a-modal
      :open="props.open"
      :width="
        props.modelInfo && props.modelInfo.width ?
          props.modelInfo.width
        : '1000px'
      "
      :title="
        props.modelInfo && props.modelInfo.title ?
          props.modelInfo.title
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
        name="ShopStockBatchForm"
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
            <a-form-item
              :name="labelMap['batchCode'].name"
              :label="labelMap['batchCode'].label"
            >
              <a-input
                v-model:value="formState.batchCode"
                :placeholder="'请填写' + labelMap['batchCode'].label"
              ></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :name="labelMap['batchName'].name"
              :label="labelMap['batchName'].label"
            >
              <a-input
                v-model:value="formState.batchName"
                :placeholder="'请填写' + labelMap['batchName'].label"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item
              :name="labelMap['isValid'].name"
              :label="labelMap['isValid'].label"
            >
              <a-select
                ref="select"
                v-model:value="formState.isValid"
                :placeholder="'请输入' + labelMap['isValid'].label"
                :field-names="{ label: 'typeName', value: 'typeCode' }"
                :options="isValidList"
                :allowClear="true"
              >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              :name="labelMap['description'].name"
              :label="labelMap['description'].label"
            >
              <a-input
                v-model:value="formState.description"
                :placeholder="'请填写' + labelMap['description'].label"
              ></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ShopStockBatchDetail } from './shopStockBatchDetailTs';
import {
  getShopStockBatchDetail,
  addOrEditShopStockBatch,
} from '@/api/finance/shopStockBatch/shopStockBatchTs';
import { message, FormInstance } from 'ant-design-vue';
import { dictInfo } from '@/views/finance/dict/dict';
import { getDictList } from '@/api/finance/dict/dictManager';
import { ModelInfo } from '../shopStockBatchListTs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>({
  batchCode: { name: 'batchCode', label: '订单编码' },
  batchName: { name: 'batchName', label: '订单名称' },
  isValid: { name: 'isValid', label: '状态' },
  description: { name: 'description', label: '描述' },
});

const rulesRef = reactive({
  batchCode: [
    {
      required: true,
      message: '订单编码不能为空！',
    },
  ],
  batchName: [
    {
      required: true,
      message: '订单名称不能为空！',
    },
  ],
  isValid: [
    {
      required: true,
      message: '状态不能为空！',
    },
  ],
  description: [
    {
      required: true,
      message: '描述不能为空！',
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

let formState = ref<ShopStockBatchDetail>({});

let isValidList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList('is_valid').then((res) => {
    if (res.code == '200') {
      isValidList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == 'is_valid',
      );
    } else {
      message.error((res && res.message) || '查询列表失败！');
    }
  });
};

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = (): void => {
  loading.value = true;
  if (formRef.value) {
    formRef.value
      .validateFields()
      .then(() => saveShopStockBatchManager())
      .catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = (): void => {
  emit('handleCancel', false);
};

//保存商店库存批次表信息
const saveShopStockBatchManager = (): void => {
  let method = '';
  if (formState.value.id) {
    method = 'put';
  } else {
    method = 'post';
  }
  addOrEditShopStockBatch(method, formState.value)
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
        message.error(data?.message || '保存失败！');
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = (values: any): void => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any): void => {
  console.log('Failed:', errorInfo);
};

const init = (): void => {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getShopStockBatchDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == '200') {
            formState.value = res.data;
            modelConfig.confirmLoading = false;
          } else {
            message.error((res && res.message) || '查询失败！');
          }
        })
        .catch((error: any) => {
          let data = error?.response?.data;
          if (data) {
            message.error(data?.message || '查询失败！');
          }
        });
    } else {
      modelConfig.confirmLoading = false;
      formState.value = {};
    }
  }
};

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
  },
);

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
