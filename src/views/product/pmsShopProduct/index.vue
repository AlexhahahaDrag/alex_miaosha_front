<template>
	<div class="page-info">
		<div class="search">
			<div class="search-box">
				<a-form
					:model="searchInfo"
					:label-col="labelCol"
					:wrapper-col="wrapperCol"
				>
					<a-row :gutter="24">
						<a-col :span="6">
							<a-form-item
								:name="searchFieldMap.name.name"
								:label="searchFieldMap.name.label"
							>
								<a-input
									v-model:value="searchInfo.name"
									:placeholder="`请输入${searchFieldMap.name.label}`"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item
								:name="searchFieldMap.shop.name"
								:label="searchFieldMap.shop.label"
							>
								<a-input
									v-model:value="searchInfo.shop"
									:placeholder="`请输入${searchFieldMap.shop.label}`"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item
								:name="searchFieldMap.source.name"
								:label="searchFieldMap.source.label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.source"
									:placeholder="`请选择${searchFieldMap.source.label}`"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="sourceList"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="() => query()"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editPmsShopProduct('add')">
					新增
				</a-button>
				<a-button type="primary" danger @click="batchDelPmsShopProduct">
					删除
				</a-button>
				<a-button type="dashed" data-testid="btn-open-ai-copy" @click="openAiCopyModal">
					✨ AI 秒杀营销文案生成
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editPmsShopProduct('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPmsShopProduct(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'image' && record.image">
						<a-image :width="80" :src="record.image" />
					</template>
					<template
						v-else-if="column.key === 'productUrl' && record.productUrl"
					>
						<a :href="record.productUrl" target="_blank">查看商城商品信息</a>
					</template>
					<template v-else-if="column.key === 'price' && record.price">
						<span
							v-if="
								record.comparePrice &&
								record.price &&
								record.price < record.comparePrice
							"
							style="font-weight: 900; font-style: oblique; color: red"
						>
							{{ record.price }}</span
						>
						<span v-else>{{ record.price }}</span>
					</template>
					<template v-else-if="column.key === 'source'">
						<template
							v-for="source in sourceTransferList"
							:key="source.value"
						>
							<component
								v-if="
									record.source &&
									source.value !== '' &&
									record.source.indexOf(source.value) >= 0 &&
									iconComponentMap[`soft-${source.label}`]
								"
								:is="iconComponentMap[`soft-${source.label}`]"
								class="svg"
								style="
									width: 1.5em;
									height: 1.5em;
									font-size: 18px;
									cursor: pointer;
									vertical-align: middle;
								"
							/>
						</template>
					</template>
					<template
						v-else-if="column.key === 'operateTime' && record.operateTime"
					>
						<span>
							{{
								record.operateTime ?
									dayjs(record.operateTime).format('YYYY-MM-DD HH:mm:ss')
								:	''
							}}
						</span>
					</template>
				</template>
			</a-table>
			<PmsShopProductDetail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			>
			</PmsShopProductDetail>
		</div>

		<!-- AI 营销文案生成 Modal -->
		<a-modal
			v-model:open="aiCopyModalVisible"
			title="✨ AI 秒杀营销文案与核心卖点生成"
			width="680px"
			:footer="null"
		>
			<a-form layout="vertical" :model="aiCopyReq">
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="商品名称" required>
							<a-input v-model:value="aiCopyReq.productName" data-testid="ai-copy-input-name" placeholder="如：降噪无线蓝牙耳机" />
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="商品品类">
							<a-input v-model:value="aiCopyReq.categoryName" placeholder="如：数码影音" />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="16">
					<a-col :span="12">
						<a-form-item label="商品原价(元)">
							<a-input-number v-model:value="aiCopyReq.originalPrice" :min="0" style="width: 100%" placeholder="如：399" />
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="秒杀促销价(元)">
							<a-input-number v-model:value="aiCopyReq.seckillPrice" :min="0" style="width: 100%" placeholder="如：199" />
						</a-form-item>
					</a-col>
				</a-row>
				<a-form-item label="商品核心亮点/规格">
					<a-input v-model:value="aiCopyReq.features" placeholder="如：主动混合降噪40dB，长续航30小时" />
				</a-form-item>
				<a-form-item>
					<a-button type="primary" block :loading="aiCopyLoading" data-testid="btn-generate-ai-copy" @click="handleGenerateAiCopy">
						🚀 一键生成爆款营销文案
					</a-button>
				</a-form-item>
			</a-form>

			<div v-if="aiCopyResult" class="ai-copy-result-card">
				<div class="result-item">
					<div class="result-header">
						<span class="result-label">🔥 爆款标题</span>
						<a-button type="link" size="small" @click="copyText(aiCopyResult.title)">复制</a-button>
					</div>
					<div class="result-content title-text">{{ aiCopyResult.title }}</div>
				</div>
				<div class="result-item">
					<div class="result-header">
						<span class="result-label">💬 一句话口号</span>
						<a-button type="link" size="small" @click="copyText(aiCopyResult.slogan)">复制</a-button>
					</div>
					<div class="result-content slogan-text">{{ aiCopyResult.slogan }}</div>
				</div>
				<div class="result-item">
					<div class="result-header">
						<span class="result-label">🎯 核心卖点清单</span>
					</div>
					<div class="result-tags">
						<a-tag v-for="(point, idx) in aiCopyResult.sellingPoints" :key="idx" color="blue">{{ point }}</a-tag>
					</div>
				</div>
				<div class="result-item">
					<div class="result-header">
						<span class="result-label">📝 营销种草详情</span>
						<a-button type="link" size="small" @click="copyText(aiCopyResult.marketingDescription)">复制</a-button>
					</div>
					<div class="result-content desc-text">{{ aiCopyResult.marketingDescription }}</div>
				</div>
				<div class="result-apply-bar" style="margin-top: 16px;">
					<a-button type="primary" block data-testid="btn-apply-ai-copy" @click="handleApplyToProduct">
						⚡ 一键应用至选中商品 / 复制全套文案
					</a-button>
				</div>
			</div>
		</a-modal>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import { iconComponentMap } from '@/views/common/config';
import type { PmsShopProductData } from '@/views/product/pmsShopProduct/config';
import {
	columns,
	sourceTransferList,
} from '@/views/product/pmsShopProduct/config';
import {
	getNewestPmsShopProductPage,
	deletePmsShopProduct,
	generateProductAiCopy,
	type ProductAiCopyReq,
	type ProductAiCopyVo,
} from '@/views/product/pmsShopProduct/api';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const sourceList = computed(() => getDictByType('is_valid'));

// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const {
	pagination,
	handleTableChange,
	setTotal,
	resetPagination,
} = usePagination({
	onChange: (p) => getPmsShopProductListPage(searchInfo.value, p),
});

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
const searchFieldMap = {
	name: { name: 'name', label: '商品名称' },
	shop: { name: 'shop', label: '商铺' },
	source: { name: 'source', label: '来源' },
} as const;
let queryTimer: ReturnType<typeof setTimeout> | null = null;

const searchInfo = ref<PmsShopProductData>({});
const loading = ref<boolean>(false);
const dataSource = ref<PmsShopProductData[]>([]);
const modelInfo = ref<ModelInfo>({});

function cancelQuery() {
	searchInfo.value = {};
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
const cancel = () => {};

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
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
}

const init = () => {
	//获取商品网上商品信息页面数据
	getPmsShopProductListPage(searchInfo.value, pagination);
};

//新增和修改弹窗
function editPmsShopProduct(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? undefined : id ?? undefined;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

// 移除冗余的 handleSuccess 函数

// ── AI 营销文案助手
const aiCopyModalVisible = ref(false);
const aiCopyLoading = ref(false);
const aiCopyReq = ref<ProductAiCopyReq>({
	productName: '',
	categoryName: '',
	originalPrice: undefined,
	seckillPrice: undefined,
	targetAudience: '',
	features: '',
});
const aiCopyResult = ref<ProductAiCopyVo | null>(null);

const openAiCopyModal = () => {
	if (rowIds.value.length > 0) {
		const selected = dataSource.value.find((item) => String(item.id) === String(rowIds.value[0]));
		if (selected) {
			aiCopyReq.value.productName = selected.name || '';
			aiCopyReq.value.originalPrice = selected.comparePrice ? Number(selected.comparePrice) : undefined;
			aiCopyReq.value.seckillPrice = selected.price ? Number(selected.price) : undefined;
		}
	}
	aiCopyModalVisible.value = true;
};

const handleGenerateAiCopy = async () => {
	if (!aiCopyReq.value.productName?.trim()) {
		message.warning('请输入商品名称');
		return;
	}
	aiCopyLoading.value = true;
	try {
		const { code, data, message: msg } = await generateProductAiCopy(aiCopyReq.value);
		if (code === '200' && data) {
			aiCopyResult.value = data;
			message.success('营销文案生成成功');
		} else {
			message.error(msg || '文案生成失败');
		}
	} catch (e) {
		console.error(e);
		message.error('文案生成异常');
	} finally {
		aiCopyLoading.value = false;
	}
};

const copyText = (text?: string) => {
	if (!text) return;
	if (navigator.clipboard?.writeText) {
		navigator.clipboard.writeText(text);
	}
	message.success('已复制到剪贴板');
};

const handleApplyToProduct = () => {
	if (!aiCopyResult.value) return;
	const fullText = `【${aiCopyResult.value.title || ''}】\n口号：${aiCopyResult.value.slogan || ''}\n核心卖点：${aiCopyResult.value.sellingPoints?.join(' | ') || ''}\n种草描述：${aiCopyResult.value.marketingDescription || ''}`;
	copyText(fullText);

	if (rowIds.value.length > 0) {
		const targetId = String(rowIds.value[0]);
		const targetItem = dataSource.value.find((item) => String(item.id) === targetId);
		if (targetItem && aiCopyResult.value.title) {
			targetItem.name = aiCopyResult.value.title;
			message.success(`已同时将爆款标题同步至当前商品行【${targetItem.name}】！`);
		}
	} else {
		message.info('当前未勾选特定商品行，已将全套营销方案复制至剪贴板供粘贴使用');
	}
};

onMounted(() => {
	init();
});

onUnmounted(() => {
	if (queryTimer) {
		clearTimeout(queryTimer);
	}
});

watch(
	() => [searchInfo.value.name, searchInfo.value.shop, searchInfo.value.source],
	() => {
		if (queryTimer) {
			clearTimeout(queryTimer);
		}
		queryTimer = setTimeout(() => {
			resetPagination();
			query();
		}, 300);
	},
);
</script>
<style lang="scss" scoped>
.ai-copy-result-card {
	margin-top: 16px;
	padding: 16px;
	border-radius: 12px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	display: flex;
	flex-direction: column;
	gap: 12px;

	.result-item {
		.result-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;

			.result-label {
				font-size: 13px;
				font-weight: 600;
				color: #0f172a;
			}
		}

		.title-text {
			font-size: 14px;
			font-weight: 700;
			color: #1e293b;
		}

		.slogan-text {
			font-size: 13px;
			color: #dc2626;
			font-weight: 600;
		}

		.desc-text {
			font-size: 12px;
			line-height: 1.6;
			color: #475569;
			background: #ffffff;
			padding: 8px 10px;
			border-radius: 6px;
			border: 1px solid #f1f5f9;
		}

		.result-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
		}
	}
}
</style>
