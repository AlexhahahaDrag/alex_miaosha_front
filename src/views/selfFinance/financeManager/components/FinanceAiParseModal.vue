<template>
	<a-modal
		:open="visible"
		title="AI 智能记账 (多场景快速解析)"
		:width="680"
		:confirm-loading="parsing"
		:destroy-on-close="true"
		wrap-class-name="modal-finance-ai-parse-wrap"
		@cancel="handleClose"
	>
		<div class="ai-parse-modal-body" data-testid="modal-finance-ai-parse">
			<a-alert
				type="info"
				show-icon
				class="mb-3"
				message="支持自然语言（日常收支）、购物小票单品明细、票据图片/截图识别抽取，大模型与本地规则双引擎保障 100% 可用。"
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

			<!-- 快速示例预填与附件工具栏 -->
			<div class="flex flex-wrap items-center justify-between gap-2 mb-2">
				<div class="quick-examples flex items-center flex-wrap gap-1">
					<span class="text-secondary text-xs mr-1">示例预填：</span>
					<a-tag
						color="blue"
						class="cursor-pointer"
						@click="
							applyExample(
								'昨天中午和同事聚餐微信付了128.5元，备注麦当劳汉堡套餐',
							)
						"
					>
						聚餐微信付128.5
					</a-tag>
					<a-tag
						color="green"
						class="cursor-pointer"
						@click="
							applyExample(
								'沃尔玛购物小票\n鲜牛奶 2 18.50\n全麦面包 1 12.00\n纸巾 3 10.00\n支付宝实付 79.00元',
							)
						"
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

				<!-- 上传附件/小票图片按钮 -->
				<div class="upload-trigger-wrap">
					<a-upload
						:show-upload-list="false"
						:before-upload="handleBeforeUpload"
						accept="image/*,application/pdf"
					>
						<a-button
							size="small"
							type="dashed"
							class="flex items-center gap-1"
							:loading="ocrLoading"
							data-testid="btn-upload-receipt-image"
						>
							<template #icon><CameraOutlined /></template>
							<span>{{ ocrLoading ? '识图中...' : '上传小票/凭证 (支持识图)' }}</span>
						</a-button>
					</a-upload>
				</div>
			</div>

			<!-- 文本输入区 (支持直接 Ctrl+V 粘贴截图) -->
			<div class="textarea-paste-wrapper relative">
				<a-textarea
					v-model:value="inputText"
					:rows="4"
					placeholder="请粘贴微信/支付宝账单、外卖消费描述、购物小票清单，或直接粘贴(Ctrl+V)/上传小票发票图片..."
					:maxlength="1000"
					show-count
					data-testid="input-finance-ai-text"
					@paste="handlePaste"
				/>
			</div>

			<!-- OCR 识别进度与反馈 -->
			<div
				v-if="ocrLoading"
				class="ocr-stage-banner mt-2 p-2.5 rounded border border-indigo-200 bg-indigo-50/70"
			>
				<div class="flex justify-between items-center text-xs mb-1.5 text-indigo-700 font-medium">
					<div class="flex items-center gap-1.5">
						<LoadingOutlined spin />
						<span>{{ ocrStatusText || '正在读取小票图像内容...' }}</span>
					</div>
					<span class="font-bold">{{ ocrProgress }}%</span>
				</div>
				<a-progress
					:percent="ocrProgress"
					size="small"
					:stroke-color="{ '0%': '#6366f1', '100%': '#3b82f6' }"
					:show-info="false"
				/>
			</div>

			<!-- 已上传附件凭证列表 -->
			<div
				v-if="attachments.length > 0"
				class="attachments-preview-list flex flex-wrap gap-2 mt-2"
			>
				<div
					v-for="(att, idx) in attachments"
					:key="idx"
					class="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200"
				>
					<PaperClipOutlined class="text-blue-500" />
					<a
						v-if="att.url"
						:href="att.preUrl || att.url"
						target="_blank"
						class="text-blue-600 hover:underline max-w-[160px] truncate"
						:title="att.name"
					>
						{{ att.name }}
					</a>
					<span v-else class="max-w-[160px] truncate" :title="att.name">
						{{ att.name }}
					</span>
					<LoadingOutlined v-if="att.status === 'uploading'" spin class="text-blue-500" />
					<span
						class="text-slate-400 hover:text-red-500 cursor-pointer ml-1 text-sm font-bold"
						title="移除"
						@click="removeAttachment(idx)"
					>
						×
					</span>
				</div>
			</div>

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
			<div
				v-if="parsing || stageStatus"
				class="stream-stage-banner mt-3 p-3 rounded border border-blue-200 bg-blue-50/60"
			>
				<div class="flex justify-between items-center text-xs mb-1.5">
					<div class="flex items-center gap-1.5 text-blue-700 font-medium">
						<LoadingOutlined v-if="parsing" spin />
						<CheckCircleOutlined v-else class="text-green-600" />
						<span>{{
							stageStatus?.message || '正在分析记账语境与语义...'
						}}</span>
					</div>
					<span class="text-blue-600 font-bold"
						>{{ stageStatus?.progress ?? 0 }}%</span
					>
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
						<a-tag
							:color="
								parsedResult.incomeAndExpenses === 'income' ? 'green' : 'red'
							"
						>
							{{
								parsedResult.incomeAndExpenses === 'income' ? '收入' : '支出'
							}}
						</a-tag>
						<a-tag color="cyan">{{ parsedResult.typeName || '未分类' }}</a-tag>
						<a-tag v-if="parsedResult.fromSourceName" color="blue">{{
							parsedResult.fromSourceName
						}}</a-tag>
						<a-tag v-if="parsedResult.prepaidCardName" color="purple">
							卡: {{ parsedResult.prepaidCardName }}
						</a-tag>
					</div>
					<div class="text-xs text-secondary">
						引擎:
						{{
							parsedResult.parseEngine === 'AI_DEEPSEEK' ?
								'DeepSeek AI'
							:	'本地规则引擎'
						}}
					</div>
				</div>

				<div class="parsed-card-body mt-2 grid grid-cols-2 gap-2 text-sm">
					<div>
						<strong>金额：</strong
						><span class="text-red-500 font-bold text-base"
							>¥ {{ parsedResult.amount || '0.00' }}</span
						>
					</div>
					<div>
						<strong>账目名称：</strong>{{ parsedResult.name || '未命名' }}
					</div>
					<div>
						<strong>发生时间：</strong>{{ parsedResult.infoDate || '当前时间' }}
					</div>
					<div>
						<strong>归属人：</strong
						>{{ parsedResult.belongToName || '默认成员' }}
					</div>
					<div class="col-span-2" v-if="parsedResult.description">
						<strong>摘要备注：</strong>{{ parsedResult.description }}
					</div>
				</div>

				<!-- 购物小票条目清单展示 -->
				<div
					v-if="parsedResult.receiptItems && parsedResult.receiptItems.length"
					class="receipt-items-table mt-3"
				>
					<div class="text-xs font-bold mb-1">
						小票提取明细（共 {{ parsedResult.receiptItems.length }} 件商品）：
					</div>
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
import {
	ThunderboltOutlined,
	LoadingOutlined,
	CheckCircleOutlined,
	CameraOutlined,
	PaperClipOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { createWorker } from 'tesseract.js';
import { addFileManager } from '@/api/file';
import {
	parseUniversalFinanceLedger,
	parseUniversalFinanceLedgerStream,
} from '@/views/selfFinance/financeManager/api';
import type {
	UniversalFinanceAiParseReq,
	UniversalFinanceAiParseVo,
	UniversalFinanceAiStageVo,
} from '@/views/selfFinance/financeManager/config';

interface UploadedAttachment {
	id?: string;
	name: string;
	url?: string;
	preUrl?: string;
	status: 'uploading' | 'done' | 'error';
}

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

// 附件管理与 OCR 状态
const attachments = ref<UploadedAttachment[]>([]);
const ocrLoading = ref(false);
const ocrProgress = ref(0);
const ocrStatusText = ref('');

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

// 触发 OCR 提取与文字清洗注入
const processImageOcr = async (file: File) => {
	ocrLoading.value = true;
	ocrProgress.value = 0;
	ocrStatusText.value = '启动 OCR 文字识别引擎...';

	let worker: any = null;
	try {
		worker = await createWorker('chi_sim+eng', 1, {
			logger: (m) => {
				if (m.status === 'recognizing text') {
					ocrStatusText.value = '正在识别小票文字...';
					ocrProgress.value = Math.min(
						99,
						Math.max(1, Math.round((m.progress || 0) * 100)),
					);
				} else if (m.status === 'loading tesseract core') {
					ocrStatusText.value = '加载识别内核...';
					ocrProgress.value = 20;
				} else if (m.status === 'loading language traineddata') {
					ocrStatusText.value = '载入中英文字库...';
					ocrProgress.value = 40;
				} else {
					ocrStatusText.value = m.status || '处理中...';
				}
			},
		});

		const { data } = await worker.recognize(file);
		const recognizedText = (data?.text || '').trim();
		if (recognizedText) {
			ocrProgress.value = 100;
			if (inputText.value.trim()) {
				inputText.value = `${inputText.value.trim()}\n${recognizedText}`;
			} else {
				inputText.value = recognizedText;
			}
			scene.value = 'SHOP_RECEIPT';
			message.success('小票文字已自动提取并填入，可点击「开始智能解析」');
		} else {
			message.warning('未能识别出清晰文字，请检查图片清晰度或手动输入');
		}
	} catch (err: any) {
		console.warn('OCR processing failed:', err);
		message.error('小票识别未完成，请检查网络或直接输入文本');
	} finally {
		if (worker) {
			try {
				await worker.terminate();
			} catch (e) {
				// ignore
			}
		}
		ocrLoading.value = false;
		ocrProgress.value = 0;
		ocrStatusText.value = '';
	}
};

// 上传附件至 OSS 并触发识图
const handleFileProcess = async (file: File) => {
	const item: UploadedAttachment = {
		name: file.name || `凭证截图_${Date.now()}.png`,
		status: 'uploading',
	};
	attachments.value.push(item);

	// 1. 同步上传到 OSS
	try {
		const formData = new FormData();
		formData.append('file', file);
		const { code, data, message: msg } = await addFileManager(formData, {
			type: 'finance',
		});
		if (String(code) === '200' && data) {
			item.id = data.id ? String(data.id) : undefined;
			item.url = data.preUrl || data.url;
			item.preUrl = data.preThumbnailUrl || data.preUrl;
			item.status = 'done';
		} else {
			item.status = 'error';
			message.warn(msg || '凭证上传失败，但不影响文本识别');
		}
	} catch (e: any) {
		item.status = 'error';
		console.warn('Upload attachment error:', e);
	}

	// 2. 如果是图片类型，触发 OCR 识别
	if (file.type && file.type.startsWith('image/')) {
		await processImageOcr(file);
	}
};

// 选文件回调
const handleBeforeUpload = (file: File) => {
	void handleFileProcess(file);
	return false;
};

// 支持剪贴板粘贴 (Ctrl+V)
const handlePaste = (e: ClipboardEvent) => {
	const items = e.clipboardData?.items;
	if (!items) return;
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item.kind === 'file' && item.type.startsWith('image/')) {
			const file = item.getAsFile();
			if (file) {
				message.info('检测到粘贴的截图，正在上传并识别小票文字...');
				void handleFileProcess(file);
				break;
			}
		}
	}
};

const removeAttachment = (idx: number) => {
	attachments.value.splice(idx, 1);
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
			const {
				code,
				data,
				message: msg,
			} = await parseUniversalFinanceLedger({
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
	const appliedData: UniversalFinanceAiParseVo = {
		...parsedResult.value,
		attachments: attachments.value
			.filter((a) => a.status === 'done')
			.map((a) => ({
				id: a.id,
				name: a.name,
				url: a.url,
				preUrl: a.preUrl || a.url,
			})),
	};
	emit('apply', appliedData);
	handleClose();
};

const handleClose = () => {
	emit('update:visible', false);
	inputText.value = '';
	parsedResult.value = null;
	stageStatus.value = null;
	scene.value = 'AUTO_DETECT';
	attachments.value = [];
	ocrLoading.value = false;
	ocrProgress.value = 0;
	ocrStatusText.value = '';
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
