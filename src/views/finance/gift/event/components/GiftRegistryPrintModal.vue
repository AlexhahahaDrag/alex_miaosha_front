<template>
	<a-modal
		v-model:open="visible"
		:title="modalTitle"
		:width="1060"
		:footer="null"
		wrap-class-name="gift-registry-print-modal-wrap"
		data-testid="modal-gift-registry-print"
		@cancel="handleClose"
	>
		<!-- 顶部交互控制工具栏（屏幕可见，打印时自动隐藏） -->
		<div class="print-toolbar no-print">
			<a-space :size="16">
				<a-radio-group v-model:value="printStyle" button-style="solid">
					<a-radio-button value="traditional">
						🏮 传统中式礼簿 (宣纸朱红)
					</a-radio-button>
					<a-radio-button value="modern">
						📄 现代精简对账 (省墨黑白)
					</a-radio-button>
				</a-radio-group>

				<a-checkbox v-model:checked="showChineseAmount">
					显示大写金额
				</a-checkbox>
				<a-checkbox v-model:checked="highlightLargeAmount">
					高亮大额礼金 (≥¥1000)
				</a-checkbox>
			</a-space>

			<a-space :size="12">
				<a-button
					type="primary"
					class="btn-print-action"
					data-testid="btn-do-print"
					:loading="loading"
					@click="handlePrint"
				>
					<template #icon><printer-outlined /></template>
					立即打印礼簿 (A4)
				</a-button>
				<a-button @click="handleClose">关闭</a-button>
			</a-space>
		</div>

		<!-- 纸质礼簿主体排版容器 (支持打印穿透) -->
		<div
			class="registry-paper-container"
			:class="[printStyle]"
			data-testid="registry-paper-content"
		>
			<!-- 礼簿扉页抬头与装饰 -->
			<div class="registry-header">
				<div class="header-inner">
					<div class="title-seal-wrapper">
						<h1 class="registry-main-title">
							{{ eventInfo?.eventName || '人情礼尚往来' }} · 人情礼簿
						</h1>
						<div class="traditional-seal">
							<span>吉祥</span>
							<span>如意</span>
						</div>
					</div>
					<div class="registry-meta-row">
						<span>办宴执事/东道主：<strong>{{ eventInfo?.hostPersonName || '东家' }}</strong></span>
						<span>办宴吉日：<strong>{{ eventDateText }}</strong></span>
						<span>席设事由：<strong>{{ eventInfo?.eventType || '喜事办宴' }}</strong></span>
					</div>
				</div>
			</div>

			<!-- 礼簿汇总统计条 -->
			<div class="registry-summary-bar">
				<div class="summary-cell">
					<span class="lbl">随礼亲朋总数</span>
					<span class="val">{{ metrics.totalCount }} <small>位</small></span>
				</div>
				<div class="summary-cell highlight">
					<span class="lbl">礼金合计金额</span>
					<span class="val">{{ metrics.totalAmountText }}</span>
				</div>
				<div class="summary-cell">
					<span class="lbl">平均随礼贺金</span>
					<span class="val">{{ metrics.avgAmountText }}</span>
				</div>
				<div class="summary-cell">
					<span class="lbl">大写总金额</span>
					<span class="val-chinese">{{ metrics.totalChineseAmount }}</span>
				</div>
			</div>

			<!-- 礼簿礼金明细表格 -->
			<div class="registry-table-wrapper">
				<table class="registry-table">
					<thead>
						<tr>
							<th style="width: 50px">序</th>
							<th style="width: 140px">贺礼亲友</th>
							<th style="width: 110px">亲友圈层</th>
							<th style="width: 130px">礼金贺仪</th>
							<th v-if="showChineseAmount" style="width: 180px">贺仪大写</th>
							<th>代送人 / 贺词备注</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="loading && records.length === 0">
							<td :colspan="showChineseAmount ? 6 : 5" class="empty-cell">
								正在载入礼簿名录流水...
							</td>
						</tr>
						<tr v-else-if="records.length === 0">
							<td :colspan="showChineseAmount ? 6 : 5" class="empty-cell">
								本场事件暂无收礼记录流水
							</td>
						</tr>
						<tr
							v-for="(item, idx) in records"
							:key="item.id || idx"
							:class="{ 'large-amount-row': highlightLargeAmount && isLargeAmount(item.amount) }"
						>
							<td class="text-center">{{ idx + 1 }}</td>
							<td class="guest-name">
								<strong>{{ item.personName || '亲朋好友' }}</strong>
							</td>
							<td class="relation-badge">
								<span class="relation-tag">{{ item.relationType || '亲友' }}</span>
							</td>
							<td class="amount-cell">
								<span class="currency">¥</span>
								<strong class="num">{{ formatRegistryMoney(item.amount) }}</strong>
							</td>
							<td v-if="showChineseAmount" class="chinese-cell">
								{{ toChineseCurrency(item.amount) }}
							</td>
							<td class="remark-cell">
								<span v-if="item.transactorPersonName" class="transactor-tag">
									(由 {{ item.transactorPersonName }} 代送)
								</span>
								<span>{{ item.remark || '-' }}</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<!-- 礼簿落款底栏 -->
			<div class="registry-footer">
				<div class="footer-sign">
					<span>礼薄记录核对人（签名）：___________________</span>
					<span>复核日期：______年____月____日</span>
				</div>
				<p class="blessing-note">
					谨此致谢 · 亲友笃厚 · 礼尚往来 · 永结同心
				</p>
			</div>
		</div>
	</a-modal>
</template>

<script setup lang="ts">
import { PrinterOutlined } from '@ant-design/icons-vue';
import { getGiftRecordPage } from '@/views/finance/gift/api';
import type { GiftRecordInfo } from '@/views/finance/gift/config';
import { formatDate } from '@/utils/dayjs';
import {
	formatRegistryMoney,
	toChineseCurrency,
	isLargeAmountRegistry,
	calculateRegistryMetrics,
} from '../utils/registryPrint';

const props = defineProps<{
	open: boolean;
	eventInfo?: Record<string, any> | null;
}>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
}>();

const visible = computed({
	get: () => props.open,
	set: (val: boolean) => emit('update:open', val),
});

const loading = ref(false);
const records = ref<GiftRecordInfo[]>([]);
const printStyle = ref<'traditional' | 'modern'>('traditional');
const showChineseAmount = ref(true);
const highlightLargeAmount = ref(true);

const modalTitle = computed(() => {
	return `礼簿台账打印预览 - ${props.eventInfo?.eventName || '办宴事件'}`;
});

const eventDateText = computed(() => {
	if (!props.eventInfo?.eventTime) return '吉日';
	return formatDate(props.eventInfo.eventTime, 'YYYY年MM月DD日');
});

const metrics = computed(() => {
	return calculateRegistryMetrics(records.value);
});

const isLargeAmount = (amount?: number | string): boolean => {
	return isLargeAmountRegistry(amount, 1000);
};

const loadEventRecords = async () => {
	if (!props.eventInfo?.id) return;
	loading.value = true;
	try {
		const { code, data } = await getGiftRecordPage(
			{
				eventId: String(props.eventInfo.id),
				direction: 'RECEIVE',
			},
			{ pageSize: 1000 },
		);
		if (code === '200' && data?.records) {
			records.value = data.records;
		} else {
			records.value = [];
		}
	} catch (e) {
		console.error('加载礼簿流水失败:', e);
		records.value = [];
	} finally {
		loading.value = false;
	}
};

watch(
	() => [props.open, props.eventInfo?.id],
	([isOpen, eventId]) => {
		if (isOpen && eventId) {
			loadEventRecords();
		}
	},
	{ immediate: true },
);

const handlePrint = () => {
	window.print();
};

const handleClose = () => {
	visible.value = false;
};
</script>

<style lang="less" scoped>
.print-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	margin-bottom: 16px;
	background: #f8fafc;
	border-radius: 8px;
	border: 1px solid #e2e8f0;

	.btn-print-action {
		background: #dc2626;
		border-color: #dc2626;
		font-weight: 600;

		&:hover {
			background: #b91c1c;
			border-color: #b91c1c;
		}
	}
}

.registry-paper-container {
	padding: 28px 32px;
	border-radius: 6px;
	background: #fff;
	transition: all 0.3s ease;

	&.traditional {
		background: #fffdf8;
		border: 2px solid #b91c1c;
		box-shadow: 0 0 16px rgba(185, 28, 28, 0.08);

		.registry-main-title {
			color: #991b1b;
			font-family: 'KaiTi', '楷体', 'STKaiti', serif;
			letter-spacing: 2px;
		}

		.traditional-seal {
			display: inline-flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 48px;
			height: 48px;
			border: 2px solid #b91c1c;
			color: #b91c1c;
			font-weight: bold;
			font-size: 13px;
			line-height: 1.1;
			border-radius: 4px;
			transform: rotate(-5deg);
		}

		.registry-summary-bar {
			background: #fef2f2;
			border: 1px dashed #f87171;
		}

		.registry-table {
			thead th {
				background: #fee2e2;
				color: #7f1d1d;
				border-color: #fca5a5;
			}
			tbody td {
				border-color: #fee2e2;
			}
			.large-amount-row {
				background: #fff1f2;
				font-weight: 600;
			}
		}
	}

	&.modern {
		background: #ffffff;
		border: 1px solid #cbd5e1;

		.registry-main-title {
			color: #0f172a;
			font-family: inherit;
		}

		.traditional-seal {
			display: none;
		}

		.registry-summary-bar {
			background: #f1f5f9;
			border: 1px solid #e2e8f0;
		}

		.registry-table {
			thead th {
				background: #f8fafc;
				color: #334155;
				border-color: #e2e8f0;
			}
			tbody td {
				border-color: #f1f5f9;
			}
			.large-amount-row {
				background: #f8fafc;
				font-weight: bold;
			}
		}
	}
}

.registry-header {
	text-align: center;
	margin-bottom: 20px;

	.title-seal-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-bottom: 12px;
	}

	.registry-main-title {
		font-size: 26px;
		font-weight: bold;
		margin: 0;
	}

	.registry-meta-row {
		display: flex;
		justify-content: center;
		gap: 32px;
		font-size: 14px;
		color: #475569;
	}
}

.registry-summary-bar {
	display: flex;
	justify-content: space-around;
	padding: 12px 16px;
	border-radius: 6px;
	margin-bottom: 20px;

	.summary-cell {
		display: flex;
		flex-direction: column;
		align-items: center;

		.lbl {
			font-size: 12px;
			color: #64748b;
			margin-bottom: 4px;
		}

		.val {
			font-size: 18px;
			font-weight: bold;
			color: #1e293b;
		}

		.val-chinese {
			font-size: 14px;
			font-weight: 600;
			color: #b91c1c;
		}

		&.highlight .val {
			color: #dc2626;
		}
	}
}

.registry-table-wrapper {
	overflow-x: auto;
	margin-bottom: 24px;
}

.registry-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;

	th, td {
		padding: 10px 12px;
		text-align: left;
		border: 1px solid #e2e8f0;
	}

	.text-center {
		text-align: center;
	}

	.guest-name {
		font-size: 14px;
	}

	.amount-cell {
		color: #b91c1c;
		font-size: 15px;

		.currency {
			font-size: 12px;
			margin-right: 2px;
		}
	}

	.chinese-cell {
		font-size: 12px;
		color: #64748b;
	}

	.relation-tag {
		display: inline-block;
		padding: 2px 6px;
		background: #f1f5f9;
		border-radius: 4px;
		font-size: 12px;
		color: #475569;
	}

	.transactor-tag {
		color: #d97706;
		margin-right: 4px;
		font-size: 12px;
	}

	.empty-cell {
		text-align: center;
		padding: 32px 0;
		color: #94a3b8;
	}
}

.registry-footer {
	margin-top: 24px;
	padding-top: 16px;
	border-top: 1px dashed #cbd5e1;

	.footer-sign {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: #475569;
		margin-bottom: 12px;
	}

	.blessing-note {
		text-align: center;
		font-size: 13px;
		color: #991b1b;
		font-style: italic;
		letter-spacing: 2px;
		margin: 0;
	}
}

/* 原生打印样式穿透 (@media print) */
@media print {
	/* 隐藏所有非打印区域（导航、侧边栏、工具栏、弹窗遮罩、关闭按钮） */
	body * {
		visibility: hidden;
	}

	.no-print,
	:deep(.ant-modal-close),
	:deep(.ant-modal-header),
	:deep(.ant-modal-mask) {
		display: none !important;
	}

	.registry-paper-container,
	.registry-paper-container * {
		visibility: visible;
	}

	.registry-paper-container {
		position: absolute;
		left: 0;
		top: 0;
		width: 100% !important;
		margin: 0 !important;
		padding: 0 !important;
		box-shadow: none !important;
		border: none !important;
	}

	.registry-table {
		page-break-inside: auto;

		tr {
			page-break-inside: avoid;
			page-break-after: auto;
		}
	}

	@page {
		size: A4 portrait;
		margin: 12mm 15mm;
	}
}
</style>