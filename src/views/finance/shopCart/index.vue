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
						<a-col :span="8">
							<a-form-item
								:name="labelMap['shopId'].name"
								:label="labelMap['shopId'].label"
							>
								<a-input
									v-model:value="searchInfo.shopId"
									:placeholder="'请填写' + labelMap['shopId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['userId'].name"
								:label="labelMap['userId'].label"
							>
								<a-input
									v-model:value="searchInfo.userId"
									:placeholder="'请填写' + labelMap['userId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['customerId'].name"
								:label="labelMap['customerId'].label"
							>
								<a-input
									v-model:value="searchInfo.customerId"
									:placeholder="'请填写' + labelMap['customerId'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['isValid'].name"
								:label="labelMap['isValid'].label"
							>
								<a-input
									v-model:value="searchInfo.isValid"
									:placeholder="'请填写' + labelMap['isValid'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['saleNum'].name"
								:label="labelMap['saleNum'].label"
							>
								<a-input
									v-model:value="searchInfo.saleNum"
									:placeholder="'请填写' + labelMap['saleNum'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" class="actions-col">
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
				<a-button type="primary" @click="editShopCart('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelShopCart">
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
								@click="editShopCart('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delShopCart(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<ShopCartDetail
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			></ShopCartDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { ShopCartData } from '@/views/finance/shopCart/config';
import type { ModelInfo } from '@/views/common/config';
import { columns } from '@/views/finance/shopCart/config';
import { getShopCartPage, deleteShopCart } from '@/views/finance/shopCart/api';
import { message } from 'ant-design-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	resetPagination,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const rowIds = ref<(string | number)[]>([]);

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds.value = selectedRowKeys;
	},
});

const labelMap: Record<string, { name: string; label: string }> = {
	shopId: { name: 'shopId', label: '商品id' },
	userId: { name: 'userId', label: '人员id' },
	customerId: { name: 'customerId', label: '客户id' },
	isValid: { name: 'isValid', label: '是否有效' },
	saleNum: { name: 'saleNum', label: '数量' },
};

const searchInfo = ref<ShopCartData>({});

const loading = ref<boolean>(false);
const dataSource = ref<ShopCartData[]>([]);
const modelInfo = ref<ModelInfo>({});

const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (resetPage = false): void => {
	if (resetPage) {
		resetPagination();
	}
	getShopCartListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getShopCartListPage(searchInfo.value, paginationInfo);
};

const delShopCart = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deleteShopCart(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		rowIds.value = [];
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelShopCart = (): void => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delShopCart(rowIds.value.join(','));
};

const cancel = (): void => {};

const getShopCartListPage = async (
	param: ShopCartData,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	try {
		const res = await getShopCartPage(param, cur.current, cur.pageSize);
		if (res.code === '200') {
			dataSource.value = res.data?.records || [];
			setTotal(res.data?.total || 0);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

//新增和修改弹窗
const editShopCart = (type: string, id?: string): void => {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? null : id;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const handleSuccess = (): void => {
	getShopCartListPage(searchInfo.value, pagination);
};

const init = (): void => {
	//获取购物车表页面数据
	getShopCartListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
});
</script>
<style lang="scss" scoped>
.actions-col {
	text-align: right;
}
</style>
