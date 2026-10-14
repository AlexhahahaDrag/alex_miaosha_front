<template>
	<!-- AI 智能助手面板 (Taste-Skill 渐进式折叠 Progressive Disclosure) -->
	<div
		class="rounded-xl border border-solid border-indigo-100/90 bg-gradient-to-br from-indigo-50/50 via-sky-50/30 to-slate-50/50 transition-all shadow-2xs overflow-hidden"
	>
		<!-- 顶部紧凑微卡片 (高度约 40px，默认常驻展示核心 AI 摘要，0 视口压迫) -->
		<div
			class="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none hover:bg-white/40 transition-colors"
			@click="isAiExpanded = !isAiExpanded"
		>
			<div class="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
				<div
					class="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center shadow-xs text-xs font-semibold shrink-0"
				>
					AI
				</div>
				<div class="flex items-center gap-2 truncate">
					<span class="text-xs font-semibold text-slate-800 shrink-0"
						>AI 智能助手</span
					>
					<!-- 摘要标签 (动态显示) -->
					<template v-if="aiRecommending">
						<span class="text-2xs text-indigo-500 animate-pulse font-normal"
							>正在结合近 3 月消费流水智能测算中...</span
						>
					</template>
					<template v-else-if="aiRecommendData">
						<span
							class="inline-flex items-center px-1.5 py-0.5 rounded text-2xs bg-indigo-100 text-indigo-700 font-medium shrink-0"
						>
							适度推荐 ¥{{ formatAmount(aiRecommendData.moderateAmount || 0) }}
						</span>
						<span
							v-if="aiRecommendData.recommendedCategories?.length"
							class="text-2xs text-slate-500 truncate"
						>
							建议管控:
							{{ aiRecommendData.recommendedCategories.slice(0, 3).join(' · ') }}
						</span>
					</template>
					<template v-else>
						<span class="text-2xs text-slate-400 font-normal truncate"
							>点击测算智能生成三档预算与重点分类推荐</span
						>
					</template>
				</div>
			</div>

			<div class="flex items-center gap-2 shrink-0" @click.stop>
				<a-button
					type="link"
					size="small"
					class="!text-xs !p-0 !text-indigo-600 hover:!text-indigo-800 font-medium flex items-center gap-1"
					:loading="aiRecommending"
					@click="fetchAiRecommend"
				>
					<ThunderboltOutlined v-if="!aiRecommending" />
					<span>{{ aiRecommendData ? '重测' : '智能测算' }}</span>
				</a-button>
				<span class="text-slate-200 text-xs">|</span>
				<button
					type="button"
					class="cursor-pointer text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 bg-transparent border-none p-0 transition-colors"
					@click="isAiExpanded = !isAiExpanded"
				>
					<span>{{ isAiExpanded ? '收起' : '口语配置' }}</span>
					<UpOutlined v-if="isAiExpanded" class="text-2xs" />
					<DownOutlined v-else class="text-2xs" />
				</button>
			</div>
		</div>

		<!-- 展开区域 (带有平滑过渡与边界容器) -->
		<div
			v-if="isAiExpanded"
			class="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-solid border-indigo-100/70 bg-white/40"
		>
			<!-- 一句话指令快捷配置输入 -->
			<div class="flex items-center gap-2">
				<a-input
					v-model:value="aiCommandInput"
					placeholder="口语化输入，如：“帮我设2500预算，重点管餐饮和交通” 或 “不设上限”"
					class="!rounded-lg text-xs"
					allow-clear
					@press-enter="handleAiParseCommand"
				/>
				<a-button
					type="primary"
					size="small"
					class="!rounded-lg !text-xs !h-8 !px-3 !bg-indigo-600 hover:!bg-indigo-500 !border-indigo-600 flex items-center gap-1"
					:loading="aiParsing"
					@click="handleAiParseCommand"
				>
					<span>AI 解析回填</span>
				</a-button>
			</div>

			<!-- 口语化示例 Chips -->
			<div
				class="flex items-center gap-1.5 flex-wrap text-2xs text-slate-500"
			>
				<span class="text-slate-400">试试指令:</span>
				<button
					v-for="sample in aiCommandSamples"
					:key="sample"
					type="button"
					class="cursor-pointer px-2 py-0.5 rounded-full bg-white/90 hover:bg-white text-slate-600 border border-solid border-indigo-100 hover:border-indigo-300 hover:text-indigo-600 transition-all select-none"
					@click="applyAiCommandSample(sample)"
				>
					{{ sample }}
				</button>
			</div>

			<!-- AI 测算加载骨架态 (防布局跳动 Shimmer) -->
			<div
				v-if="aiRecommending && !aiRecommendData"
				class="bg-white/80 rounded-lg p-3 border border-solid border-indigo-100/60 animate-pulse space-y-2"
			>
				<div class="h-4 bg-indigo-100/60 rounded w-1/3"></div>
				<div class="h-3 bg-slate-100 rounded w-2/3"></div>
				<div class="grid grid-cols-3 gap-2 pt-1">
					<div class="h-10 bg-slate-100 rounded"></div>
					<div class="h-10 bg-indigo-50 rounded"></div>
					<div class="h-10 bg-slate-100 rounded"></div>
				</div>
			</div>

			<!-- AI 测算结果展示区 -->
			<div
				v-else-if="aiRecommendData"
				class="bg-white/95 rounded-lg p-3 border border-solid border-indigo-100/80 space-y-2.5 transition-all shadow-2xs"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="flex-1">
						<div
							class="flex items-center justify-between text-xs text-indigo-900 font-medium"
						>
							<div class="flex items-center gap-1.5">
								<BulbOutlined class="text-amber-500" />
								<span>AI 消费洞察与建议</span>
							</div>
							<span
								v-if="aiRecommendData.isFallback"
								class="text-3xs px-1.5 py-0.2 rounded bg-amber-100 text-amber-700"
								>智能规则模式</span
							>
							<span
								v-else
								class="text-3xs px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700"
								>大模型深度洞察</span
							>
						</div>
						<div class="text-xs text-slate-600 mt-1 leading-relaxed">
							{{ aiRecommendData.healthAdvice }}
						</div>
						<div
							v-if="aiRecommendData.dailyLimitSuggest"
							class="text-2xs text-slate-400 mt-1"
						>
							建议每日均摊控制在
							<span class="font-mono font-semibold text-indigo-600"
								>¥{{
									formatAmount(aiRecommendData.dailyLimitSuggest || 0)
								}}</span
							>
							以内
						</div>
					</div>
				</div>

				<!-- 三档推荐胶囊快捷采纳 -->
				<div class="pt-1.5 border-t border-solid border-slate-100">
					<div
						class="flex items-center justify-between text-2xs text-slate-400 mb-1.5"
					>
						<span>推荐档位 (点击一键采纳额度):</span>
						<span v-if="aiRecommendData.avgMonthlyExpense"
							>近3月均支出: ¥{{
								formatAmount(aiRecommendData.avgMonthlyExpense || 0)
							}}</span
						>
					</div>
					<div class="grid grid-cols-3 gap-2">
						<div
							class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center"
							:class="
								currentBudgetAmount === aiRecommendData.savingAmount ?
									'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
								:	'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
							"
							@click="$emit('apply-tier', aiRecommendData.savingAmount)"
						>
							<div class="text-2xs text-slate-500">节约档 (85%)</div>
							<div class="text-xs font-bold font-mono mt-0.5">
								¥{{ formatAmount(aiRecommendData.savingAmount || 0) }}
							</div>
						</div>
						<div
							class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center relative"
							:class="
								currentBudgetAmount === aiRecommendData.moderateAmount ?
									'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs ring-1 ring-indigo-300'
								:	'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
							"
							@click="$emit('apply-tier', aiRecommendData.moderateAmount)"
						>
							<span
								class="absolute -top-1.5 right-1 px-1 rounded text-3xs bg-indigo-600 text-white leading-tight"
								>推荐</span
							>
							<div class="text-2xs text-indigo-600 font-medium">
								适度档 (100%)
							</div>
							<div
								class="text-xs font-bold font-mono mt-0.5 text-indigo-700"
							>
								¥{{ formatAmount(aiRecommendData.moderateAmount || 0) }}
							</div>
						</div>
						<div
							class="cursor-pointer p-2 rounded-lg border border-solid transition-all text-center"
							:class="
								currentBudgetAmount === aiRecommendData.relaxedAmount ?
									'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
								:	'bg-slate-50/60 border-slate-200/60 hover:border-indigo-300 text-slate-700'
							"
							@click="$emit('apply-tier', aiRecommendData.relaxedAmount)"
						>
							<div class="text-2xs text-slate-500">宽松档 (115%)</div>
							<div class="text-xs font-bold font-mono mt-0.5">
								¥{{ formatAmount(aiRecommendData.relaxedAmount || 0) }}
							</div>
						</div>
					</div>
				</div>

				<!-- AI 建议重点分类一键采纳 -->
				<div
					v-if="aiRecommendData.recommendedCategories?.length"
					class="flex items-center justify-between pt-1.5 border-t border-solid border-slate-100 text-2xs"
				>
					<div class="flex items-center gap-1.5 text-slate-600">
						<span>AI 建议重点管控:</span>
						<div class="flex items-center gap-1 flex-wrap">
							<span
								v-for="cat in aiRecommendData.recommendedCategories"
								:key="cat"
								class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-solid border-indigo-100 font-medium"
							>
								{{ cat }}
							</span>
						</div>
					</div>
					<a-button
						type="link"
						size="small"
						class="!text-2xs !p-0 !text-indigo-600 hover:!text-indigo-800 font-medium"
						@click="
							$emit(
								'apply-categories',
								aiRecommendData.recommendedCategories,
							)
						"
					>
						一键采用推荐分类
					</a-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	ThunderboltOutlined,
	UpOutlined,
	DownOutlined,
	BulbOutlined,
} from '@ant-design/icons-vue';
import { formatAmount } from '@/utils/amountInfo';
import { useUserStore } from '@/store/modules/user/user';
import {
	recommendBudget,
	parseBudgetCommand,
	type FinanceBudgetAiRecommendVo,
	type FinanceBudgetAiParseVo,
} from '../../api';

const aiRecommendData = defineModel<FinanceBudgetAiRecommendVo | null>(
	'aiRecommendData',
	{ default: null },
);

const props = defineProps<{
	currentMonth: string;
	belongTo?: string;
	currentBudgetAmount?: number | null;
	availableCategories?: string[];
}>();

const emit = defineEmits<{
	(e: 'apply-tier', amount?: number): void;
	(e: 'apply-categories', categories: string[]): void;
	(e: 'apply-parsed-command', data: FinanceBudgetAiParseVo): void;
}>();

const userStore = useUserStore();
const isAiExpanded = ref<boolean>(false);
const aiRecommending = ref<boolean>(false);
const aiParsing = ref<boolean>(false);
const aiCommandInput = ref<string>('');

const aiCommandSamples = [
	'帮我设3000预算，重点管餐饮交通',
	'每月2000零花钱，全部分类',
	'调高预算到5000',
	'不设预算上限',
];

const applyAiCommandSample = (sample: string) => {
	aiCommandInput.value = sample;
	handleAiParseCommand();
};

const fetchAiRecommend = async () => {
	aiRecommending.value = true;
	try {
		const targetBelongTo =
			props.belongTo ||
			((
				userStore.getUserInfo?.id !== undefined &&
				userStore.getUserInfo?.id !== null
			) ?
				String(userStore.getUserInfo.id)
			:	undefined);
		const { code, data, message: msg } = await recommendBudget({
			budgetMonth: props.currentMonth,
			belongTo: targetBelongTo,
		});
		if (code === '200' && data) {
			aiRecommendData.value = data;
			message.success('AI 智能测算完成');
		} else {
			message.warning(msg || 'AI 测算服务暂不可用');
		}
	} catch (e: any) {
		message.error(e?.message || '获取 AI 推荐失败');
	} finally {
		aiRecommending.value = false;
	}
};

const handleAiParseCommand = async () => {
	if (!aiCommandInput.value || !aiCommandInput.value.trim()) {
		message.warning('请输入指令内容');
		return;
	}
	aiParsing.value = true;
	try {
		const { code, data, message: msg } = await parseBudgetCommand({
			command: aiCommandInput.value.trim(),
			budgetMonth: props.currentMonth,
		});
		if (code === '200' && data) {
			emit('apply-parsed-command', data);
			message.success(data.reasoning || '已根据 AI 指令更新预算设定');
		} else {
			message.warning(msg || '未能解析该指令');
		}
	} catch (e: any) {
		message.error(e?.message || 'AI 指令解析失败');
	} finally {
		aiParsing.value = false;
	}
};

defineExpose({
	fetchAiRecommend,
	resetPanel() {
		aiCommandInput.value = '';
		isAiExpanded.value = false;
	},
});
</script>
