<template>
	<div class="personal-gift-container">
		<!-- 筛选区域 -->
		<div class="filter-section">
			<div class="filter-box">
				<!-- 搜索框显示 -->
				<div class="search-row">
					<div class="search-input"></div>
					<div class="select-row">
						<!-- 分类选择器 1 -->
						<div class="select-item"></div>
						<!-- 分类选择器 2 -->
						<div class="select-item"></div>
						<!-- 筛选按钮 -->
						<button class="filter-btn">
							<i class="filter-icon"></i>
							<span>筛选</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- 统计数据区域 -->
		<a-row :gutter="16" class="stats-section">
			<!-- 使用 v-for 循环动态渲染统计卡片 -->
			<a-col
				v-for="card in statCards"
				:key="card.id"
				:xs="24"
				:sm="24"
				:md="8"
				:lg="8"
			>
				<a-card class="stat-card" :bordered="false">
					<div class="stat-content">
						<div class="stat-info">
							<p class="stat-label">{{ card.label }}</p>
							<h3 class="stat-number">{{ card.value }}</h3>
						</div>
						<div :class="['stat-icon', card.iconClass]"></div>
					</div>
					<div class="stat-footer">
						<span :class="['stat-text', card.textClass]">
							{{ card.trend }}
							<i
								:class="[
									'arrow-icon',
									card.trendType === 'up' ? 'arrow-up' : 'arrow-down',
								]"
							></i>
						</span>
					</div>
				</a-card>
			</a-col>
		</a-row>

		<!-- 联系人记录区域 -->
		<div class="contacts-section">
			<div class="contacts-box">
				<!-- 标题和排序 -->
				<div class="contacts-header">
					<h2 class="contacts-title">联系人记录</h2>
					<div class="sort-section">
						<span class="sort-label">排序:</span>
						<a-select
							v-model:value="sortBy"
							style="width: 120px"
							@change="onSortChange"
						>
							<a-select-option value="date">按时间排序</a-select-option>
							<a-select-option value="name">按姓名排序</a-select-option>
							<a-select-option value="amount">按金额排序</a-select-option>
						</a-select>
					</div>
				</div>

				<!-- 联系人列表表格 - 使用 a-table 替代卡片列表 -->
				<div class="table-wrapper">
					<a-table
						:columns="tableColumns"
						:data-source="contactTableData"
						:loading="tableLoading"
						:row-key="(record: any) => record.id"
						:pagination="pagination"
						:scroll="{ x: 'max-content' }"
						size="small"
						@change="onTableChange"
					>
						<!-- 自定义列渲染 -->
						<template #bodyCell="{ column, record }">
							<!-- 联系人名称和标签 -->
							<template v-if="column.key === 'contactsUserName'">
								<div class="contact-name-cell">
									<div class="name-tag-group">
										<span class="contact-name">{{
											record.contactsUserName
										}}</span>
										<a-tag
											:color="getRelationshipColor(record.relationship)"
											class="relationship-tag"
										>
											{{ getRelationshipLabel(record.relationship) }}
										</a-tag>
									</div>
									<p class="contact-date">
										上次往来:
										{{ record.lastContactTime }}
									</p>
								</div>
							</template>

							<!-- 随礼总额 -->
							<template v-if="column.key === 'giftOutAmount'">
								<span class="amount-text text-red"
									>¥{{ record.giftOutAmount }}</span
								>
							</template>

							<!-- 收礼总额 -->
							<template v-if="column.key === 'giftInAmount'">
								<span class="amount-text text-green"
									>¥{{ record.giftInAmount }}</span
								>
							</template>

							<!-- 净差额 -->
							<template v-if="column.key === 'netAmount'">
								<span
									:class="[
										'amount-text',
										record.netAmount > 0 ? 'text-green' : 'text-red',
									]"
								>
									{{ record.netAmount > 0 ? '¥' : '-¥'
									}}{{ Math.abs(record.netAmount) }}
								</span>
							</template>

							<!-- 操作列 -->
							<template v-if="column.key === 'operation'">
								<a-space>
									<a-button
										type="link"
										size="small"
										class="btn-record-gift"
										@click="onRecordGift(record)"
									>
										<template #icon>
											<!-- eslint-disable-next-line vue/component-name-in-template-casing -->
											<gift-outlined />
										</template>
										收礼随礼
									</a-button>
									<a-button
										type="link"
										size="small"
										class="btn-interaction-record"
										@click="onInteractionRecord(record)"
									>
										<template #icon>
											<!-- eslint-disable-next-line vue/component-name-in-template-casing -->
											<history-outlined />
										</template>
										往来记录
									</a-button>
								</a-space>
							</template>
						</template>
					</a-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { GiftOutlined, HistoryOutlined } from '@ant-design/icons-vue';
import { usePagination } from '@/composables/usePagination';
import type { PageInfo } from '@/composables/usePagination';
import { getContactsGiftRecordList } from './api/index';
import {
	type ContactsGiftRecord,
	getRelationshipColor,
	getRelationshipLabel,
	defaultPageConfig,
	errorMessages,
} from './config/index';

// 使用分页组合式函数 - 参考 contacts-user 的实现
const { pagination, handleTableChange: paginationChange } = usePagination();

// 表格数据
const contactTableData = ref<ContactsGiftRecord[]>([]);

// 排序方式
const sortBy = ref<string>('date');

// 表格加载状态
const tableLoading = ref<boolean>(false);

/**
 * 加载联系人随礼记录列表
 */
const loadContactsGiftRecordList = async () => {
	try {
		tableLoading.value = true;
		const {
			code,
			message: messageInfo,
			data,
		} = await getContactsGiftRecordList(
			pagination.current || defaultPageConfig.pageNum,
			pagination.pageSize || defaultPageConfig.pageSize,
		);
		if (code === '200' && data) {
			contactTableData.value = data.records || [];
			pagination.total = data.total || 0;
		} else {
			message.error(messageInfo || errorMessages.loadDataFail, 3);
		}
	} catch (error) {
		console.error('加载联系人随礼记录失败:', error);
		message.error(errorMessages.loadDataException, 3);
	} finally {
		tableLoading.value = false;
	}
};

/**
 * 页面挂载时加载数据
 */
onMounted(() => {
	loadContactsGiftRecordList();
});

// 统计卡片数据 - 定义卡片信息数组
interface StatCard {
	id: string;
	label: string;
	value: string;
	trend: string;
	trendType: 'up' | 'down'; // up 上升 down 下降
	iconClass: 'stat-icon-blue' | 'stat-icon-red' | 'stat-icon-green';
	textClass: 'text-green' | 'text-red';
}

const statCards = ref<StatCard[]>([
	{
		id: '1',
		label: '总联系人',
		value: '24',
		trend: '3 新增',
		trendType: 'up',
		iconClass: 'stat-icon-blue',
		textClass: 'text-green',
	},
	{
		id: '2',
		label: '随礼总额',
		value: '-¥5,280',
		trend: '¥800 本月',
		trendType: 'down',
		iconClass: 'stat-icon-red',
		textClass: 'text-red',
	},
	{
		id: '3',
		label: '收礼总额',
		value: '¥7,560',
		trend: '¥1,200 本月',
		trendType: 'up',
		iconClass: 'stat-icon-green',
		textClass: 'text-green',
	},
]);

// 表格列配置 - 根据 contacts-user 的风格定义
const tableColumns: TableColumnsType<ContactsGiftRecord> = [
	{
		title: '联系人',
		dataIndex: 'contactsUserName',
		key: 'contactsUserName',
		width: 200,
	},
	{
		title: '随礼总额',
		dataIndex: 'giftOutAmount',
		key: 'giftOutAmount',
		width: 120,
		align: 'right',
	},
	{
		title: '收礼总额',
		dataIndex: 'giftInAmount',
		key: 'giftInAmount',
		width: 120,
		align: 'right',
	},
	{
		title: '净差额',
		dataIndex: 'netAmount',
		key: 'netAmount',
		width: 120,
		align: 'right',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 150,
		align: 'center',
	},
];

// 排序改变事件
const onSortChange = (): void => {
	// TODO: 实现排序逻辑
	console.log('排序方式改变:', sortBy.value);
};

/**
 * 表格变化事件 - 处理分页变化，参考 contacts-user 的实现
 */
const onTableChange = (paginationInfo: PageInfo): void => {
	paginationChange(paginationInfo);
	loadContactsGiftRecordList();
};

/**
 * 收礼随礼记录 - 查看和记录与该联系人的收礼随礼详情
 */
const onRecordGift = (record: ContactsGiftRecord): void => {
	// TODO: 打开收礼随礼详情页面或模态框
	console.log('收礼随礼:', record);
};

/**
 * 往来记录 - 查看与该联系人的所有往来记录
 */
const onInteractionRecord = (record: ContactsGiftRecord): void => {
	// TODO: 打开往来记录详情页面或模态框
	console.log('往来记录:', record);
};
</script>

<style lang="less" scoped>
// 根据Figma设计生成的样式

// 颜色定义
@color-primary: #1f2937;
@color-secondary: #6b7280;
@color-border: #e5e7eb;
@color-bg-light: #f9fafb;
@color-bg-white: #ffffff;
@color-red: #ef4444;
@color-red-light: #fee2e2;
@color-green: #10b981;
@color-green-light: #dcfce7;
@color-blue: #3b82f6;
@color-blue-light: #dbeafe;
@color-purple: #a855f7;
@color-purple-light: #f3e8ff;

// 字体定义
@font-family: Inter, sans-serif;
@font-size-sm: 12px;
@font-size-base: 14px;
@font-size-md: 16px;
@font-size-lg: 18px;
@font-size-xl: 24px;

// 间距定义
@spacing-xs: 8px;
@spacing-sm: 12px;
@spacing-md: 16px;
@spacing-lg: 20px;
@spacing-xl: 24px;

// 圆角定义
@radius-sm: 8px;
@radius-lg: 12px;
@radius-full: 9999px;

// 阴影定义
@shadow-sm:
	0px 4px 6px -1px rgba(0, 0, 0, 0.1),
	0px 2px 4px -1px rgba(0, 0, 0, 0.06);

.personal-gift-container {
	padding: @spacing-md;
	background-color: @color-bg-light;
}

// ========== 筛选区域 ==========
.filter-section {
	margin-bottom: @spacing-lg;
}

.filter-box {
	background-color: @color-bg-white;
	border-radius: @radius-lg;
	box-shadow: @shadow-sm;
	padding: @spacing-md;
}

.search-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.search-input {
	flex: 1;
	width: 60%;
	height: 50px;
	background-color: @color-bg-light;
	border: 1px solid @color-border;
	border-radius: @radius-sm;
	margin-right: @spacing-md;
}

.select-row {
	display: flex;
	gap: @spacing-md;
	align-items: center;
}

.select-item {
	width: 118px;
	height: 50px;
	background-color: @color-bg-light;
	border: 1px solid @color-border;
	border-radius: @radius-sm;
}

.filter-btn {
	display: flex;
	align-items: center;
	gap: @spacing-sm;
	height: 50px;
	padding: 0 @spacing-md;
	background-color: @color-border;
	border: 1px solid @color-border;
	border-radius: @radius-sm;
	cursor: pointer;
	font-size: @font-size-md;
	font-family: @font-family;
	color: @color-primary;
	transition: all 0.3s ease;

	&:hover {
		background-color: #d1d5db;
	}

	i {
		width: 16px;
		height: 16px;
	}
}

// ========== 统计数据区域 ==========
.stats-section {
	margin-bottom: @spacing-lg;

	:deep(.ant-card) {
		height: 100%;
	}
}

.stat-card {
	height: 100%;

	:deep(.ant-card-body) {
		padding: @spacing-lg;
	}

	:deep(.ant-card-bordered) {
		border: none;
	}
}

.stat-content {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: @spacing-lg;
}

.stat-info {
	flex: 1;
}

.stat-label {
	font-size: @font-size-base;
	color: @color-secondary;
	margin: 0;
	font-weight: 400;
	line-height: 1.5;
}

.stat-number {
	font-size: @font-size-xl;
	font-weight: 700;
	color: @color-primary;
	margin: @spacing-xs 0 0 0;
	line-height: 1.3;
}

.stat-icon {
	width: 48px;
	height: 48px;
	border-radius: @radius-full;
	flex-shrink: 0;
}

.stat-icon-blue {
	background-color: @color-blue-light;
}

.stat-icon-red {
	background-color: @color-red-light;
}

.stat-icon-green {
	background-color: @color-green-light;
}

.stat-footer {
	display: flex;
	align-items: center;
	gap: @spacing-xs;
}

.stat-text {
	font-size: @font-size-base;
	line-height: 1.4;
	display: flex;
	align-items: center;
	gap: @spacing-xs;

	&.text-green {
		color: @color-green;
	}

	&.text-red {
		color: @color-red;
	}
}

.arrow-icon {
	display: inline-block;
	width: 10.5px;
	height: 14px;
}

// ========== 联系人记录区域 ==========
.contacts-section {
	background-color: @color-bg-white;
	border-radius: @radius-lg;
	box-shadow: @shadow-sm;
	overflow: hidden;
}

.contacts-box {
	padding: @spacing-md;
}

.contacts-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: @spacing-md;
	border-bottom: 1px solid @color-border;
	margin-bottom: @spacing-md;
}

.contacts-title {
	font-size: @font-size-lg;
	font-weight: 400;
	color: @color-primary;
	margin: 0;
	line-height: 1.6;
}

.sort-section {
	display: flex;
	align-items: center;
	gap: @spacing-sm;
}

.sort-label {
	font-size: @font-size-base;
	color: @color-secondary;
	line-height: 1.4;
}

// ========== 表格样式 - 基于 contacts-user 的表格风格 ==========
.table-wrapper {
	margin-bottom: @spacing-lg;

	:deep(.ant-table) {
		font-family: @font-family;
		font-size: @font-size-base;

		// 表头样式
		.ant-table-thead > tr > th {
			background-color: @color-bg-light;
			color: @color-primary;
			font-weight: 500;
			border-bottom: 1px solid @color-border;
		}

		// 表格行样式
		.ant-table-tbody > tr {
			&:hover {
				background-color: #fafafa;
			}

			> td {
				border-bottom: 1px solid @color-border;
				padding: @spacing-md;
				color: @color-primary;
			}
		}
	}
}

// 联系人名称单元格 - 自定义样式
.contact-name-cell {
	.name-tag-group {
		display: flex;
		align-items: center;
		gap: @spacing-sm;
		margin-bottom: @spacing-xs;
	}

	.contact-name {
		font-size: @font-size-md;
		font-weight: 500;
		color: @color-primary;
	}

	.relationship-tag {
		font-size: @font-size-sm;
	}

	.contact-date {
		font-size: @font-size-sm;
		color: @color-secondary;
		margin: @spacing-xs 0 0 0;
	}
}

// 金额单元格样式
.amount-text {
	font-size: @font-size-md;
	font-weight: 500;

	&.text-red {
		color: @color-red;
	}

	&.text-green {
		color: @color-green;
	}
}

// 收礼随礼按钮样式
.btn-record-gift {
	color: @color-green;

	&:hover {
		background-color: @color-green-light;
	}
}

// 往来记录按钮样式
.btn-interaction-record {
	color: @color-blue;

	&:hover {
		background-color: @color-blue-light;
	}
}

// ========== 响应式设计 ==========
@media (max-width: 1024px) {
	.stats-section {
		grid-template-columns: repeat(2, 1fr);
	}

	:deep(.ant-table) {
		font-size: @font-size-sm !important;
	}
}

@media (max-width: 768px) {
	.personal-gift-container {
		padding: @spacing-sm;
	}

	.stats-section {
		grid-template-columns: 1fr;
	}

	.search-row {
		flex-direction: column;
		gap: @spacing-md;
	}

	.search-input {
		width: 100%;
	}

	.select-row {
		width: 100%;
		justify-content: space-between;
	}

	.select-item,
	.filter-btn {
		flex: 1;
	}

	.contacts-header {
		flex-direction: column;
		align-items: flex-start;
		gap: @spacing-md;
	}

	:deep(.ant-table) {
		font-size: @font-size-sm !important;

		.ant-table-thead > tr > th,
		.ant-table-tbody > tr > td {
			padding: @spacing-sm !important;
		}
	}
}
</style>
