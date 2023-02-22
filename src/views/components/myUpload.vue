<template><!-- <a-upload v-model:file-list="fileList" name="avatar" list-type="picture-card" class="avatar-uploader"
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
    <a-upload v-model:file-list="fileList" name="avatar" list-type="picture-card" class="avatar-uploader"
        :show-upload-list="false" @change="handleChange">
        <img v-if="imageUrl" :src="imageUrl" alt="avatar" />
        <div v-else>
            <loading-outlined v-if="loading"></loading-outlined>
            <plus-outlined v-else></plus-outlined>
            <div class="ant-upload-text">Upload</div>
        </div>
</a-upload>
</template>
<script setup lang="ts">
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { ref } from 'vue';
import type { UploadChangeParam } from 'ant-design-vue';
import { addOrEditFileManager } from '@/api/file/index'
// import type { UploadChangeParam, UploadProps } from 'ant-design-vue';

function getBase64(img: Blob | undefined, callback: (base64Url: string) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    if (img) {
        reader.readAsDataURL(img);
    }
}

function customRequest(data) {
    debugger;
    const formData = new FormData();
	formData.append("file", data.file);
	saveFile(formData);
}

function saveFile(formData) {
    let method = "";
        // if (formState.value.id) {
        //     method = "put";
        // } else {
        method = "post";
        // }
    addOrEditFileManager(method, 'user', formData).then(res => {
            if (res.code == "200") {
                message.success((res && res.message) || "保存成功！");
                // emit("handleOk", false);
            } else {
                message.error((res && res.message) || "保存失败！");
            }
        }).finally(() => {
            loading.value = false;
        })
}

const fileList = ref([]);
const loading = ref<boolean>(false);
const imageUrl = ref<string>('');

const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
        loading.value = true;
        return;
    }
    debugger;
    // if (info.file.status === 'done') {
        debugger;
    // Get this url from response in real world.
    const formData = new FormData() as any;
	formData.append("file", info.file.originFileObj);
	saveFile(formData);
    getBase64(info.file.originFileObj, (base64Url: string) => {
        imageUrl.value = base64Url;
        loading.value = false;
    });

    // }
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
