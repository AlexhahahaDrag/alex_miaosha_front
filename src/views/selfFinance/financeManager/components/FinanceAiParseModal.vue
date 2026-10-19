<template>
	<a-modal
		:visible="visible"
		title="AI 智能记账 (多场景快速解析)"
		:width="680"
		:confirm-loading="parsing"
		:destroy-on-close="true"
		data-testid="modal-finance-ai-parse"
		@cancel="handleClose"
	>
		<div class="ai-parse-modal-body">
			<a-alert
				type="info"
				show-icon
				class="mb-3"
				message="支持自然语言（日常收支）、购物小票单品明细及预付卡储值/消费记录智能抽取，大模型与本地规则双引擎保障 100% 可用。"
			/>

			<!-- 场景快捷切换 -->
			<div class="scene-radio-group mb-3">
				<span class="label mr-2">记账模式：</span>
				<a-radio-group v-model:value="scene" button-style="solid" size="small">
					<a-radio-button value="AUTO_DETECT">自动识别</a-radio-button>
					<a-radio-button value="DAILY_EXPENSE">日常收支</a-radio-button>
					<a-radio-button value="SHOP_RECEIPT">购物小票</a-radio-button>
					<a-radio-button value="PREPAID_CARD">预付储值卡</a-radio-button>
				</a-radio-group>
			</div>

			<!-- 快速示例预填 -->
			<div class="quick-examples mb-2">
				<span class="text-secondary text-xs mr-2">点此填入示例：</span>
				<a-tag
					color="blue"
					class="cursor-pointer"
					@click="applyExample('昨天中午和同事聚餐微信付了128.5元，备注麦当劳汉堡套餐')"
				>
					聚餐微信付128.5
				</a-tag>
				<a-tag
					color="green"
					class="cursor-pointer"
					@click="applyExample('沃尔玛购物小票\n鲜牛奶 2 18.50\n全麦面包 1 12.00\n纸巾 3 10.00\n支付宝实付 79.00元')"
				>
					超市小票明细
				</a-tag>
				<a-tag
					color="purple"
					class="cursor-pointer"
					@click="applyExample('在咖啡厅刷星巴克星礼卡消费了38元')"
				>
					刷星巴克星礼卡38
				</a-tag>
			</div>

			<!-- 文本输入区 -->
			<a-textarea
				v-model:value="inputText"
				:rows="4"
				placeholder="请粘贴微信/支付宝账单、外卖消费描述、购物小票清单或输入语音转文字流水..."
				:maxlength="1000"
				show-count
				data-testid="input-finance-ai-text"
			/>

			<div class="flex justify-end mt-2">
				<a-button
					type="primary"
					:loading="parsing"
					:disabled="!inputText.trim()"
					data-testid="btn-do-finance-ai-parse"
					@click="handleParse"
				>
					<template #icon><ThunderboltOutlined /></template>
					开始智能解析
				</a-button>
			</div>

			<!-- 流式分阶段状态与打字机微交互 -->
			<div v-if="parsing || stageStatus" class="stream-stage-banner mt-3 p-3 rounded border border-blue-200 bg-blue-50/60">
				<div class="flex justify-between items-center text-xs mb-1.5">
					<div class="flex items-center gap-1.5 text-blue-700 font-medium">
						<LoadingOutlined v-if="parsing" spin />
						<CheckCircleOutlined v-else class="text-green-600" />
						<span>{{ stageStatus?.message || '正在分析记账语境与语义...' }}</span>
					</div>
					<span class="text-blue-600 font-bold">{{ stageStatus?.progress ?? 0 }}%</span>
				</div>
				<a-progress
					:percent="stageStatus?.progress ?? 0"
					:status="parsing ? 'active' : 'normal'"
					:stroke-color="{ '0%': '#3b82f6', '100%': '#10b981' }"
					:show-info="false"
					size="small"
				/>
			</div>

			<!-- 解析结果卡片 -->
			<div v-if="parsedResult" class="parsed-card mt-3">
				<div class="parsed-card-header flex justify-between items-center">
					<div class="flex items-center gap-2">
						<span class="font-bold text-base">解析结果预览</span>
						<a-tag :color="parsedResult.incomeAndExpenses === 'income' ? 'green' : 'red'">
							{{ parsedResult.incomeAndExpenses === 'income' ? '收入' : '支出' }}
						</a-tag>
						<a-tag color="cyan">{{ parsedResult.typeName || '未分类' }}</a-tag>
						<a-tag v-if="parsedResult.fromSourceName" color="blue">{{ parsedResult.fromSourceName }}</a-tag>
						<a-tag v-if="parsedResult.prepaidCardName" color="purple">
							卡: {{ parsedResult.prepaidCardName }}
						</a-tag>
					</div>
					<div class="text-xs text-secondary">
						引擎: {{ parsedResult.parseEngine === 'AI_DEEPSEEK' ? 'DeepSeek AI' : '本地规则引擎' }}
					</div>
				</div>

				<div class="parsed-card-body mt-2 grid grid-cols-2 gap-2 text-sm">
					<div><strong>金额：</strong><span class="text-red-500 font-bold text-base">¥ {{ parsedResult.amount || '0.00' }}</span></div>
					<div><strong>账目名称：</strong>{{ parsedResult.name || '未命名' }}</div>
					<div><strong>发生时间：</strong>{{ parsedResult.infoDate || '当前时间' }}</div>
					<div><strong>归属人：</strong>{{ parsedResult.belongToName || '默认成员' }}</div>
					<div class="col-span-2" v-if="parsedResult.description">
						<strong>摘要备注：</strong>{{ parsedResult.description }}
					</div>
				</div>

				<!-- 购物小票条目清单展示 -->
				<div v-if="parsedResult.receiptItems && parsedResult.receiptItems.length" class="receipt-items-table mt-3">
					<div class="text-xs font-bold mb-1">小票提取明细（共 {{ parsedResult.receiptItems.length }} 件商品）：</div>
					<table class="w-full text-xs border-collapse">
						<thead>
							<tr class="bg-gray-100 text-gray-600">
								<th class="p-1 text-left border">商品品名</th>
								<th class="p-1 text-center border">单价</th>
								<th class="p-1 text-center border">数量</th>
								<th class="p-1 text-right border">小计</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(it, idx) in parsedResult.receiptItems" :key="idx">
								<td class="p-1 border">{{ it.itemName }}</td>
								<td class="p-1 text-center border">¥{{ it.unitPrice }}</td>
								<td class="p-1 text-center border">{{ it.quantity }}</td>
								<td class="p-1 text-right border">¥{{ it.subtotal }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<template #footer>
			<a-button @click="handleClose">取消</a-button>
			<a-button
				type="primary"
				:disabled="!parsedResult"
				data-testid="btn-apply-finance-ai-result"
				@click="handleApply"
			>
				一键填入表单
			</a-button>
		</template>
	</a-modal>
</template>

<script setup lang="ts">
import { ThunderboltOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {
	parseUniversalFinanceLedger,
	parseUniversalFinanceLedgerStream,
} from '@/views/selfFinance/financeManager/api';
import type {
	UniversalFinanceAiParseReq,
	UniversalFinanceAiParseVo,
	UniversalFinanceAiStageVo,
} from '@/views/selfFinance/financeManager/config';

const props = defineProps<{
	visible: boolean;
	defaultBelongTo?: string;
}>();

const emit = defineEmits<{
	(e: 'update:visible', val: boolean): void;
	(e: 'apply', result: UniversalFinanceAiParseVo): void;
}>();

const scene = ref<UniversalFinanceAiParseReq['scene']>('AUTO_DETECT');
const inputText = ref('');
const parsing = ref(false);
const stageStatus = ref<UniversalFinanceAiStageVo | null>(null);
const parsedResult = ref<UniversalFinanceAiParseVo | null>(null);

const applyExample = (ex: string) => {
	inputText.value = ex;
	if (ex.includes('小票')) {
		scene.value = 'SHOP_RECEIPT';
	} else if (ex.includes('卡')) {
		scene.value = 'PREPAID_CARD';
	} else {
		scene.value = 'DAILY_EXPENSE';
	}
};

const handleParse = async () => {
	if (!inputText.value.trim()) {
		message.warning('请输入记账描述或小票文本');
		return;
	}
	parsing.value = true;
	parsedResult.value = null;
	stageStatus.value = {
		stage: 'SCENE_ANALYSIS',
		progress: 10,
		message: '建立流式连接中...',
	};

	let receivedStreamComplete = false;

	try {
		await parseUniversalFinanceLedgerStream(
			{
				scene: scene.value,
				text: inputText.value.trim(),
				belongTo: props.defaultBelongTo,
			},
			{
				onStage: (stageVo) => {
					stageStatus.value = stageVo;
					if (stageVo.partialData) {
						parsedResult.value = stageVo.partialData;
					}
				},
				onComplete: (result) => {
					receivedStreamComplete = true;
					parsedResult.value = result;
					message.success('AI 解析完成，请核对预览信息');
				},
				onError: (err) => {
					console.warn('SSE stream error, fallback to synchronous parse:', err);
				},
			},
		);
	} catch (e: any) {
		console.warn('Stream failed, executing sync fallback:', e);
	}

	// 若流式因网络或代理未完整返回结果，执行同步降级保底
	if (!receivedStreamComplete && !parsedResult.value) {
		try {
			const { code, data, message: msg } = await parseUniversalFinanceLedger({
				scene: scene.value,
				text: inputText.value.trim(),
				belongTo: props.defaultBelongTo,
			});
			if (String(code) === '200' || String(code) === '00000') {
				parsedResult.value = data || null;
				stageStatus.value = {
					stage: 'COMPLETE',
					progress: 100,
					message: '解析已完成',
				};
				message.success('AI 解析完成，请核对预览信息');
			} else {
				message.error(msg || '解析失败，请重试');
			}
		} catch (e: any) {
			message.error(e.message || '网络异常，解析失败');
		}
	}

	parsing.value = false;
};

const handleApply = () => {
	if (!parsedResult.value) return;
	emit('apply', parsedResult.value);
	handleClose();
};

const handleClose = () => {
	emit('update:visible', false);
	inputText.value = '';
	parsedResult.value = null;
	stageStatus.value = null;
	scene.value = 'AUTO_DETECT';
};
</script>

<style scoped>
.parsed-card {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 12px;
}
.receipt-items-table table {
	border: 1px solid #e2e8f0;
}
</style>
