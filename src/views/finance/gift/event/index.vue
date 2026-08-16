<template>
	<div class="gift-screen">
		<div class="screen-header">
			<div>
				<h2>人情事件管理</h2>
				<p>统一管理人情活动事件、分类标签与随礼收支统计。</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				class="primary-action"
				@click="openDrawer()"
			>
				+ 新增人情事件
			</a-button>
		</div>

		<section class="filter-panel">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="事件名称">
					<a-input
						v-model:value="searchInfo.keyword"
						placeholder="搜索事件名称或备注"
						allow-clear
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="事件分类">
					<a-select
						v-model:value="searchInfo.eventType"
						:options="giftEventTypeOptions"
						placeholder="全部分类"
						allow-clear
						class="filter-select"
					/>
				</a-form-item>
				<a-form-item label="快捷分类">
					<a-space>
						<a-tag
							v-for="item in quickEvents"
							:key="item.id"
							class="quick-tag"
							:color="
								searchInfo.eventType === resolveFilterEventType(item.id) ?
									'blue'
								:	'default'
							"
							@click="selectEventType(item.id)"
						>
							{{ item.name }}
						</a-tag>
					</a-space>
				</a-form-item>
				<a-form-item v-if="searchExpanded" label="事件日期">
					<a-range-picker
						v-model:value="eventRange"
						value-format="YYYY-MM-DD"
					/>
				</a-form-item>
				<a-form-item>
					<a-space>
						<a-button type="primary" @click="query(true)">查询结果</a-button>
						<a-button @click="resetQuery">重置</a-button>
						<a-button type="link" class="expand-btn" @click="searchExpanded = !searchExpanded">
							<span>{{ searchExpanded ? '收起' : '展开' }}</span>
							<down-outlined class="expand-icon" :class="{ 'is-expanded': searchExpanded }" />
						</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</section>

		<div class="metric-grid metric-grid-three">
			<div class="metric-card metric-card-gold">
				<div class="metric-top">
					<span>本月人情活动</span>
					<div class="metric-icon">
						<calendar-outlined />
					</div>
				</div>
				<strong>{{ summary.monthPendingCount || 0 }} 项</strong>
				<p>近期需要跟进的往来活动</p>
			</div>
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>累计礼金收支</span>
					<div class="metric-icon">
						<pay-circle-outlined />
					</div>
				</div>
				<strong>{{ money(summary.totalAmount) }}</strong>
				<p>覆盖全部事件收支记录</p>
			</div>
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>活跃往来对象</span>
					<div class="metric-icon">
						<team-outlined />
					</div>
				</div>
				<strong>{{ summary.activePersonCount || 0 }} 位</strong>
				<p>近期待往来或已往来对象</p>
			</div>
		</div>

		<!-- 高频事件卡片 (Top Category Cards) -->
		<div
			class="section-title-bar"
			style="
				margin-top: 20px;
				margin-bottom: 12px;
				display: flex;
				justify-content: space-between;
				align-items: center;
			"
		>
			<h3 style="margin: 0; font-size: 16px; font-weight: 800">高频事件场景</h3>
			<span style="color: #8c8c8c; font-size: 13px"
				>自动统计使用频次最高的事由场景，智能辅助随礼梯度</span
			>
		</div>
		<div class="top-event-cards">
			<div
				v-for="item in displayTopEvents"
				:key="item.id"
				class="top-event-card"
			>
				<span class="card-icon-emoji">{{ item.icon || '💬' }}</span>
				<div class="card-main">
					<div class="card-title-row">
						<strong>{{ item.name }}</strong>
						<a-tag size="small" color="blue" class="category-badge">{{
							item.category
						}}</a-tag>
					</div>
					<div class="card-stats">
						<span class="stat-item"
							>累计使用:
							<strong style="color: #1890ff">{{ item.useCount || 0 }}</strong>
							次</span
						>
						<span
							class="stat-item"
							v-if="item.defaultAmount"
							style="margin-left: 12px"
						>
							建议金额:
							<strong style="color: #52c41a">¥{{ item.defaultAmount }}</strong>
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Tabs 布局 -->
		<a-tabs
			v-model:activeKey="activeTab"
			class="event-tabs-panel"
			style="
				background: #fff;
				padding: 12px 18px 20px;
				border-radius: 8px;
				margin-top: 20px;
				border: 1px solid #f0f0f0;
			"
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
											<strong :title="record.eventName">{{ record.eventName || '-' }}</strong>
										</div>
										<a-tooltip v-if="record.remark" :title="record.remark" placement="topLeft">
											<p class="event-remark">{{ record.remark }}</p>
										</a-tooltip>
										<p v-else class="event-remark" style="color: #cbd5e1">-</p>
									</div>
								</div>
							</template>
							<template v-else-if="column.key === 'hostPersonName'">
								<a-tag
									v-if="record.hostPersonName || (record.hostPersonId && personMap[String(record.hostPersonId)])"
									color="cyan"
									style="margin-right: 0; font-weight: 500"
								>
									👤 {{ record.hostPersonName || personMap[String(record.hostPersonId)] }}
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
				<div class="dictionary-grid">
					<div
						v-for="(groupItems, groupName) in categorizedEventTypes"
						:key="groupName"
						class="dictionary-card"
					>
						<div class="dictionary-card-header">
							<strong>{{ groupName }}</strong>
						</div>
						<div class="dictionary-card-body">
							<div
								v-for="opt in groupItems"
								:key="opt.id"
								class="dictionary-item"
							>
								<div class="item-left">
									<span class="item-icon-emoji">{{ opt.icon || '💬' }}</span>
									<div class="item-info">
										<span
											class="item-name"
											:class="{ 'disabled-text': opt.status === 0 }"
											>{{ opt.name }}</span
										>
										<span class="item-count"
											>使用 {{ opt.useCount || 0 }} 次</span
										>
									</div>
								</div>
								<div class="item-right">
									<span class="item-amount" v-if="opt.defaultAmount">
										¥{{ opt.defaultAmount }}
									</span>
									<span class="item-amount text-muted" v-else>
										暂无推荐金额
									</span>
									<a-space size="small" style="margin-left: 12px">
										<a-button
											type="link"
											size="small"
											style="padding: 0"
											:disabled="loadingOptionId === opt.id"
											@click="startEditOption(opt)"
										>
											编辑
										</a-button>
										<a-switch
											:checked="opt.status !== 0"
											:loading="loadingOptionId === opt.id"
											:disabled="loadingOptionId === opt.id"
											size="small"
											@change="toggleOptionStatus(opt)"
										/>
									</a-space>
								</div>
							</div>
						</div>
					</div>
				</div>
			</a-tab-pane>
		</a-tabs>

		<!-- 事件分类编辑 Modal -->
		<a-modal
			v-model:open="optionEditing"
			title="编辑事件分类配置"
			:confirm-loading="optionSaving"
			@ok="saveOption"
			destroy-on-close
		>
			<a-form
				:model="editingOption"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 16 }"
				style="padding-top: 12px"
			>
				<a-form-item label="分类名称">
					<a-input v-model:value="editingOption.name" disabled />
				</a-form-item>
				<a-form-item label="分类分组">
					<a-select v-model:value="editingOption.category">
						<a-select-option value="婚庆类">婚庆类</a-select-option>
						<a-select-option value="家庭类">家庭类</a-select-option>
						<a-select-option value="节日类">节日类</a-select-option>
						<a-select-option value="其他">其他</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="图标/Emoji">
					<a-input
						v-model:value="editingOption.icon"
						placeholder="输入单个 Emoji 图标"
					/>
				</a-form-item>
				<a-form-item label="默认推荐金额">
					<a-input-number
						v-model:value="editingOption.defaultAmount"
						:min="0"
						:precision="2"
						style="width: 100%"
						placeholder="随礼时的默认候选金额"
					/>
				</a-form-item>
				<a-form-item label="启用状态">
					<a-radio-group v-model:value="editingOption.status">
						<a-radio :value="1">启用</a-radio>
						<a-radio :value="0">停用</a-radio>
					</a-radio-group>
				</a-form-item>
			</a-form>
		</a-modal>

		<a-drawer
			v-model:open="drawerOpen"
			:title="formInfo.id ? '编辑人情事件' : '新增人情事件'"
			width="480"
		>
			<a-form :model="formInfo" layout="vertical">
				<a-form-item label="事件名称" required>
					<a-input
						v-model:value="formInfo.eventName"
						placeholder="例如：张三婚礼"
					/>
				</a-form-item>
				<a-form-item label="事件分类" required>
					<a-select
						v-model:value="formInfo.eventTypeMode"
						:options="eventTypeSelectOptions"
						allow-clear
						placeholder="请选择事件分类"
					/>
				</a-form-item>
				<a-form-item
					v-if="formInfo.eventTypeMode === EVENT_TYPE_CUSTOM"
					label="自定义事件分类"
					required
				>
					<a-input
						v-model:value="formInfo.customEventType"
						placeholder="请输入自定义事件分类"
						allow-clear
						:maxlength="20"
					/>
				</a-form-item>
				<a-form-item label="事件日期">
					<a-date-picker
						v-model:value="formInfo.eventTime"
						value-format="YYYY-MM-DD"
						style="width: 100%"
						placeholder="请选择举办日期"
					/>
				</a-form-item>
				<a-form-item
					label="关联亲友"
					extra="该事件的主办人、主角或主要关联亲友（如新人、寿星等）"
				>
					<gift-person-picker
						v-model="formInfo.hostPersonId"
						placeholder="请选择或搜索关联亲友/主办人"
						data-testid="gift-event-host-person-picker"
					/>
				</a-form-item>
				<a-form-item label="备注">
					<a-textarea
						v-model:value="formInfo.remark"
						:rows="3"
						placeholder="例如：地址/参与成员说明"
					/>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { debounce } from 'lodash-es';
import { message } from 'ant-design-vue';
import {
	CalendarOutlined,
	PayCircleOutlined,
	TeamOutlined,
} from '@ant-design/icons-vue';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import GiftPersonPicker from '@/views/finance/gift/components/gift-person-picker/index.vue';
import {
	addGiftEvent,
	deleteGiftEvent,
	getGiftEventBusinessPage,
	getGiftEventSummary,
	getGiftPersonList,
	updateGiftEvent,
	updateGiftEventTypeOption,
} from '@/views/finance/gift/api';
import type {
	GiftEventBusinessInfo,
	GiftEventFormState,
	GiftEventInfo,
	GiftEventQuery,
	GiftEventSummary,
	GiftEventTypeOptionItem,
} from '@/views/finance/gift/config';
import {
	EVENT_TYPE_CUSTOM,
	buildEventTypeForSave,
	money,
} from '@/views/finance/gift/config';

const {
	giftEventTypeOptions,
	eventTypeSelectOptions,
	quickEvents,
	eventLabel,
	loadEventTypeOptions,
	resolveFilterEventType,
	mapEventTypeToFormFields,
	presetOptions,
	customOptions,
} = useGiftEventTypeOptions();

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
const formInfo = ref<GiftEventFormState>({});
const dataSource = ref<GiftEventBusinessInfo[]>([]);
const summary = ref<GiftEventSummary>({});
const eventRange = ref<[string, string] | undefined>();

const formatDate = (val?: string) => {
	if (!val) return '-';
	return val.replace('T', ' ').slice(0, 10);
};

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
		value?.[0] ? `${value[0]}T00:00:00` : undefined;
	searchInfo.value.eventTimeEnd =
		value?.[1] ? `${value[1]}T23:59:59` : undefined;
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

const handleTableChange = (page: PageInfo) => {
	paginationChange(page);
	loadPage(page);
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
			const list = data?.records || [];
			list.forEach((item) => {
				if (
					!item.hostPersonName &&
					item.hostPersonId &&
					personMap.value[String(item.hostPersonId)]
				) {
					item.hostPersonName =
						personMap.value[String(item.hostPersonId)];
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
	const mapped = record ? mapEventTypeToFormFields(record) : {};
	if (mapped.eventTime) {
		mapped.eventTime = mapped.eventTime.replace('T', ' ').slice(0, 10);
	}
	formInfo.value = mapped;
	drawerOpen.value = true;
};

const toSavePayload = (): GiftEventInfo => {
	const typePayload = buildEventTypeForSave(formInfo.value);
	let params: Record<string, any> = {
		id: formInfo.value.id || undefined,
		eventName: formInfo.value.eventName?.trim() || undefined,
		eventType: typePayload.eventType || undefined,
		eventTypeOptionId: typePayload.eventTypeOptionId || undefined,
		hostPersonId: formInfo.value.hostPersonId || undefined,
		remark: formInfo.value.remark?.trim() || undefined,
	};
	if (formInfo.value.eventTime) {
		const timeStr = formInfo.value.eventTime;
		params.eventTime =
			timeStr.length === 10 ? `${timeStr}T00:00:00` : timeStr;
	}
	return params as GiftEventInfo;
};

const save = async () => {
	if (!formInfo.value.eventName?.trim()) {
		message.warning('请输入事件名称');
		return;
	}
	if (
		formInfo.value.eventTypeMode === EVENT_TYPE_CUSTOM &&
		!formInfo.value.customEventType?.trim()
	) {
		message.warning('请输入自定义事件分类');
		return;
	}
	if (!formInfo.value.eventTypeMode) {
		message.warning('请选择事件分类');
		return;
	}
	saving.value = true;
	try {
		const api = formInfo.value.id ? updateGiftEvent : addGiftEvent;
		const { code, message: msg } = await api(toSavePayload());
		if (code === '200') {
			message.success('保存成功');
			drawerOpen.value = false;
			await loadEventTypeOptions();
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

const route = useRoute();

const activeTab = ref('instances');
const optionEditing = ref(false);
const editingOption = ref<Partial<GiftEventTypeOptionItem>>({});

const displayTopEvents = computed(() => {
	// 高频场景卡片仅展示已启用的有效分类 (status !== 0)
	const activePresets = presetOptions.value.filter((x) => x.status !== 0);
	const activeCustoms = customOptions.value.filter((x) => x.status !== 0);
	const all = [...activePresets, ...activeCustoms];

	// 按使用次数降序排序；使用次数相同时按 sortOrder 权重升序排列，始终保证展示 4 个完整卡片
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

const categorizedEventTypes = computed(() => {
	const groups: Record<string, GiftEventTypeOptionItem[]> = {
		婚庆类: [],
		家庭类: [],
		节日类: [],
		其他: [],
	};
	const all = [...presetOptions.value, ...customOptions.value];
	all.forEach((item) => {
		const cat = item.category || '其他';
		if (!groups[cat]) {
			groups[cat] = [];
		}
		if (!groups[cat].some((x) => x.name === item.name)) {
			groups[cat].push(item);
		}
	});
	return groups;
});

const optionSaving = ref(false);
const loadingOptionId = ref<string | null>(null);

const startEditOption = (opt: GiftEventTypeOptionItem) => {
	editingOption.value = { ...opt };
	optionEditing.value = true;
};

const saveOption = async () => {
	const { id, name, defaultAmount, status, icon, category } =
		editingOption.value;
	if (!id || optionSaving.value) return;

	optionSaving.value = true;
	try {
		const { code, message: msg } = await updateGiftEventTypeOption({
			id,
			eventLabel: name,
			defaultAmount,
			status,
			icon,
			category,
		});
		if (code === '200') {
			message.success('更新事由配置成功');
			optionEditing.value = false;
			await loadEventTypeOptions();
		} else {
			message.error(msg || '更新事由配置失败');
		}
	} catch (error: unknown) {
		message.error('更新事由配置失败，请重试');
	} finally {
		optionSaving.value = false;
	}
};

const toggleOptionStatus = async (opt: GiftEventTypeOptionItem) => {
	if (!opt.id || loadingOptionId.value === opt.id) return;
	loadingOptionId.value = opt.id;
	const newStatus = opt.status === 0 ? 1 : 0;
	try {
		const { code, message: msg } = await updateGiftEventTypeOption({
			id: opt.id,
			eventLabel: opt.name,
			status: newStatus,
		});
		if (code === '200') {
			message.success(
				`${newStatus === 1 ? '已启用' : '已停用'}事由【${opt.name}】`,
			);
			await loadEventTypeOptions();
		} else {
			message.error(msg || '操作失败');
		}
	} catch (error: unknown) {
		message.error('操作失败，请重试');
	} finally {
		loadingOptionId.value = null;
	}
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

.expand-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	color: #006bb6;
	font-size: 14px;
	padding: 0 4px;
	height: 32px;
	line-height: 32px;
	user-select: none;

	&:hover {
		color: #0088e8;
	}

	.expand-icon {
		font-size: 11px;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

		&.is-expanded {
			transform: rotate(180deg);
		}
	}
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

	.metric-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		font-size: 18px;
		transition: all 0.2s ease;
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

.metric-card-blue strong {
	color: #1478d4;
}

.metric-card-blue .metric-icon {
	color: #2563eb;
	background: #dbeafe;
}

.metric-card-green strong {
	color: #14803c;
}

.metric-card-green .metric-icon {
	color: #16a34a;
	background: #dcfce7;
}

.metric-card-gold strong {
	color: #9a6712;
}

.metric-card-gold .metric-icon {
	color: #d97706;
	background: #fef3c7;
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
	max-width: 220px;

	.event-main {
		min-width: 0;
		flex: 1;
	}

	strong {
		color: #101828;
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.event-remark {
		margin: 2px 0 0;
		color: #98a2b3;
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

.top-event-cards {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 14px;
	margin-bottom: 20px;
}

.top-event-card {
	background: #fff;
	border: 1px solid #e5eaf1;
	border-radius: 8px;
	padding: 14px 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);

	.card-icon-emoji {
		font-size: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: #f0f5ff;
		border-radius: 50%;
	}

	.card-main {
		flex: 1;

		.card-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;

			strong {
				font-size: 14px;
				color: #1f1f1f;
			}
		}

		.card-stats {
			font-size: 12px;
			color: #8c8c8c;
		}
	}
}

.dictionary-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px;
	padding: 8px 0;
}

.dictionary-card {
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 8px;

	.dictionary-card-header {
		padding: 10px 16px;
		background: #f0f0f0;
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		border-bottom: 1px solid #e8e8e8;

		strong {
			font-size: 14px;
			color: #333;
		}
	}

	.dictionary-card-body {
		padding: 8px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dictionary-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		border-bottom: 1px dashed #e8e8e8;

		&:last-child {
			border-bottom: none;
		}

		.item-left {
			display: flex;
			align-items: center;
			gap: 10px;

			.item-icon-emoji {
				font-size: 20px;
				width: 32px;
				height: 32px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				background: #fff;
				border-radius: 50%;
				border: 1px solid #e8e8e8;
			}

			.item-info {
				display: flex;
				flex-direction: column;

				.item-name {
					font-weight: 700;
					color: #262626;
					font-size: 13px;

					&.disabled-text {
						color: #bfbfbf;
						text-decoration: line-through;
					}
				}

				.item-count {
					font-size: 11px;
					color: #8c8c8c;
					margin-top: 2px;
				}
			}
		}

		.item-right {
			display: flex;
			align-items: center;

			.item-amount {
				font-size: 12px;
				color: #52c41a;
				font-weight: 700;

				&.text-muted {
					color: #bfbfbf;
					font-weight: normal;
					font-style: italic;
				}
			}
		}
	}
}

.muted-info {
	font-size: 13px;
	color: #8c8c8c;
	font-weight: normal;
}
</style>
