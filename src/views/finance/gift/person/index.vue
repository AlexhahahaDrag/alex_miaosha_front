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
							:key="item.value"
							class="quick-tag"
							:color="
								searchInfo.relationType === item.value ? 'blue' : 'default'
							"
							@click="selectRelation(item.value)"
						>
							{{ item.label }}
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

		<a-drawer
			v-model:open="drawerOpen"
			:title="formInfo.id ? '编辑联系人' : '新增联系人'"
			width="460"
		>
			<a-form :model="formInfo" layout="vertical">
				<a-form-item label="姓名" required>
					<a-input
						v-model:value="formInfo.personName"
						placeholder="请输入姓名"
					/>
				</a-form-item>
				<a-form-item label="手机号">
					<a-input v-model:value="formInfo.phone" placeholder="请输入手机号" />
				</a-form-item>
				<a-form-item label="关系">
					<a-select
						v-model:value="formInfo.relationType"
						:options="giftRelationOptions"
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

		<a-drawer v-model:open="profileOpen" title="联系人详情" width="420">
			<div class="profile-head">
				<span class="profile-avatar">{{
					firstName(profile.person?.personName)
				}}</span>
				<h3>{{ profile.person?.personName || '-' }}</h3>
				<p>
					{{ relationLabel(profile.person?.relationType) }} ·
					{{ profile.person?.phone || '-' }}
				</p>
			</div>
			<div class="profile-metrics">
				<div>
					<span>累计送礼</span>
					<strong class="amount-out">{{
						money(profile.person?.totalGiveAmount)
					}}</strong>
				</div>
				<div>
					<span>累计收礼</span>
					<strong class="amount-in">{{
						money(profile.person?.totalReceiveAmount)
					}}</strong>
				</div>
			</div>
			<a-divider>基本信息</a-divider>
			<a-descriptions :column="1" size="small" bordered>
				<a-descriptions-item label="手机号">
					{{ profile.person?.phone || '-' }}
				</a-descriptions-item>
				<a-descriptions-item label="关系">
					{{ relationLabel(profile.person?.relationType) }}
				</a-descriptions-item>
				<a-descriptions-item label="备注">
					{{ profile.person?.remark || '-' }}
				</a-descriptions-item>
			</a-descriptions>
			<a-divider>往来历史</a-divider>
			<a-list :data-source="profile.records || []" size="small">
				<template #renderItem="{ item }">
					<a-list-item>
						<a-list-item-meta
							:title="`${directionLabel(item.direction)} ${money(item.amount)}`"
							:description="`${item.payTime || '-'} ${item.remark || ''}`"
						/>
					</a-list-item>
				</template>
			</a-list>
			<div class="profile-actions">
				<a-button
					v-if="hasPermission('gift:edit')"
					type="primary"
					block
					@click="openDrawer(profile.person)"
				>
					编辑资料
				</a-button>
				<a-button block @click="profileOpen = false">返回列表</a-button>
			</div>
		</a-drawer>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { usePermission } from '@/composables/usePermission';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	addGiftPerson,
	deleteGiftPerson,
	getGiftPersonBusinessPage,
	getGiftPersonProfile,
	getGiftPersonSummary,
	updateGiftPerson,
} from '@/views/finance/gift/api';
import type {
	GiftPersonBusinessInfo,
	GiftPersonInfo,
	GiftPersonProfile,
	GiftPersonQuery,
	GiftPersonSummary,
} from '@/views/finance/gift/config';
import {
	directionLabel,
	giftRelationOptions,
	money,
	relationLabel,
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
const profileOpen = ref(false);
const tableSize = ref<'small' | 'middle'>('middle');
const searchInfo = ref<GiftPersonQuery>({});
const formInfo = ref<GiftPersonInfo>({});
const summary = ref<GiftPersonSummary>({});
const profile = ref<GiftPersonProfile>({});
const dataSource = ref<GiftPersonBusinessInfo[]>([]);
const quickRelations = giftRelationOptions.slice(0, 3);

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

const selectRelation = (value: string) => {
	searchInfo.value.relationType =
		searchInfo.value.relationType === value ? undefined : value;
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
	formInfo.value = record ? { ...record } : {};
	drawerOpen.value = true;
};

const openProfile = async (record: GiftPersonBusinessInfo) => {
	if (!record.id) return;
	const { code, data, message: msg } = await getGiftPersonProfile(record.id);
	if (code === '200') {
		profile.value = data || {};
		profileOpen.value = true;
	} else {
		message.error(msg || '联系人详情加载失败');
	}
};

const save = async () => {
	saving.value = true;
	try {
		const api = formInfo.value.id ? updateGiftPerson : addGiftPerson;
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
	const { code, message: msg } = await deleteGiftPerson(String(id));
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

.avatar-dot,
.profile-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: #65d944;
	color: #0b3b13;
	font-weight: 800;
}

.avatar-dot {
	width: 28px;
	height: 28px;
	border-radius: 50%;
}

.amount-in {
	color: #389e0d;
	font-weight: 700;
}

.amount-out {
	color: #cf1322;
	font-weight: 700;
}

.profile-head {
	text-align: center;

	h3 {
		margin: 12px 0 4px;
		font-size: 18px;
	}

	p {
		margin: 0;
		color: #667085;
	}
}

.profile-avatar {
	width: 64px;
	height: 64px;
	border-radius: 10px;
	font-size: 24px;
}

.profile-metrics {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
	margin-top: 18px;

	div {
		padding: 14px;
		background: #f8fafc;
		border-radius: 7px;
	}

	span {
		display: block;
		margin-bottom: 8px;
		color: #667085;
		font-size: 12px;
	}
}

.profile-actions {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
	margin-top: 18px;
}
</style>
