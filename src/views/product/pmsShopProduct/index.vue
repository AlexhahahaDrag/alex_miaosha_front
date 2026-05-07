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
								<a-button type="primary" @click="query"> 查找</a-button>
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
						<div v-for="source in sourceTransferList" :key="source.value">
							<MySvgIcon
								v-if="
									record.source.indexOf(source.value) >= 0 &&
									source.value !== ''
								"
								:name="source.label"
								class="svg"
								style="
									width: 1.5em;
									height: 1.5em;
									font-size: 18px;
									cursor: pointer;
									vertical-align: middle;
								"
							></MySvgIcon>
						</div>
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
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			>
			</PmsShopProductDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PmsShopProductData } from '@/views/product/pmsShopProduct/config';
import {
	columns,
	sourceTransferList,
} from '@/views/product/pmsShopProduct/config';
import {
	getNewestPmsShopProductPage,
	deletePmsShopProduct,
} from '@/views/product/pmsShopProduct/api';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');

// 字典数据已通过 useDictInfo 自动加载
const sourceList = computed(() => getDictByType('is_valid'));

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
const searchFieldMap = {
	name: { name: 'name', label: '商品名称' },
	shop: { name: 'shop', label: '商铺' },
	source: { name: 'source', label: '来源' },
} as const;
const rowIds = ref<(string | number)[]>([]);
let queryTimer: ReturnType<typeof setTimeout> | null = null;

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

const searchInfo = ref<PmsShopProductData>({});
const loading = ref<boolean>(false);
const dataSource = ref<PmsShopProductData[]>([]);
const modelInfo = ref<ModelInfo>({});

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getPmsShopProductListPage(searchInfo.value, pagination);
}

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getPmsShopProductListPage(searchInfo.value, pagination);
}

async function delPmsShopProduct(ids: string) {
	try {
		const { code, message: messageInfo } = await deletePmsShopProduct(ids);
		if (code === '200') {
			message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
			rowIds.value = [];
			getPmsShopProductListPage(searchInfo.value, pagination);
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
	const {
		code,
		data,
		message: messageInfo,
	} = await getNewestPmsShopProductPage(
		param,
		cur.current,
		cur.pageSize,
	).finally(() => {
		loading.value = false;
	});
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
}

const init = () => {
	//获取商品网上商品信息页面数据
	getPmsShopProductListPage(searchInfo.value, pagination);
};

//新增和修改弹窗
function editPmsShopProduct(type: string, id?: string) {
	if (type === 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type === 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id ?? undefined;
	}
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

const handleSuccess = () => {
	getPmsShopProductListPage(searchInfo.value, pagination);
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
<style lang="scss" scoped></style>
