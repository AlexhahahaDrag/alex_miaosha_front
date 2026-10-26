<template>
	<BaseRbacDrawer
		v-model:open="modelInfo.open"
		:title="modelInfo?.title || '记账明细'"
		:subtitle="drawerSubtitle"
		width="560px"
		:confirm-loading="loading"
		ok-text="保存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 只读模式：账单电子凭证卡片 -->
		<div v-if="isReadonly" class="detail-readonly-view">
			<div
				class="voucher-hero-card"
				:class="
					formState.incomeAndExpenses === 'income' ? 'is-income' : 'is-expense'
				"
			>
				<div class="hero-top-row">
					<div class="hero-title-group">
						<div class="hero-icon-box">
							<WalletOutlined />
						</div>
						<div class="hero-meta">
							<h3 class="hero-title">{{ formState.name || '未命名账目' }}</h3>
							<div class="hero-badges">
								<span
									class="direction-pill"
									:class="
										formState.incomeAndExpenses === 'income' ?
											'pill-income'
										:	'pill-expense'
									"
								>
									{{
										formState.incomeAndExpenses === 'income' ?
											'收入入账'
										:	'日常支出'
									}}
								</span>
								<span
									class="status-pill"
									:class="
										String(formState.isValid) === '1' ?
											'is-valid'
										:	'is-invalid'
									"
								>
									<span class="status-dot"></span>
									{{ String(formState.isValid) === '1' ? '有效账单' : '已失效' }}
								</span>
							</div>
						</div>
					</div>
					<div class="hero-amount-block">
						<span class="amount-label">账单金额</span>
						<span
							class="amount-value"
							:class="
								formState.incomeAndExpenses === 'income' ?
									'text-emerald-600'
								:	'text-rose-600'
							"
						>
							{{ formState.incomeAndExpenses === 'income' ? '+' : '-' }}¥{{
								formatAmount(formState.amount || 0)
							}}
						</span>
					</div>
				</div>
			</div>

			<div class="detail-section-card">
				<div class="section-header">
					<FileTextOutlined class="section-icon" />
					<span>交易凭证详情</span>
				</div>
				<div class="detail-grid">
					<div class="detail-cell">
						<span class="cell-label">
							<TagOutlined class="mr-1" />账目类别
						</span>
						<span class="cell-value">
							<span v-if="formState.typeCode" class="category-badge">
								{{ formState.typeCode }}
							</span>
							<span v-else class="text-slate-400">未分类</span>
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">
							<CreditCardOutlined class="mr-1" />支付方式
						</span>
						<span class="cell-value">
							<span class="source-badge">
								<component
									v-if="iconComponentMap[`finance-${formState.fromSource}`]"
									:is="iconComponentMap[`finance-${formState.fromSource}`]"
									class="source-icon"
								/>
								<span>{{ resolvedFromSourceName }}</span>
							</span>
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">
							<UserOutlined class="mr-1" />归属成员
						</span>
						<span class="cell-value font-semibold text-slate-800">
							{{ resolvedBelongToName }}
						</span>
					</div>
					<div class="detail-cell">
						<span class="cell-label">
							<ClockCircleOutlined class="mr-1" />业务时间
						</span>
						<span class="cell-value font-mono text-slate-700">
							{{ formattedInfoDate }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：现代垂直表单 -->
		<a-form
			v-else
			ref="formRef"
			name="financeForm"
			@keydown.ctrl.enter.prevent="handleSaveShortcut"
			@keydown.meta.enter.prevent="handleSaveShortcut"
			layout="vertical"
			class="modern-form"
			:model="formState"
			:rules="rulesRef"
		>
			<!-- 智能记账辅助栏 -->
			<div v-if="!formState.id" class="ai-assistant-banner mb-3 p-2 bg-blue-50 border border-blue-200 rounded flex justify-between items-center">
				<div class="text-xs text-blue-700 flex items-center">
					<ThunderboltOutlined class="mr-1 text-blue-500" />
					<span>粘贴账单、小票文本或预付卡流水，AI 自动帮您提取并填表</span>
				</div>
				<a-button
					type="primary"
					ghost
					size="small"
					data-testid="btn-finance-detail-ai-parse"
					@click="openAiModal"
				>
					<template #icon><ThunderboltOutlined /></template>
					智能记账 (AI识别)
				</a-button>
			</div>

			<div class="form-grid-2">
				<a-form-item name="name" label="账目名称">
					<a-input
						id="form_name"
						name="name"
						v-model:value="formState.name"
						placeholder="如：午餐、地铁打卡、电费"
						allow-clear
					/>
				</a-form-item>

				<a-form-item name="amount" label="账单金额">
					<a-input
						id="form_amount"
						name="amount"
						v-model:value="formState.amount"
						type="number"
						placeholder="请填写金额"
						prefix="￥"
						suffix="RMB"
					/>
				</a-form-item>
			</div>

			<a-form-item name="typeCode" label="账目类别">
				<div class="space-y-2">
					<a-input
						id="form_typeCode"
						name="typeCode"
						v-model:value="formState.typeCode"
						placeholder="填写或点击下方常用类别胶囊"
						allow-clear
					/>
					<div
						v-if="presetCategories.length"
						class="preset-category-chips flex flex-wrap gap-1.5 pt-1"
					>
						<span
							v-for="cat in presetCategories"
							:key="cat"
							:class="[
								'category-chip-pill',
								formState.typeCode === cat ? 'is-selected' : '',
							]"
							@click="toggleCategoryChip(cat)"
						>
							<span class="chip-emoji">{{ getCategoryEmoji(cat) }}</span>
							<span class="chip-name">{{ cat }}</span>
						</span>
					</div>
				</div>
			</a-form-item>

			<div class="form-grid-2">
				<a-form-item name="fromSource" label="支付方式">
					<a-select
						id="form_fromSource"
						name="fromSource"
						v-model:value="formState.fromSource"
						placeholder="请选择支付来源"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="fromSourceList"
						:allowClear="true"
					/>
				</a-form-item>

				<a-form-item name="incomeAndExpenses" label="收支类型">
					<a-select
						id="form_incomeAndExpenses"
						name="incomeAndExpenses"
						v-model:value="formState.incomeAndExpenses"
						placeholder="请选择收支类型"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="incomeAndExpensesList"
						:allowClear="true"
					/>
				</a-form-item>
			</div>

			<div class="form-grid-2">
				<a-form-item name="infoDate" label="业务时间">
					<a-date-picker
						id="form_infoDate"
						name="infoDate"
						v-model:value="formState.infoDate"
						show-time
						class="w-full"
						:format="dataTimeFormat"
						:getPopupContainer="
							(triggerNode: HTMLElement) => {
								return triggerNode.parentNode as HTMLElement;
							}
						"
					/>
				</a-form-item>

				<a-form-item name="belongTo" label="归属成员">
					<a-select
						id="form_belongTo"
						name="belongTo"
						v-model:value="formState.belongTo"
						:field-names="{ label: 'nickName', value: 'id' }"
						:options="userList"
						placeholder="请选择归属人"
					/>
				</a-form-item>
			</div>

			<div class="form-grid-2">
				<a-form-item name="isValid" label="有效状态">
					<a-select
						id="form_isValid"
						name="isValid"
						v-model:value="formState.isValid"
						placeholder="请选择有效状态"
						:field-names="{ label: 'typeName', value: 'typeCode' }"
						:options="validList"
						:allowClear="true"
					/>
				</a-form-item>
			</div>
		</a-form>

		<template #footer>
			<div class="flex items-center justify-between w-full">
				<div class="text-xs text-slate-400">
					<span v-if="!formState.id && !isReadonly">
						💡 支持连续记录多笔账目
					</span>
				</div>
				<a-space :size="10">
					<a-button class="drawer-btn" @click="handleCancel">
						{{ isReadonly ? '关闭' : '取消' }}
					</a-button>
					<a-button
						v-if="!formState.id && !isReadonly"
						class="drawer-btn"
						:loading="loading"
						@click="handleSaveAndContinue"
					>
						保存并再记一笔 (Ctrl+↵)
					</a-button>
					<a-button
						v-if="!isReadonly"
						type="primary"
						class="drawer-btn drawer-btn-primary"
						:loading="loading"
						@click="handleOk"
					>
						保存
					</a-button>
				</a-space>
			</div>
		</template>
	</BaseRbacDrawer>

	<!-- AI 记账弹窗 -->
	<FinanceAiParseModal
		v-model:visible="aiModalVisible"
		:default-belong-to="formState.belongTo"
		@apply="onApplyAiResult"
	/>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import {
	WalletOutlined,
	FileTextOutlined,
	TagOutlined,
	CreditCardOutlined,
	UserOutlined,
	ClockCircleOutlined,
	ThunderboltOutlined,
} from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import FinanceAiParseModal from '@/views/selfFinance/financeManager/components/FinanceAiParseModal.vue';
import type { UniversalFinanceAiParseVo } from '@/views/selfFinance/financeManager/config';
import { iconComponentMap } from '@/config/icons';
import { formatAmount } from '@/utils/amountInfo';
import { useUserStore } from '@/store/modules/user/user';
import type { ModelInfo } from '@/types/modal';
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';
import {
	getFinanceMangerDetail,
	addFinanceManger,
	editFinanceManger,
	getBudgetCategories,
} from '@/views/selfFinance/financeManager/api';
import {
	rulesRef,
	fromSourceTransferList,
} from '@/views/selfFinance/financeManager/config';
import { useUserInfo } from '@/composables/useUserInfo';
import { useDictInfo } from '@/composables/useDictInfo';
import {
	formatDayjs,
	formatTime,
	nowDayjs,
	formatMonth,
	dataTimeFormat,
} from '@/utils/dayjs';
import type { ResponseBody } from '@/types/api';

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });

const { getDictByType } = useDictInfo('pay_way,income_expense_type,is_valid');

const fromSourceList = computed(() => getDictByType('pay_way'));
const incomeAndExpensesList = computed(() =>
	getDictByType('income_expense_type'),
);
const validList = computed(() => getDictByType('is_valid'));

const { userList } = useUserInfo();

const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const currentUser = useUserStore()?.getUserInfo;
const formState = ref<FinanceManagerData>({});
const presetCategories = ref<string[]>([]);

const aiModalVisible = ref(false);
const openAiModal = () => {
	aiModalVisible.value = true;
};

const onApplyAiResult = (parsed: UniversalFinanceAiParseVo) => {
	if (!parsed) return;
	if (parsed.amount) {
		formState.value.amount = Number(parsed.amount);
	}
	if (parsed.name) {
		formState.value.name = parsed.name;
	}
	if (parsed.incomeAndExpenses) {
		formState.value.incomeAndExpenses = parsed.incomeAndExpenses;
	}
	if (parsed.typeCode) {
		formState.value.typeCode = parsed.typeCode;
	}
	if (parsed.fromSource) {
		formState.value.fromSource = parsed.fromSource;
	}
	if (parsed.belongTo) {
		formState.value.belongTo = String(parsed.belongTo);
	}
	if (parsed.infoDate) {
		formState.value.infoDate = formatTime(parsed.infoDate);
	}
	message.success('已将 AI 识别内容填入表单，请复核后保存');
};

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));

const drawerSubtitle = computed(() => {
	if (isReadonly.value) {
		return '查看账单收支金额、分类标签与归属成员等电子凭证信息';
	}
	return formState.value?.id ?
			'修改账单收支金额、分类或支付渠道信息'
		:	'快速录入日常消费或收入流水，支持连续记账';
});

const resolvedFromSourceName = computed(() => {
	const code = formState.value?.fromSource;
	if (!code) return '未指定';
	const fromDict = fromSourceList.value?.find((d) => d.typeCode === code);
	if (fromDict?.typeName) return fromDict.typeName;
	const fromStatic = fromSourceTransferList.find((item) => item.value === code);
	return fromStatic?.name || code;
});

const resolvedBelongToName = computed(() => {
	if (formState.value?.belongToName) return formState.value.belongToName;
	const belongId = formState.value?.belongTo;
	if (!belongId) return '未指定';
	const matched = userList.value?.find(
		(u) => String(u.id) === String(belongId),
	);
	return matched?.nickName || matched?.username || String(belongId);
});

const formattedInfoDate = computed(() => {
	if (!formState.value?.infoDate) return '—';
	return formatTime(formState.value.infoDate);
});

const fetchPresetCategories = async () => {
	try {
		const { code, data } = await getBudgetCategories(formatMonth());
		if (code === '200' && Array.isArray(data)) {
			const clean = data.filter(
				(c) =>
					c !== '支出' && c !== '收入' && c !== 'expense' && c !== 'income',
			);
			presetCategories.value = clean.slice(0, 10);
		}
	} catch (e) {
		console.warn('获取常用记账分类失败:', e);
	}
	if (!presetCategories.value.length) {
		presetCategories.value = [
			'餐饮',
			'日常交通',
			'日用百货',
			'水费',
			'电费',
			'零食',
			'工资',
		];
	}
};

const createDefaultFormState = (): FinanceManagerData => ({
	name: '',
	typeCode: '',
	amount: undefined,
	fromSource: 'wx',
	isValid: '1',
	incomeAndExpenses: 'expense',
	infoDate: nowDayjs(),
	belongTo: String(currentUser?.id ?? 2),
});


const categoryEmojiMap: Record<string, string> = {
	餐饮: '🍱',
	日常交通: '🚗',
	交通: '🚗',
	打车: '🚕',
	日用百货: '🛒',
	日用: '🛒',
	超市: '🏪',
	水费: '💧',
	电费: '⚡',
	燃气费: '🔥',
	零食: '🍿',
	饮品: '☕',
	咖啡: '☕',
	工资: '💰',
	奖金: '🧧',
	礼金: '🎁',
	房租: '🏠',
	医疗: '💊',
	娱乐: '🎮',
};

const getCategoryEmoji = (name: string): string => {
	for (const [key, emoji] of Object.entries(categoryEmojiMap)) {
		if (name.includes(key)) {
			return emoji;
		}
	}
	return '🏷️';
};

const toggleCategoryChip = (cat: string) => {
	if (formState.value.typeCode === cat) {
		formState.value.typeCode = '';
	} else {
		formState.value.typeCode = cat;
		if (!formState.value.name || formState.value.name.trim() === '') {
			formState.value.name = cat;
		}
	}
};

const handleSaveShortcut = () => {
	if (isReadonly.value) return;
	if (formState.value.id) {
		handleOk();
	} else {
		handleSaveAndContinue();
	}
};

const handleOk = () => {
	if (isReadonly.value) {
		handleCancel();
		return;
	}
	if (formRef.value) {
		loading.value = true;
		formRef.value
			.validateFields()
			.then(() => saveFinanceManager())
			.catch(() => (loading.value = false));
	}
};

const handleSaveAndContinue = async () => {
	if (!formRef.value) return;
	try {
		await formRef.value.validateFields();
		loading.value = true;
		const { code, message: messageInfo } = await addFinanceManger(
			formState.value,
		);
		if (code === '200') {
			message.success('已保存当前账目！可继续录入下一笔');
			emit('success');
			formState.value = {
				...formState.value,
				name: '',
				amount: undefined,
				typeCode: '',
				infoDate: nowDayjs(),
			};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} catch (err) {
		console.warn('表单验证未通过:', err);
	} finally {
		loading.value = false;
	}
};

const handleCancel = () => {
	modelInfo.value.open = false;
};

const saveFinanceManager = async () => {
	let api = addFinanceManger;
	if (formState.value.id) {
		api = editFinanceManger;
	}
	loading.value = true;
	const { code, message: messageInfo } = await api(formState.value)
		.catch((error: ResponseBody) => {
			return error;
		})
		.finally(() => {
			loading.value = false;
		});
	if (code === '200') {
		message.success(messageInfo || '保存成功！');
		formState.value = {};
		modelInfo.value.open = false;
		emit('success');
	} else {
		message.error(messageInfo || '保存失败！');
	}
};

const initDetail = async (modalData: ModelInfo | undefined) => {
	if (!modalData?.id) {
		formState.value = createDefaultFormState();
		if (modalData?.extraData) {
			onApplyAiResult(modalData.extraData as UniversalFinanceAiParseVo);
			modalData.extraData = undefined;
		}
		return;
	}

	const {
		code,
		data,
		message: messageInfo,
	} = await getFinanceMangerDetail(String(modalData.id));

	if (code !== '200') {
		message.error(messageInfo || '查询失败！');
		return;
	}

	const detailData = data || {};
	formState.value = {
		...detailData,
		infoDate: formatDayjs(detailData.infoDate),
	};
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			initDetail(modelInfo.value);
			fetchPresetCategories();
		}
	},
);

const emit = defineEmits(['success']);
</script>

<style lang="scss" scoped>
.detail-readonly-view {
	display: flex;
	flex-direction: column;
	gap: 16px;

	.voucher-hero-card {
		padding: 18px 20px;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

		&.is-income {
			border-color: #a7f3d0;
			background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 65%);
		}

		&.is-expense {
			border-color: #fecdd3;
			background: linear-gradient(135deg, #fff1f2 0%, #ffffff 65%);
		}

		.hero-top-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex-wrap: wrap;
		}

		.hero-title-group {
			display: flex;
			align-items: center;
			gap: 14px;
			min-width: 0;
		}

		.hero-icon-box {
			width: 44px;
			height: 44px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #ffffff;
			border: 1px solid #e2e8f0;
			color: #2563eb;
			font-size: 20px;
			flex-shrink: 0;
			box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
		}

		.hero-meta {
			display: flex;
			flex-direction: column;
			gap: 6px;
			min-width: 0;

			.hero-title {
				margin: 0;
				font-size: 16px;
				font-weight: 700;
				color: #0f172a;
				line-height: 1.3;
			}

			.hero-badges {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
			}
		}

		.direction-pill {
			display: inline-flex;
			align-items: center;
			padding: 2px 8px;
			border-radius: 6px;
			font-size: 11px;
			font-weight: 600;

			&.pill-income {
				background: #d1fae5;
				color: #047857;
			}

			&.pill-expense {
				background: #ffe4e6;
				color: #be123c;
			}
		}

		.status-pill {
			display: inline-flex;
			align-items: center;
			gap: 5px;
			padding: 2px 8px;
			border-radius: 999px;
			font-size: 11px;
			font-weight: 600;

			.status-dot {
				width: 6px;
				height: 6px;
				border-radius: 50%;
			}

			&.is-valid {
				background: #f0fdf4;
				color: #15803d;
				border: 1px solid #bbf7d0;
				.status-dot {
					background: #22c55e;
				}
			}

			&.is-invalid {
				background: #f1f5f9;
				color: #64748b;
				border: 1px solid #cbd5e1;
				.status-dot {
					background: #94a3b8;
				}
			}
		}

		.hero-amount-block {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 2px;

			.amount-label {
				font-size: 11px;
				color: #64748b;
				font-weight: 500;
			}

			.amount-value {
				font-size: 22px;
				font-weight: 800;
				font-variant-numeric: tabular-nums;
				letter-spacing: -0.02em;
			}
		}
	}

	.detail-section-card {
		padding: 16px 18px;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		background: #ffffff;

		.section-header {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 13px;
			font-weight: 600;
			color: #334155;
			margin-bottom: 14px;
			padding-bottom: 10px;
			border-bottom: 1px solid #f1f5f9;

			.section-icon {
				color: #3b82f6;
			}
		}

		.detail-grid {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 14px;

			.detail-cell {
				display: flex;
				flex-direction: column;
				gap: 6px;
				padding: 10px 12px;
				border-radius: 8px;
				background: #f8fafc;
				border: 1px solid #f1f5f9;

				.cell-label {
					font-size: 12px;
					color: #64748b;
				}

				.cell-value {
					font-size: 13px;
					color: #1e293b;
					display: flex;
					align-items: center;
				}
			}
		}
	}

	.category-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 10px;
		border-radius: 999px;
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		color: #1d4ed8;
		font-size: 12px;
		font-weight: 600;
	}

	.source-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 2px 8px;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 500;
		color: #334155;

		.source-icon {
			width: 15px;
			height: 15px;
		}
	}
}


.category-chip-pill {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 3px 10px;
	border-radius: 14px;
	border: 1px solid #e2e8f0;
	background: #f8fafc;
	font-size: 12px;
	color: #475569;
	cursor: pointer;
	user-select: none;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

	.chip-emoji {
		font-size: 13px;
	}

	&:hover {
		border-color: #93c5fd;
		background: #eff6ff;
		color: #1d4ed8;
		transform: translateY(-1px);
	}

	&.is-selected {
		border-color: #3b82f6;
		background: #dbeafe;
		color: #1d4ed8;
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.25);
	}
}

.modern-form {
	.form-grid-2 {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 16px;
	}

	:deep(.ant-form-item-label > label) {
		font-size: 13px;
		font-weight: 600;
		color: #334155;
	}

	:deep(.ant-input),
	:deep(.ant-input-affix-wrapper),
	:deep(.ant-select-selector),
	:deep(.ant-picker) {
		border-radius: 8px;
	}
}

.drawer-btn {
	min-width: 84px;
	height: 36px;
	border-radius: 8px;
	font-weight: 500;

	&.drawer-btn-primary {
		box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
	}
}
</style>
