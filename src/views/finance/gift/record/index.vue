<template>
	<div class="gift-page">
		<a-page-header title="礼金记录 - 礼尚往来管理" />
		<a-card :bordered="false" class="section-card">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="方向">
					<a-select
						v-model:value="searchInfo.direction"
						:options="giftDirectionOptions"
						allow-clear
						style="width: 140px"
					/>
				</a-form-item>
				<a-form-item label="金额">
					<a-input-number
						v-model:value="searchInfo.amountMin"
						:min="0"
						placeholder="最小"
					/>
					<span class="range-split">-</span>
					<a-input-number
						v-model:value="searchInfo.amountMax"
						:min="0"
						placeholder="最大"
					/>
				</a-form-item>
				<a-form-item v-if="searchExpanded" label="礼金时间">
					<a-range-picker
						v-model:value="payRange"
						show-time
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</a-form-item>
				<a-form-item>
					<a-space>
						<a-button type="primary" @click="query(true)">查询</a-button>
						<a-button @click="resetQuery">清空</a-button>
						<a-button type="link" @click="searchExpanded = !searchExpanded">
							{{ searchExpanded ? '收起' : '展开' }}
						</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</a-card>
		<a-card :bordered="false" class="section-card">
			<template #title>礼金记录</template>
			<template #extra>
				<a-space>
					<a-radio-group v-model:value="tableSize" size="small">
						<a-radio-button value="small">紧凑</a-radio-button>
						<a-radio-button value="middle">默认</a-radio-button>
					</a-radio-group>
					<a-button type="primary" @click="openDrawer()">快速记礼</a-button>
				</a-space>
			</template>
			<a-table
				:data-source="dataSource"
				:columns="columns"
				:loading="loading"
				:pagination="pagination"
				:size="tableSize"
				row-key="id"
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'direction'">
						<a-tag :color="directionColor(record.direction)">
							{{ directionLabel(record.direction) }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'amount'">
						{{ money(record.amount) }}
					</template>
					<template v-else-if="column.key === 'returnedFlag'">
						<a-tag
							v-if="record.direction === 'RECEIVE'"
							:color="record.returnedFlag === 1 ? 'green' : 'orange'"
						>
							{{ record.returnedFlag === 1 ? '已回礼' : '待回礼' }}
						</a-tag>
						<span v-else>-</span>
					</template>
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<a-button size="small" type="link" @click="openDrawer(record)"
								>编辑</a-button
							>
							<a-button
								v-if="
									record.direction === 'RECEIVE' && record.returnedFlag !== 1
								"
								size="small"
								type="link"
								@click="showPending(record.id)"
							>
								待回礼
							</a-button>
							<a-button
								v-if="
									record.direction === 'RECEIVE' && record.returnedFlag !== 1
								"
								size="small"
								type="link"
								@click="markReturned(record.id)"
							>
								标记已回
							</a-button>
							<a-popconfirm title="确认删除?" @confirm="remove(record.id)">
								<a-button size="small" type="link" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
		</a-card>
		<a-drawer
			v-model:open="drawerOpen"
			:title="formInfo.id ? '编辑礼金记录' : '快速记礼'"
			width="520"
		>
			<a-form :model="formInfo" layout="vertical">
				<a-form-item label="方向" required>
					<a-select
						v-model:value="formInfo.direction"
						:options="giftDirectionOptions"
					/>
				</a-form-item>
				<a-form-item label="金额" required>
					<a-input-number
						v-model:value="formInfo.amount"
						:min="0"
						:precision="2"
						style="width: 100%"
					/>
				</a-form-item>
				<a-form-item label="事件ID">
					<a-input
						v-model:value="formInfo.eventId"
						placeholder="后续可替换为事件选择器"
					/>
				</a-form-item>
				<a-form-item label="送礼人ID">
					<a-input v-model:value="formInfo.giverPersonId" />
				</a-form-item>
				<a-form-item label="收礼人ID">
					<a-input v-model:value="formInfo.receiverPersonId" />
				</a-form-item>
				<a-form-item
					v-if="formInfo.direction === 'RETURN'"
					label="原始收礼记录ID"
					required
				>
					<a-input v-model:value="formInfo.relatedRecordId" />
				</a-form-item>
				<a-form-item label="礼金时间">
					<a-date-picker
						v-model:value="formInfo.payTime"
						show-time
						value-format="YYYY-MM-DD HH:mm:ss"
						style="width: 100%"
					/>
				</a-form-item>
				<a-form-item label="备注">
					<a-textarea v-model:value="formInfo.remark" :rows="3" />
				</a-form-item>
			</a-form>
			<template #footer>
				<a-space>
					<a-button @click="drawerOpen = false">取消</a-button>
					<a-button type="primary" :loading="saving" @click="save"
						>保存</a-button
					>
				</a-space>
			</template>
		</a-drawer>
	</div>
</template>

<script setup lang="ts">
import { message, Modal } from 'ant-design-vue';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	addGiftRecord,
	deleteGiftRecord,
	getGiftRecordPage,
	getPendingReturnAmount,
	markGiftReturned,
	updateGiftRecord,
} from '@/views/finance/gift/api';
import type {
	GiftRecordInfo,
	GiftRecordQuery,
} from '@/views/finance/gift/config';
import {
	directionColor,
	directionLabel,
	giftDirectionOptions,
	money,
} from '@/views/finance/gift/config';

const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const loading = ref(false);
const saving = ref(false);
const drawerOpen = ref(false);
const searchExpanded = ref(false);
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftRecordQuery>({});
const formInfo = ref<GiftRecordInfo>({});
const dataSource = ref<GiftRecordInfo[]>([]);
const payRange = ref<[string, string] | undefined>();

watch(payRange, (value) => {
	searchInfo.value.payTimeStart = value?.[0];
	searchInfo.value.payTimeEnd = value?.[1];
});

const columns = [
	{ title: '方向', dataIndex: 'direction', key: 'direction', width: 100 },
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
		width: 120,
		sorter: true,
	},
	{ title: '事件ID', dataIndex: 'eventId', key: 'eventId', width: 120 },
	{
		title: '送礼人ID',
		dataIndex: 'giverPersonId',
		key: 'giverPersonId',
		width: 120,
	},
	{
		title: '收礼人ID',
		dataIndex: 'receiverPersonId',
		key: 'receiverPersonId',
		width: 120,
	},
	{ title: '礼金时间', dataIndex: 'payTime', key: 'payTime', width: 180 },
	{
		title: '回礼状态',
		dataIndex: 'returnedFlag',
		key: 'returnedFlag',
		width: 120,
	},
	{ title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
	{ title: '操作', key: 'operation', width: 240 },
];

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadPage(pagination);
};

const resetQuery = () => {
	searchInfo.value = {};
	payRange.value = undefined;
	query(true);
};

const handleTableChange = (page: PageInfo) => {
	paginationChange(page);
	loadPage(page);
};

const loadPage = async (page: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftRecordPage(searchInfo.value, page.current, page.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(msg || '礼金记录加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const openDrawer = (record?: GiftRecordInfo) => {
	formInfo.value = record ? { ...record } : { direction: 'GIVE' };
	drawerOpen.value = true;
};

const save = async () => {
	saving.value = true;
	try {
		const api = formInfo.value.id ? updateGiftRecord : addGiftRecord;
		const { code, message: msg } = await api(formInfo.value);
		if (code === '200') {
			message.success('保存成功');
			drawerOpen.value = false;
			query();
		} else {
			message.error(msg || '保存失败');
		}
	} finally {
		saving.value = false;
	}
};

const remove = async (id: string | number) => {
	const { code, message: msg } = await deleteGiftRecord(String(id));
	if (code === '200') {
		message.success('删除成功');
		query(true);
	} else {
		message.error(msg || '删除失败');
	}
};

const showPending = async (id: string | number) => {
	const { code, data, message: msg } = await getPendingReturnAmount(id);
	if (code === '200') {
		Modal.info({
			title: '待回礼金额',
			content: money(data || 0),
		});
	} else {
		message.error(msg || '待回礼金额查询失败');
	}
};

const markReturned = async (id: string | number) => {
	const { code, message: msg } = await markGiftReturned(id);
	if (code === '200') {
		message.success('已标记回礼');
		query();
	} else {
		message.error(msg || '标记失败');
	}
};

onMounted(() => query(true));
</script>

<style scoped lang="less">
.gift-page {
	padding: 16px;
	background: #f8fbff;
	min-height: 100%;
}

.section-card {
	margin-bottom: 16px;
	border-radius: 8px;
}

.range-split {
	margin: 0 8px;
	color: #8c8c8c;
}
</style>
