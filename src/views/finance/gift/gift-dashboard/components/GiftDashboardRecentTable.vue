<template>
	<section class="panel panel-tertiary record-panel">
		<div class="panel-head">
			<h3>最近往来记录</h3>
			<a-button
				type="link"
				data-testid="gift-dashboard-record-all"
				@click="$emit('go-record')"
			>
				全部记录 >
			</a-button>
		</div>
		<div class="record-table">
			<div class="record-row record-head">
				<span>日期</span>
				<span>活动项目</span>
				<span>往来对象</span>
				<span>类型</span>
				<span>金额</span>
				<span>状态</span>
				<span>操作</span>
			</div>
			<gift-empty-state
				v-if="records.length === 0"
				title="暂无往来记录"
				description="开始记录第一笔随礼或收礼，方便随时查看人情往来。"
				action-text="去记一笔礼金 →"
				:to="recordPath"
				:icon="FileTextOutlined"
			/>
			<div
				v-for="item in displayRecords"
				:key="item.id"
				class="record-row record-row-body"
			>
				<span>{{ formatDate(item.payTime) }}</span>
				<span>{{ item.eventName || item.eventId || '-' }}</span>
				<span>{{
					item.personName ||
					item.giverPersonName ||
					item.receiverPersonName ||
					'-'
				}}</span>
				<span>
					<a-tag :color="directionColor(item.direction)">
						{{ directionLabel(item.direction) }}
					</a-tag>
				</span>
				<span
					:class="
						item.direction === 'RECEIVE'
							? 'amount-income'
							: 'amount-expense'
					"
				>
					{{ signedMoney(item) }}
				</span>
				<span>
					<a-tag
						v-if="item.direction === 'RECEIVE'"
						:color="item.returnedFlag === 1 ? 'green' : 'orange'"
					>
						{{ item.returnedFlag === 1 ? '已完成' : '待确认' }}
					</a-tag>
					<a-tag v-else color="green">已完成</a-tag>
				</span>
				<span>
					<a-button type="link" size="small" @click="$emit('go-record')">
						查看
					</a-button>
				</span>
			</div>
		</div>
		<a-button
			v-if="canAdd"
			type="primary"
			shape="circle"
			class="float-add"
			data-testid="gift-dashboard-float-add"
			@click="$emit('go-record')"
		>
			+
		</a-button>
	</section>
</template>

<script setup lang="ts">
import { FileTextOutlined } from '@ant-design/icons-vue';
import { formatDate } from '@/utils/dayjs';
import GiftEmptyState from '@/views/finance/gift/gift-dashboard/components/GiftEmptyState.vue';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import {
	directionColor,
	directionLabel,
	money,
} from '@/views/finance/gift/config';

defineProps<{
	records: GiftRecordInfo[];
	displayRecords: GiftRecordInfo[];
	recordPath: string;
	canAdd: boolean;
}>();

defineEmits<{
	(e: 'go-record'): void;
}>();

const signedMoney = (record: GiftRecordInfo) => {
	const val = Number(record.amount || 0);
	if (record.direction === 'RECEIVE') {
		return `+${money(val)}`;
	}
	return `-${money(val)}`;
};
</script>

<style scoped lang="less">
.panel {
	border-radius: 16px;
	padding: 20px;
	background: #fff;
	border: 1px solid #e2e8f0;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
	position: relative;
}

.panel-head {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;

	h3 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
	}
}

.record-table {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.record-row {
	display: grid;
	grid-template-columns: 1.2fr 1.5fr 1.2fr 1fr 1.2fr 1fr 0.8fr;
	align-items: center;
	padding: 12px 16px;
	font-size: 13px;
	border-bottom: 1px solid #f1f5f9;

	&.record-head {
		background: #f8fafc;
		font-weight: 600;
		color: #64748b;
		border-radius: 8px;
		border-bottom: none;
		margin-bottom: 4px;
	}

	&.record-row-body {
		transition: background 0.2s;
		color: #334155;

		&:hover {
			background: #f8fafc;
		}

		&:last-child {
			border-bottom: none;
		}
	}
}

.amount-income {
	color: #10b981;
	font-weight: 600;
}

.amount-expense {
	color: #f43f5e;
	font-weight: 600;
}

.float-add {
	position: absolute;
	right: 24px;
	bottom: -20px;
	width: 44px;
	height: 44px;
	font-size: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
	background: #2563eb;
	z-index: 10;
}
</style>
