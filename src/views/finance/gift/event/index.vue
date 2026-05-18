<template>
	<div class="gift-screen">
		<div class="screen-header">
			<div>
				<h2>事由管理</h2>
				<p>统一管理婚礼、乔迁、满月等往来事由与参与统计。</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				class="primary-action"
				@click="openDrawer()"
			>
				+ 新增事由
			</a-button>
		</div>

		<section class="filter-panel">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="事由名称">
					<a-input
						v-model:value="searchInfo.keyword"
						placeholder="搜索事由名称或备注"
						allow-clear
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="事由类别">
					<a-select
						v-model:value="searchInfo.eventType"
						:options="giftEventOptions"
						allow-clear
						class="filter-select"
					/>
				</a-form-item>
				<a-form-item label="快捷类别">
					<a-space>
						<a-tag
							v-for="item in quickEvents"
							:key="item.value"
							class="quick-tag"
							:color="searchInfo.eventType === item.value ? 'blue' : 'default'"
							@click="selectEventType(item.value)"
						>
							{{ item.label }}
						</a-tag>
					</a-space>
				</a-form-item>
				<a-form-item v-if="searchExpanded" label="事由时间">
					<a-range-picker
						v-model:value="eventRange"
						show-time
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</a-form-item>
				<a-form-item>
					<a-space>
						<a-button type="primary" @click="query(true)">查询结果</a-button>
						<a-button @click="resetQuery">重置</a-button>
						<a-button type="link" @click="searchExpanded = !searchExpanded">
							{{ searchExpanded ? '收起' : '展开' }}
						</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</section>

		<div class="metric-grid metric-grid-three">
			<div class="metric-card metric-card-gold">
				<div class="metric-top">
					<span>本月待办事项</span>
					<i>□</i>
				</div>
				<strong>{{ summary.monthPendingCount || 0 }} 项</strong>
				<p>近期需要跟进的往来活动</p>
			</div>
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>累计礼金总额</span>
					<i>￥</i>
				</div>
				<strong>{{ money(summary.totalAmount) }}</strong>
				<p>覆盖全部事由收支记录</p>
			</div>
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>活跃联系人</span>
					<i>人</i>
				</div>
				<strong>{{ summary.activePersonCount || 0 }} 位</strong>
				<p>近期待往来或已往来对象</p>
			</div>
		</div>

		<section class="table-panel">
			<div class="panel-head">
				<h3>事由列表</h3>
				<a-radio-group v-model:value="tableSize" size="small">
					<a-radio-button value="small">紧凑</a-radio-button>
					<a-radio-button value="middle">默认</a-radio-button>
				</a-radio-group>
			</div>
			<a-table
				:data-source="dataSource"
				:columns="columns"
				:loading="loading"
				:pagination="pagination"
				:size="tableSize"
				row-key="id"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'eventName'">
						<div class="event-cell">
							<span class="event-icon">{{
								eventLabel(record.eventType).slice(0, 1)
							}}</span>
							<div>
								<strong>{{ record.eventName || '-' }}</strong>
								<p>{{ record.remark || '礼尚往来事由' }}</p>
							</div>
						</div>
					</template>
					<template v-else-if="column.key === 'eventType'">
						<a-tag color="blue">{{ eventLabel(record.eventType) }}</a-tag>
					</template>
					<template v-else-if="column.key === 'totalAmount'">
						<span class="amount-in">{{ money(record.totalAmount) }}</span>
					</template>
					<template v-else-if="column.key === 'eventStatus'">
						<a-tag
							:color="record.eventStatus === '已完成' ? 'green' : 'orange'"
						>
							{{ record.eventStatus || '进行中' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<a-button
								v-if="hasPermission('gift:edit')"
								size="small"
								type="link"
								@click="openDrawer(record)"
							>
								编辑
							</a-button>
							<a-popconfirm
								v-if="hasPermission('gift:delete')"
								title="确认删除该事由?"
								@confirm="remove(record.id)"
							>
								<a-button size="small" type="link" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

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
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	addGiftEvent,
	deleteGiftEvent,
	getGiftEventBusinessPage,
	getGiftEventSummary,
	updateGiftEvent,
} from '@/views/finance/gift/api';
import type {
	GiftEventBusinessInfo,
	GiftEventInfo,
	GiftEventQuery,
	GiftEventSummary,
} from '@/views/finance/gift/config';
import {
	eventLabel,
	giftEventOptions,
	money,
} from '@/views/finance/gift/config';

const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const loading = ref(false);
const { hasPermission } = usePermission();
const saving = ref(false);
const drawerOpen = ref(false);
const searchExpanded = ref(false);
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftEventQuery>({});
const formInfo = ref<GiftEventInfo>({});
const dataSource = ref<GiftEventBusinessInfo[]>([]);
const summary = ref<GiftEventSummary>({});
const eventRange = ref<[string, string] | undefined>();
const quickEvents = giftEventOptions.slice(0, 3);

watch(eventRange, (value) => {
	searchInfo.value.eventTimeStart = value?.[0];
	searchInfo.value.eventTimeEnd = value?.[1];
});

const selectEventType = (value: string) => {
	searchInfo.value.eventType =
		searchInfo.value.eventType === value ? undefined : value;
	query(true);
};

const columns = [
	{ title: '事由名称', dataIndex: 'eventName', key: 'eventName' },
	{ title: '类型', dataIndex: 'eventType', key: 'eventType', width: 100 },
	{ title: '日期', dataIndex: 'eventTime', key: 'eventTime', width: 180 },
	{ title: '地点', dataIndex: 'locationText', key: 'locationText', width: 140 },
	{ title: '状态', dataIndex: 'eventStatus', key: 'eventStatus', width: 100 },
	{
		title: '参与人数',
		dataIndex: 'participantCount',
		key: 'participantCount',
		width: 100,
	},
	{
		title: '礼金总额',
		dataIndex: 'totalAmount',
		key: 'totalAmount',
		width: 120,
	},
	{ title: '操作', key: 'operation', width: 140 },
];

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadSummary();
	loadPage(pagination);
};

const resetQuery = () => {
	searchInfo.value = {};
	eventRange.value = undefined;
	query(true);
};

const handleTableChange = (page: PageInfo) => {
	paginationChange(page);
	loadPage(page);
};

const loadSummary = async () => {
	const { code, data, message: msg } = await getGiftEventSummary();
	if (code === '200') {
		summary.value = data || {};
	} else {
		message.error(msg || '事由统计加载失败');
	}
};

const loadPage = async (page: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftEventBusinessPage(
			searchInfo.value,
			page.current,
			page.pageSize,
		);
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

const remove = async (id: string) => {
	const { code, message: msg } = await deleteGiftEvent(id);
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
.gift-screen {
	min-height: 100%;
	padding: 18px;
	background: #f3f6fa;
	color: #17233d;
}

.screen-header,
.panel-head,
.metric-top,
.event-cell {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.screen-header {
	margin-bottom: 16px;

	h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 800;
	}

	p {
		margin: 6px 0 0;
		color: #667085;
		font-size: 13px;
	}
}

.primary-action {
	border-radius: 6px;
	background: #006bb6;
	box-shadow: 0 6px 14px rgba(0, 91, 170, 0.18);
}

.filter-panel,
.table-panel,
.metric-card {
	background: #fff;
	border: 1px solid #e5eaf1;
	border-radius: 7px;
	box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
}

.filter-panel {
	margin-bottom: 16px;
	padding: 16px 18px;
}

.filter-input {
	width: 220px;
}

.filter-select {
	width: 160px;
}

.quick-tag {
	padding: 2px 10px;
	border-radius: 4px;
	cursor: pointer;
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.metric-grid-three {
	grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-card {
	min-height: 116px;
	padding: 18px;

	span {
		color: #344054;
		font-size: 13px;
		font-weight: 700;
	}

	i {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 6px;
		font-style: normal;
		font-weight: 800;

		&::after {
			position: absolute;
			inset: 7px;
			border: 2px solid currentcolor;
			border-radius: 3px;
			content: '';
			opacity: 0.24;
		}
	}

	strong {
		display: block;
		margin-top: 20px;
		font-size: 22px;
		line-height: 1;
	}

	p {
		margin: 8px 0 0;
		color: #667085;
		font-size: 12px;
	}
}

.metric-card-blue strong,
.metric-card-blue i {
	color: #1478d4;
}

.metric-card-blue i {
	background: #dcecff;
}

.metric-card-green strong,
.metric-card-green i {
	color: #14803c;
}

.metric-card-green i {
	background: #ddf6df;
}

.metric-card-gold strong,
.metric-card-gold i {
	color: #9a6712;
}

.metric-card-gold i {
	background: #f5ead5;
}

.table-panel {
	padding: 0 18px 16px;
}

.panel-head {
	padding: 16px 0 12px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
	}
}

.event-cell {
	justify-content: flex-start;
	gap: 10px;

	strong {
		color: #101828;
	}

	p {
		margin: 2px 0 0;
		color: #98a2b3;
		font-size: 12px;
	}
}

.event-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: #e9f2ff;
	color: #1478d4;
	font-weight: 800;
}

.amount-in {
	color: #389e0d;
	font-weight: 700;
}
</style>
