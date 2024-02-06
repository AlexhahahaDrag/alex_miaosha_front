<template>
  <div>
    <a-modal :visible='props.visible'
            :width="props.modelInfo && props.modelInfo.width ? props.modelInfo.width : '1000px'"
            :title="props.modelInfo && props.modelInfo.title ? props.modelInfo.title : 'Basic Modal'"
            @ok='handleOk' okText='保存' :confirmLoading='modelConfig.confirmLoading'
            :destroyOnClose='modelConfig.destroyOnClose' @cancel='handleCancel'>
      <template #footer>
        <a-button key='back' @click='handleCancel'>取消</a-button>
        <a-button key='submit' type='primary' :loading='loading' @click='handleOk'>保存</a-button>
      </template>
      <a-form ref='formRef' name='PermissionInfoForm' class='ant-advanced-search-form' :model='formState' @finish='onFinish'
        @finishFailed='onFinishFailed' :rules='rulesRef' :label-col='labelCol' :wrapper-col='wrapperCol'>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['permissionCode'].name" :label="labelMap['permissionCode'].label">
              <a-input v-model:value='formState.permissionCode' :placeholder="'请填写' + labelMap['permissionCode'].label"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item :name="labelMap['permissionName'].name" :label="labelMap['permissionName'].label">
              <a-input v-model:value='formState.permissionName' :placeholder="'请填写' + labelMap['permissionName'].label"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['summary'].name" :label="labelMap['summary'].label">
              <a-input v-model:value='formState.summary' :placeholder="'请填写' + labelMap['summary'].label"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item :name="labelMap['status'].name" :label="labelMap['status'].label">
              <a-select ref="select" v-model:value="formState.status" :placeholder="'请输入' + labelMap['status'].label"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="statusList" :allowClear="true">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['options'].name" :label="labelMap['options'].label">
              <a-input v-model:value='formState.options' :placeholder="'请填写' + labelMap['options'].label"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang='ts' setup>
import { PermissionInfoDetail } from './permissionInfoDetailTs';
import {
  getPermissionInfoDetail,
  addOrEditPermissionInfo,
} from '@/api/user/permissionInfo/permissionInfoTs';
import { message, FormInstance } from 'ant-design-vue';
import { dictInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";
import { ModelInfo } from '../permissionInfoListTs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>(
{
    permissionCode: {name: 'permissionCode', label: '权限编码'},
    permissionName: {name: 'permissionName', label: '权限名称'},
    summary: {name: 'summary', label: '描述'},
    status: {name: 'status', label: '状态'},
    options: {name: 'options', label: 'url'},
});

const rulesRef = reactive({
  permissionCode: [
    {
      required: true,
      message: '权限编码不能为空！',
    },
  ],
  permissionName: [
    {
      required: true,
      message: '权限名称不能为空！',
    },
  ],
  summary: [
    {
      required: true,
      message: '描述不能为空！',
    },
  ],
  status: [
    {
      required: true,
      message: '状态不能为空！',
    },
  ],
  options: [
    {
      required: true,
      message: 'url不能为空！',
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

let formState = ref<PermissionInfoDetail>({});

let statusList = ref<dictInfo[]>([]);

const getDictInfoList = () => {
  getDictList("is_valid").then((res) => {
    if (res.code == "200") {
      statusList.value = res.data.filter(
        (item: { belongTo: string }) => item.belongTo == "is_valid"
      );
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePermissionInfoManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit('handleCancel', false);
};

//保存权限信息表信息
function savePermissionInfoManager() {
  let method = '';
  if (formState.value.id) {
    method = 'put';
  } else {
    method = 'post';
  }
  addOrEditPermissionInfo(method, formState.value)
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

function init() {
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getPermissionInfoDetail(props.modelInfo.id)
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
            message.error((data?.message) || '查询失败！');
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
<style lang='scss' scoped>
@import '@/style/index.scss';
</style>