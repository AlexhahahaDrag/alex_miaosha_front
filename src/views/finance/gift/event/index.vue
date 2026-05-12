<template>
	<div class="gift-page">
		<a-page-header title="事由管理 - 礼尚往来管理" />
		<a-card :bordered="false" class="section-card">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="关键词">
					<a-input
						v-model:value="searchInfo.keyword"
						placeholder="事由名称"
						allow-clear
					/>
				</a-form-item>
				<a-form-item v-if="searchExpanded" label="类型">
					<a-select
						v-model:value="searchInfo.eventType"
						:options="giftEventOptions"
						allow-clear
						style="width: 160px"
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
			<template #title>事由列表</template>
			<template #extra>
				<a-button type="primary" @click="openDrawer()">新增</a-button>
			</template>
			<a-table
				:data-source="dataSource"
				:columns="columns"
				:loading="loading"
				:pagination="pagination"
				row-key="id"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button size="small" type="link" @click="openDrawer(record)"
								>编辑</a-button
							>
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
			:title="formInfo.id ? '编辑事由' : '新增事由'"
			width="480"
		>
			<a-form :model="formInfo" layout="vertical">
				<a-form-item label="事由名称" required>
					<a-input v-model:value="formInfo.eventName" />
				</a-form-item>
				<a-form-item label="类型">
					<a-select
						v-model:value="formInfo.eventType"
						:options="giftEventOptions"
					/>
				</a-form-item>
				<a-form-item label="事由时间">
					<a-date-picker
						v-model:value="formInfo.eventTime"
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
import { message } from 'ant-design-vue';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	addGiftEvent,
	deleteGiftEvent,
	getGiftEventPage,
	updateGiftEvent,
} from '@/views/finance/gift/api';
import type {
	GiftEventInfo,
	GiftEventQuery,
} from '@/views/finance/gift/config';
import { giftEventOptions } from '@/views/finance/gift/config';

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
const searchInfo = ref<GiftEventQuery>({});
const formInfo = ref<GiftEventInfo>({});
const dataSource = ref<GiftEventInfo[]>([]);

const columns = [
	{ title: '事由名称', dataIndex: 'eventName', key: 'eventName' },
	{ title: '类型', dataIndex: 'eventType', key: 'eventType' },
	{ title: '事由时间', dataIndex: 'eventTime', key: 'eventTime' },
	{ title: '备注', dataIndex: 'remark', key: 'remark' },
	{ title: '操作', key: 'operation', width: 140 },
];

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadPage(pagination);
};

const resetQuery = () => {
	searchInfo.value = {};
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
		} = await getGiftEventPage(searchInfo.value, page.current, page.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(msg || '事由列表加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const openDrawer = (record?: GiftEventInfo) => {
	formInfo.value = record ? { ...record } : {};
	drawerOpen.value = true;
};

const save = async () => {
	saving.value = true;
	try {
		const api = formInfo.value.id ? updateGiftEvent : addGiftEvent;
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
	const { code, message: msg } = await deleteGiftEvent(String(id));
	if (code === '200') {
		message.success('删除成功');
		query(true);
	} else {
		message.error(msg || '删除失败');
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
</style>
