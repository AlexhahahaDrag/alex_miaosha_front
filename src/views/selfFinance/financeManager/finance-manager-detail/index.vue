<template>
	<BaseRbacDrawer
		v-model:open="modelInfo.open"
		:title="modelInfo?.title || '记账明细'"
		:subtitle="drawerSubtitle"
		width="560px"
		:loading="detailLoading || loading"
		:show-footer="!detailLoading"
		ok-text="保存"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<!-- 数据加载中骨架屏状态 -->
		<div v-if="detailLoading" class="space-y-3.5 py-1">
			<div class="p-5 rounded-2xl bg-slate-50/80 border-0">
				<a-skeleton active avatar :paragraph="{ rows: 2 }" />
			</div>
			<div class="p-5 rounded-2xl bg-slate-50/80 border-0">
				<a-skeleton active :paragraph="{ rows: 4 }" />
			</div>
		</div>

		<!-- 只读模式：账单电子凭证卡片 (Tailwind Soft UI) -->
		<div v-else-if="isReadonly" class="flex flex-col gap-4">
			<div
				:class="[
					'p-5 rounded-2xl border-0 transition-all',
					formState.incomeAndExpenses === 'income' ?
						'bg-emerald-500/[0.07]'
					:	'bg-rose-500/[0.07]',
				]"
			>
				<div class="flex items-center justify-between gap-4 flex-wrap">
					<div class="flex items-center gap-3.5 min-w-0">
						<div
							:class="[
								'w-11 h-11 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-xl shrink-0',
								formState.incomeAndExpenses === 'income' ?
									'text-emerald-600'
								:	'text-rose-600',
							]"
						>
							<WalletOutlined />
						</div>
						<div class="flex flex-col gap-1.5 min-w-0">
							<h3
								class="m-0 text-base font-bold text-slate-900 leading-snug truncate"
							>
								{{ formState.name || '未命名账目' }}
							</h3>
							<div class="flex items-center gap-2 flex-wrap">
								<span
									:class="[
										'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
										formState.incomeAndExpenses === 'income' ?
											'bg-emerald-500/15 text-emerald-700'
										:	'bg-rose-500/15 text-rose-700',
									]"
								>
									{{
										formState.incomeAndExpenses === 'income' ?
											'收入入账'
										:	'日常支出'
									}}
								</span>
								<span
									:class="[
										'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
										String(formState.isValid) === '1' ?
											'bg-emerald-500/10 text-emerald-600'
										:	'bg-slate-200/80 text-slate-500',
									]"
								>
									<span
										:class="[
											'w-1.5 h-1.5 rounded-full',
											String(formState.isValid) === '1' ?
												'bg-emerald-500'
											:	'bg-slate-400',
										]"
									></span>
									{{ String(formState.isValid) === '1' ? '有效账单' : '已失效' }}
								</span>
							</div>
						</div>
					</div>
					<div class="flex flex-col items-end gap-0.5">
						<span class="text-[11px] text-slate-400 font-medium">账单金额</span>
						<span
							:class="[
								'text-2xl font-extrabold font-mono tabular-nums tracking-tight',
								formState.incomeAndExpenses === 'income' ?
									'text-emerald-600'
								:	'text-rose-600',
							]"
						>
							{{ formState.incomeAndExpenses === 'income' ? '+' : '-' }}¥{{
								formatAmount(formState.amount || 0)
							}}
						</span>
					</div>
				</div>
			</div>

			<div class="p-4 rounded-2xl bg-slate-50/80 border-0 space-y-3">
				<div class="flex items-center gap-2 text-xs font-semibold text-slate-500 px-1">
					<span
						class="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 inline-flex items-center justify-center"
					>
						<FileTextOutlined class="text-[11px]" />
					</span>
					<span>交易凭证详情</span>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-white shadow-2xs">
						<span class="text-xs text-slate-400 flex items-center gap-1">
							<TagOutlined />账目类别
						</span>
						<div class="flex items-center min-h-[24px]">
							<span
								v-if="formState.typeCode"
								class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
								:style="getCategoryPillStyle(formState.typeCode)"
							>
								<span class="text-[11px] leading-none">{{
									getCategoryEmoji(formState.typeCode)
								}}</span>
								<span>{{ formState.typeCode }}</span>
							</span>
							<span v-else class="text-xs text-slate-400">未分类</span>
						</div>
					</div>
					<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-white shadow-2xs">
						<span class="text-xs text-slate-400 flex items-center gap-1">
							<CreditCardOutlined />支付方式
						</span>
						<div class="flex items-center min-h-[24px]">
							<span
								class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100/90 rounded-full text-xs font-medium text-slate-700"
							>
								<component
									v-if="getFinanceIconComponent(formState.fromSource)"
									:is="getFinanceIconComponent(formState.fromSource)"
									class="w-3.5 h-3.5 shrink-0"
								/>
								<CreditCardOutlined
									v-else
									class="text-[13px] text-slate-400 shrink-0"
								/>
								<span>{{ resolvedFromSourceName }}</span>
							</span>
						</div>
					</div>
					<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-white shadow-2xs">
						<span class="text-xs text-slate-400 flex items-center gap-1">
							<UserOutlined />归属成员
						</span>
						<span
							class="text-xs font-semibold text-slate-800 flex items-center min-h-[24px]"
						>
							{{ resolvedBelongToName }}
						</span>
					</div>
					<div class="flex flex-col gap-1.5 p-3 rounded-xl bg-white shadow-2xs">
						<span class="text-xs text-slate-400 flex items-center gap-1">
							<ClockCircleOutlined />业务时间
						</span>
						<span
							class="text-xs font-mono tabular-nums text-slate-700 flex items-center min-h-[24px]"
						>
							{{ formattedInfoDate }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 新增/编辑模式：Tailwind Soft UI 分组卡片表单 -->
		<a-form
			v-else
			ref="formRef"
			name="financeForm"
			layout="vertical"
			class="modern-soft-form space-y-3.5"
			:model="formState"
			:rules="rulesRef"
		>
			<!-- 智能记账辅助栏 -->
			<div
				v-if="!isEdit"
				class="p-3 bg-indigo-500/[0.08] rounded-2xl flex justify-between items-center gap-3"
			>
				<div class="text-xs text-indigo-700 flex items-center gap-1.5 font-medium">
					<span
						class="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 inline-flex items-center justify-center shrink-0"
					>
						<ThunderboltOutlined />
					</span>
					<span>粘贴账单、小票文本或预付卡流水，AI 自动帮您提取并填表</span>
				</div>
				<button
					type="button"
					data-testid="btn-finance-detail-ai-parse"
					class="shrink-0 inline-flex items-center gap-1 h-7 px-3 rounded-xl border-0 bg-indigo-500 text-white hover:bg-indigo-600 text-xs font-medium shadow-xs shadow-indigo-500/20 cursor-pointer transition-all duration-150"
					@click="openAiModal"
				>
					<ThunderboltOutlined />
					<span>智能记账 (AI识别)</span>
				</button>
			</div>

			<!-- 卡片 1：核心收支方向、金额与账目名称 -->
			<div class="bg-slate-50/80 rounded-2xl p-4 space-y-3">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<a-form-item
						name="incomeAndExpenses"
						label="收支类型"
						class="!mb-0"
					>
						<div
							id="form_incomeAndExpenses"
							class="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl h-9 box-border"
						>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									formState.incomeAndExpenses !== 'income' ?
										'bg-white text-rose-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="selectDirection('expense')"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"
								></span>
								<span>支出</span>
							</button>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									formState.incomeAndExpenses === 'income' ?
										'bg-white text-emerald-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="selectDirection('income')"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
								></span>
								<span>收入</span>
							</button>
						</div>
					</a-form-item>

					<a-form-item name="isValid" label="有效状态" class="!mb-0">
						<div
							id="form_isValid"
							class="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 rounded-xl h-9 box-border"
						>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									String(formState.isValid ?? '1') === '1' ?
										'bg-white text-emerald-600 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="selectValidStatus('1')"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
								></span>
								<span>有效</span>
							</button>
							<button
								type="button"
								:class="[
									'border-0 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 flex items-center justify-center gap-1.5',
									String(formState.isValid ?? '1') === '0' ?
										'bg-white text-slate-700 shadow-2xs'
									:	'bg-transparent text-slate-500 hover:text-slate-800',
								]"
								@click="selectValidStatus('0')"
							>
								<span
									class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
								></span>
								<span>失效</span>
							</button>
						</div>
					</a-form-item>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<a-form-item name="name" label="账目名称" class="!mb-0">
						<a-input
							id="form_name"
							name="name"
							v-model:value="formState.name"
							placeholder="如：午餐、地铁打卡、电费"
							class="!rounded-xl"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="amount" label="账单金额" class="!mb-0">
						<a-input
							id="form_amount"
							name="amount"
							v-model:value="formState.amount"
							type="number"
							placeholder="0.00"
							class="!rounded-xl font-mono font-semibold"
						>
							<template #prefix>
								<span
									:class="[
										'font-mono font-bold',
										formState.incomeAndExpenses === 'income' ?
											'text-emerald-600'
										:	'text-rose-600',
									]"
									>¥</span
								>
							</template>
							<template #suffix>
								<span class="text-[11px] font-mono text-slate-400">RMB</span>
							</template>
						</a-input>
					</a-form-item>
				</div>
			</div>

			<!-- 卡片 2：分类胶囊池与支付方式 -->
			<div class="bg-slate-50/80 rounded-2xl p-4 space-y-3">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<a-form-item name="typeCode" label="账目类别" class="!mb-0">
						<a-input
							id="form_typeCode"
							name="typeCode"
							v-model:value="formState.typeCode"
							placeholder="填写或点击下方常用类别"
							class="!rounded-xl"
							allow-clear
						/>
					</a-form-item>

					<a-form-item name="fromSource" label="支付方式" class="!mb-0">
						<a-select
							id="form_fromSource"
							name="fromSource"
							v-model:value="formState.fromSource"
							placeholder="请选择支付来源"
							:allowClear="true"
						>
							<a-select-option
								v-for="item in fromSourceList"
								:key="item.typeCode"
								:value="item.typeCode"
								:label="item.typeName"
							>
								<span class="inline-flex items-center gap-2">
									<component
										v-if="getFinanceIconComponent(item.typeCode)"
										:is="getFinanceIconComponent(item.typeCode)"
										class="w-4 h-4 shrink-0"
									/>
									<CreditCardOutlined
										v-else
										class="text-[13px] text-slate-400 shrink-0"
									/>
									<span>{{ item.typeName }}</span>
								</span>
							</a-select-option>
						</a-select>
					</a-form-item>
				</div>

				<!-- 无框 Soft UI 快捷分类胶囊池 -->
				<div v-if="presetCategories.length" class="pt-0.5">
					<div class="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
						<span>快捷分类标签（点击即选）</span>
					</div>
					<div class="flex flex-wrap gap-1.5">
						<button
							v-for="cat in presetCategories"
							:key="cat"
							type="button"
							:class="[
								'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer select-none transition-all duration-150',
								formState.typeCode === cat ?
									'bg-indigo-500 text-white font-semibold shadow-sm shadow-indigo-500/25 -translate-y-0.5'
								:	'bg-white text-slate-600 shadow-2xs hover:bg-indigo-500/10 hover:text-indigo-600 hover:-translate-y-0.5',
							]"
							@click="toggleCategoryChip(cat)"
						>
							<span class="text-xs leading-none">{{
								getCategoryEmoji(cat)
							}}</span>
							<span class="leading-tight">{{ cat }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- 卡片 3：业务时间与归属成员 -->
			<div class="bg-slate-50/80 rounded-2xl p-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<a-form-item name="infoDate" label="业务时间" class="!mb-0">
						<a-date-picker
							id="form_infoDate"
							name="infoDate"
							v-model:value="formState.infoDate"
							show-time
							class="w-full !rounded-xl"
							:format="dataTimeFormat"
							:getPopupContainer="
								(triggerNode: HTMLElement) => {
									return triggerNode.parentNode as HTMLElement;
								}
							"
						/>
					</a-form-item>

					<a-form-item name="belongTo" label="归属成员" class="!mb-0">
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
			</div>

			<!-- 卡片 4：票据凭证与附件 (若存在) -->
			<div v-if="attachedFiles.length > 0" class="bg-slate-50/80 rounded-2xl p-4">
				<div
					class="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between"
				>
					<span class="flex items-center gap-1.5">
						<PaperClipOutlined />关联凭证与小票 ({{ attachedFiles.length }})
					</span>
				</div>
				<div class="flex flex-wrap gap-2">
					<div
						v-for="(file, idx) in attachedFiles"
						:key="idx"
						class="flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs shadow-2xs"
					>
						<PaperClipOutlined class="text-indigo-500" />
						<a
							:href="file.preUrl || file.url"
							target="_blank"
							class="text-indigo-600 hover:underline max-w-[200px] truncate"
						>
							{{ file.name || '小票凭证' }}
						</a>
						<span
							class="cursor-pointer text-slate-400 hover:text-rose-500 font-bold ml-1 text-sm"
							title="移除凭证"
							@click="attachedFiles.splice(idx, 1)"
						>
							×
						</span>
					</div>
				</div>
			</div>
		</a-form>

		<template #footer>
			<div class="flex items-center justify-end w-full">
				<div class="flex items-center gap-2.5">
					<button
						type="button"
						class="h-9 px-4 rounded-xl border-0 bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 text-xs font-medium cursor-pointer transition-all duration-200"
						@click="handleCancel"
					>
						{{ isReadonly ? '关闭' : '取消' }}
					</button>
					<button
						v-if="!isEdit && !isReadonly"
						type="button"
						:disabled="loading"
						class="h-9 px-4 rounded-xl border-0 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/15 disabled:opacity-50 text-xs font-medium cursor-pointer transition-all duration-200"
						@click="handleSaveAndContinue"
					>
						保存并再记一笔 (Ctrl+↵)
					</button>
					<button
						v-if="!isReadonly"
						type="button"
						:disabled="loading"
						class="h-9 px-5 rounded-xl border-0 bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 text-xs font-medium shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 cursor-pointer transition-all duration-200"
						@click="handleOk"
					>
						保存
					</button>
				</div>
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
	PaperClipOutlined,
} from '@ant-design/icons-vue';
import BaseRbacDrawer from '@/components/rbac/BaseRbacDrawer.vue';
import FinanceAiParseModal from '@/views/selfFinance/financeManager/components/FinanceAiParseModal.vue';
import {
	type UniversalFinanceAiParseVo,
	type FinanceManagerData,
	rulesRef,
	fromSourceTransferList,
	getCategoryEmoji,
	getCategoryPillStyle,
} from '@/views/selfFinance/financeManager/config';
import { iconComponentMap } from '@/config/icons';
import { formatAmount } from '@/utils/amountInfo';
import { useUserStore } from '@/store/modules/user/user';
import type { ModelInfo } from '@/types/modal';
import {
	getFinanceMangerDetail,
	addFinanceManger,
	editFinanceManger,
	getBudgetCategories,
} from '@/views/selfFinance/financeManager/api';
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

const { getDictByType } = useDictInfo('pay_way');

const fromSourceList = computed(() => getDictByType('pay_way'));

const financeSourceIconMap: Record<string, string> = {
	hfw: 'hf',
	hfm: 'hf',
	hfmj: 'hf',
	dfw: 'df',
	dfm: 'df',
};

const getFinanceIconComponent = (source?: string | number) => {
	if (!source) return null;
	const key = String(source);
	const iconKey = financeSourceIconMap[key] || key;
	return iconComponentMap[`finance-${iconKey}`] || null;
};

const { userList } = useUserInfo();

const loading = ref<boolean>(false);
const detailLoading = ref<boolean>(false);
const formRef = ref<FormInstance>();

const currentUser = useUserStore()?.getUserInfo;
const formState = ref<FinanceManagerData>({});
const presetCategories = ref<string[]>([]);
const attachedFiles = ref<
	Array<{ id?: string; name?: string; url?: string; preUrl?: string }>
>([]);

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
	if (parsed.attachments && parsed.attachments.length) {
		attachedFiles.value = [...parsed.attachments];
	}
	message.success('已将 AI 识别内容填入表单，请复核后保存');
};

const isReadonly = computed(() => Boolean(modelInfo.value?.readonly));
const isEdit = computed(() =>
	Boolean(modelInfo.value?.id || formState.value?.id),
);

const drawerSubtitle = computed(() => {
	if (isReadonly.value) {
		return '查看账单收支金额、分类标签与归属成员等电子凭证信息';
	}
	return isEdit.value ?
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

const selectDirection = (dir: 'expense' | 'income') => {
	formState.value.incomeAndExpenses = dir;
	void formRef.value?.validateFields(['incomeAndExpenses']);
};

const selectValidStatus = (status: '1' | '0') => {
	formState.value.isValid = status;
	void formRef.value?.validateFields(['isValid']);
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
	void formRef.value?.validateFields(['typeCode']);
};

const handleSaveShortcut = () => {
	if (isReadonly.value || loading.value || detailLoading.value) return;
	if (isEdit.value) {
		handleOk();
	} else {
		void handleSaveAndContinue();
	}
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
	if (!modelInfo.value.open || isReadonly.value || aiModalVisible.value) {
		return;
	}
	if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
		e.preventDefault();
		e.stopPropagation();
		handleSaveShortcut();
	}
};

onMounted(() => {
	window.addEventListener('keydown', handleGlobalKeydown, true);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleGlobalKeydown, true);
});

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
			void nextTick(() => formRef.value?.clearValidate());
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
	attachedFiles.value = [];
	if (!modalData?.id) {
		detailLoading.value = false;
		formState.value = createDefaultFormState();
		if (modalData?.extraData) {
			onApplyAiResult(modalData.extraData as UniversalFinanceAiParseVo);
			modalData.extraData = undefined;
		}
		void nextTick(() => formRef.value?.clearValidate());
		return;
	}

	detailLoading.value = true;
	formState.value = {};
	try {
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
		void nextTick(() => formRef.value?.clearValidate());
	} catch (e) {
		console.warn('获取账单明细失败:', e);
		message.error('获取账单明细失败！');
	} finally {
		detailLoading.value = false;
	}
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
.modern-soft-form {
	:deep(.ant-form-item-label > label) {
		font-size: 12px;
		font-weight: 600;
		color: #475569;
	}

	:deep(.ant-input),
	:deep(.ant-input-affix-wrapper),
	:deep(.ant-select-selector),
	:deep(.ant-picker) {
		border-radius: 12px !important;
		border-color: rgba(226, 232, 240, 0.9) !important;
	}
}
</style>
