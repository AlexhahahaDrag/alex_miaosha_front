<template>
	<div class="contacts-management">
		<!-- 页面头部 -->
		<div class="page-header">
			<h1 class="page-title">联系人管理</h1>
			<div class="header-actions">
				<!-- 下载模版按钮 -->
				<a-button class="btn-template btn-info" @click="onDownloadTemplate">
					<template #icon><download-outlined /></template>
					下载模版
				</a-button>
				<a-upload
					name="file"
					:showUploadList="false"
					:customRequest="customImportRequest"
					accept=".xlsx,.xls"
				>
					<a-button type="primary" class="btn-import btn-info">
						<template #icon><download-outlined /></template>
						导入联系人
					</a-button>
				</a-upload>
				<a-button type="primary" class="btn-add btn-info" @click="onAddContact">
					<template #icon><plus-outlined /></template>
					添加联系人
				</a-button>
			</div>
		</div>

		<!-- 搜索和筛选区域 -->
		<div class="search-filter-section">
			<div class="search-box">
				<a-input
					v-model:value="searchInfo.keyword"
					placeholder="搜索联系名称、电话号码"
					allow-clear
					@press-enter="onSearch"
					@change="onSearchDebounce"
					class="search-input"
				>
					<template #prefix><search-outlined /></template>
				</a-input>
			</div>
			<div class="filter-controls">
				<a-select
					v-model:value="searchInfo.relationship"
					placeholder="所有关系"
					style="width: 120px; height: 100%"
					allow-clear
					@change="onSearch"
				>
					<a-select-option value="">所有关系</a-select-option>
					<a-select-option
						v-for="option in relationshipOptions"
						:key="option.id"
						:value="option.id"
					>
						{{ option.relationshipTag }}
					</a-select-option>
				</a-select>
				<!-- 添加查询和清空按钮 -->
				<a-button type="primary" @click="onSearch" class="search-btn">
					<template #icon><search-outlined /></template>
					查询
				</a-button>
				<a-button @click="onResetFilter" class="reset-btn">
					<template #icon><reload-outlined /></template>
					清空
				</a-button>
			</div>
		</div>

		<!-- 表格区域 -->
		<div class="table-section">
			<div v-if="loading" class="loading-container">
				<a-spin tip="加载中..."> </a-spin>
			</div>
			<a-table
				v-else-if="contactList?.length"
				:dataSource="contactList"
				:columns="columns"
				:loading="loading"
				:row-key="(record: ContactsUserInfo) => record.id || 0"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'relationship'">
						<a-tag
							v-if="record.relationshipTag"
							:color="
								getRelationshipTagColor(
									record.relationshipTag,
									relationshipOptions,
								)
							"
						>
							{{ record.relationshipTag }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<a-button type="link" size="small" @click="onEditContact(record)">
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="onDeleteContact(record.id)"
								@cancel="onCancel"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<!-- 空状态提示 -->
			<div v-else class="empty-state">
				<a-empty :description="`未找到联系人`" style="margin-top: 20px">
				</a-empty>
			</div>
		</div>

		<!-- 详情模态框 -->
		<contacts-user-detail
			ref="detailRef"
			:open="modelInfo?.open"
			:modelInfo="modelInfo"
			@handleOk="handleOk"
			@handleCancel="handleCancel"
		></contacts-user-detail>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	DownloadOutlined,
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons-vue';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { ContactsUserInfo } from './config/index';
import { columns, getRelationshipTagColor } from './config/index';
import {
	getContactsUserPage,
	deleteContactsUser,
	importContactsUser,
	downloadContactsUserTemplate,
} from './api/index';
import { debounce } from 'lodash-es';
import contactsUserDetail from './contacts-user-detail/index.vue';
import { getUserEnabledRelations } from '../contacts-user-relation/api/index';
import type { ContactsUserRelationInfo } from '../contacts-user-relation/config/index';
import { useUserStore } from '@/store/modules/user/user';

const userStore = useUserStore();
// 获取用户信息
const { userInfo } = storeToRefs(userStore);

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

// 加载状态
const loading = ref<boolean>(false);
// 下载中状态 - 防止重复下载
const downloading = ref<boolean>(false);
// 数据源
const contactList = ref<ContactsUserInfo[]>([]);
// 关系分类选项
const relationshipOptions = ref<ContactsUserRelationInfo[]>([]);
// 搜索条件 - 合并到searchInfo中
const searchInfo = ref<ContactsUserInfo>({
	relationship: '',
	keyword: '',
});

// 详情模态框相关
const detailRef = ref<InstanceType<typeof contactsUserDetail> | null>(null);
const modelInfo = ref<{
	open: boolean;
	title?: string;
	record?: ContactsUserInfo;
	id?: number;
}>({
	open: false,
});

// 处理详情页面保存成功
const handleOk = (v: boolean): void => {
	modelInfo.value = { open: v };
	// 重新加载列表
	getContactsUserListPage(searchInfo.value, pagination);
};

// 处理详情页面取消
const handleCancel = (v: boolean): void => {
	modelInfo.value = { open: v };
};

// 清空查询条件
const onResetFilter = (): void => {
	searchInfo.value = {
		relationship: '',
		keyword: '',
	};
	getContactsUserListPage(searchInfo.value, pagination);
};

// 搜索
const onSearch = (): void => {
	pagination.current = 1;
	getContactsUserListPage(searchInfo.value, pagination);
};

// 防抖搜索 - 用户输入时延迟500ms后执行查询，避免频繁请求
const onSearchDebounce = debounce((): void => {
	pagination.current = 1;
	getContactsUserListPage(searchInfo.value, pagination);
}, 500);

// 分页改变
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getContactsUserListPage(searchInfo.value, pagination);
};

// 删除单个联系人
const onDeleteContact = async (id: number | undefined): Promise<void> => {
	if (!id) {
		message.error('ID不存在！', 3);
		return;
	}
	const { code, message: messageInfo } = await deleteContactsUser(String(id));
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getContactsUserListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 导入联系人
const customImportRequest = async (info: unknown): Promise<void> => {
	const formData = new FormData();
	formData.append('file', (info as { file: File }).file);
	const { code, message: messageInfo } = await importContactsUser(formData);
	if (code == '200') {
		message.success(messageInfo || '导入成功！', 3);
		const params: ContactsUserInfo = {};
		getContactsUserListPage(params, pagination);
	} else {
		message.error(messageInfo || '导入失败！', 3);
	}
};

const onCancel = (e: MouseEvent): void => {
	console.log(e);
};

// 获取联系人列表
const getContactsUserListPage = async (
	param: ContactsUserInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getContactsUserPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		contactList.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

// 添加联系人
const onAddContact = (): void => {
	modelInfo.value = {
		open: true,
		title: '新增联系人',
		id: undefined,
	};
};

// 编辑联系人
const onEditContact = (record: ContactsUserInfo): void => {
	modelInfo.value = {
		open: true,
		title: '编辑联系人',
		record,
		id: record.id,
	};
};

// 下载联系人模版 - 改进版本，修复所有风险
const onDownloadTemplate = async (): Promise<void> => {
	// 风险1修复：防止重复下载
	if (downloading.value) {
		return;
	}
	message.info('开始下载模版，请稍候...');
	try {
		// 设置下载中状态
		downloading.value = true;
		// 获取加密后的响应（内容为Blob）
		const response: unknown = await downloadContactsUserTemplate({
			responseType: 'blob',
		});
		// 响应数据是Blob二进制文件
		const blob = (response as { data: Blob }).data;
		// 创建临时 URL
		const blobUrl = window.URL.createObjectURL(blob);
		// 创建临时 a 标签进行下载
		const link = document.createElement('a');
		link.href = blobUrl;
		link.download = '联系人模版.xlsx';
		document.body.appendChild(link);
		// 触发下载
		link.click();
		// 清理资源
		document.body.removeChild(link);
		window.URL.revokeObjectURL(blobUrl);
		// 隐藏加载提示，显示成功提示
		message.success('模版下载成功！');
	} catch (error: unknown) {
		console.error('错误信息：', error);
		// 风险4修复：详细的错误信息处理
		let errorMsg = '下载模版失败！';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const axiosError = error as any;
		if (axiosError?.code === 'ECONNABORTED') {
			errorMsg = '下载超时，请检查网络后重试';
		} else if (axiosError?.response?.status === 404) {
			errorMsg = '模版文件不存在，请联系管理员';
		} else if (axiosError?.response?.status === 401) {
			errorMsg = '登录已过期，请重新登录';
		} else if (axiosError?.response?.status === 500) {
			errorMsg = '服务器错误，请稍后重试';
		} else if (error instanceof Error && error.message.includes('token')) {
			errorMsg = '登录令牌缺失，请重新登录';
		} else if (error instanceof Error) {
			errorMsg = error.message;
		}
		message.error(errorMsg);
		console.error('下载模版错误:', error);
	} finally {
		downloading.value = false;
	}
};

// 获取关系分类选项
const loadRelationshipOptions = async (): Promise<void> => {
	try {
		// 获取用户的所有启用的关系分类（公共+私有）
		const { code, data } = await getUserEnabledRelations(
			userInfo.value?.id ?? 0,
		);
		if (code == '200' && data) {
			relationshipOptions.value = data;
		}
	} catch (error: unknown) {
		console.error('错误信息：', error);
		message.error(
			'获取关系分类失败，请重试！' + (error as Error).message || '未知错误',
		);
	}
};

// 页面初始化
const init = async (): Promise<void> => {
	// 加载关系分类选项
	loadRelationshipOptions();
	// 加载联系人列表
	const params: ContactsUserInfo = {};
	getContactsUserListPage(params, pagination);
};

init();
</script>

<style lang="scss" scoped>
.contacts-management {
	padding: 24px;
	background: #f5f5f5;
	height: 100%;

	// 页面头部
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;

		.page-title {
			font-size: 24px;
			font-weight: 500;
			margin: 0;
			color: #000;
		}

		.header-actions {
			display: flex;
			gap: 12px;

			.btn-template {
				color: #1890ff;
				border-color: #1890ff;

				&:hover {
					color: #0050b3;
					border-color: #0050b3;
				}
			}

			.btn-import {
				background: #52c41a;
				border-color: #52c41a;

				&:hover {
					background: #45a049;
					border-color: #45a049;
				}
			}

			.btn-add {
				background: #1890ff;
				border-color: #1890ff;

				&:hover {
					background: #0050b3;
					border-color: #0050b3;
				}
			}
		}
	}

	// 搜索和筛选
	.search-filter-section {
		display: flex;
		gap: 16px;
		margin-bottom: 20px;
		background: white;
		padding: 16px;
		border-radius: 4px;

		.search-box {
			flex: 1;
			display: flex;
			align-items: center;
			height: 40px;
			border-radius: 8px;
			padding: 0 10px;
			background: #f5f5f5;
			border: 1px solid #f0f0f0;
			transition: all 0.3s ease;

			&:hover {
				background: #fafafa;
				border-color: #e6e6e6;
			}

			&:focus-within {
				background: #ffffff;
				border-color: #d9d9d9;
				box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
			}

			:deep(.ant-input-affix-wrapper) {
				height: 100%;
				background: transparent;
				border: none;
				box-shadow: none;
				padding: 0;

				&:hover,
				&:focus {
					background: transparent;
					box-shadow: none;
					border: none;
				}

				.ant-input-prefix {
					color: #8c8c8c;
					margin-right: 8px;
					font-size: 14px;
				}
			}

			.search-input {
				flex: 1;
				height: 100%;
				border: none;
				background: transparent;
				padding-left: 0;
				font-size: 14px;
				color: #333;

				&::placeholder {
					color: #bfbfbf;
				}

				&:focus {
					box-shadow: none;
					border: none;
				}
			}
		}

		.filter-controls {
			display: flex;
			align-items: center;
			gap: 8px;
			height: 40px;

			:deep(.ant-select) {
				height: 100%;

				.ant-select-selector {
					height: 100%;
					border-radius: 4px;
					border: 1px solid #d9d9d9;
					transition: all 0.3s ease;
					display: flex;
					align-items: center;

					&:hover {
						border-color: #40a9ff;
					}
				}

				// 选择器内容区域
				.ant-select-selection-item {
					text-align: center;
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				// 占位符文本
				.ant-select-selection-placeholder {
					text-align: center;
					width: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				&.ant-select-focused .ant-select-selector {
					border-color: #1890ff;
					box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
				}
			}

			.search-btn {
				background: #1890ff;
				border-color: #1890ff;
				height: 100%;
				border-radius: 4px;

				&:hover {
					background: #0050b3;
					border-color: #0050b3;
				}
			}

			.reset-btn {
				border-color: #d9d9d9;
				color: #000;
				height: 100%;
				border-radius: 4px;

				&:hover {
					border-color: #40a9ff;
					color: #40a9ff;
				}
			}
		}
	}

	// 表格区域
	.table-section {
		background: white;
		border-radius: 4px;
		overflow: hidden;
		padding: 16px;

		.loading-container {
			height: 200px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		:deep(.ant-table) {
			background: white;

			.ant-table-thead > tr > th {
				background: #fafafa;
				border-bottom: 1px solid #f0f0f0;
				font-weight: 500;
			}

			.ant-table-tbody > tr:hover > td {
				background: #fafafa;
			}

			// Loading 状态样式
			&.ant-table-loading {
				opacity: 0.6;

				.ant-table-body {
					pointer-events: none;
				}
			}

			// Loading 覆盖层
			:deep(.ant-table-loading) {
				background: rgba(255, 255, 255, 0.9);
				backdrop-filter: blur(2px);

				.ant-spin {
					color: #1890ff;
				}
			}

			// Spin 动画样式
			:deep(.ant-spin-spinning) {
				color: #1890ff;
			}

			:deep(.ant-spin-dot) {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
			}
		}

		// 空状态
		.empty-state {
			text-align: center;
			background: white;
			min-height: 300px;
			display: flex;
			align-items: center;
			justify-content: center;

			.empty-tip {
				color: #8c8c8c;
				font-size: 14px;
			}
		}
	}
}

.btn-info {
	padding: 6px 10px;
	height: 40px;
}
</style>
