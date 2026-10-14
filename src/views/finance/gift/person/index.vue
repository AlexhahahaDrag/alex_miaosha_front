<template>
	<div class="gift-screen">
		<header class="screen-header">
			<div>
				<h2>亲友与人情关系档案</h2>
				<p>管理常联系人情往来对象，多维度统计礼金净值与往来频次</p>
			</div>
			<a-button
				v-if="hasPermission('gift:add')"
				type="primary"
				size="middle"
				class="primary-action"
				@click="openDrawer()"
			>
				+ 新增联系人
			</a-button>
		</header>

		<section class="filter-panel">
			<a-form layout="inline" :model="searchInfo">
				<a-form-item label="姓名/称呼">
					<a-input
						v-model:value="searchInfo.personName"
						allow-clear
						placeholder="搜索姓名、电话或备注..."
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="关系类型">
					<a-select
						v-model:value="searchInfo.relationType"
						allow-clear
						placeholder="全部关系"
						class="filter-select"
					>
						<a-select-option
							v-for="opt in giftRelationOptions"
							:key="opt.value"
							:value="opt.value"
						>
							{{ opt.label }}
						</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="关系等级">
					<a-select
						v-model:value="searchInfo.relationGrade"
						allow-clear
						placeholder="全部等级"
						class="filter-select"
					>
						<a-select-option value="CORE">⭐ 核心亲友</a-select-option>
						<a-select-option value="IMPORTANT">重要亲友</a-select-option>
						<a-select-option value="NORMAL">普通往来</a-select-option>
						<a-select-option value="WEAK">泛泛之交</a-select-option>
					</a-select>
				</a-form-item>
				<a-form-item label="人情差额">
					<a-select
						v-model:value="searchInfo.scope"
						allow-clear
						placeholder="全部状态"
						:options="giftPersonScopeOptions"
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

		<!-- 亲友看板统计解耦子组件 -->
		<gift-person-summary-cards
			:summary="summary"
			:loading="summaryLoading"
		/>

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
						<span class="relation-type-text">{{
							relationLabel(record.relationType)
						}}</span>
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
							<div class="time-text">
								{{ formatDate(record.latestRecordTime) }}
							</div>
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { debounce } from 'lodash-es';
import { message } from 'ant-design-vue';
import { formatDate } from '@/utils/dayjs';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
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

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (page) => loadPage(page),
	});
const loading = ref<boolean>(false);
const summaryLoading = ref<boolean>(false);
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
const recordDrawerOpen = ref<boolean>(false);
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
			queryParams.relationType = resolveFilterRelationType(
				queryParams.relationType,
			);
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

function openQuickLog(record: GiftPersonBusinessInfo) {
	editingRecord.value = {
		direction: 'RECEIVE',
		giverPersonId: record.id ? String(record.id) : undefined,
	};
	recordDrawerOpen.value = true;
}

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
	background: #f8fafc;
	color: #0f172a;
}

.screen-header,
.panel-head {
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

.table-panel {
	padding: 0 20px 18px;
}

.panel-head {
	padding: 16px 0 14px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
		color: #0f172a;
	}
}

.person-cell {
	display: flex;
	align-items: center;
	gap: 12px;

	strong {
		color: #0f172a;
		font-weight: 700;
	}

	p {
		margin: 2px 0 0;
		color: #64748b;
		font-size: 12px;
	}
}

.avatar-dot {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	overflow: hidden;
	background: #f1f5f9;
	color: #334155;
	font-weight: 800;
	font-size: 14px;
	flex-shrink: 0;
	border: 1px solid #e2e8f0;
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
</style>
