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
      <a-form ref="formRef" name="PmsBrandForm" class="ant-advanced-search-form" :model="formState" @finish="onFinish"
        @finishFailed="onFinishFailed" :rules="rulesRef" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="name" label="品牌名">
              <a-input v-model:value="formState.name" placeholder="请填写品牌名"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="logo" label="品牌logo地址">
              <myUpload :fileInfo="fileInfo" :fromSystem="fromSystem" @handleRemove="handleRemove" @customImageRequest="customImageRequest"></myUpload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="showStatus" label="显示状态">
              <a-select ref="select" v-model:value="formState.showStatus" mode="combobox" placeholder="请输入显示状态"
                :field-names="{ label: 'typeName', value: 'typeCode' }" :options="validList"
                :allowClear="true"></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="firstLetter" label="检索首字母">
              <a-input v-model:value="formState.firstLetter" placeholder="请填写检索首字母"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="sort" label="排序">
              <a-input v-model:value="formState.sort" placeholder="请填写排序"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item name="descript" label="介绍" :label-col="{ span: 3 }" :wrapperCol="{ span: 24 }">
              <a-textarea v-model:value="formState.descript" placeholder="请填写介绍"></a-textarea>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { PmsBrandDetail } from "./pmsBrandDetailTs";
import {
  getPmsBrandDetail,
  addOrEditPmsBrand,
} from "@/api/product/pmsBrand/pmsBrandTs";
import { message, FormInstance } from "ant-design-vue";
import { dictInfo, ModelInfo } from "@/views/finance/dict/dict";
import { getDictList } from "@/api/finance/dict/dictManager";
import { FileInfo } from '@/views/components/fileInfo';

let validList = ref<dictInfo[]>([]);
const labelCol = ref({ span: 6 });
const wrapperCol = ref({ span: 18 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

const rulesRef = reactive({
  name: [
    {
      required: true,
      message: '品牌名不能为空！',
    },
  ],
  logo: [
    {
      required: true,
      message: '品牌logo地址不能为空！',
      trigger: 'submit'
    },
  ],
  firstLetter: [
    {
      required: true,
      message: '检索首字母不能为空！',
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

let formState = ref<PmsBrandDetail>({});

let fileInfo = ref<FileInfo>({});

let fromSystem = ref<string>('product');

const emit = defineEmits(["handleOk", "handleCancel"]);

const handleOk = () => {
  loading.value = true;
  if (formRef.value) {
    formRef.value.validateFields().then(
      () => savePmsBrandManager()).catch(() => {
        loading.value = false;
      });
  }
};

const handleCancel = () => {
  emit("handleCancel", false);
};

//保存品牌信息
function savePmsBrandManager() {
  let method = "";
  if (formState.value.brandId) {
    method = "put";
  } else {
    method = "post";
  }
  addOrEditPmsBrand(method, formState.value)
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

function getDictInfoList() {
  getDictList("is_valid").then((res) => {
    if (res.code == "200") {
      res.data.forEach(item => {
        if (item.belongTo == "is_valid") {
          validList.value.push({ typeCode: Number(item.typeCode), typeName: item.typeName });
        }
      });
    } else {
      message.error((res && res.message) || "查询列表失败！");
    }
  });
}

const customImageRequest = (file: FileInfo) => {
  formState.value.logo = file.id;
}

const handleRemove = () => {
  formState.value.logo = null;
  formState.value.logoUrl = '';
}

function init() {
  //获取字典值
  getDictInfoList();
  if (props.modelInfo) {
    if (props.modelInfo.id) {
      getPmsBrandDetail(props.modelInfo.id)
        .then((res) => {
          if (res.code == "200") {
            formState.value = res.data;
            modelConfig.confirmLoading = false;
            if (formState.value.logo) {
              fileInfo.value.id = formState.value.logo;
              fileInfo.value.url = formState.value.logoUrl;
            } else {
              fileInfo.value = {};
            }
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
        showStatus: 1,
      };
      fileInfo.value = {};
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