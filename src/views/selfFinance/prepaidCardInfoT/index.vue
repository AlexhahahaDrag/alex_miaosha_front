<template>
	<div class="card-management">
		<!-- 消费卡列表 -->
		<div class="card-list">
			<div style="display: flex; justify-content: start; align-items: center">
				<h2>我的消费卡</h2>
				<a-button
					type="primary"
					style="margin-left: 10px"
					@click="handleRecharge('recharge')"
				>
					新增消费记录
				</a-button>
			</div>
			<a-row :gutter="24">
				<a-col :span="4" v-for="card in cards" :key="card.id">
					<a-card
						class="card-item"
						:class="{ 'card-item-active': selectedCardId === card.id }"
						@click="handleCardClick(card)"
					>
						<div class="card-info">
							<h3>{{ card.cardName }}</h3>
							<p class="balance">余额: ¥{{ card.currentBalance }}</p>
						</div>
						<div class="card-actions">
							<a-button
								type="primary"
								@click="handleRecharge('recharge', card)"
							>
								充值
							</a-button>
							<a-button type="primary" @click="handleRecharge('consume', card)">
								消费
							</a-button>
						</div>
					</a-card>
				</a-col>
			</a-row>
		</div>

		<!-- 交易记录 -->
		<div class="transaction-records">
			<h2>交易记录</h2>
			<div class="record-header">
				<span v-if="selectedCardId"
					>当前查看: {{ getSelectedCardName() }} 的交易记录</span
				>
				<a-button v-if="selectedCardId" type="link" @click="clearCardSelection">
					查看全部记录
				</a-button>
			</div>
			<a-table
				:columns="columns"
				:data-source="transactions"
				:pagination="paginationInfo"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'type'">
						<a-tag :color="record.type === '充值' ? 'success' : 'warning'">
							{{ record.type }}
						</a-tag>
					</template>
					<template v-if="column.key === 'operateTime'">
						{{
							record.operateTime ?
								dayjs(record.operateTime).format('YYYY-MM-DD HH:mm')
							:	''
						}}
					</template>
				</template>
			</a-table>
		</div>
	</div>
	<recharge-info-modal
		v-model:open="rechargeDialogOpen"
		:data="currentCard"
		@ok="confirmRecharge"
		@cancel="cancelRecharge"
	/>
</template>

<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import { columns } from '@/views/selfFinance/prepaidCardInfoT/config/index';
import { getPrepaidCardInfoList } from './api/index';
import { getPrepaidConsumeRecordTPage } from '@/views/selfFinance/prepaidConsumeRecordT/api/index';
import { message } from 'ant-design-vue';
import RechargeInfoModal from '@/views/selfFinance/prepaidCardInfoT/recharge-info-modal/index.vue';
import dayjs from 'dayjs';
import type { IRechargeForm } from '@/views/selfFinance/prepaidCardInfoT/config/index';

// 消费卡数据
const cards = ref<any[]>([]);

// 交易记录数据
const transactions = ref<any[]>([]);

const selectedCardId = ref<string | number | null>(null);

const paginationInfo = ref<any>({
	pageNo: 1,
	current: 1,
	pageSize: 10,
	total: 0,
});

// 充值相关
const rechargeDialogOpen = ref<boolean>(false);
const currentCard = ref<IRechargeForm | null>(null);

// 处理充值
const handleRecharge = (type: string, card?: any) => {
	currentCard.value = card ?? {};
	currentCard.value!.type = type;
	rechargeDialogOpen.value = true;
};

const handleCardClick = (card: any) => {
	selectedCardId.value = card.id;
	transactions.value = [];
	paginationInfo.value.pageNo = 1;
	paginationInfo.value.current = 1;
	paginationInfo.value.pageSize = 10;
	paginationInfo.value.total = 0;
	getPrepaidConsumeRecordTPageInfo();
};

// 清除卡片选择
const clearCardSelection = () => {
	selectedCardId.value = null;
	transactions.value = [];
	paginationInfo.value.pageNo = 1;
	paginationInfo.value.current = 1;
	paginationInfo.value.pageSize = 10;
	paginationInfo.value.total = 0;
	getPrepaidConsumeRecordTPageInfo();
};

// 获取选中卡片的名称
const getSelectedCardName = () => {
	const card = cards.value.find((c) => c.id === selectedCardId.value);
	return card ? card.cardName : '';
};

// 获取消费卡列表
const getPrepaidCardInfoListInfo = async () => {
	const { code, data, message: messageInfo } = await getPrepaidCardInfoList({});
	if (code === '200') {
		cards.value = data;
	} else {
		message.error(messageInfo);
	}
};

// 获取消费记录列表
const getPrepaidConsumeRecordTPageInfo = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getPrepaidConsumeRecordTPage(
		{ cardId: selectedCardId.value },
		paginationInfo.value.pageNo,
		paginationInfo.value.pageSize,
	);
	console.log(data, code, messageInfo);
	if (code === '200') {
		transactions.value = data?.records || [];
		paginationInfo.value.total = data.total;
	} else {
		message.error(messageInfo);
	}
};

// 确认充值
const confirmRecharge = () => {
	rechargeDialogOpen.value = false;
	// 获取消费卡列表
	getPrepaidCardInfoListInfo();
	// 获取消费记录列表
	getPrepaidConsumeRecordTPageInfo();
};

// 取消充值
const cancelRecharge = () => {
	rechargeDialogOpen.value = false;
};

// 分页
const handleTableChange = (pagination: PageInfo) => {
	paginationInfo.value.pageNo = pagination.current;
	paginationInfo.value.current = pagination.current;
	paginationInfo.value.pageSize = pagination.pageSize;
	getPrepaidConsumeRecordTPageInfo();
};

const init = () => {
	selectedCardId.value = null;
	// 获取消费卡列表
	getPrepaidCardInfoListInfo();
	// 获取消费记录列表
	getPrepaidConsumeRecordTPageInfo();
};

init();
</script>

<style lang="less" scoped>
.card-list {
	margin-bottom: 30px;
}

.card-item {
	margin-bottom: 16px;
	cursor: pointer;
	transition: all 0.3s;
}

.card-item:hover {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.card-item-active {
	border: 2px solid #1890ff;
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
