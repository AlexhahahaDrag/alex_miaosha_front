<template>
	<div class="pms-attr-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">PRODUCT SPECIFICATION</span>
				<h1>商品属性与规格字典管理</h1>
				<p class="subtitle">
					统一维护 SPU 基本参数、SKU 销售规格、可选值标签与商城检索筛选配置
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button type="primary" @click="openAttrDrawer('add')">
						新增属性
					</a-button>
					<a-button
						danger
						:disabled="!selectedRowKeys.length"
						@click="batchDelPmsAttr"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item name="attrName" label="属性名称">
						<a-input
							id="filter-attr-name"
							v-model:value="searchInfo.attrName"
							name="attrName"
							placeholder="请输入属性名称关键词"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="catelogId" label="所属分类">
						<a-input
							id="filter-attr-catelog-id"
							v-model:value="searchInfo.catelogId"
							name="catelogId"
							placeholder="请输入所属分类 ID"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="attrType" label="属性类型">
						<a-select
							id="filter-attr-type"
							v-model:value="searchInfo.attrType"
							placeholder="全部属性类型"
							:options="ATTR_TYPE_OPTIONS"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="enable" label="启用状态">
						<a-select
							id="filter-attr-enable"
							v-model:value="searchInfo.enable"
							placeholder="全部状态"
							:options="ENABLE_STATUS_OPTIONS"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="searchType" label="检索支持">
						<a-select
							id="filter-attr-search-type"
							v-model:value="searchInfo.searchType"
							placeholder="全部检索配置"
							:options="SEARCH_TYPE_OPTIONS"
							allow-clear
						/>
					</a-form-item>

					<div class="filter-actions">
						<a-space :size="8">
							<a-button type="primary" @click="() => query(true)">
								查询
							</a-button>
							<a-button @click="cancelQuery">重置</a-button>
						</a-space>
					</div>
				</div>
			</a-form>
		</section>

		<section class="table-card">
			<div class="table-toolbar">
				<span class="table-summary">
					商品属性规格列表
					<template v-if="selectedRowKeys.length">
						· 已勾选 <strong>{{ selectedRowKeys.length }}</strong> 项
					</template>
				</span>
			</div>

			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => String(record.id)"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'attrName'">
						<a
							class="attr-name-link"
							@click="openAttrDrawer('view', record.id)"
						>
							{{ record.attrName || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'attrType'">
						<a-tag :color="getAttrTypeMeta(record.attrType).color">
							{{ getAttrTypeMeta(record.attrType).label }}
						</a-tag>
					</template>

					<template v-else-if="column.key === 'valueSelect'">
						<div v-if="record.valueSelect" class="value-tags-cell">
							<span
								v-for="(val, idx) in splitValueList(record.valueSelect)"
								:key="idx"
								class="value-mini-pill"
							>
								{{ val }}
							</span>
						</div>
						<span v-else class="text-muted">--</span>
					</template>

					<template v-else-if="column.key === 'catelogId'">
						<span class="mono-id">{{ record.catelogId ?? '--' }}</span>
					</template>

					<template v-else-if="column.key === 'searchType'">
						<span
							class="flag-pill"
							:class="record.searchType === 1 ? 'is-yes' : 'is-no'"
						>
							{{ record.searchType === 1 ? '支持检索' : '无需检索' }}
						</span>
					</template>

					<template v-else-if="column.key === 'showDesc'">
						<span
							class="flag-pill"
							:class="record.showDesc === 1 ? 'is-yes' : 'is-no'"
						>
							{{ record.showDesc === 1 ? '快速展示' : '默认隐藏' }}
						</span>
					</template>

					<template v-else-if="column.key === 'enable'">
						<span
							class="status-dot-pill"
							:class="record.enable === 1 ? 'is-enabled' : 'is-disabled'"
						>
							<i class="dot" />
							{{ record.enable === 1 ? '已启用' : '已禁用' }}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								@click="openAttrDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openAttrDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该商品属性吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsAttr(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<PmsAttrDetail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="handleSuccess"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types/modal';
import type { PageInfo } from '@/composables/usePagination';
import {
	columns,
	ATTR_TYPE_OPTIONS,
	ENABLE_STATUS_OPTIONS,
	SEARCH_TYPE_OPTIONS,
	type PmsAttrData,
	type SearchInfo,
} from '@/views/product/pmsAttr/config';
import { getPmsAttrPage, deletePmsAttr } from '@/views/product/pmsAttr/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getPmsAttrListPage(searchInfo.value, p),
	});

const searchInfo = ref<SearchInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<PmsAttrData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const getAttrTypeMeta = (type?: number) => {
	const matched = ATTR_TYPE_OPTIONS.find((item) => item.value === Number(type));
	return matched || { label: type !== undefined ? String(type) : '--', color: 'default' };
};

const splitValueList = (raw?: string) => {
	if (!raw) return [];
	return raw
		.split(/[,，;；]+/)
		.map((s) => s.trim())
		.filter(Boolean)
		.slice(0, 6);
};

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

function cancelQuery() {
	triggerDebouncedQuery.cancel();
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getPmsAttrListPage(searchInfo.value, pagination);
}

async function delPmsAttr(ids: string) {
	try {
		const { code, message: messageInfo } = await deletePmsAttr(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			clearSelected();
			query(true);
		} else {
			message.error(messageInfo || '删除失败！', 3);
		}
	} catch {
		message.error('删除失败，请稍后重试！', 3);
	}
}

const batchDelPmsAttr = (): void => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPmsAttr(selectedRowKeys.value.join(','));
};

async function getPmsAttrListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPmsAttrPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
				catelogId:
					item.catelogId !== undefined ? String(item.catelogId) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
}

function openAttrDrawer(type: 'add' | 'update' | 'view', id?: string) {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商品属性规格',
		update: '编辑商品属性规格',
		view: '商品属性规格详情',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
}

const handleSuccess = () => {
	getPmsAttrListPage(searchInfo.value, pagination);
};

onMounted(() => {
	query(true);
});

onBeforeUnmount(() => {
	triggerDebouncedQuery.cancel();
});

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>

<style lang="scss" scoped>
.pms-attr-screen {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px 24px 28px;
	background: #f8fafc;
	min-height: 100%;
}

.screen-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	padding: 20px 24px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);

	.title-block {
		.eyebrow {
			display: inline-block;
			font-size: 11px;
			font-weight: 700;
			letter-spacing: 0.08em;
			color: #2563eb;
			background: #eff6ff;
			padding: 2px 8px;
			border-radius: 999px;
			margin-bottom: 6px;
		}

		h1 {
			margin: 0 0 4px;
			font-size: 20px;
			font-weight: 700;
			color: #0f172a;
		}

		.subtitle {
			margin: 0;
			font-size: 13px;
			color: #64748b;
		}
	}
}

.filter-card {
	padding: 18px 22px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

	.filter-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 14px 18px;
		align-items: center;

		:deep(.ant-form-item) {
			margin-bottom: 0;
		}
	}

	.filter-actions {
		display: flex;
		justify-content: flex-end;
	}
}

.table-card {
	padding: 18px 22px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

	.table-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.table-summary {
			font-size: 13px;
			font-weight: 600;
			color: #334155;

			strong {
				color: #2563eb;
			}
		}
	}
}

.attr-name-link {
	font-weight: 600;
	color: #0f172a;
	cursor: pointer;

	&:hover {
		color: #2563eb;
		text-decoration: underline;
	}
}

.value-tags-cell {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;

	.value-mini-pill {
		padding: 1px 7px;
		border-radius: 5px;
		font-size: 11px;
		font-weight: 600;
		background: #f1f5f9;
		color: #334155;
		border: 1px solid #e2e8f0;
	}
}

.mono-id {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: #475569;
}

.flag-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 600;

	&.is-yes {
		background: #eff6ff;
		color: #1d4ed8;
	}

	&.is-no {
		background: #f8fafc;
		color: #94a3b8;
	}
}

.status-dot-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.is-enabled {
		background: #dcfce7;
		color: #15803d;

		.dot {
			background: #16a34a;
		}
	}

	&.is-disabled {
		background: #f1f5f9;
		color: #64748b;

		.dot {
			background: #94a3b8;
		}
	}
}

.text-muted {
	font-size: 12px;
	color: #94a3b8;
}
</style>
