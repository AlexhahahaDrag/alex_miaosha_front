<template>
	<div class="gift-page">
		<a-page-header title="数据概览 - 礼尚往来管理" />
		<a-row :gutter="16" class="metric-row">
			<a-col :span="6">
				<a-card :bordered="false">
					<a-statistic
						title="本月收礼"
						:value="summary.receive"
						prefix="￥"
						:precision="2"
					/>
				</a-card>
			</a-col>
			<a-col :span="6">
				<a-card :bordered="false">
					<a-statistic
						title="本月随礼"
						:value="summary.give"
						prefix="￥"
						:precision="2"
					/>
				</a-card>
			</a-col>
			<a-col :span="6">
				<a-card :bordered="false">
					<a-statistic
						title="待回礼金额"
						:value="summary.pending"
						prefix="￥"
						:precision="2"
					/>
				</a-card>
			</a-col>
			<a-col :span="6">
				<a-card :bordered="false">
					<a-statistic
						title="人情净值"
						:value="summary.net"
						prefix="￥"
						:precision="2"
					/>
				</a-card>
			</a-col>
		</a-row>
		<a-card :bordered="false" class="section-card">
			<template #title>最近礼金记录</template>
			<a-table
				:data-source="records"
				:columns="columns"
				:loading="loading"
				:pagination="false"
				row-key="id"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'direction'">
						<a-tag :color="directionColor(record.direction)">
							{{ directionLabel(record.direction) }}
						</a-tag>
					</template>
					<template v-if="column.key === 'amount'">
						{{ money(record.amount) }}
					</template>
					<template v-if="column.key === 'returnedFlag'">
						<a-tag :color="record.returnedFlag === 1 ? 'green' : 'orange'">
							{{ record.returnedFlag === 1 ? '已回礼' : '待回礼' }}
						</a-tag>
					</template>
				</template>
			</a-table>
		</a-card>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getGiftRecordPage } from '@/views/finance/gift/api';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import {
	directionColor,
	directionLabel,
	money,
} from '@/views/finance/gift/config';

const loading = ref(false);
const records = ref<GiftRecordInfo[]>([]);
const summary = reactive({
	receive: 0,
	give: 0,
	pending: 0,
	net: 0,
});

const columns = [
	{ title: '方向', dataIndex: 'direction', key: 'direction', width: 100 },
	{ title: '金额', dataIndex: 'amount', key: 'amount', width: 120 },
	{ title: '礼金时间', dataIndex: 'payTime', key: 'payTime', width: 180 },
	{
		title: '回礼状态',
		dataIndex: 'returnedFlag',
		key: 'returnedFlag',
		width: 120,
	},
	{ title: '备注', dataIndex: 'remark', key: 'remark' },
];

const loadData = async () => {
	loading.value = true;
	try {
		const { code, data, message: msg } = await getGiftRecordPage({}, 1, 8);
		if (code !== '200') {
			message.error(msg || '数据加载失败');
			return;
		}
		records.value = data?.records || [];
		const receive = records.value
			.filter((item) => item.direction === 'RECEIVE')
			.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		const give = records.value
			.filter(
				(item) => item.direction === 'GIVE' || item.direction === 'RETURN',
			)
			.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		summary.receive = receive;
		summary.give = give;
		summary.pending = records.value
			.filter((item) => item.direction === 'RECEIVE' && item.returnedFlag !== 1)
			.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		summary.net = receive - give;
	} finally {
		loading.value = false;
	}
};

onMounted(loadData);
</script>

<style scoped lang="less">
.gift-page {
	padding: 16px;
	background: #f8fbff;
	min-height: 100%;
}

.metric-row {
	margin-bottom: 16px;
}

.section-card {
	border-radius: 8px;
}
</style>
