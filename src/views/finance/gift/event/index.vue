<template>
	<div class="gift-screen">
		<header class="screen-header">
			<div>
				<h2>人情事件台账</h2>
				<p>统一沉淀婚丧嫁娶、生辰满月等各类人情事由，智能关联礼金明细</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				size="middle"
				class="primary-action"
				@click="openDrawer()"
			>
				+ 登记人情事件
			</a-button>
		</header>

		<section class="filter-panel">
			<a-form layout="inline" :model="searchInfo">
				<a-form-item label="事件名称">
					<a-input
						v-model:value="searchInfo.keyword"
						allow-clear
						placeholder="搜索事件名称..."
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="事件分类">
					<a-select
						v-model:value="searchInfo.eventType"
						allow-clear
						placeholder="全部分类"
						class="filter-select"
					>
						<a-select-option
							v-for="opt in giftEventTypeOptions"
							:key="opt.value"
							:value="opt.value"
						>
							{{ opt.label }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="高频速选">
					<a-space wrap :size="[6, 6]">
						<a-tag
							v-for="opt in quickEvents"
							:key="opt.value"
							:color="
								searchInfo.eventType === resolveFilterEventType(opt.value)
									? 'blue'
									: 'default'
							"
							class="quick-tag"
							@click="selectEventType(opt.value)"
						>
							{{ opt.label }}
						</a-tag>
					</a-space>
				</a-form-item>

				<template v-if="searchExpanded">
					<a-form-item label="举行日期">
						<a-range-picker
							v-model:value="eventRange"
							value-format="YYYY-MM-DD"
							style="width: 250px"
						/>
					</a-form-item>
					<a-form-item label="事件状态">
						<a-select
							v-model:value="searchInfo.eventStatus"
							allow-clear
							placeholder="全部状态"
							class="filter-select"
						>
							<a-select-option value="进行中">进行中</a-select-option>
							<a-select-option value="已完成">已完成</a-select-option>
						</a-select>
					</a-form-item>
				</template>

				<a-form-item>
					<a-space>
						<a-button type="primary" @click="query(true)">查询</a-button>
						<a-button @click="resetQuery">重置</a-button>
						<a-button
							type="link"
							class="expand-btn"
							@click="searchExpanded = !searchExpanded"
						>
							{{ searchExpanded ? '收起' : '展开' }}
							<down-outlined
								class="expand-icon"
								:class="{ 'is-expanded': searchExpanded }"
							/>
						</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</section>

		<!-- 指标统计与高频场景解耦子组件 -->
		<gift-event-metric-cards
			:summary="summary"
			:top-events="displayTopEvents"
		/>

		<!-- Tabs 布局 -->
		<a-tabs
			v-model:activeKey="activeTab"
			class="event-tabs-panel"
		>
			<a-tab-pane key="instances" tab="事件列表">
				<section class="table-panel" style="padding: 0">
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
							<template v-if="column.key === 'eventName'">
								<div class="event-cell">
									<span class="event-icon">📅</span>
									<div class="event-main">
										<div style="display: flex; align-items: center; gap: 6px">
											<strong :title="record.eventName">{{
												record.eventName || '-'
											}}</strong>
										</div>
										<a-tooltip
											v-if="record.remark"
											:title="record.remark"
											placement="topLeft"
										>
											<p class="event-remark">{{ record.remark }}</p>
										</a-tooltip>
										<p v-else class="event-remark" style="color: #cbd5e1">-</p>
									</div>
								</div>
							</template>
							<template v-else-if="column.key === 'hostPersonName'">
								<a-tag
									v-if="
										record.hostPersonName ||
										(record.hostPersonId &&
											personMap[String(record.hostPersonId)])
									"
									color="cyan"
									style="margin-right: 0; font-weight: 500"
								>
									👤
									{{
										record.hostPersonName ||
										personMap[String(record.hostPersonId)]
									}}
								</a-tag>
								<span v-else style="color: #94a3b8">-</span>
							</template>
							<template v-else-if="column.key === 'eventType'">
								<a-tag color="blue">{{ eventLabel(record.eventType) }}</a-tag>
							</template>
							<template v-else-if="column.key === 'eventTime'">
								<span>{{ formatDate(record.eventTime) }}</span>
							</template>
							<template v-else-if="column.key === 'giveAmount'">
								<span
									class="amount-out"
									style="color: #cf1322; font-weight: bold"
									>{{
										record.giveAmount > 0 ? money(record.giveAmount) : '-'
									}}</span
								>
							</template>
							<template v-else-if="column.key === 'receiveAmount'">
								<span
									class="amount-in"
									style="color: #389e0d; font-weight: bold"
									>{{
										record.receiveAmount > 0 ? money(record.receiveAmount) : '-'
									}}</span
								>
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
										title="确认删除该事件?"
										@confirm="remove(record.id)"
									>
										<a-button size="small" type="link" danger>删除</a-button>
									</a-popconfirm>
								</a-space>
							</template>
						</template>
					</a-table>
				</section>
			</a-tab-pane>

			<a-tab-pane key="dictionary" tab="事件分类">
				<!-- 事件分类字典解耦子组件 -->
				<gift-event-type-dictionary
					:preset-options="presetOptions"
					:custom-options="customOptions"
					@edit="startEditOption"
					@refresh="loadEventTypeOptions"
				/>
			</a-tab-pane>
		</a-tabs>

		<!-- 事件分类编辑 Modal (Vue 3.4 defineModel 规范组件) -->
		<gift-event-option-modal
			v-model:open="optionEditing"
			:option-data="editingOption"
			@success="loadEventTypeOptions"
		/>

		<!-- 人情事件表单 Drawer (Vue 3.4 defineModel 规范组件) -->
		<gift-event-form-drawer
			v-model:open="drawerOpen"
			:record="currentEditingRecord"
			@success="handleEventSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { debounce } from 'lodash-es';
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { formatDate, formatTime } from '@/utils/dayjs';
import {
	deleteGiftEvent,
	getGiftEventBusinessPage,
	getGiftEventSummary,
	getGiftPersonList,
} from '@/views/finance/gift/api';
import type {
	GiftEventBusinessInfo,
	GiftEventQuery,
	GiftEventSummary,
	GiftEventTypeOptionItem,
} from '@/views/finance/gift/config';
import { money } from '@/views/finance/gift/config';

const {
	giftEventTypeOptions,
	quickEvents,
	eventLabel,
	loadEventTypeOptions,
	resolveFilterEventType,
	presetOptions,
	customOptions,
} = useGiftEventTypeOptions();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (page) => loadPage(page),
	});
const loading = ref<boolean>(false);
const { hasPermission } = usePermission();
const drawerOpen = ref<boolean>(false);
const currentEditingRecord = ref<GiftEventBusinessInfo | null>(null);
const searchExpanded = ref<boolean>(false);
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftEventQuery>({});
const dataSource = ref<GiftEventBusinessInfo[]>([]);
const summary = ref<GiftEventSummary>({});
const eventRange = ref<[string, string] | undefined>();

const debouncedQuery = debounce(() => {
	query(true);
}, 300);

watch(
	searchInfo,
	() => {
		debouncedQuery();
	},
	{ deep: true },
);

watch(eventRange, (value) => {
	searchInfo.value.eventTimeStart =
		value?.[0] ? formatTime(value[0], 'YYYY-MM-DD 00:00:00') : undefined;
	searchInfo.value.eventTimeEnd =
		value?.[1] ? formatTime(value[1], 'YYYY-MM-DD 23:59:59') : undefined;
});

const selectEventType = (presetId: string) => {
	const eventType = resolveFilterEventType(presetId);
	searchInfo.value.eventType =
		searchInfo.value.eventType === eventType ? undefined : eventType;
};

onUnmounted(() => {
	debouncedQuery.cancel();
});

const columns = [
	{ title: '事件名称', dataIndex: 'eventName', key: 'eventName', width: 220 },
	{
		title: '关联亲友',
		dataIndex: 'hostPersonName',
		key: 'hostPersonName',
		width: 130,
	},
	{ title: '事件分类', dataIndex: 'eventType', key: 'eventType', width: 110 },
	{ title: '举行日期', dataIndex: 'eventTime', key: 'eventTime', width: 130 },
	{ title: '状态', dataIndex: 'eventStatus', key: 'eventStatus', width: 100 },
	{
		title: '参与人数',
		dataIndex: 'participantCount',
		key: 'participantCount',
		width: 100,
	},
	{
		title: '我送出的',
		dataIndex: 'giveAmount',
		key: 'giveAmount',
		width: 120,
	},
	{
		title: '我收到的',
		dataIndex: 'receiveAmount',
		key: 'receiveAmount',
		width: 120,
	},
	{ title: '操作', key: 'operation', width: 140, fixed: 'right' as const },
];

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadSummary();
	loadEventTypeOptions();
	loadPage(pagination);
};

const resetQuery = () => {
	searchInfo.value = {};
	eventRange.value = undefined;
	query(true);
};

const loadSummary = async () => {
	const { code, data, message: msg } = await getGiftEventSummary();
	if (code === '200') {
		summary.value = data || {};
	} else {
		message.error(msg || '事件统计加载失败');
	}
};

const personMap = ref<Record<string, string>>({});

const loadPersons = async () => {
	try {
		const { code, data } = await getGiftPersonList();
		if (code === '200' && data) {
			const map: Record<string, string> = {};
			data.forEach((p) => {
				if (p.id) {
					map[String(p.id)] = p.personName || '-';
				}
			});
			personMap.value = map;
		}
	} catch {
		// ignore
	}
};

const loadPage = async (page: PageInfo) => {
	loading.value = true;
	try {
		const queryParams = { ...searchInfo.value };
		if (!queryParams.keyword && (queryParams as any).eventName) {
			queryParams.keyword = (queryParams as any).eventName;
		}
		const {
			code,
			data,
			message: msg,
		} = await getGiftEventBusinessPage(
			queryParams,
			page.current,
			page.pageSize,
		);
		if (code === '200') {
			const list = data?.records || [];
			list.forEach((item) => {
				if (
					!item.hostPersonName &&
					item.hostPersonId &&
					personMap.value[String(item.hostPersonId)]
				) {
					item.hostPersonName = personMap.value[String(item.hostPersonId)];
				}
			});
			dataSource.value = list;
			setTotal(data?.total || 0);
		} else {
			message.error(msg || '事件列表加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const openDrawer = (record?: GiftEventBusinessInfo) => {
	currentEditingRecord.value = record || null;
	drawerOpen.value = true;
};

const handleEventSuccess = async () => {
	await loadEventTypeOptions();
	query();
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

const route = useRoute();

const activeTab = ref('instances');
const optionEditing = ref<boolean>(false);
const editingOption = ref<Partial<GiftEventTypeOptionItem>>({});

const displayTopEvents = computed(() => {
	const activePresets = presetOptions.value.filter((x) => x.status !== 0);
	const activeCustoms = customOptions.value.filter((x) => x.status !== 0);
	const all = [...activePresets, ...activeCustoms];

	const sorted = [...all].sort((a, b) => {
		const countA = a.useCount || 0;
		const countB = b.useCount || 0;
		if (countB !== countA) {
			return countB - countA;
		}
		return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
	});
	return sorted.slice(0, 4);
});

const startEditOption = (opt: GiftEventTypeOptionItem) => {
	editingOption.value = { ...opt };
	optionEditing.value = true;
};

onMounted(async () => {
	await Promise.all([loadEventTypeOptions(), loadPersons()]);
	query(true);
	if (route.query.open === 'create' && hasPermission('gift:add')) {
		openDrawer();
	}
});
</script>

<style scoped lang="less">
.gift-screen {
	min-height: 100%;
	padding: 18px;
	background: #f8fafc;
	color: #0f172a;
}

.screen-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;

	h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.02em;
	}

	p {
		margin: 6px 0 0;
		color: #64748b;
		font-size: 13px;
	}
}

.primary-action {
	border-radius: 8px;
	background: #2563eb;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	font-weight: 600;
	transition: all 0.2s ease;

	&:hover {
		background: #1d4ed8;
		box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
		transform: translateY(-1px);
	}
}

.filter-panel,
.table-panel {
	background: #fff;
	border: 1px solid #e2e8f0;
	border-radius: 16px;
	box-shadow:
		0 1px 3px 0 rgba(0, 0, 0, 0.05),
		0 1px 2px -1px rgba(0, 0, 0, 0.05);
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
	border-radius: 9999px;
	cursor: pointer;
}

.expand-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	color: #2563eb;
	font-size: 14px;
	font-weight: 500;
	padding: 0 4px;
	height: 32px;
	line-height: 32px;
	user-select: none;

	&:hover {
		color: #1d4ed8;
	}

	.expand-icon {
		font-size: 11px;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

		&.is-expanded {
			transform: rotate(180deg);
		}
	}
}

.event-tabs-panel {
	background: #fff;
	padding: 12px 18px 20px;
	border-radius: 8px;
	margin-top: 20px;
	border: 1px solid #f0f0f0;
}

.table-panel {
	padding: 0 20px 18px;
}

.event-cell {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 12px;
	max-width: 220px;

	.event-main {
		min-width: 0;
		flex: 1;
	}

	strong {
		color: #0f172a;
		font-weight: 700;
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.event-remark {
		margin: 2px 0 0;
		color: #64748b;
		font-size: 12px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: default;
	}
}

.event-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	border-radius: 8px;
	background: #eff6ff;
	color: #2563eb;
	border: 1px solid #dbeafe;
	font-weight: 800;
}

.amount-in {
	color: #059669;
	font-weight: 700;
}
</style>
