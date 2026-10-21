<template>
	<a-drawer
		:open="open"
		:title="drawerTitle"
		placement="right"
		:width="540"
		class="gift-person-detail-drawer"
		root-class-name="gift-person-detail-drawer-root"
		data-testid="drawer-gift-person-detail"
		@close="handleClose"
	>
		<template #extra>
			<a-button
				type="primary"
				size="small"
				data-testid="btn-drawer-ai-calc"
				@click="handleOpenCalculator"
			>
				✨ AI 回礼测算
			</a-button>
		</template>

		<div v-if="person" class="drawer-body-wrap" data-testid="drawer-gift-person-detail-body">
			<!-- 人情对账卡片概览 -->
			<div class="person-balance-overview">
				<div class="overview-header-row">
					<span class="person-tag">{{ relationText }}</span>
					<a-tag :color="statusColor">{{ statusText }}</a-tag>
					<a-tag v-if="person.isImbalancedAlert" color="error">
						⚠️ 失衡预警: {{ person.alertReason || '超180天无互动' }}
					</a-tag>
				</div>
				<div class="kpi-mini-grid">
					<div class="kpi-mini-item">
						<span class="label">累计收TA礼金</span>
						<strong class="text-green">¥{{ Number(person.totalReceiveAmount || 0).toFixed(2) }}</strong>
					</div>
					<div class="kpi-mini-item">
						<span class="label">累计给TA随礼</span>
						<strong class="text-orange">¥{{ Number(person.totalGiveAmount || 0).toFixed(2) }}</strong>
					</div>
					<div class="kpi-mini-item">
						<span class="label">净顺逆差 (轧差)</span>
						<strong :class="Number(person.netBalance || 0) >= 0 ? 'text-green' : 'text-orange'">
							{{ Number(person.netBalance || 0) >= 0 ? '+' : '' }}¥{{ Number(person.netBalance || 0).toFixed(2) }}
						</strong>
					</div>
				</div>
			</div>

			<!-- 往来人情流水时间轴 -->
			<div class="timeline-section">
				<div class="section-title">
					<h4>往来流水明细时间轴</h4>
					<span class="record-count">共 {{ records.length }} 笔记录</span>
				</div>

				<a-spin :spinning="loadingRecords">
					<div v-if="records.length === 0" class="empty-timeline">
						暂无与该亲友的直接流水记录
					</div>
					<div v-else class="record-timeline-list">
						<div
							v-for="rec in records"
							:key="rec.id"
							class="record-item"
							:class="rec.direction === 'RECEIVE' ? 'direction-receive' : 'direction-give'"
						>
							<div class="timeline-dot" />
							<div class="record-card">
								<div class="record-card-top">
									<div class="event-title-wrap">
										<span class="direction-badge">
											{{ rec.direction === 'RECEIVE' ? '收礼' : rec.direction === 'RETURN' ? '回礼' : '随礼' }}
										</span>
										<strong class="event-name">{{ rec.eventName || '人情往来' }}</strong>
									</div>
									<span class="amount-value font-mono">
										{{ rec.direction === 'RECEIVE' ? '+' : '-' }}¥{{ Number(rec.amount || 0).toFixed(2) }}
									</span>
								</div>
								<div class="record-card-meta">
									<span class="meta-date">{{ rec.eventDate || rec.createTime?.substring(0, 10) || '近期' }}</span>
									<span v-if="rec.relationTypeName || rec.relationType" class="meta-relation">
										{{ rec.relationTypeName || rec.relationType }}
									</span>
									<span v-if="rec.remark" class="meta-remark">备注: {{ rec.remark }}</span>
								</div>
							</div>
						</div>
					</div>
				</a-spin>
			</div>
		</div>
	</a-drawer>
</template>

<script setup lang="ts">
import { getGiftRecordPage } from '@/views/finance/gift/api';
import type { GiftPersonBalance, GiftRecordInfo } from '@/views/finance/gift/config';

const props = defineProps<{
	open: boolean;
	person: GiftPersonBalance | null;
}>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
	(e: 'open-calculator', person: GiftPersonBalance): void;
}>();

const records = ref<GiftRecordInfo[]>([]);
const loadingRecords = ref(false);

const drawerTitle = computed(() => {
	if (!props.person) return '亲友往来明细';
	return `往来明细 · ${props.person.personName || '亲友'}`;
});

const relationText = computed(() => {
	return props.person?.relationTypeName || props.person?.relationType || '亲友圈';
});

const statusColor = computed(() => {
	if (!props.person) return 'default';
	if (props.person.balanceStatus === 'SURPLUS') return 'green';
	if (props.person.balanceStatus === 'DEFICIT') return 'orange';
	return 'default';
});

const statusText = computed(() => {
	if (!props.person) return '持平';
	if (props.person.balanceStatus === 'SURPLUS') return '礼金盈余 (多收)';
	if (props.person.balanceStatus === 'DEFICIT') return '礼金借出 (多送)';
	return '收支平衡';
});

const fetchPersonRecords = async (personId: string) => {
	loadingRecords.value = true;
	try {
		const { code, data } = await getGiftRecordPage(
			{ personId },
			1,
			50,
		);
		if ((code === '200' || code === '00000') && data && Array.isArray(data.records)) {
			records.value = data.records;
		} else {
			records.value = [];
		}
	} catch (e) {
		console.warn('获取亲友往来明细失败', e);
		records.value = [];
	} finally {
		loadingRecords.value = false;
	}
};

watch(
	() => [props.open, props.person?.personId],
	([isOpen, personId]) => {
		if (isOpen && personId) {
			void fetchPersonRecords(String(personId));
		} else if (!isOpen) {
			records.value = [];
		}
	},
);

const handleClose = () => {
	emit('update:open', false);
};

const handleOpenCalculator = () => {
	if (props.person) {
		emit('open-calculator', props.person);
	}
};
</script>

<style scoped lang="scss">
.drawer-body-wrap {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.person-balance-overview {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 16px;
}

.overview-header-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;

	.person-tag {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}
}

.kpi-mini-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.kpi-mini-item {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;

	.label {
		font-size: 11px;
		color: #64748b;
	}

	strong {
		font-size: 15px;
	}
}

.text-green {
	color: #16a34a;
}

.text-orange {
	color: #ea580c;
}

.timeline-section {
	.section-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 14px;

		h4 {
			margin: 0;
			font-size: 14px;
			font-weight: 600;
			color: #1e293b;
		}

		.record-count {
			font-size: 12px;
			color: #94a3b8;
		}
	}
}

.empty-timeline {
	text-align: center;
	padding: 30px 0;
	color: #94a3b8;
	font-size: 13px;
}

.record-timeline-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	position: relative;
	padding-left: 18px;

	&::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: #e2e8f0;
	}
}

.record-item {
	position: relative;

	.timeline-dot {
		position: absolute;
		left: -18px;
		top: 14px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #94a3b8;
		border: 2px solid #ffffff;
		box-shadow: 0 0 0 2px #cbd5e1;
	}

	&.direction-receive .timeline-dot {
		background: #16a34a;
		box-shadow: 0 0 0 2px #bbf7d0;
	}

	&.direction-give .timeline-dot {
		background: #ea580c;
		box-shadow: 0 0 0 2px #fed7aa;
	}
}

.record-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 10px;
	padding: 12px 14px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.record-card-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}

.event-title-wrap {
	display: flex;
	align-items: center;
	gap: 8px;
}

.direction-badge {
	font-size: 11px;
	padding: 1px 6px;
	border-radius: 4px;
	background: #f1f5f9;
	color: #475569;
}

.direction-receive .direction-badge {
	background: #dcfce7;
	color: #15803d;
}

.direction-give .direction-badge {
	background: #ffedd5;
	color: #c2410c;
}

.event-name {
	font-size: 13px;
	color: #1e293b;
}

.amount-value {
	font-size: 14px;
	font-weight: 700;
}

.direction-receive .amount-value {
	color: #16a34a;
}

.direction-give .amount-value {
	color: #ea580c;
}

.record-card-meta {
	display: flex;
	gap: 10px;
	font-size: 11px;
	color: #64748b;
}
</style>
