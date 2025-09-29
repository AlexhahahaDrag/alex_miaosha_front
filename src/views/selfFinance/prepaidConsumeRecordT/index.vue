<template>
	<div class="card-management">
		<!-- 消费卡列表 -->
		<div class="card-list">
			<h2>我的消费卡</h2>
			<a-row :gutter="16">
				<a-col :span="8" v-for="card in cards" :key="card.id">
					<a-card class="card-item">
						<div class="card-info">
							<h3>{{ card.name }}</h3>
							<p class="balance">余额: ¥{{ card.balance }}</p>
						</div>
						<div class="card-actions">
							<a-button
								type="primary"
								:size="'small'"
								@click="handleRecharge(card)"
								>充值</a-button
							>
							<a-button
								type="primary"
								:size="'small'"
								@click="handleConsume(card)"
								>消费</a-button
							>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 交易记录 -->
		<div class="transaction-records">
			<h2>交易记录</h2>
			<a-table
				:columns="columns"
				:data-source="transactions"
				:pagination="{ pageSize: 10 }"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'type'">
						<a-tag :color="record.type === '充值' ? 'success' : 'warning'">
							{{ record.type }}
						</a-tag>
					</template>
				</template>
			</a-table>
		</div>

		<!-- 充值对话框 -->
		<a-modal
			v-model:visible="rechargeDialogVisible"
			title="充值"
			@ok="confirmRecharge"
			@cancel="rechargeDialogVisible = false"
		>
			<a-form
				:model="rechargeForm"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 16 }"
			>
				<a-form-item label="充值金额">
					<a-input-number
						v-model:value="rechargeForm.amount"
						:min="1"
						style="width: 100%"
					/>
				</a-form-item>
				<a-form-item label="支付方式">
					<a-select v-model:value="rechargeForm.paymentMethod">
						<a-select-option value="wechat">微信支付</a-select-option>
						<a-select-option value="alipay">支付宝</a-select-option>
						<a-select-option value="bank">银行卡</a-select-option>
					</a-select>
				</a-form-item>
			</a-form>
		</a-modal>

		<!-- 消费对话框 -->
		<a-modal
			v-model:visible="consumeDialogVisible"
			title="消费"
			@ok="confirmConsume"
			@cancel="consumeDialogVisible = false"
		>
			<a-form
				:model="consumeForm"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 16 }"
			>
				<a-form-item label="消费金额">
					<a-input-number
						v-model:value="consumeForm.amount"
						:min="1"
						style="width: 100%"
					/>
				</a-form-item>
				<a-form-item label="消费说明">
					<a-textarea v-model:value="consumeForm.description" />
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';

// 表格列定义
const columns = [
	{
		title: '日期',
		dataIndex: 'date',
		key: 'date',
		width: 180,
	},
	{
		title: '卡名称',
		dataIndex: 'cardName',
		key: 'cardName',
		width: 180,
	},
	{
		title: '类型',
		dataIndex: 'type',
		key: 'type',
	},
	{
		title: '金额',
		dataIndex: 'amount',
		key: 'amount',
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
	},
];

// 消费卡数据
const cards = ref([
	{ id: 1, name: '会员卡', balance: 1000 },
	{ id: 2, name: '储值卡', balance: 500 },
]);

// 交易记录数据
const transactions = ref([
	{
		key: '1',
		date: '2024-03-20',
		cardName: '会员卡',
		type: '充值',
		amount: 500,
		description: '微信充值',
	},
	{
		key: '2',
		date: '2024-03-19',
		cardName: '储值卡',
		type: '消费',
		amount: 100,
		description: '购买商品',
	},
]);

// 充值相关
const rechargeDialogVisible = ref(false);
const currentCard = ref(null);
const rechargeForm = reactive({
	amount: 100,
	paymentMethod: 'wechat',
});

// 消费相关
const consumeDialogVisible = ref(false);
const consumeForm = reactive({
	amount: 0,
	description: '',
});

// 处理充值
const handleRecharge = (card) => {
	currentCard.value = card;
	rechargeDialogVisible.value = true;
};

// 确认充值
const confirmRecharge = () => {
	message.success('充值成功');
	rechargeDialogVisible.value = false;
};

// 处理消费
const handleConsume = (card) => {
	currentCard.value = card;
	consumeDialogVisible.value = true;
};

// 确认消费
const confirmConsume = () => {
	message.success('消费成功');
	consumeDialogVisible.value = false;
};
</script>

<style scoped>
.card-management {
	padding: 24px;
}

.card-list {
	margin-bottom: 30px;
}

.card-item {
	margin-bottom: 16px;
}

.card-info h3 {
	margin: 0 0 10px 0;
}

.balance {
	font-size: 18px;
	color: #1890ff;
	margin: 0;
}

.card-actions {
	display: flex;
	gap: 8px;
	margin-top: 16px;
}

.transaction-records {
	margin-top: 30px;
}

h2 {
	margin-bottom: 20px;
	color: rgba(0, 0, 0, 0.85);
	font-weight: 500;
}
</style>
