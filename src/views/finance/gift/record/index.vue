<template>
	<div class="gift-screen">
		<div class="screen-header">
			<div>
				<h2>礼金记录</h2>
				<p>集中记录随礼、收礼、回礼，按人员、事由和金额快速筛选。</p>
			</div>
			<a-space>
				<a-button v-if="hasPermission('gift:export')">Excel导出</a-button>
				<a-button
					v-if="hasPermission('gift:add')"
					type="primary"
					class="primary-action"
					@click="openDrawer()"
				>
					+ 快速记礼
				</a-button>
			</a-space>
		</div>

		<section class="filter-panel">
			<a-form :model="searchInfo" layout="inline">
				<a-form-item label="关键词">
					<a-input
						v-model:value="searchInfo.keyword"
						placeholder="姓名、事由或备注"
						allow-clear
						class="filter-input"
					/>
				</a-form-item>
				<a-form-item label="礼金方向">
					<a-select
						v-model:value="searchInfo.direction"
						:options="giftDirectionOptions"
						allow-clear
						class="filter-select"
					/>
				</a-form-item>
				<a-form-item label="快捷方向">
					<a-space>
						<a-tag
							v-for="item in giftDirectionOptions"
							:key="item.value"
							class="quick-tag"
							:color="searchInfo.direction === item.value ? 'blue' : 'default'"
							@click="selectDirection(item.value)"
						>
							{{ item.label }}
						</a-tag>
					</a-space>
				</a-form-item>
				<a-form-item label="金额区间">
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
				<a-form-item v-if="searchExpanded" label="时间范围">
					<a-range-picker
						v-model:value="payRange"
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

		<div class="metric-grid">
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>筛选内收礼</span>
					<i>↗</i>
				</div>
				<strong>{{ money(summary.receiveAmount) }}</strong>
				<p>收入类礼金记录合计</p>
			</div>
			<div class="metric-card metric-card-red">
				<div class="metric-top">
					<span>筛选内随礼</span>
					<i>↘</i>
				</div>
				<strong>{{ money(summary.giveAmount) }}</strong>
				<p>支出类随礼记录合计</p>
			</div>
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>人情净值</span>
					<i>□</i>
				</div>
				<strong>{{ money(summary.netAmount) }}</strong>
				<p>收礼减随礼与回礼</p>
			</div>
			<div class="metric-card metric-card-gold">
				<div class="metric-top">
					<span>记录数量</span>
					<i>#</i>
				</div>
				<strong>{{ summary.recordCount || 0 }} 笔</strong>
				<p>当前筛选条件内记录</p>
			</div>
		</div>

		<section class="table-panel">
			<div class="panel-head">
				<h3>礼金记录</h3>
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
				:scroll="{ x: 'max-content' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'direction'">
						<a-tag :color="directionColor(record.direction)">
							{{ directionLabel(record.direction) }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'personName'">
						<div class="record-person-cell">
							<span class="record-avatar">{{
								firstName(
									record.personName ||
										record.giverPersonName ||
										record.receiverPersonName,
								)
							}}</span>
							<div class="record-person">
								<strong>{{
									record.personName ||
									record.giverPersonName ||
									record.receiverPersonName ||
									'-'
								}}</strong>
								<p>{{ record.handlerName || '系统记录' }}</p>
							</div>
						</div>
					</template>
					<template v-else-if="column.key === 'eventName'">
						{{ record.eventName || record.eventId || '-' }}
					</template>
					<template v-else-if="column.key === 'amount'">
						<span
							:class="record.direction === 'RECEIVE' ? 'income' : 'expense'"
						>
							{{ record.direction === 'RECEIVE' ? '+' : '-'
							}}{{ money(record.amount) }}
						</span>
					</template>
					<template v-else-if="column.key === 'paymentMethod'">
						{{
							record.paymentMethod && record.paymentMethod !== '-' ?
								record.paymentMethod
							:	'未记录'
						}}
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
							<a-button
								v-if="hasPermission('gift:edit')"
								size="small"
								type="link"
								@click="openDrawer(record)"
							>
								编辑
							</a-button>
							<a-button
								v-if="
									hasPermission('gift:view') &&
									record.direction === 'RECEIVE' &&
									record.returnedFlag !== 1
								"
								size="small"
								type="link"
								@click="showPending(record.id)"
							>
								待回礼
							</a-button>
							<a-button
								v-if="
									hasPermission('gift:edit') &&
									record.direction === 'RECEIVE' &&
									record.returnedFlag !== 1
								"
								size="small"
								type="link"
								@click="markReturned(record.id)"
							>
								标记已回
							</a-button>
							<a-popconfirm
								v-if="hasPermission('gift:delete')"
								title="确认删除该礼金记录?"
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
			:title="formInfo.id ? '编辑礼金记录' : '快速记礼'"
			width="520"
		>
			<a-form :model="formInfo" layout="vertical">
				<a-form-item label="方向" required>
					<a-segmented
						v-model:value="formInfo.direction"
						:options="giftDirectionOptions"
						block
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
					<a-input v-model:value="formInfo.eventId" />
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
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	addGiftRecord,
	deleteGiftRecord,
	getGiftRecordPage,
	getGiftRecordSummary,
	getPendingReturnAmount,
	markGiftReturned,
	updateGiftRecord,
} from '@/views/finance/gift/api';
import type {
	GiftRecordInfo,
	GiftRecordQuery,
	GiftRecordSummary,
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
const { hasPermission } = usePermission();
const saving = ref(false);
const drawerOpen = ref(false);
const searchExpanded = ref(false);
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftRecordQuery>({});
const formInfo = ref<GiftRecordInfo>({});
const dataSource = ref<GiftRecordInfo[]>([]);
const summary = ref<GiftRecordSummary>({});
const payRange = ref<[string, string] | undefined>();

watch(payRange, (value) => {
	searchInfo.value.payTimeStart = value?.[0];
	searchInfo.value.payTimeEnd = value?.[1];
});

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const selectDirection = (value: string) => {
	searchInfo.value.direction =
		searchInfo.value.direction === value ?
			undefined
		:	(value as GiftRecordQuery['direction']);
	query(true);
};

const columns = [
	{ title: '日期', dataIndex: 'payTime', key: 'payTime', width: 180 },
	{ title: '姓名', dataIndex: 'personName', key: 'personName', width: 150 },
	{ title: '关系', dataIndex: 'relationType', key: 'relationType', width: 100 },
	{ title: '事由', dataIndex: 'eventName', key: 'eventName', width: 160 },
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
		width: 120,
		sorter: true,
	},
	{ title: '类型', dataIndex: 'direction', key: 'direction', width: 100 },
	{
		title: '支付方式',
		dataIndex: 'paymentMethod',
		key: 'paymentMethod',
		width: 120,
	},
	{
		title: '回礼状态',
		dataIndex: 'returnedFlag',
		key: 'returnedFlag',
		width: 120,
	},
	{ title: '备注', dataIndex: 'remark', key: 'remark', width: 180 },
	{ title: '操作', key: 'operation', width: 260 },
];

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadSummary();
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

const loadSummary = async () => {
	const {
		code,
		data,
		message: msg,
	} = await getGiftRecordSummary(searchInfo.value);
	if (code === '200') {
		summary.value = data || {};
	} else {
		message.error(msg || '礼金汇总加载失败');
	}
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

const remove = async (id: string) => {
	const { code, message: msg } = await deleteGiftRecord(id);
	if (code === '200') {
		message.success('删除成功');
		query(true);
	} else {
		message.error(msg || '删除失败');
	}
};

const showPending = async (id: string) => {
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

const markReturned = async (id: string) => {
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
	width: 140px;
}

.quick-tag {
	padding: 2px 10px;
	border-radius: 4px;
	cursor: pointer;
}

.range-split {
	margin: 0 8px;
	color: #8c8c8c;
}

.metric-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
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

.metric-card-green strong,
.metric-card-green i,
.income {
	color: #14803c;
}

.metric-card-green i {
	background: #ddf6df;
}

.metric-card-red strong,
.metric-card-red i,
.expense {
	color: #d92d20;
}

.metric-card-red i {
	background: #ffe7e7;
}

.metric-card-blue strong,
.metric-card-blue i {
	color: #1478d4;
}

.metric-card-blue i {
	background: #dcecff;
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

.record-person-cell {
	display: flex;
	align-items: center;
	gap: 10px;
}

.record-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	background: #e9f2ff;
	border-radius: 50%;
	color: #1478d4;
	font-weight: 800;
}

.record-person {
	strong {
		color: #101828;
	}

	p {
		margin: 2px 0 0;
		color: #98a2b3;
		font-size: 12px;
	}
}

.income,
.expense {
	font-weight: 800;
}
</style>
