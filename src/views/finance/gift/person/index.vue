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
				<a-form-item label="标签筛选">
					<a-space>
						<a-tag
							v-for="item in quickRelations"
							:key="item.id"
							class="quick-tag"
							:color="
								searchInfo.relationType === resolveFilterRelationType(item.id) ?
									'blue'
								:	'default'
							"
							@click="selectRelation(item.id)"
						>
							{{ item.name }}
						</a-tag>
					</a-space>
				</a-form-item>
				<a-form-item>
					<a-space>
						<a-button @click="resetQuery">重置</a-button>
						<a-button type="primary" @click="query(true)">查询结果</a-button>
					</a-space>
				</a-form-item>
			</a-form>
		</section>

		<div class="person-summary-grid">
			<div class="metric-card metric-card-blue">
				<div class="metric-top">
					<span>总联系人</span>
					<i>人</i>
				</div>
				<strong>{{ summary.personCount || 0 }} 位</strong>
				<p>常联系亲友档案</p>
			</div>
			<div class="metric-card metric-card-green">
				<div class="metric-top">
					<span>年度往来总额</span>
					<i>￥</i>
				</div>
				<strong>{{ money(summary.yearTotalAmount) }}</strong>
				<p>较去年保持稳定</p>
			</div>
			<div class="reminder-card">
				<div>
					<span>近期重要活动提醒</span>
					<strong>下周内有婚礼、乔迁</strong>
					<p>
						待回礼金额
						{{ money(summary.pendingReturnAmount) }}，建议优先处理高金额联系人。
					</p>
				</div>
				<i>!</i>
			</div>
		</div>

		<section class="table-panel">
			<div class="panel-head">
				<h3>亲友列表</h3>
				<a-space>
					<a-button v-if="hasPermission('gift:export')">导出数据</a-button>
					<a-button v-if="hasPermission('gift:edit')">批量标签</a-button>
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
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'personName'">
						<div class="person-cell">
							<span class="avatar-dot">{{ firstName(record.personName) }}</span>
							<div>
								<strong>{{ record.personName || '-' }}</strong>
								<p>{{ record.remark || '重点维护联系人' }}</p>
							</div>
						</div>
					</template>
					<template v-else-if="column.key === 'relationType'">
						<a-tag color="blue">{{ relationLabel(record.relationType) }}</a-tag>
					</template>
					<template v-else-if="column.key === 'totalGiveAmount'">
						<span class="amount-out">{{ money(record.totalGiveAmount) }}</span>
					</template>
					<template v-else-if="column.key === 'totalReceiveAmount'">
						<span class="amount-in">{{
							money(record.totalReceiveAmount)
						}}</span>
					</template>
					<template v-else-if="column.key === 'latestRecordTime'">
						<div>{{ record.latestRecordTime || '-' }}</div>
						<a-tag v-if="record.latestDirection" size="small">
							{{ directionLabel(record.latestDirection) }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'operation'">
						<a-space>
							<a-button
								v-if="hasPermission('gift:view')"
								size="small"
								type="link"
								@click="openProfile(record)"
							>
								详情
							</a-button>
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
								title="确认删除?"
								@confirm="remove(record.id)"
							>
								<a-button size="small" type="link" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

		<gift-person-detail
			v-model:model-info="modelInfo"
			@success="handleSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
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
} from '@/views/finance/gift/config';
import { directionLabel, money } from '@/views/finance/gift/config';

const {
	giftRelationOptions,
	quickRelations,
	relationLabel,
	loadRelationOptions,
	resolveFilterRelationType,
} = useGiftRelationOptions();

const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();
const loading = ref(false);
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

const columns = [
	{ title: '联系人姓名', dataIndex: 'personName', key: 'personName' },
	{ title: '关系', dataIndex: 'relationType', key: 'relationType', width: 110 },
	{ title: '联系方式', dataIndex: 'phone', key: 'phone', width: 150 },
	{ title: '累计支出', dataIndex: 'totalGiveAmount', key: 'totalGiveAmount' },
	{
		title: '累计收入',
		dataIndex: 'totalReceiveAmount',
		key: 'totalReceiveAmount',
	},
	{ title: '最后往来', dataIndex: 'latestRecordTime', key: 'latestRecordTime' },
	{ title: '操作', key: 'operation', width: 180 },
];

const firstName = (value?: string) => value?.slice(0, 1) || '-';

const selectRelation = (presetId: string) => {
	const relationType = resolveFilterRelationType(presetId);
	searchInfo.value.relationType =
		searchInfo.value.relationType === relationType ? undefined : relationType;
	query(true);
};

const query = (resetPage = false) => {
	if (resetPage) resetPagination();
	loadSummary();
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

const loadSummary = async () => {
	const { code, data } = await getGiftPersonSummary();
	if (code === '200') summary.value = data || {};
};

const loadPage = async (page: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: msg,
		} = await getGiftPersonBusinessPage(
			searchInfo.value,
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

onMounted(async () => {
	await loadRelationOptions();
	query(true);
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
	grid-template-columns: 1fr 1fr 2.2fr;
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
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 6px;
		font-style: normal;
		font-weight: 800;
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

.metric-card-red strong,
.metric-card-red i {
	color: #d92d20;
}

.metric-card-red i {
	background: #ffe7e7;
}

.metric-card-gold strong,
.metric-card-gold i {
	color: #9a6712;
}

.metric-card-gold i {
	background: #f5ead5;
}

.quick-tag {
	padding: 2px 10px;
	border-radius: 4px;
	cursor: pointer;
}

.reminder-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 116px;
	padding: 18px 22px;
	overflow: hidden;
	color: #fff;
	background:
		linear-gradient(110deg, #006bb6 0%, #006bb6 70%, #087fd0 70%),
		linear-gradient(135deg, #006bb6, #0a82cf);
	border-radius: 7px;
	box-shadow: 0 7px 18px rgba(0, 91, 170, 0.18);

	span {
		font-size: 13px;
		font-weight: 700;
		opacity: 0.88;
	}

	strong {
		display: block;
		margin-top: 14px;
		font-size: 18px;
	}

	p {
		margin: 8px 0 0;
		color: rgba(255, 255, 255, 0.86);
		font-size: 12px;
	}

	i {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		background: rgba(255, 255, 255, 0.16);
		border-radius: 8px;
		font-style: normal;
		font-size: 22px;
		font-weight: 800;
	}
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
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: #65d944;
	color: #0b3b13;
	font-weight: 800;
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
