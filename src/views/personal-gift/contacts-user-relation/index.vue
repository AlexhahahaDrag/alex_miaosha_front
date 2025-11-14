<template>
	<div class="contacts-relation-management">
		<!-- 页面头部 -->
		<div class="page-header">
			<h1 class="page-title">关系分类管理</h1>
			<div class="header-actions">
				<a-button
					type="primary"
					class="btn-add btn-info"
					@click="onAddRelation"
				>
					<template #icon><plus-outlined /></template>
					添加关系分类
				</a-button>
			</div>
		</div>

		<!-- 搜索和筛选区域 -->
		<div class="search-filter-section">
			<div class="search-box">
				<a-input
					v-model:value="searchInfo.keyword"
					placeholder="搜索关系分类、描述"
					allow-clear
					@press-enter="onSearch"
					@change="onSearchDebounce"
					class="search-input"
				>
					<template #prefix><search-outlined /></template>
				</a-input>
			</div>
			<div class="filter-controls">
				<!-- 重要程度筛选 -->
				<a-select
					v-model:value="searchInfo.importance"
					placeholder="所有重要程度"
					style="width: 140px; height: 100%"
					@change="onSearch"
				>
					<a-select-option :value="undefined">所有重要程度</a-select-option>
					<a-select-option
						v-for="option in importanceOptions"
						:key="option.value"
						:value="option.value"
					>
						{{ option.label }}
					</a-select-option>
				</a-select>
				<!-- 启用状态筛选 -->
				<a-select
					v-model:value="searchInfo.isEnabled"
					placeholder="所有状态"
					style="width: 120px; height: 100%"
					@change="onSearch"
				>
					<a-select-option :value="undefined">所有状态</a-select-option>
					<a-select-option
						v-for="option in enabledOptions"
						:key="option.value"
						:value="option.value"
					>
						{{ option.label }}
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
				v-else-if="relationList?.length"
				:dataSource="relationList"
				:columns="columns"
				:loading="loading"
				:row-key="(record: ContactsUserRelationInfo) => record.id || 0"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<!-- 重要程度显示 -->
					<template v-if="column.key === 'importance'">
						<a-tag v-if="record.importance === 1" color="blue">普通</a-tag>
						<a-tag v-else-if="record.importance === 2" color="orange">
							重要
						</a-tag>
						<a-tag v-else-if="record.importance === 3" color="red">
							非常重要
						</a-tag>
					</template>
					<!-- 启用状态显示 -->
					<template v-else-if="column.key === 'isEnabled'">
						<a-tag v-if="record.isEnabled === 1" color="green">启用</a-tag>
						<a-tag v-else color="red">禁用</a-tag>
					</template>
					<!-- 描述显示 -->
					<template v-else-if="column.key === 'description'">
						<div class="description-text" :title="record.description">
							{{ record.description }}
						</div>
					</template>
					<!-- 操作按钮 -->
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="link"
								size="small"
								v-if="getPermission(record)"
								@click="onEditRelation(record)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								v-if="getPermission(record)"
								@confirm="onDeleteRelation(record.id)"
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
				<a-empty :description="`未找到关系分类`" style="margin-top: 20px">
				</a-empty>
			</div>
		</div>

		<!-- 详情模态框 -->
		<contacts-user-relation-detail
			ref="detailRef"
			:open="modelInfo?.open"
			:modelInfo="modelInfo"
			@handleOk="handleOk"
			@handleCancel="handleCancel"
		></contacts-user-relation-detail>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	PlusOutlined,
	ReloadOutlined,
	SearchOutlined,
} from '@ant-design/icons-vue';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { ContactsUserRelationInfo } from './config/index';
import { columns, importanceOptions, enabledOptions } from './config/index';
import {
	getContactsUserRelationPage,
	deleteContactsUserRelation,
} from './api/index';
import { debounce } from 'lodash-es';
import contactsUserRelationDetail from './contacts-user-relation-detail/index.vue';
import { useUserStore } from '@/store/modules/user/user';

const userStore = useUserStore();
// 获取用户信息和角色信息
const { userInfo, roleInfo } = storeToRefs(userStore);
// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

// 加载状态
const loading = ref<boolean>(false);
// 数据源
const relationList = ref<ContactsUserRelationInfo[]>([]);
// 搜索条件
const searchInfo = ref<ContactsUserRelationInfo>({
	keyword: '',
	importance: undefined,
	isEnabled: undefined,
	userId: userInfo.value?.id as number | undefined,
});

// 详情模态框相关
const detailRef = ref<InstanceType<typeof contactsUserRelationDetail> | null>(
	null,
);
const modelInfo = ref<{
	open: boolean;
	title?: string;
	record?: ContactsUserRelationInfo;
	id?: number;
}>({
	open: false,
});

// 处理详情页面保存成功
const handleOk = (v: boolean): void => {
	modelInfo.value = { open: v };
	// 重新加载列表
	getRelationListPage(searchInfo.value, pagination);
};

// 处理详情页面取消
const handleCancel = (v: boolean): void => {
	modelInfo.value = { open: v };
};

// 清空查询条件
const onResetFilter = (): void => {
	searchInfo.value = {
		keyword: '',
		importance: undefined,
		isEnabled: undefined,
		userId: userInfo.value?.id as number | undefined,
	};
	getRelationListPage(searchInfo.value, pagination);
};

// 搜索
const onSearch = (): void => {
	pagination.current = 1;
	getRelationListPage(searchInfo.value, pagination);
};

// 防抖搜索 - 用户输入时延迟500ms后执行查询，避免频繁请求
const onSearchDebounce = debounce((): void => {
	pagination.current = 1;
	getRelationListPage(searchInfo.value, pagination);
}, 500);

// 分页改变
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getRelationListPage(searchInfo.value, pagination);
};

// 删除单个关系分类
const onDeleteRelation = async (id: number | undefined): Promise<void> => {
	if (!id) {
		message.error('ID不存在！', 3);
		return;
	}
	const { code, message: messageInfo } = await deleteContactsUserRelation(
		String(id),
	);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getRelationListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const onCancel = (e: MouseEvent): void => {
	console.log(e);
};

// 获取关系分类列表
const getRelationListPage = async (
	param: ContactsUserRelationInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getContactsUserRelationPage(
		param,
		cur.current,
		cur.pageSize,
	).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		relationList.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

// 添加关系分类
const onAddRelation = (): void => {
	modelInfo.value = {
		open: true,
		title: '新增关系分类',
		id: undefined,
	};
};

// 编辑关系分类
const onEditRelation = (record: ContactsUserRelationInfo): void => {
	modelInfo.value = {
		open: true,
		title: '编辑关系分类',
		record,
		id: record.id,
	};
};

const getPermission = (record: ContactsUserRelationInfo): boolean => {
	return (
		userInfo.value?.id === record.userId ||
		roleInfo.value?.roleCode === 'super_super'
	);
};

// 页面初始化
const init = (): void => {
	const params: ContactsUserRelationInfo = {};
	getRelationListPage(params, pagination);
};

init();
</script>

<style lang="scss" scoped>
.contacts-relation-management {
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
		padding: 10px;

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

		// 描述文本样式 - 最多显示两行，超出部分用省略号
		.description-text {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
			word-break: break-word;
			line-height: 1.5;
			max-height: 3em; // 两行的高度（1.5 * 2）
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
