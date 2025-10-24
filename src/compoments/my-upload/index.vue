<template>
	<div class="clearfix">
		<a-upload
			v-model:file-list="fileList"
			name="avatar"
			list-type="picture-card"
			class="avatar-uploader"
			:show-upload-list="true"
			@change="handleChange"
			@remove="handleRemove"
			:customRequest="customImageRequest"
			@preview="handlePreview"
		>
			<div v-if="fileList && fileList.length < 1">
				<plus-outlined />
				<div style="margin-top: 8px">Upload</div>
			</div>
		</a-upload>
		<a-modal
			:open="previewVisible"
			:title="previewTitle"
			:footer="null"
			@cancel="handleCancel"
		>
			<img alt="example" style="width: 100%" :src="previewImage" />
		</a-modal>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { UploadChangeParam, UploadProps } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { addOrEditFileManager } from '@/views/common/api/file';
import type { FileInfo } from './config';

const emit = defineEmits(['customImageRequest', 'handleRemove']);

interface Props {
	fileInfo?: FileInfo;
	fromSystem?: string;
}

// 通过覆盖默认的上传行为,可以自定义自己的上传实现(只写了前端没有写请求)
const customImageRequest = async (info: any) => {
	const formData = new FormData() as any;
	formData.append('file', info.file);
	let method = '';
	let id = '';
	if (id) {
		method = 'put';
	} else {
		method = 'post';
	}
	const {
		code,
		data,
		message: messageInfo,
	} = await addOrEditFileManager(
		method,
		props.fromSystem ? props.fromSystem : 'common',
		formData,
	).finally(() => {
		loading.value = false;
	});
	console.log(`dddddddddddddddddddddddddd`, code, messageInfo, data);
	if (code == '200') {
		info.onSuccess(data, info.file);
		emit('customImageRequest', data);
	} else {
		message.error(messageInfo || '上传错误，请联系管理员！');
	}
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

const handleRemove = () => {
	fileList.value = [];
	emit('handleRemove');
};

// const beforeUpload = (file: UploadProps['fileList'][number]) => {
//     if(!file) {
//         return;
//     }
//     const isJpgOrPng = imageTypeList.indexOf(file.type) >= 0;
//     if (!isJpgOrPng) {
//         message.error('You can only upload JPG file!');
//     }
//     const isLt2M = file.size / 1024 / 1024 < 2;
//     if (!isLt2M) {
//         message.error('Image must smaller than 2MB!');
//     }
//     return isJpgOrPng && isLt2M;
// };

const getBase6412 = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
};

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const props = defineProps<Props>();
// const imageTypeList = ['bmp', 'jpg', 'png', 'tif', 'gif', 'pcx', 'tga', 'exif', 'fpx', 'svg', 'psd', 'cdr', 'pcd', 'dxf', 'ufo', 'eps', 'ai', 'raw', 'WMF', 'webp', 'avif', 'apng'];
const fileList = ref<UploadProps['fileList']>([]);

const handleCancel = () => {
	previewVisible.value = false;
	previewTitle.value = '';
};
const handlePreview = async (file: any) => {
	if (!file.url && !file.preview) {
		file.preview = (await getBase6412(file.originFileObj)) as string;
	}
	previewImage.value = file.url || file.preview;
	previewVisible.value = true;
	previewTitle.value =
		file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const init = () => {
	fileList.value = [];
	if (props.fileInfo?.id) {
		fileList.value?.push({
			uid: props.fileInfo.id + '',
			name: 'test.png',
			status: 'done',
			url: props.fileInfo.url,
		});
	}
};

watch(
	() => props.fileInfo,
	() => {
		init();
	},
	{ deep: true, flush: 'post' },
);

onMounted(() => {
	init();
});
</script>
<style>
.avatar-uploader > .ant-upload {
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
