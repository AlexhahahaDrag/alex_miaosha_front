<template>
	<div class="gift-screen">
		<div class="screen-header">
			<div>
				<h2>亲友管理</h2>
				<p>记录亲友档案与每一段礼尚往来，快速查看人情余额。</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				class="primary-action"
				@click="openDrawer()"
			>
				+ 添加联系人
			</a-button>
		</div>

		<section class="filter-panel">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="姓名查询">
					<a-input
						v-model:value="searchInfo.keyword"
						placeholder="搜索姓名或手机号"
						allow-clear
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="关系类别">
					<a-select
						v-model:value="searchInfo.relationType"
						:options="giftRelationOptions"
						placeholder="全部关系"
						allow-clear
						class="filter-select"
					/>
				</a-form-item>
				<a-form-item label="关系等级">
					<a-select
						v-model:value="searchInfo.relationGrade"
						placeholder="全部等级"
						allow-clear
						class="filter-select"
						@change="query(true)"
					>
						<a-select-option value="CORE">⭐ 核心关系</a-select-option>
						<a-select-option value="IMPORTANT">🟢 重要关系</a-select-option>
						<a-select-option value="NORMAL">🔵 普通关系</a-select-option>
						<a-select-option value="WEAK">⚪ 弱关系</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="关系状态">
					<a-select
						v-model:value="searchInfo.relationStatus"
						placeholder="全部状态"
						allow-clear
						class="filter-select"
						@change="query(true)"
					>
						<a-select-option value="ACTIVE">🟢 活跃</a-select-option>
						<a-select-option value="GENERAL">🟡 一般</a-select-option>
						<a-select-option value="DISTANT">🔴 疏远</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="人员范围">
					<a-select
						v-model:value="searchInfo.personScope"
						:options="giftPersonScopeOptions"
						placeholder="全部人员"
						allow-clear
						class="filter-select"
						data-testid="gift-person-filter-scope"
						@change="query(true)"
					/>
				</a-form-item>
				<a-form-item>
					<a-space>
						<a-button @click="resetQuery">重置</a-button>
						<a-button type="primary" @click="query(true)">查询结果</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</section>

		<a-spin :spinning="summaryLoading">
			<div class="person-summary-grid">
				<div class="metric-card metric-card-blue">
					<div class="metric-top">
						<span>关系总数</span>
						<span class="card-icon">👥</span>
					</div>
					<strong>{{ summary.personCount || 0 }} 人</strong>
					<p>常联系关系网络</p>
				</div>
				<div
					class="metric-card"
					:class="
						summary.netAmount && summary.netAmount >= 0 ?
							'metric-card-green'
						:	'metric-card-gray'
					"
				>
					<div class="metric-top">
						<span>人情净值</span>
						<span class="card-icon">💰</span>
					</div>
					<strong v-if="summary.netAmount && summary.netAmount >= 0"
						>+{{ money(summary.netAmount) }}</strong
					>
					<strong v-else>{{ money(summary.netAmount) }}</strong>
					<p>累计收礼与送礼差值</p>
				</div>
				<div class="metric-card metric-card-gold">
					<div class="metric-top">
						<span>近期活跃关系</span>
						<span class="card-icon">🔥</span>
					</div>
					<strong>{{ summary.activeCount || 0 }} 人</strong>
					<p>90天内有往来互动</p>
				</div>
				<div class="metric-card metric-card-red">
					<div class="metric-top">
						<span>待维护关系</span>
						<span class="card-icon">⚠️</span>
					</div>
					<strong>{{ summary.pendingMaintenanceCount || 0 }} 人</strong>
					<p>超过半年无互动往来</p>
				</div>
			</div>
		</a-spin>

		<section class="table-panel">
			<div class="panel-head">
				<h3>联系人档案</h3>
				<a-space>
					<a-button v-if="hasPermission('gift:export')">导出数据</a-button>
					<a-radio-group v-model:value="tableSize" size="small">
						<a-radio-button value="small">紧凑</a-radio-button>
						<a-radio-button value="middle">默认</a-radio-button>
					</a-radio-group>
				</a-space>
			</div>
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
					<template v-if="column.key === 'personName'">
						<div class="person-cell">
							<span
								class="avatar-dot"
								:class="getAvatarClass(record.relationGrade)"
							>
								<img
									v-if="personAvatarSrc(record)"
									class="avatar-dot__img"
									:src="personAvatarSrc(record)"
									alt=""
								/>
								<template v-else>{{ firstName(record.personName) }}</template>
							</span>
							<div>
								<div class="name-row">
									<strong>{{ record.personName || '-' }}</strong>
								</div>
								<p>{{ record.remark || '暂无备注' }}</p>
							</div>
						</div>
					</template>
					<template v-else-if="column.key === 'relationType'">
						<span class="relation-type-text">{{ relationLabel(record.relationType) }}</span>
					</template>
					<template v-else-if="column.key === 'relationGrade'">
						<a-tag
							:color="getGradeColor(record.relationGrade)"
							class="table-grade-tag"
						>
							{{ getGradeLabel(record.relationGrade) }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'transactions'">
						<div class="transactions-cell">
							<div class="amounts-row">
								<span class="amount-in"
									>收: {{ money(record.totalReceiveAmount) }}</span
								>
								<span class="divider">|</span>
								<span class="amount-out"
									>送: {{ money(record.totalGiveAmount) }}</span
								>
							</div>
							<div
								class="net-row"
								:class="record.netAmount >= 0 ? 'net-positive' : 'net-negative'"
							>
								人情余额: {{ record.netAmount >= 0 ? '+' : ''
								}}{{ money(record.netAmount) }}
							</div>
						</div>
					</template>
					<template v-else-if="column.key === 'latestRecordTime'">
						<div v-if="record.latestRecordTime">
							<div class="time-text">{{ formatDate(record.latestRecordTime) }}</div>
							<a-tag
								size="small"
								:color="
									record.latestDirection === 'RECEIVE' ? 'blue' : 'orange'
								"
							>
								{{ directionLabel(record.latestDirection) }} ({{
									record.latestEventName || '人情往来'
								}})
							</a-tag>
						</div>
						<div v-else class="text-muted">暂无互动记录</div>
					</template>
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<template v-for="act in getDirectActions(record)" :key="act.key">
								<a-popconfirm
									v-if="act.confirm"
									:title="act.confirmTitle"
									@confirm="act.action"
								>
									<a-button size="small" type="link" :danger="act.danger">
										{{ act.label }}
									</a-button>
								</a-popconfirm>
								<a-button
									v-else
									size="small"
									type="link"
									:danger="act.danger"
									@click="act.action"
								>
									{{ act.label }}
								</a-button>
							</template>
							<a-dropdown v-if="getMoreActions(record).length > 0">
								<template #overlay>
									<a-menu>
										<a-menu-item
											v-for="act in getMoreActions(record)"
											:key="act.key"
											:danger="act.danger"
										>
											<a-popconfirm
												v-if="act.confirm"
												:title="act.confirmTitle"
												@confirm="act.action"
											>
												<span>{{ act.label }}</span>
											</a-popconfirm>
											<span v-else @click="act.action">{{ act.label }}</span>
										</a-menu-item>
									</a-menu>
								</template>
								<a-button size="small" type="link">更多 ▾</a-button>
							</a-dropdown>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

		<gift-person-detail
			v-model:model-info="modelInfo"
			@success="handleSuccess"
		/>

		<gift-record-form-drawer
			v-model:open="recordDrawerOpen"
			:record="editingRecord"
			@success="handleRecordSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash-es';
import { message } from 'ant-design-vue';
import { formatDate } from '@/utils/dayjs';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	deleteGiftPerson,
	getGiftPersonBusinessPage,
	getGiftPersonSummary,
} from '@/views/finance/gift/api';
import type {
	GiftPersonBusinessInfo,
	GiftPersonInfo,
	GiftPersonQuery,
	GiftPersonSummary,
	GiftRecordInfo,
} from '@/views/finance/gift/config';
import {
	directionLabel,
	giftPersonScopeOptions,
	money,
	personAvatarSrc,
} from '@/views/finance/gift/config';

const {
	giftRelationOptions,
	loadRelationOptions,
	relationLabel,
	resolveFilterRelationType,
} = useGiftRelationOptions();

const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const loading = ref(false);
const summaryLoading = ref(false);
const { hasPermission } = usePermission();
const modelInfo = ref<{
	id?: string;
	open?: boolean;
	title?: string;
	width?: string;
	mode?: 'form' | 'profile';
}>({});
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftPersonQuery>({});
const summary = ref<GiftPersonSummary>({});
const dataSource = ref<GiftPersonBusinessInfo[]>([]);

// 快速记录往来相关 Refs
const recordDrawerOpen = ref(false);
const editingRecord = ref<GiftRecordInfo | undefined>(undefined);

const handleRecordSuccess = () => {
	query();
};

const columns = [
	{ title: '联系人', key: 'personName', width: 220 },
	{ title: '关系', key: 'relationType', width: 120 },
	{ title: '关系等级', key: 'relationGrade', width: 130 },
	{ title: '人情往来', key: 'transactions', width: 280 },
	{ title: '最近互动', key: 'latestRecordTime', width: 220 },
	{ title: '操作', key: 'operation', width: 260, fixed: 'right' as const },
];

interface PersonAction {
	key: string;
	label: string;
	danger?: boolean;
	confirm?: boolean;
	confirmTitle?: string;
	action: () => void;
}

const getRowActions = (record: GiftPersonBusinessInfo): PersonAction[] => {
	const actions: PersonAction[] = [];
	if (hasPermission('gift:view')) {
		actions.push({
			key: 'profile',
			label: '查看关系',
			action: () => openProfile(record),
		});
	}
	if (hasPermission('gift:add')) {
		actions.push({
			key: 'quickLog',
			label: '快捷记单',
			action: () => openQuickLog(record),
		});
	}
	if (hasPermission('gift:edit')) {
		actions.push({
			key: 'edit',
			label: '编辑资料',
			action: () => openDrawer(record),
		});
	}
	if (hasPermission('gift:delete')) {
		actions.push({
			key: 'delete',
			label: '删除',
			danger: true,
			confirm: true,
			confirmTitle: '确认删除该联系人档案吗?',
			action: () => record.id && remove(record.id),
		});
	}
	return actions;
};

const getDirectActions = (record: GiftPersonBusinessInfo): PersonAction[] => {
	const actions = getRowActions(record);
	return actions.length > 3 ? actions.slice(0, 2) : actions;
};

const getMoreActions = (record: GiftPersonBusinessInfo): PersonAction[] => {
	const actions = getRowActions(record);
	return actions.length > 3 ? actions.slice(2) : [];
};

const firstName = (value?: string) => value?.slice(0, 1) || '-';

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

onUnmounted(() => {
	debouncedQuery.cancel();
});

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadSummary();
	loadPage(pagination);
};

const resetQuery = () => {
	searchInfo.value = {};
};

const handleTableChange = (page: PageInfo) => {
	paginationChange(page);
	loadPage(page);
};

const loadSummary = async () => {
	summaryLoading.value = true;
	try {
		const { code, data } = await getGiftPersonSummary();
		if (code === '200') summary.value = data || {};
	} finally {
		summaryLoading.value = false;
	}
};

const loadPage = async (page: PageInfo) => {
	loading.value = true;
	try {
		const queryParams = { ...searchInfo.value };
		if (queryParams.relationType) {
			queryParams.relationType = resolveFilterRelationType(queryParams.relationType);
		}
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonBusinessPage(
			queryParams,
			page.current,
			page.pageSize,
		);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(msg || '亲友列表加载失败');
		}
	} finally {
		loading.value = false;
	}
};

const openDrawer = (record?: GiftPersonInfo) => {
	modelInfo.value = {
		open: true,
		mode: 'form',
		title: record?.id ? '编辑联系人' : '新增联系人',
		width: '460px',
		id: record?.id,
	};
};

const handleSuccess = () => {
	query();
};

const openProfile = (record: GiftPersonBusinessInfo) => {
	if (!record.id) return;
	modelInfo.value = {
		open: true,
		mode: 'profile',
		title: '联系人详情',
		width: '420px',
		id: record.id,
	};
};

const remove = async (id: string) => {
	const { code, message: msg } = await deleteGiftPerson(id);
	if (code === '200') {
		message.success('删除成功');
		query(true);
	} else {
		message.error(msg || '删除失败');
	}
};

const route = useRoute();

// 快速记录往来逻辑
function openQuickLog(record: GiftPersonBusinessInfo) {
	editingRecord.value = {
		direction: 'RECEIVE',
		giverPersonId: record.id ? String(record.id) : undefined,
	};
	recordDrawerOpen.value = true;
}

// 关系分级和活跃度逻辑辅助函数
const getAvatarClass = (grade?: string) => {
	switch (grade) {
		case 'CORE':
			return 'avatar-core';
		case 'IMPORTANT':
			return 'avatar-important';
		case 'NORMAL':
			return 'avatar-normal';
		case 'WEAK':
			return 'avatar-weak';
		default:
			return '';
	}
};

const getGradeLabel = (grade?: string) => {
	switch (grade) {
		case 'CORE':
			return '⭐ 核心';
		case 'IMPORTANT':
			return '重要';
		case 'NORMAL':
			return '普通';
		case 'WEAK':
			return '弱关系';
		default:
			return '普通';
	}
};

const getGradeColor = (grade?: string) => {
	switch (grade) {
		case 'CORE':
			return 'gold';
		case 'IMPORTANT':
			return 'green';
		case 'NORMAL':
			return 'blue';
		case 'WEAK':
			return 'default';
		default:
			return 'blue';
	}
};

const getStatusLabel = (status?: string) => {
	switch (status) {
		case 'ACTIVE':
			return '活跃';
		case 'GENERAL':
			return '一般';
		case 'DISTANT':
			return '疏远';
		default:
			return '一般';
	}
};

const getStatusBadgeType = (status?: string) => {
	switch (status) {
		case 'ACTIVE':
			return 'success';
		case 'GENERAL':
			return 'warning';
		case 'DISTANT':
			return 'error';
		default:
			return 'warning';
	}
};

onMounted(async () => {
	loadRelationOptions();
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
.metric-top {
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

.person-summary-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14px;
	margin-bottom: 16px;
}

.metric-card {
	min-height: 116px;
	padding: 18px;

	span {
		color: #344054;
		font-size: 13px;
		font-weight: 700;
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

.card-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border-radius: 6px;
	font-size: 16px;
}

.metric-card-blue strong,
.metric-card-blue .card-icon {
	color: #1478d4;
}

.metric-card-blue .card-icon {
	background: #dcecff;
}

.metric-card-green strong,
.metric-card-green .card-icon {
	color: #14803c;
}

.metric-card-green .card-icon {
	background: #ddf6df;
}

.metric-card-red strong,
.metric-card-red .card-icon {
	color: #d92d20;
}

.metric-card-red .card-icon {
	background: #ffe7e7;
}

.metric-card-gold strong,
.metric-card-gold .card-icon {
	color: #9a6712;
}

.metric-card-gold .card-icon {
	background: #f5ead5;
}

.metric-card-gray strong,
.metric-card-gray .card-icon {
	color: #64748b;
}

.metric-card-gray .card-icon {
	background: #f1f5f9;
}

.quick-tag {
	padding: 2px 10px;
	border-radius: 4px;
	cursor: pointer;
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

.person-cell {
	display: flex;
	align-items: center;
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

.avatar-dot {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	overflow: hidden;
	background: #e2e8f0;
	color: #475569;
	font-weight: 800;
	font-size: 13px;
	flex-shrink: 0;
}

.avatar-dot__img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.avatar-core {
	background: #fef3c7;
	color: #b45309;
	border: 1px solid #fde68a;
}

.avatar-important {
	background: #dcfce7;
	color: #15803d;
	border: 1px solid #bbf7d0;
}

.avatar-normal {
	background: #dbeafe;
	color: #1d4ed8;
	border: 1px solid #bfdbfe;
}

.avatar-weak {
	background: #f1f5f9;
	color: #64748b;
	border: 1px solid #e2e8f0;
}

.name-row {
	display: flex;
	align-items: center;
	gap: 6px;
}

.grade-tag {
	font-size: 11px;
	padding: 0 4px;
	line-height: 1.5;
}

.transactions-cell {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.amounts-row {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	color: #475569;
}

.divider {
	color: #cbd5e1;
}

.net-row {
	font-size: 13px;
	font-weight: 700;
}

.net-positive {
	color: #15803d;
}

.net-negative {
	color: #64748b;
}

.time-text {
	font-size: 12px;
	color: #334155;
	margin-bottom: 2px;
}

.text-muted {
	color: #94a3b8;
	font-style: italic;
	font-size: 12px;
}

.amount-in {
	color: #389e0d;
	font-weight: 700;
}

.amount-out {
	color: #cf1322;
	font-weight: 700;
}

.quick-amounts {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 10px;
}

.quick-amount-tag {
	cursor: pointer;
}

.quick-event-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 8px;
}

.quick-event-tag {
	cursor: pointer;
	user-select: none;
	padding: 4px 10px;
	border-radius: 4px;
	font-size: 13px;
	transition: all 0.2s;

	&:hover {
		opacity: 0.85;
	}

	&.more-tag {
		background: #f5f5f5;
		border: 1px dashed #d9d9d9;
		color: #555;
	}
}

.selected-reason-display {
	margin-top: 8px;
	font-size: 13px;
	background: #f0f5ff;
	padding: 6px 12px;
	border-radius: 4px;
	display: inline-block;
}

.more-events-popover {
	max-height: 320px;
	overflow-y: auto;
	padding: 4px;
}

.categorized-groups {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.category-group {
	.group-title {
		font-weight: 800;
		color: #666;
		font-size: 12px;
		margin-bottom: 6px;
	}

	.group-items {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.popover-tag {
		cursor: pointer;
		margin: 0;
	}
}

.search-results {
	display: flex;
	flex-direction: column;
	gap: 6px;
	max-height: 200px;
	overflow-y: auto;

	.search-item {
		padding: 6px 12px;
		cursor: pointer;
		border-radius: 4px;
		transition: background 0.2s;

		&:hover {
			background: #f5f5f5;
		}
	}

	.no-result {
		color: #999;
		text-align: center;
		padding: 12px 0;
	}
}

.recommend-amount-tip {
	font-size: 12px;
	color: #666;
	margin-bottom: 6px;
}
</style>
