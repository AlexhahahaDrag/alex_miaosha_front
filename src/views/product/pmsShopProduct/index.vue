<template>
	<div class="shop-product-screen">
		<header class="screen-header">
			<div class="title-block">
				<span class="eyebrow">PRODUCT &amp; SECKILL CENTER</span>
				<h1>商城商品与秒杀池管理</h1>
				<p class="subtitle">
					统一纳管全渠道采集商品、实时比价预警、历史价格曲线与 AI 秒杀爆款文案生成
				</p>
			</div>
			<div class="header-actions">
				<a-space :size="10">
					<a-button
						class="ai-copy-trigger-btn"
						data-testid="btn-open-ai-copy"
						@click="openAiCopyModal"
					>
						✨ AI 秒杀营销文案生成
					</a-button>
					<a-button type="primary" @click="openProductDrawer('add')">
						新增商品
					</a-button>
					<a-button
						danger
						:disabled="!rowIds.length"
						@click="batchDelPmsShopProduct"
					>
						批量删除
					</a-button>
				</a-space>
			</div>
		</header>

		<section class="filter-card">
			<a-form :model="searchInfo" class="filter-form">
				<div class="filter-grid">
					<a-form-item
						:name="searchFieldMap.name.name"
						:label="searchFieldMap.name.label"
					>
						<a-input
							id="filter-product-name"
							v-model:value="searchInfo.name"
							name="name"
							:placeholder="`请输入${searchFieldMap.name.label}关键词`"
							allow-clear
						/>
					</a-form-item>

					<a-form-item
						:name="searchFieldMap.shop.name"
						:label="searchFieldMap.shop.label"
					>
						<a-input
							id="filter-product-shop"
							v-model:value="searchInfo.shop"
							name="shop"
							:placeholder="`请输入${searchFieldMap.shop.label}名称`"
							allow-clear
						/>
					</a-form-item>

					<a-form-item
						:name="searchFieldMap.source.name"
						:label="searchFieldMap.source.label"
					>
						<a-select
							id="filter-product-source"
							v-model:value="searchInfo.source"
							:placeholder="`请选择${searchFieldMap.source.label}`"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="sourceList"
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
					商城商品列表
					<template v-if="rowIds.length">
						· 已勾选 <strong>{{ rowIds.length }}</strong> 项
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
					<template v-if="column.key === 'image'">
						<div class="product-img-cell">
							<a-image
								v-if="record.image"
								:width="56"
								:height="56"
								:src="record.image"
								class="thumb-img"
							/>
							<span v-else class="thumb-empty">无图</span>
						</div>
					</template>

					<template v-else-if="column.key === 'name'">
						<a
							class="product-name-link"
							@click="openProductDrawer('view', record.id)"
						>
							{{ record.name || '--' }}
						</a>
					</template>

					<template v-else-if="column.key === 'price'">
						<div v-if="record.price !== undefined && record.price !== null" class="price-cell">
							<span
								v-if="
									record.comparePrice &&
									record.price < record.comparePrice
								"
								class="price-drop-chip"
								:title="`对比价 ¥${record.comparePrice}`"
							>
								↓ ¥{{ Number(record.price).toFixed(2) }}
							</span>
							<span v-else class="price-normal-chip">
								¥{{ Number(record.price).toFixed(2) }}
							</span>
							<span
								v-if="
									record.comparePrice &&
									record.price < record.comparePrice
								"
								class="compare-price-strike"
							>
								¥{{ Number(record.comparePrice).toFixed(2) }}
							</span>
						</div>
						<span v-else class="text-muted">--</span>
					</template>

					<template v-else-if="column.key === 'icons'">
						<div v-if="record.icons" class="tag-group">
							<span
								v-for="(tag, idx) in splitTags(record.icons)"
								:key="idx"
								class="promo-mini-tag"
							>
								{{ tag }}
							</span>
						</div>
						<span v-else class="text-muted">--</span>
					</template>

					<template v-else-if="column.key === 'source'">
						<div class="source-cell">
							<template v-for="source in sourceTransferList" :key="source.value">
								<span
									v-if="
										record.source &&
										source.value !== '' &&
										record.source.indexOf(source.value) >= 0
									"
									class="source-badge"
								>
									<component
										v-if="iconComponentMap[`soft-${source.label}`]"
										:is="iconComponentMap[`soft-${source.label}`]"
										class="svg-icon"
									/>
									<span>{{ source.name }}</span>
								</span>
							</template>
							<span
								v-if="!record.source"
								class="text-muted"
							>
								--
							</span>
						</div>
					</template>

					<template v-else-if="column.key === 'productUrl'">
						<a
							v-if="record.productUrl"
							:href="record.productUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="external-link-pill"
						>
							商城详情 ↗
						</a>
						<span v-else class="text-muted">--</span>
					</template>

					<template v-else-if="column.key === 'operateTime'">
						<span class="time-text">
							{{ record.operateTime ? formatTime(record.operateTime) : '--' }}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								@click="openProductDrawer('view', record.id)"
							>
								查看
							</a-button>
							<a-button
								type="link"
								size="small"
								@click="openProductDrawer('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除该商城商品吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsShopProduct(String(record.id))"
							>
								<a-button type="link" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<PmsShopProductDetail
				v-model:modelInfo="modelInfo"
				:is-readonly="isReadonlyMode"
				@success="() => query()"
			/>
		</section>

		<!-- AI 营销文案生成 Modal (子组件) -->
		<product-ai-copy-modal
			v-model:open="aiCopyModalVisible"
			:product-data="selectedProductForAi"
			@apply="handleApplyAiCopy"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ModelInfo } from '@/types/modal';
import { iconComponentMap } from '@/config/icons';
import type { PmsShopProductData } from '@/views/product/pmsShopProduct/config';
import {
	columns,
	sourceTransferList,
	DEFAULT_SHOP_SOURCE_OPTIONS,
} from '@/views/product/pmsShopProduct/config';
import {
	getNewestPmsShopProductPage,
	deletePmsShopProduct,
} from '@/views/product/pmsShopProduct/api';
import { message } from 'ant-design-vue';
import { formatTime } from '@/utils/dayjs';
import type { PageInfo } from '@/composables/usePagination';
import ProductAiCopyModal from '@/views/product/pmsShopProduct/components/ProductAiCopyModal.vue';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('shop_type');

const sourceList = computed(() => {
	const list = getDictByType('shop_type');
	return list?.length ? list : DEFAULT_SHOP_SOURCE_OPTIONS;
});

const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getPmsShopProductListPage(searchInfo.value, p),
	});

const searchFieldMap = {
	name: { name: 'name', label: '商品名称' },
	shop: { name: 'shop', label: '所属商铺' },
	source: { name: 'source', label: '来源平台' },
} as const;

let queryTimer: ReturnType<typeof setTimeout> | null = null;

const searchInfo = ref<PmsShopProductData>({});
const loading = ref<boolean>(false);
const dataSource = ref<PmsShopProductData[]>([]);
const modelInfo = ref<ModelInfo>({});
const isReadonlyMode = ref<boolean>(false);

const splitTags = (raw?: string) => {
	if (!raw) return [];
	return raw
		.split(/[,，\s]+/)
		.map((s) => s.trim())
		.filter(Boolean)
		.slice(0, 3);
};

function cancelQuery() {
	if (queryTimer) {
		clearTimeout(queryTimer);
		queryTimer = null;
	}
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getPmsShopProductListPage(searchInfo.value, pagination);
}

async function delPmsShopProduct(ids: string) {
	try {
		const { code, message: messageInfo } = await deletePmsShopProduct(ids);
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

const batchDelPmsShopProduct = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPmsShopProduct(rowIds.value.join(','));
};

async function getPmsShopProductListPage(
	param: PmsShopProductData,
	cur: PageInfo,
) {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getNewestPmsShopProductPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = (data?.records || []).map((item) => ({
				...item,
				id: item.id !== undefined ? String(item.id) : undefined,
			}));
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
}

function openProductDrawer(type: 'add' | 'update' | 'view', id?: string) {
	isReadonlyMode.value = type === 'view';
	const titleMap = {
		add: '新增商城商品',
		update: '编辑商城商品',
		view: '商城商品档案与价格监测',
	};
	modelInfo.value = {
		title: titleMap[type],
		id: type === 'add' ? undefined : id !== undefined ? String(id) : undefined,
		confirmLoading: false,
		open: true,
	};
}

// ── AI 营销文案助手
const aiCopyModalVisible = ref<boolean>(false);

const selectedProductForAi = computed(() => {
	if (!rowIds.value.length) return undefined;
	return dataSource.value.find(
		(item) => String(item.id) === String(rowIds.value[0]),
	);
});

const openAiCopyModal = () => {
	aiCopyModalVisible.value = true;
};

const handleApplyAiCopy = ({ title }: { title: string }) => {
	if (rowIds.value.length > 0) {
		const targetId = String(rowIds.value[0]);
		const targetItem = dataSource.value.find(
			(item) => String(item.id) === targetId,
		);
		if (targetItem && title) {
			targetItem.name = title;
			message.success(
				`已同时将爆款标题同步至当前商品行【${targetItem.name}】！`,
			);
		}
	} else {
		message.info(
			'当前未勾选特定商品行，已将全套营销方案复制至剪贴板供粘贴使用',
		);
	}
};

onMounted(() => {
	query(true);
});

onBeforeUnmount(() => {
	if (queryTimer) {
		clearTimeout(queryTimer);
		queryTimer = null;
	}
});

watch(
	() => [searchInfo.value.name, searchInfo.value.shop, searchInfo.value.source],
	() => {
		if (queryTimer) {
			clearTimeout(queryTimer);
		}
		queryTimer = setTimeout(() => {
			query(true);
		}, 300);
	},
);
</script>

<style lang="scss" scoped>
.shop-product-screen {
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

	.ai-copy-trigger-btn {
		border-color: #c084fc;
		color: #7e22ce;
		background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
		font-weight: 600;

		&:hover {
			border-color: #9333ea;
			color: #6b21a8;
			background: #f3e8ff;
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
		grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
		gap: 16px;
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

.product-img-cell {
	display: flex;
	align-items: center;
	justify-content: center;

	:deep(.ant-image-img),
	.thumb-img {
		border-radius: 8px;
		object-fit: cover;
		border: 1px solid #e2e8f0;
	}

	.thumb-empty {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 8px;
		background: #f8fafc;
		border: 1px dashed #cbd5e1;
		font-size: 11px;
		color: #94a3b8;
	}
}

.product-name-link {
	font-weight: 600;
	color: #0f172a;
	cursor: pointer;

	&:hover {
		color: #2563eb;
		text-decoration: underline;
	}
}

.price-cell {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;

	.price-drop-chip {
		display: inline-flex;
		align-items: center;
		padding: 2px 8px;
		border-radius: 999px;
		background: #fef2f2;
		color: #dc2626;
		font-weight: 700;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}

	.price-normal-chip {
		font-weight: 700;
		font-size: 13px;
		color: #0f172a;
		font-variant-numeric: tabular-nums;
	}

	.compare-price-strike {
		font-size: 11px;
		color: #94a3b8;
		text-decoration: line-through;
		font-variant-numeric: tabular-nums;
	}
}

.tag-group {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;

	.promo-mini-tag {
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		background: #fff1f2;
		color: #e11d48;
		border: 1px solid #fecdd3;
	}
}

.source-cell {
	display: inline-flex;
	align-items: center;
	justify-content: center;

	.source-badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 8px;
		border-radius: 999px;
		background: #f1f5f9;
		font-size: 12px;
		font-weight: 600;
		color: #334155;

		.svg-icon {
			width: 14px;
			height: 14px;
		}
	}
}

.external-link-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	color: #2563eb;
	background: #eff6ff;
	text-decoration: none;

	&:hover {
		background: #dbeafe;
	}
}

.time-text {
	font-size: 12px;
	color: #64748b;
	font-variant-numeric: tabular-nums;
}

.text-muted {
	color: #94a3b8;
	font-size: 12px;
}
</style>
