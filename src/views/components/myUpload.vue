<template>
    <!-- <a-upload v-model:file-list="fileList" name="avatar" list-type="picture-card" class="avatar-uploader"
        :show-upload-list="false" action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        :before-upload="beforeUpload" @change="handleChange">
        <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
        <div v-else>
            <loading-outlined v-if="loading"></loading-outlined>
            <plus-outlined v-else></plus-outlined>
            <div class="ant-upload-text">Upload</div>
        </div>
</a-upload> -->
    <!-- <a-upload v-model:file-list="fileList" name="avatar" list-type="picture-card" class="avatar-uploader"
        :show-upload-list="false" :customRequest="customRequest">
        <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
        <div v-else>
            <loading-outlined v-if="loading"></loading-outlined>
            <plus-outlined v-else></plus-outlined>
            <div class="ant-upload-text">Upload</div>
        </div>
    </a-upload> -->
    <div class="clearfix">
        <a-upload v-model:file-list="fileList" name="avatar" list-type="picture-card" class="avatar-uploader"
            :show-upload-list="true" @change="handleChange" :customRequest="customImageRequest" @preview="handlePreview">
            <div>
                <plus-outlined />
                <div style="margin-top: 8px">Upload</div>
            </div>
        </a-upload>
        <a-modal :visible="previewVisible" :title="previewTitle" :footer="null" @cancel="handleCancel">
            <img alt="example" style="width: 100%" :src="previewImage" />
        </a-modal>
    </div>
</template>
<script setup lang="ts">
import { message, UploadProps } from 'ant-design-vue';
import { ref } from 'vue';
import type { UploadChangeParam } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { addOrEditFileManager } from '@/api/file/index'

// 通过覆盖默认的上传行为，可以自定义自己的上传实现(只写了前端没有写请求)
const customImageRequest = (info: any) => {
    const formData = new FormData() as any;
    formData.append("file", info.file);
    let method = "";
    let id = '';
    // if (formState.value.id) {
    if (id) {
        method = "put";
    } else {
        method = "post";
    }
    addOrEditFileManager(method, 'user', formData).then(res => {
        if (res.data && res.data.code == "200") {
            message.success((res.data && res.data.message) || "保存成功！");
            info.onSuccess(res.data, info.file);
        } else {
            message.error((res.data && res.data.message) || "保存失败！");
        }
    });
};

const loading = ref<boolean>(false);

const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
        loading.value = true;
        return;
    }
    if (info.file.status === 'done') {
        loading.value = false;
        return;
    }
    if (info.file.status === 'error') {
        message.error('upload error');
    }
};
// const beforeUpload = (file: UploadProps['fileList'][number]) => {
//     const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
//     if (!isJpgOrPng) {
//         message.error('You can only upload JPG file!');
//     }
//     const isLt2M = file.size / 1024 / 1024 < 2;
//     if (!isLt2M) {
//         message.error('Image must smaller than 2MB!');
//     }
//     return isJpgOrPng && isLt2M;
// };

function getBase6412(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const fileList = ref<UploadProps['fileList']>([]);

const handleCancel = () => {
    previewVisible.value = false;
    previewTitle.value = '';
};
const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
        file.preview = (await getBase6412(file.originFileObj)) as string;
    }
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
    previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};
</script>
<style>
.avatar-uploader>.ant-upload {
    width: 128px;
    height: 128px;
}

.ant-upload-select-picture-card i {
    font-size: 32px;
    color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
}
</style>
