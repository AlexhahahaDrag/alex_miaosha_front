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
      <a-form ref='formRef' name='RoleUserInfoForm' class='ant-advanced-search-form' :model='formState' @finish='onFinish'
        @finishFailed='onFinishFailed' :rules='rulesRef' :label-col='labelCol' :wrapper-col='wrapperCol'>
        <a-row :gutter='24'>
          <a-col :span='12'>
            <a-form-item :name="labelMap['roleId'].name" :label="labelMap['roleId'].label">
              <a-input v-model:value='formState.roleId' :placeholder="'请填写' + labelMap['roleId'].label"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span='12'>
            <a-form-item :name="labelMap['userId'].name" :label="labelMap['userId'].label">
              <a-input v-model:value='formState.userId' :placeholder="'请填写' + labelMap['userId'].label"></a-input>
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
              <a-select ref="select" v-model:value="formState.status" mode="combobox" :placeholder="'请输入' + labelMap['status'].label"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="statusList" :allowClear="true">
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang='ts' setup>
import { RoleUserInfoDetail } from './roleUserInfoDetailTs';
import {
  getRoleUserInfoDetail,
  addOrEditRoleUserInfo,
} from '@/api/user/roleUserInfo/roleUserInfoTs';
import { message, FormInstance } from 'ant-design-vue';
import { dictInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";
import { ModelInfo } from '../roleUserInfoListTs';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const labelMap = ref<any>(
{
    roleId: {name: 'roleId', label: '角色id'},
    userId: {name: 'userId', label: '用户id'},
    summary: {name: 'summary', label: '描述'},
    status: {name: 'status', label: '状态'},
});

const rulesRef = reactive({
  roleId: [
    {
      required: true,
      message: '角色id不能为空！',
    },
  ],
  userId: [
    {
      required: true,
      message: '用户id不能为空！',
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

let formState = ref<RoleUserInfoDetail>({});

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
      () => saveRoleUserInfoManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit('handleCancel', false);
};

//保存用户角色信息表信息
function saveRoleUserInfoManager() {
  let method = '';
  if (formState.value.id) {
    method = 'put';
  } else {
    method = 'post';
  }
  addOrEditRoleUserInfo(method, formState.value)
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
      getRoleUserInfoDetail(props.modelInfo.id)
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