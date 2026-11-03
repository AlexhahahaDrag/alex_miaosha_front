<template>
	<!-- AI 智能助手面板 (Tailwind Soft UI 渐进式折叠 Progressive Disclosure) -->
	<div
		class="rounded-2xl border-0 bg-indigo-500/[0.08] transition-all overflow-hidden"
	>
		<!-- 顶部紧凑微卡片 (对标记账抽屉 AI 辅助栏) -->
		<div
			class="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-indigo-500/[0.04] transition-colors gap-3"
			@click="isAiExpanded = !isAiExpanded"
		>
			<div class="flex items-center gap-2 min-w-0 flex-1">
				<span
					class="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 inline-flex items-center justify-center shrink-0 text-xs"
				>
					<ThunderboltOutlined />
				</span>
				<div class="flex items-center gap-2 min-w-0 truncate">
					<span class="text-xs font-semibold text-indigo-950 shrink-0">
						AI 智能助手
					</span>
					<!-- 摘要标签 (动态显示) -->
					<template v-if="aiRecommending">
						<span class="text-xs text-indigo-500 animate-pulse font-normal truncate">
							正在结合近 3 月消费流水智能测算中...
						</span>
					</template>
					<template v-else-if="aiRecommendData">
						<span
							class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-indigo-500/15 text-indigo-700 font-semibold font-mono shrink-0"
						>
							适度推荐 ¥{{ formatAmount(aiRecommendData.moderateAmount || 0) }}
						</span>
						<span
							v-if="aiRecommendData.recommendedCategories?.length"
							class="text-xs text-slate-500 truncate"
						>
							建议管控:
							{{ aiRecommendData.recommendedCategories.slice(0, 3).join(' · ') }}
						</span>
					</template>
					<template v-else>
						<span class="text-xs text-indigo-700/80 font-normal truncate">
							点击测算智能生成三档预算与重点分类推荐
						</span>
					</template>
				</div>
			</div>

			<div class="flex items-center gap-1.5 shrink-0" @click.stop>
				<button
					type="button"
					:disabled="aiRecommending"
					data-testid="btn-fetch-ai-recommend"
					class="inline-flex items-center gap-1 h-7 px-3 rounded-xl border-0 bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-60 text-xs font-medium shadow-xs shadow-indigo-500/20 cursor-pointer transition-all duration-150"
					@click="fetchAiRecommend"
				>
					<ThunderboltOutlined />
					<span>{{ aiRecommendData ? '重测' : '智能测算' }}</span>
				</button>
				<button
					type="button"
					class="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl border-0 bg-white/80 hover:bg-white text-xs font-medium text-indigo-600 hover:text-indigo-700 shadow-2xs cursor-pointer transition-all duration-150"
					data-testid="btn-toggle-ai-expand"
					@click="isAiExpanded = !isAiExpanded"
				>
					<span>{{ isAiExpanded ? '收起' : '口语配置' }}</span>
					<UpOutlined v-if="isAiExpanded" class="text-[10px]" />
					<DownOutlined v-else class="text-[10px]" />
				</button>
			</div>
		</div>

		<!-- 展开区域 (Tailwind Soft UI 无边框内嵌面板) -->
		<div v-if="isAiExpanded" class="px-3 pb-3 pt-0.5 space-y-2.5">
			<!-- 一句话指令快捷配置输入 -->
			<div class="bg-white/90 rounded-xl p-2.5 shadow-2xs space-y-2">
				<div class="flex items-center gap-2">
					<a-input
						v-model:value="aiCommandInput"
						placeholder="口语化输入，如：“帮我设2500预算，重点管餐饮和交通” 或 “不设上限”"
						class="!rounded-xl text-xs flex-1"
						allow-clear
						data-testid="ai-command-input"
						@press-enter="handleAiParseCommand"
					/>
					<button
						type="button"
						:disabled="aiParsing"
						data-testid="btn-ai-parse-command"
						class="shrink-0 h-8 px-3.5 rounded-xl border-0 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-60 text-xs font-medium shadow-xs shadow-indigo-500/20 cursor-pointer transition-all duration-150 inline-flex items-center gap-1"
						@click="handleAiParseCommand"
					>
						<span>AI 解析回填</span>
					</button>
				</div>

				<!-- 口语化示例 Chips -->
				<div class="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
					<span class="text-slate-400">试试指令:</span>
					<button
						v-for="sample in aiCommandSamples"
						:key="sample"
						type="button"
						class="cursor-pointer px-2.5 py-0.5 rounded-full bg-slate-100/90 hover:bg-indigo-500/10 text-slate-600 hover:text-indigo-600 border-0 text-[11px] font-medium transition-all select-none"
						@click="applyAiCommandSample(sample)"
					>
						{{ sample }}
					</button>
				</div>
			</div>

			<!-- AI 测算加载骨架态 (防布局跳动 Shimmer) -->
			<div
				v-if="aiRecommending && !aiRecommendData"
				class="bg-white/90 rounded-xl p-3 border-0 shadow-2xs animate-pulse space-y-2"
			>
				<div class="h-4 bg-indigo-500/15 rounded-lg w-1/3"></div>
				<div class="h-3 bg-slate-100 rounded-lg w-2/3"></div>
				<div class="grid grid-cols-3 gap-2 pt-1">
					<div class="h-12 bg-slate-100 rounded-xl"></div>
					<div class="h-12 bg-indigo-500/10 rounded-xl"></div>
					<div class="h-12 bg-slate-100 rounded-xl"></div>
				</div>
			</div>

			<!-- AI 测算结果展示区 -->
			<div
				v-else-if="aiRecommendData"
				class="bg-white/95 rounded-xl p-3 border-0 shadow-2xs space-y-2.5 transition-all"
			>
				<div class="flex items-start justify-between gap-3">
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between text-xs text-slate-800 font-semibold">
							<div class="flex items-center gap-1.5">
								<BulbOutlined class="text-amber-500" />
								<span>AI 消费洞察与建议</span>
							</div>
							<span
								v-if="aiRecommendData.isFallback"
								class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium"
							>
								智能规则模式
							</span>
							<span
								v-else
								class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-medium"
							>
								大模型深度洞察
							</span>
						</div>
						<div class="text-xs text-slate-600 mt-1 leading-relaxed">
							{{ aiRecommendData.healthAdvice }}
						</div>
						<div
							v-if="aiRecommendData.dailyLimitSuggest"
							class="text-[11px] text-slate-400 mt-1"
						>
							建议每日均摊控制在
							<span class="font-mono font-semibold text-indigo-600">
								¥{{ formatAmount(aiRecommendData.dailyLimitSuggest || 0) }}
							</span>
							以内
						</div>
					</div>
				</div>

				<!-- 三档推荐胶囊快捷采纳 -->
				<div class="bg-slate-50/90 rounded-xl p-2.5 space-y-2">
					<div class="flex items-center justify-between text-[11px] text-slate-400">
						<span>推荐档位 (点击一键采纳额度)</span>
						<span v-if="aiRecommendData.avgMonthlyExpense" class="font-mono">
							近3月均支出: ¥{{
								formatAmount(aiRecommendData.avgMonthlyExpense || 0)
							}}
						</span>
					</div>
					<div class="grid grid-cols-3 gap-2">
						<button
							type="button"
							class="cursor-pointer p-2 rounded-xl border-0 transition-all text-center"
							:class="
								currentBudgetAmount === aiRecommendData.savingAmount ?
									'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
								:	'bg-white hover:bg-indigo-500/10 text-slate-700 shadow-2xs'
							"
							@click="$emit('apply-tier', aiRecommendData.savingAmount)"
						>
							<div
								:class="[
									'text-[11px]',
									currentBudgetAmount === aiRecommendData.savingAmount ?
										'text-white/85'
									:	'text-slate-400',
								]"
							>
								节约档 (85%)
							</div>
							<div class="text-xs font-bold font-mono tabular-nums mt-0.5">
								¥{{ formatAmount(aiRecommendData.savingAmount || 0) }}
							</div>
						</button>
						<button
							type="button"
							data-testid="btn-apply-tier-moderate"
							class="cursor-pointer p-2 rounded-xl border-0 transition-all text-center relative"
							:class="
								currentBudgetAmount === aiRecommendData.moderateAmount ?
									'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
								:	'bg-white hover:bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/25 shadow-2xs'
							"
							@click="$emit('apply-tier', aiRecommendData.moderateAmount)"
						>
							<span
								class="absolute -top-1.5 right-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-semibold leading-tight"
							>
								推荐
							</span>
							<div
								:class="[
									'text-[11px] font-medium',
									currentBudgetAmount === aiRecommendData.moderateAmount ?
										'text-white/90'
									:	'text-indigo-600',
								]"
							>
								适度档 (100%)
							</div>
							<div class="text-xs font-bold font-mono tabular-nums mt-0.5">
								¥{{ formatAmount(aiRecommendData.moderateAmount || 0) }}
							</div>
						</button>
						<button
							type="button"
							class="cursor-pointer p-2 rounded-xl border-0 transition-all text-center"
							:class="
								currentBudgetAmount === aiRecommendData.relaxedAmount ?
									'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
								:	'bg-white hover:bg-indigo-500/10 text-slate-700 shadow-2xs'
							"
							@click="$emit('apply-tier', aiRecommendData.relaxedAmount)"
						>
							<div
								:class="[
									'text-[11px]',
									currentBudgetAmount === aiRecommendData.relaxedAmount ?
										'text-white/85'
									:	'text-slate-400',
								]"
							>
								宽松档 (115%)
							</div>
							<div class="text-xs font-bold font-mono tabular-nums mt-0.5">
								¥{{ formatAmount(aiRecommendData.relaxedAmount || 0) }}
							</div>
						</button>
					</div>
				</div>

				<!-- AI 建议重点分类一键采纳 -->
				<div
					v-if="aiRecommendData.recommendedCategories?.length"
					class="flex items-center justify-between gap-2 pt-0.5 text-xs flex-wrap"
				>
					<div class="flex items-center gap-1.5 text-slate-500 flex-wrap">
						<span>建议重点管控:</span>
						<span
							v-for="cat in aiRecommendData.recommendedCategories"
							:key="cat"
							class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 text-[11px] font-medium"
						>
							<span class="text-[11px] leading-none">{{
								getCategoryEmoji(cat)
							}}</span>
							<span>{{ cat }}</span>
						</span>
					</div>
					<button
						type="button"
						class="border-0 bg-transparent p-0 text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
						@click="
							$emit('apply-categories', aiRecommendData.recommendedCategories)
						"
					>
						一键采用推荐分类
					</button>
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
} from '@/views/selfFinance/financeManager/api';
import {
	getCategoryEmoji,
	type FinanceBudgetAiRecommendVo,
	type FinanceBudgetAiParseVo,
} from '@/views/selfFinance/financeManager/config';

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
			isAiExpanded.value = true;
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
