<template>
	<a-drawer
		:open="open"
		title="AI 智能回礼档位测算器"
		:width="540"
		class="gift-return-calculator-drawer"
		root-class-name="gift-return-calculator-drawer-root"
		data-testid="drawer-gift-return-calculator"
		@close="onClose"
	>
		<div
			v-if="person"
			class="calculator-container"
			data-testid="calculator-drawer-content"
		>
			<!-- 亲友基本档案与往来画像 -->
			<div class="person-profile-card">
				<div class="profile-header">
					<div class="profile-main">
						<span class="person-name">{{ person.personName }}</span>
						<a-tag color="blue">
							{{ person.relationTypeName || '亲友' }}
						</a-tag>
						<a-tag
							:color="person.balanceStatus === 'SURPLUS' ? 'green' : person.balanceStatus === 'DEFICIT' ? 'orange' : 'default'"
						>
							{{ person.balanceStatus === 'SURPLUS' ? '人情盈余 (欠TA)' : person.balanceStatus === 'DEFICIT' ? '礼金借出 (待回)' : '收送持平' }}
						</a-tag>
					</div>
					<div class="net-balance">
						<span class="label">净差额：</span>
						<strong :class="person.netBalance >= 0 ? 'text-green' : 'text-orange'">
							{{ person.netBalance >= 0 ? '+' : '' }}{{ money(person.netBalance) }}
						</strong>
					</div>
				</div>
				<div class="profile-meta">
					<span>TA 送我总额: <strong>{{ money(person.totalReceiveAmount) }}</strong></span>
					<span class="divider">|</span>
					<span>我送 TA 总额: <strong>{{ money(person.totalGiveAmount) }}</strong></span>
				</div>
			</div>

			<!-- 测算事件选择区 -->
			<div class="form-section">
				<h4 class="section-title">
					1. 选择待办宴请事由
				</h4>
				<a-radio-group
					v-model:value="eventType"
					button-style="solid"
					class="event-type-group"
					data-testid="calc-event-type-group"
				>
					<a-radio-button value="WEDDING">
						结婚宴请
					</a-radio-button>
					<a-radio-button value="FULL_MONTH">
						满月百天
					</a-radio-button>
					<a-radio-button value="BIRTHDAY">
						长辈寿宴
					</a-radio-button>
					<a-radio-button value="HOUSEWARMING">
						乔迁之喜
					</a-radio-button>
					<a-radio-button value="FUNERAL">
						白事慰问
					</a-radio-button>
					<a-radio-button value="GENERAL">
						通用礼往
					</a-radio-button>
				</a-radio-group>

				<div class="calc-action-row">
					<a-button
						type="primary"
						block
						:loading="loading"
						data-testid="btn-do-gift-calc"
						@click="handleCalculate"
					>
						<template #icon>
							<ThunderboltOutlined />
						</template>
						{{ loading ? 'AI 正在推导最优吉利档位…' : 'AI 智能推导演算' }}
					</a-button>
				</div>
			</div>

			<!-- 测算推荐档位结果卡片 -->
			<div
				v-if="result"
				class="result-section"
				data-testid="calc-result-panel"
			>
				<h4 class="section-title">
					2. 智能推荐档位 (结合历史参考基准 ¥{{ result.historicalBaseAmount }})
				</h4>

				<div class="tiers-grid">
					<!-- 最低体面档 -->
					<div class="tier-card tier-min">
						<div class="tier-header">
							<span>最低体面档</span>
							<a-tag size="small">
								底线守礼
							</a-tag>
						</div>
						<div class="tier-amount">
							<span class="currency">¥</span>
							<span class="val">{{ result.minDecentAmount }}</span>
						</div>
						<p class="tier-desc">
							适合普通往来，不失礼节
						</p>
					</div>

					<!-- 推荐平衡档 (高亮) -->
					<div class="tier-card tier-recommend">
						<div class="recommend-badge">
							推荐最佳
						</div>
						<div class="tier-header">
							<span class="bold">推荐平衡档</span>
							<a-tag
								color="green"
								size="small"
							>
								体面周全
							</a-tag>
						</div>
						<div class="tier-amount text-green">
							<span class="currency">¥</span>
							<span class="val">{{ result.recommendedAmount }}</span>
						</div>
						<p class="tier-desc">
							结合事由与亲疏加权的最优吉利档
						</p>
					</div>

					<!-- 热络加码档 -->
					<div class="tier-card tier-generous">
						<div class="tier-header">
							<span>热络加码档</span>
							<a-tag
								color="blue"
								size="small"
							>
								深化情谊
							</a-tag>
						</div>
						<div class="tier-amount text-blue">
							<span class="currency">¥</span>
							<span class="val">{{ result.generousAmount }}</span>
						</div>
						<p class="tier-desc">
							体现深厚交情与隆重关切
						</p>
					</div>
				</div>

				<!-- AI 测算依据阐述 -->
				<div class="rule-summary-card">
					<div class="summary-title">
						<InfoCircleOutlined class="icon-info" />
						<span>AI 测算推导逻辑</span>
					</div>
					<p class="summary-content">
						{{ result.ruleSummary }}
					</p>
				</div>

				<!-- 随赠祝颂语锦囊 -->
				<div class="blessing-card">
					<div class="blessing-header">
						<span class="blessing-title">💌 随赠祝颂语锦囊</span>
						<a-button
							size="small"
							type="link"
							data-testid="btn-copy-blessing"
							@click="copyBlessing(result.blessingWords)"
						>
							一键复制贺词
						</a-button>
					</div>
					<p class="blessing-text">
						{{ result.blessingWords }}
					</p>
				</div>
			</div>
		</div>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { recommendReturnGift } from '@/views/finance/gift/api';
import {
	money,
	type GiftPersonBalance,
	type GiftReturnRecommendationVo,
} from '@/views/finance/gift/config';

const props = defineProps<{
	open: boolean;
	person: GiftPersonBalance | null;
}>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
}>();

const eventType = ref<string>('WEDDING');
const loading = ref<boolean>(false);
const result = ref<GiftReturnRecommendationVo | null>(null);

watch(
	() => props.open,
	(val) => {
		if (val && props.person) {
			result.value = null;
			void handleCalculate();
		}
	},
);

const handleCalculate = async () => {
	if (!props.person?.personId) return;
	loading.value = true;
	try {
		const { code, data, message: msg } = await recommendReturnGift({
			personId: String(props.person.personId),
			eventType: eventType.value,
		});
		if (code === '200' || code === '00000') {
			result.value = data || null;
		} else {
			message.warning(msg || '测算失败');
		}
	} catch (e: unknown) {
		const errMsg = e instanceof Error ? e.message : '网络异常，测算失败';
		message.error(errMsg);
	} finally {
		loading.value = false;
	}
};

const copyBlessing = async (text: string) => {
	if (!text) return;
	try {
		await navigator.clipboard.writeText(text);
		message.success('随赠贺词已成功复制到剪贴板！');
	} catch {
		message.info(text);
	}
};

const onClose = () => {
	emit('update:open', false);
};
</script>

<style scoped lang="less">
.calculator-container {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.person-profile-card {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 12px 16px;

	.profile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;

		.profile-main {
			display: flex;
			align-items: center;
			gap: 8px;

			.person-name {
				font-size: 16px;
				font-weight: 600;
				color: #0f172a;
			}
		}

		.net-balance {
			font-size: 13px;
			.label {
				color: #64748b;
			}
			.text-green {
				color: #16a34a;
			}
			.text-orange {
				color: #ea580c;
			}
		}
	}

	.profile-meta {
		font-size: 12px;
		color: #64748b;
		display: flex;
		gap: 10px;
		.divider {
			color: #cbd5e1;
		}
		strong {
			color: #334155;
		}
	}
}

.form-section {
	.section-title {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
		margin-bottom: 8px;
	}

	.event-type-group {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 12px;

		:deep(.ant-radio-button-wrapper) {
			text-align: center;
			border-radius: 6px !important;
			border: 1px solid #d9d9d9;
			&::before {
				display: none;
			}
		}
	}

	.calc-action-row {
		margin-top: 6px;
	}
}

.result-section {
	margin-top: 8px;

	.section-title {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
		margin-bottom: 10px;
	}

	.tiers-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 14px;

		.tier-card {
			position: relative;
			background: #ffffff;
			border: 1px solid #e2e8f0;
			border-radius: 8px;
			padding: 12px;
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			transition: all 0.2s ease;

			&.tier-recommend {
				border-color: #22c55e;
				background: #f0fdf4;
				box-shadow: 0 4px 12px rgba(34, 197, 94, 0.12);

				.recommend-badge {
					position: absolute;
					top: -10px;
					background: #22c55e;
					color: #ffffff;
					font-size: 10px;
					font-weight: 600;
					padding: 1px 8px;
					border-radius: 999px;
				}
			}

			.tier-header {
				font-size: 12px;
				color: #475569;
				margin-bottom: 6px;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 4px;
				.bold {
					font-weight: 600;
					color: #166534;
				}
			}

			.tier-amount {
				font-size: 22px;
				font-weight: 800;
				font-family: monospace;
				color: #0f172a;
				margin-bottom: 4px;

				&.text-green {
					color: #16a34a;
				}
				&.text-blue {
					color: #2563eb;
				}

				.currency {
					font-size: 14px;
					margin-right: 2px;
				}
			}

			.tier-desc {
				font-size: 11px;
				color: #94a3b8;
				margin: 0;
			}
		}
	}

	.rule-summary-card {
		background: #f1f5f9;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 12px;
		color: #475569;
		line-height: 1.6;
		margin-bottom: 12px;

		.summary-title {
			display: flex;
			align-items: center;
			gap: 6px;
			font-weight: 600;
			color: #334155;
			margin-bottom: 4px;
			.icon-info {
				color: #0284c7;
			}
		}

		.summary-content {
			margin: 0;
		}
	}

	.blessing-card {
		background: #fff7ed;
		border: 1px solid #fed7aa;
		border-radius: 8px;
		padding: 12px;

		.blessing-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 6px;

			.blessing-title {
				font-size: 12px;
				font-weight: 600;
				color: #9a3412;
			}
		}

		.blessing-text {
			font-size: 13px;
			color: #c2410c;
			line-height: 1.5;
			font-weight: 500;
			margin: 0;
		}
	}
}
</style>
