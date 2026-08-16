<template>
	<a-modal
		v-model:open="open"
		width="640px"
		:destroy-on-close="true"
		:mask-closable="false"
		@cancel="handleCancel"
	>
		<!-- 自定义 Modal Header -->
		<template #title>
			<div class="modal-custom-header">
				<span class="header-title">选择人情事件</span>
				<a-button
					v-if="!showCreateForm"
					type="primary"
					size="small"
					class="create-header-btn"
					@click="openCreatePanel"
				>
					＋ 新建人情事件
				</a-button>
			</div>
		</template>

		<div class="event-selector-container">
			<!-- 内联创建新事件表单 -->
			<div v-if="showCreateForm" class="create-form-panel">
				<div class="panel-header">
					<h4 class="panel-title">新建人情事件</h4>
					<span class="panel-subtitle">创建后将自动为您选中该事件</span>
				</div>
				<a-form :model="createForm" layout="vertical" ref="formRef">
					<a-row :gutter="16">
						<a-col :span="14">
							<a-form-item
								label="事件名称"
								name="eventName"
								:rules="[{ required: true, message: '请输入事件名称，如：徐福乐结婚' }]"
							>
								<a-input v-model:value="createForm.eventName" placeholder="例如：徐福乐结婚" />
							</a-form-item>
						</a-col>
						<a-col :span="10">
							<a-form-item
								label="事件分类"
								name="eventType"
								:rules="[{ required: true, message: '请选择事件分类' }]"
							>
								<a-select
									v-model:value="createForm.eventType"
									placeholder="请选择分类"
									:options="eventTypeSelectOptions"
								/>
							</a-form-item>
						</a-col>
					</a-row>

					<a-row :gutter="16">
						<a-col :span="12">
							<a-form-item
								label="举行时间"
								name="eventTime"
								:rules="[{ required: true, message: '请选择举行时间' }]"
							>
								<a-date-picker
									v-model:value="createForm.eventTime"
									value-format="YYYY-MM-DD"
									style="width: 100%"
									placeholder="请选择举行日期"
								/>
							</a-form-item>
						</a-col>
						<a-col :span="12">
							<a-form-item label="关联亲友" name="hostPersonId">
								<gift-person-picker
									v-model="createForm.hostPersonId"
									placeholder="选择或搜索关联亲友"
								/>
							</a-form-item>
						</a-col>
					</a-row>
				</a-form>
				<div class="panel-buttons">
					<a-button @click="showCreateForm = false">返回列表</a-button>
					<a-button type="primary" :loading="creating" @click="handleCreate">确定并选中</a-button>
				</div>
			</div>

			<!-- 事件选择面板 -->
			<div v-else class="selection-panel">
				<!-- 搜索与多维筛选栏 -->
				<div class="filter-toolbar">
					<a-input
						v-model:value="searchKey"
						placeholder="🔍 搜索事件名称、关联亲友..."
						allow-clear
						class="search-input"
						@change="debouncedSearch"
					/>
					<div class="filter-controls">
						<a-radio-group
							v-model:value="statusFilter"
							size="small"
							button-style="solid"
							@change="handleFilterChange"
						>
							<a-radio-button value="ALL">全部</a-radio-button>
							<a-radio-button value="UPCOMING">待发生</a-radio-button>
							<a-radio-button value="FINISHED">已结束</a-radio-button>
						</a-radio-group>
						<a-select
							v-model:value="categoryFilter"
							placeholder="全部分类"
							size="small"
							allow-clear
							style="width: 120px"
							:options="eventTypeFilterOptions"
							@change="handleFilterChange"
						/>
					</div>
				</div>

				<!-- 事件卡片列表区域 -->
				<a-spin :spinning="loading">
					<div class="events-scroll-wrap">
						<!-- 1. 最近使用分组 (仅在全部状态且无主动搜索过滤时展示) -->
						<template v-if="shouldShowRecentSection">
							<div class="group-title">
								<span>🕒 最近使用</span>
							</div>
							<div class="events-grid recent-grid">
								<div
									v-for="item in recentUsedEvents"
									:key="'recent-' + item.id"
									class="event-card"
									:class="{ active: isCurrentSelected(item) }"
									@click="handleCardClick(item)"
									@dblclick="handleCardDblClick(item)"
								>
									<div class="card-left-icon">
										{{ getEventIcon(item.eventType) }}
									</div>
									<div class="card-main">
										<div class="card-title-row">
											<strong class="event-title" :title="item.eventName">{{ item.eventName }}</strong>
											<span class="status-pill" :class="getStatusInfo(item).type">
												{{ getStatusInfo(item).label }}
											</span>
										</div>
										<div class="card-meta-row">
											<span class="category-badge">{{ getEventTypeLabel(item.eventType) }}</span>
											<span class="dot">·</span>
											<span class="time-badge">📅 {{ formatDate(item.eventTime) }}</span>
											<template v-if="item.hostPersonName">
												<span class="dot">·</span>
												<span class="host-badge">👤 {{ item.hostPersonName }}</span>
											</template>
										</div>
									</div>
									<div class="card-check-mark" v-if="isCurrentSelected(item)">
										<span>✓</span>
									</div>
								</div>
							</div>
							<div class="group-title" style="margin-top: 12px;">
								<span>📋 全部事件</span>
							</div>
						</template>

						<!-- 2. 全部事件列表 -->
						<div v-if="displayEventsList.length > 0" class="events-grid">
							<div
								v-for="item in displayEventsList"
								:key="item.id"
								class="event-card"
								:class="{ active: isCurrentSelected(item) }"
								@click="handleCardClick(item)"
								@dblclick="handleCardDblClick(item)"
							>
								<div class="card-left-icon">
									{{ getEventIcon(item.eventType) }}
								</div>
								<div class="card-main">
									<div class="card-title-row">
										<strong class="event-title" :title="item.eventName">{{ item.eventName }}</strong>
										<span class="status-pill" :class="getStatusInfo(item).type">
											{{ getStatusInfo(item).label }}
										</span>
									</div>
									<div class="card-meta-row">
										<span class="category-badge">{{ getEventTypeLabel(item.eventType) }}</span>
										<span class="dot">·</span>
										<span class="time-badge">📅 {{ formatDate(item.eventTime) }}</span>
										<template v-if="item.hostPersonName">
											<span class="dot">·</span>
											<span class="host-badge">👤 {{ item.hostPersonName }}</span>
										</template>
									</div>
								</div>
								<div class="card-check-mark" v-if="isCurrentSelected(item)">
									<span>✓</span>
								</div>
							</div>
						</div>

						<!-- 空状态 -->
						<div v-else class="empty-placeholder">
							<p>暂无符合条件的人情事件</p>
							<a-button type="link" size="small" @click="openCreatePanel">
								直接新建一个事件？
							</a-button>
						</div>
					</div>
				</a-spin>
			</div>
		</div>

		<!-- Modal Footer 统一结构 -->
		<template #footer>
			<div class="modal-footer-container">
				<div class="footer-left">
					<!-- 当数据大于 10 条展示分页，<= 10 条展示总数文案 -->
					<template v-if="total > pageSize">
						<a-pagination
							v-model:current="current"
							v-model:page-size="pageSize"
							:total="total"
							size="small"
							:show-size-changer="false"
							:show-total="(t) => `共 ${t} 个事件`"
							@change="handlePageChange"
						/>
					</template>
					<template v-else>
						<span class="total-text">共 {{ total }} 个事件</span>
					</template>
				</div>
				<div class="footer-right">
					<a-button @click="handleCancel">取消</a-button>
					<a-button
						type="primary"
						:disabled="!selectedEvent"
						@click="confirmSelection"
					>
						确认选择
					</a-button>
				</div>
			</div>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import type { FormInstance } from 'ant-design-vue';
import { formatDate } from '@/utils/dayjs';
import {
	getGiftEventBusinessPage,
	addGiftEvent,
	getGiftPersonList,
} from '@/views/finance/gift/api';
import type {
	GiftEventBusinessInfo,
	GiftEventInfo,
} from '@/views/finance/gift/config';
import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import GiftPersonPicker from '@/views/finance/gift/components/gift-person-picker/index.vue';

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
	selectedId?: string;
}>();

const emit = defineEmits<{
	(e: 'select', item: GiftEventInfo): void;
	(e: 'cancel'): void;
}>();

const { presetOptions, customOptions, loadEventTypeOptions } = useGiftEventTypeOptions();

const PRESET_ICONS: Record<string, string> = {
	WEDDING: '💍',
	婚礼: '💍',
	BIRTH: '👶',
	满月: '👶',
	HOUSEWARMING: '🏡',
	乔迁: '🏡',
	EDUCATION: '🎓',
	升学: '🎓',
	BIRTHDAY: '🎂',
	寿宴: '🎂',
	生日: '🎂',
	SPRING_FESTIVAL: '🏮',
	春节: '🏮',
	MID_AUTUMN: '🥮',
	中秋: '🥮',
	DRAGON_BOAT: '🎏',
	端午: '🎏',
	FUNERAL: '🕯️',
	白事: '🕯️',
	THANKS: '🙏',
	感谢: '🙏',
	VISIT: '🤝',
	拜访: '🤝',
	STUDY: '💬',
	考学: '💬',
	OTHER: '💬',
	其他: '💬',
};

const PRESET_NAMES: Record<string, string> = {
	WEDDING: '婚礼',
	BIRTH: '满月',
	HOUSEWARMING: '乔迁',
	EDUCATION: '升学',
	BIRTHDAY: '寿宴',
	SPRING_FESTIVAL: '春节',
	MID_AUTUMN: '中秋',
	DRAGON_BOAT: '端午',
	FUNERAL: '白事',
	THANKS: '感谢',
	VISIT: '拜访',
	STUDY: '考学',
	OTHER: '其他',
};

const loading = ref(false);
const creating = ref(false);
const showCreateForm = ref(false);
const searchKey = ref('');
const statusFilter = ref<'ALL' | 'UPCOMING' | 'FINISHED'>('ALL');
const categoryFilter = ref<string | undefined>(undefined);

const eventsList = ref<GiftEventBusinessInfo[]>([]);
const personMap = ref<Record<string, string>>({});
const selectedEvent = ref<GiftEventBusinessInfo | null>(null);

const total = ref(0);
const current = ref(1);
const pageSize = ref(10);
const formRef = ref<FormInstance>();

const createForm = ref<GiftEventInfo>({
	eventName: '',
	eventType: undefined,
	eventTime: undefined,
	hostPersonId: undefined,
});

// 加载联系人映射
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

// 分类图标映射
const getEventIcon = (type?: string) => {
	if (!type) return '📅';
	if (PRESET_ICONS[type]) return PRESET_ICONS[type];
	const all = [...presetOptions.value, ...customOptions.value];
	const found = all.find((p) => p.eventCode === type || p.name === type);
	if (found?.icon) return found.icon;
	if (found?.name && PRESET_ICONS[found.name]) return PRESET_ICONS[found.name];
	return '📅';
};

// 中文分类名称映射
const getEventTypeLabel = (type?: string) => {
	if (!type) return '其他';
	if (PRESET_NAMES[type]) return PRESET_NAMES[type];
	const all = [...presetOptions.value, ...customOptions.value];
	const found = all.find((p) => p.eventCode === type || p.name === type);
	return found ? found.name : type;
};

// 选项下拉
const eventTypeSelectOptions = computed(() => {
	const all = [...presetOptions.value, ...customOptions.value];
	return all.map((opt) => ({
		label: `${getEventIcon(opt.eventCode || opt.name)} ${opt.name}`,
		value: opt.name,
	}));
});

// 筛选下拉
const eventTypeFilterOptions = computed(() => {
	const all = [...presetOptions.value, ...customOptions.value];
	return all.map((opt) => ({
		label: `${getEventIcon(opt.eventCode || opt.name)} ${opt.name}`,
		value: opt.eventCode || opt.name,
	}));
});

// 状态计算
const getStatusInfo = (item: GiftEventBusinessInfo) => {
	const today = new Date().toISOString().slice(0, 10);
	const eventDay = item.eventTime ? item.eventTime.slice(0, 10) : '';
	if (item.eventStatus === 'FINISHED' || (eventDay && eventDay < today)) {
		return { label: '已结束', type: 'finished' };
	}
	if (item.eventStatus === 'UPCOMING' || (eventDay && eventDay > today)) {
		return { label: '待发生', type: 'upcoming' };
	}
	return { label: '进行中', type: 'ongoing' };
};

// 当前选中的判断
const isCurrentSelected = (item: GiftEventBusinessInfo) => {
	if (!item || !selectedEvent.value) return false;
	return String(selectedEvent.value.id) === String(item.id);
};

// 过滤后的事件列表（结合状态筛选与搜索）
const filteredEvents = computed(() => {
	let list = eventsList.value;
	const today = new Date().toISOString().slice(0, 10);
	if (statusFilter.value === 'UPCOMING') {
		list = list.filter((item) => {
			const day = item.eventTime ? item.eventTime.slice(0, 10) : '';
			return !day || day >= today;
		});
	} else if (statusFilter.value === 'FINISHED') {
		list = list.filter((item) => {
			const day = item.eventTime ? item.eventTime.slice(0, 10) : '';
			return Boolean(day && day < today);
		});
	}
	return list;
});

const shouldShowRecentSection = computed(() => {
	return (
		statusFilter.value === 'ALL' &&
		!categoryFilter.value &&
		!searchKey.value.trim() &&
		current.value === 1 &&
		filteredEvents.value.length > 1
	);
});

const recentUsedEvents = computed(() => {
	if (!shouldShowRecentSection.value) return [];
	return filteredEvents.value.slice(0, 1);
});

const displayEventsList = computed(() => {
	if (shouldShowRecentSection.value) {
		return filteredEvents.value.slice(1);
	}
	return filteredEvents.value;
});

// 加载事件列表
const loadEvents = async () => {
	loading.value = true;
	try {
		const queryParams: Record<string, any> = {
			keyword: searchKey.value.trim() || undefined,
			eventType: categoryFilter.value || undefined,
		};
		const today = new Date().toISOString().slice(0, 10);
		if (statusFilter.value === 'UPCOMING') {
			queryParams.eventTimeStart = `${today}T00:00:00`;
		} else if (statusFilter.value === 'FINISHED') {
			queryParams.eventTimeEnd = `${today}T23:59:59`;
		}

		const { code, data } = await getGiftEventBusinessPage(
			queryParams,
			current.value,
			pageSize.value,
		);
		if (code === '200' && data) {
			const list = data.records || [];
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
			eventsList.value = list;
			total.value = Number(data.total || 0);

			// 若有传入 selectedId，自动匹配选中项
			if (props.selectedId && !selectedEvent.value) {
				const matched = list.find(
					(x) => String(x.id) === String(props.selectedId),
				);
				if (matched) {
					selectedEvent.value = matched;
				}
			}
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const debouncedSearch = debounce(() => {
	current.value = 1;
	void loadEvents();
}, 300);

const handleFilterChange = () => {
	current.value = 1;
	void loadEvents();
};

const handlePageChange = (page: number) => {
	current.value = page;
	void loadEvents();
};

const handleCardClick = (item: GiftEventBusinessInfo) => {
	selectedEvent.value = item;
};

const handleCardDblClick = (item: GiftEventBusinessInfo) => {
	selectedEvent.value = item;
	confirmSelection();
};

const confirmSelection = () => {
	if (selectedEvent.value) {
		emit('select', selectedEvent.value as GiftEventInfo);
		open.value = false;
	}
};

const openCreatePanel = () => {
	createForm.value = {
		eventName: '',
		eventType: undefined,
		eventTime: new Date().toISOString().slice(0, 10),
		hostPersonId: undefined,
	};
	showCreateForm.value = true;
};

const handleCreate = async () => {
	if (!formRef.value) return;
	creating.value = true;
	try {
		await formRef.value.validateFields();

		let params: Record<string, any> = {
			eventName: createForm.value.eventName?.trim() || undefined,
			eventType: createForm.value.eventType || undefined,
			hostPersonId: createForm.value.hostPersonId || undefined,
		};
		if (createForm.value.eventTime) {
			const timeStr = createForm.value.eventTime;
			params.eventTime =
				timeStr.includes('T') ? timeStr : `${timeStr}T00:00:00`;
		}

		const { code, data, message: msg } = await addGiftEvent(
			params as GiftEventInfo,
		);
		if (code === '200' && data) {
			message.success('创建成功并已选中该事件');
			showCreateForm.value = false;
			emit('select', data);
			open.value = false;
		} else {
			message.error(msg || '创建失败');
		}
	} catch (e) {
		// validation failed
	} finally {
		creating.value = false;
	}
};

const handleCancel = () => {
	showCreateForm.value = false;
	emit('cancel');
	open.value = false;
};

watch(open, async (isOpen) => {
	if (isOpen) {
		showCreateForm.value = false;
		searchKey.value = '';
		statusFilter.value = 'ALL';
		categoryFilter.value = undefined;
		current.value = 1;
		selectedEvent.value = null;
		await Promise.all([loadPersons(), loadEventTypeOptions()]);
		void loadEvents();
	}
});
</script>

<style scoped lang="less">
.modal-custom-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 28px;

	.header-title {
		font-size: 16px;
		font-weight: 700;
		color: #101828;
	}

	.create-header-btn {
		font-weight: 500;
		border-radius: 6px;
	}
}

.event-selector-container {
	min-height: 320px;
	display: flex;
	flex-direction: column;
}

.create-form-panel {
	border: 1px solid #eaecf0;
	border-radius: 8px;
	padding: 16px 20px;
	background: #f8fafc;

	.panel-header {
		margin-bottom: 16px;

		.panel-title {
			margin: 0 0 2px;
			font-weight: 700;
			font-size: 15px;
			color: #1e293b;
		}

		.panel-subtitle {
			font-size: 12px;
			color: #64748b;
		}
	}

	.panel-buttons {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 12px;
	}
}

.filter-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 12px;

	.search-input {
		flex: 1;
		border-radius: 6px;
	}

	.filter-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}
}

.events-scroll-wrap {
	max-height: 360px;
	overflow-y: auto;
	padding-right: 4px;
	min-height: 200px;
}

.group-title {
	font-size: 12px;
	font-weight: 600;
	color: #64748b;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
}

.events-grid {
	display: flex;
	flex-direction: column;
	gap: 8px;

	&.recent-grid {
		margin-bottom: 4px;
	}
}

.event-card {
	display: flex;
	align-items: center;
	padding: 12px 14px;
	background: #ffffff;
	border: 1px solid #eaecf0;
	border-radius: 8px;
	cursor: pointer;
	position: relative;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		border-color: #93c5fd;
		background: #f8fafc;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.06);
	}

	&.active {
		border-color: #3b82f6;
		background: #eff6ff;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.card-left-icon {
		font-size: 24px;
		margin-right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: #f1f5f9;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.card-main {
		flex: 1;
		min-width: 0;

		.card-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 4px;
			padding-right: 28px;

			.event-title {
				font-size: 14px;
				font-weight: 700;
				color: #0f172a;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.status-pill {
				font-size: 11px;
				font-weight: 500;
				padding: 1px 8px;
				border-radius: 12px;
				flex-shrink: 0;

				&.upcoming {
					color: #15803d;
					background: #dcfce7;
					border: 1px solid #bbf7d0;
				}

				&.finished {
					color: #64748b;
					background: #f1f5f9;
					border: 1px solid #e2e8f0;
				}

				&.ongoing {
					color: #2563eb;
					background: #dbeafe;
					border: 1px solid #bfdbfe;
				}
			}
		}

		.card-meta-row {
			display: flex;
			align-items: center;
			font-size: 12px;
			color: #64748b;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			.category-badge {
				font-weight: 600;
				color: #475569;
			}

			.dot {
				margin: 0 6px;
				color: #cbd5e1;
			}

			.time-badge {
				color: #64748b;
			}

			.host-badge {
				color: #2563eb;
				font-weight: 500;
				background: #eff6ff;
				padding: 0 6px;
				border-radius: 4px;
			}
		}
	}

	.card-check-mark {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #3b82f6;
		color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 700;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
	}
}

.empty-placeholder {
	text-align: center;
	padding: 48px 0;
	color: #94a3b8;

	p {
		margin: 0 0 8px;
		font-size: 13px;
	}
}

.modal-footer-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;

	.footer-left {
		.total-text {
			font-size: 12.5px;
			color: #64748b;
		}
	}

	.footer-right {
		display: flex;
		gap: 8px;
	}
}
</style>
