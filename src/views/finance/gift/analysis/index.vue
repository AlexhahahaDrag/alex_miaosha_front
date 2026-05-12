<template>
	<div class="gift-page">
		<a-page-header title="统计报表 - 礼尚往来管理" />
		<a-card :bordered="false" class="section-card">
			<a-row :gutter="16">
				<a-col :span="8">
					<a-statistic
						title="收礼总额"
						:value="report.receive"
						prefix="￥"
						:precision="2"
					/>
				</a-col>
				<a-col :span="8">
					<a-statistic
						title="随礼/回礼总额"
						:value="report.give"
						prefix="￥"
						:precision="2"
					/>
				</a-col>
				<a-col :span="8">
					<a-statistic
						title="人情净值"
						:value="report.net"
						prefix="￥"
						:precision="2"
					/>
				</a-col>
			</a-row>
		</a-card>
		<a-card :bordered="false" class="section-card">
			<template #title>方向分布</template>
			<a-table
				:data-source="rows"
				:columns="columns"
				:loading="loading"
				:pagination="false"
				row-key="direction"
			/>
		</a-card>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { getGiftRecordPage } from '@/views/finance/gift/api';
import { directionLabel, money } from '@/views/finance/gift/config';

const loading = ref(false);
const report = reactive({
	receive: 0,
	give: 0,
	net: 0,
});
const rows = ref<{ direction: string; count: number; amount: string }[]>([]);
const columns = [
	{ title: '方向', dataIndex: 'direction', key: 'direction' },
	{ title: '笔数', dataIndex: 'count', key: 'count' },
	{ title: '金额', dataIndex: 'amount', key: 'amount' },
];

const loadData = async () => {
	loading.value = true;
	try {
		const { code, data, message: msg } = await getGiftRecordPage({}, 1, 200);
		if (code !== '200') {
			message.error(msg || '统计加载失败');
			return;
		}
		const records = data?.records || [];
		const groups = ['RECEIVE', 'GIVE', 'RETURN'].map((direction) => {
			const list = records.filter((item) => item.direction === direction);
			const total = list.reduce(
				(sum, item) => sum + Number(item.amount || 0),
				0,
			);
			return {
				direction: directionLabel(direction),
				count: list.length,
				amount: money(total),
			};
		});
		report.receive = records
			.filter((item) => item.direction === 'RECEIVE')
			.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		report.give = records
			.filter(
				(item) => item.direction === 'GIVE' || item.direction === 'RETURN',
			)
			.reduce((sum, item) => sum + Number(item.amount || 0), 0);
		report.net = report.receive - report.give;
		rows.value = groups;
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

.section-card {
	margin-bottom: 16px;
	border-radius: 8px;
}
</style>
