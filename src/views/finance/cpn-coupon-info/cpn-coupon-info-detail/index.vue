<template>
  <div>
    <a-modal 
    :open="props.open" 
    :width="props.modelInfo?.width || '1000px'"
      :title="props.modelInfo?.title || 'Basic Modal'" @ok="handleOk" okText="保存" :confirmLoading="loading"
      :destroyOnClose="true" @cancel="handleCancel">
      <template #footer>
        <a-button key="back" @click="handleCancel">取消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleOk">
          保存
        </a-button>
      </template>
      <a-form ref="formRef" name="CouponInfoForm" class="ant-advanced-search-form" :model="formState" :rules="rulesRef"
        :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :name="labelMap['couponName'].name" :label="labelMap['couponName'].label">
              <a-input v-model:value="formState.couponName" :placeholder="'请填写' + labelMap['couponName'].label">
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :name="labelMap['totalQuantity'].name" :label="labelMap['totalQuantity'].label">
              <a-input v-model:value="formState.totalQuantity" :placeholder="'请填写' + labelMap['totalQuantity'].label">
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :name="labelMap['startDate'].name" :label="labelMap['startDate'].label">
              <a-date-picker v-model:value="formState.startDate" :format="'YYYY-MM-DD'" :getPopupContainer="(triggerNode: any) => {
                return triggerNode.parentNode;
              }
                " />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :name="labelMap['endDate'].name" :label="labelMap['endDate'].label">
              <a-date-picker v-model:value="formState.endDate" :format="'YYYY-MM-DD'" :getPopupContainer="(triggerNode: any) => {
                return triggerNode.parentNode;
              }
                " />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :name="labelMap['unitValue'].name" :label="labelMap['unitValue'].label">
              <a-input v-model:value="formState.unitValue" :placeholder="'请填写' + labelMap['unitValue'].label">
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :name="labelMap['minSpend'].name" :label="labelMap['minSpend'].label">
              <a-input v-model:value="formState.minSpend" :placeholder="'请填写' + labelMap['minSpend'].label">
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { message, type FormInstance } from 'ant-design-vue';
import {
  getCpnCouponInfoDetail,
  addCpnCouponInfo,
  editCpnCouponInfo,
} from '@/views/finance/cpn-coupon-info/api';
import type { ModelInfo } from '@/views/common/config';
import type { CpnCouponInfoData } from '../config';
import { labelMap } from '../config';
import { rulesRef, labelCol, wrapperCol } from './config';
import dayjs from 'dayjs';

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const modelConfig = {
  confirmLoading: true,
  destroyOnClose: true,
};

interface Props {
  open?: boolean;
  modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<CpnCouponInfoData>({});

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value
      .validateFields()
      .then(() => saveCpnCouponInfo())
      .catch(() => (loading.value = false));
  }
};
const handleCancel = () => {
  emits('handleCancel', false);
};

//保存消费券信息表信息
const saveCpnCouponInfo = async () => {
  let api = addCpnCouponInfo;
  if (formState.value.id) {
    api = editCpnCouponInfo;
  }
  loading.value = true;
  const { code, message: messageInfo } = await api(formState.value)
    .catch((error: any) => {
      return error;
    })
    .finally(() => {
      loading.value = false;
    });
  if (code == '200') {
    message.success(messageInfo || '保存成功！');
    formState.value = {};
    emits('handleOk', false);
  } else {
    message.error(messageInfo || '保存失败！');
  }
};

const initDetail = async (modalData: ModelInfo | undefined) => {
  if (modalData?.id) {
    const {
      code,
      data,
      message: messageInfo,
    } = await getCpnCouponInfoDetail(modalData.id);
    if (code == '200') {
      formState.value = data || {};
      modelConfig.confirmLoading = false;
    } else {
      message.error(messageInfo || '查询失败！');
    }
  } else {
    modelConfig.confirmLoading = false;
    formState.value = {startDate: dayjs()};
  }
};

const init = async () => {
  //初始化数据
  initDetail(props.modelInfo);
};

const emits = defineEmits(['handleOk', 'handleCancel']);

defineExpose({ handleOk, handleCancel });

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
</script>
<style lang="scss" scoped></style>
