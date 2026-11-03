<template>
	<div class="search shrink-0 mb-2.5">
		<div
			class="search-box bg-white px-4 py-2.5 rounded-2xl border-0 shadow-sm shadow-slate-200/60 transition-all duration-200"
		>
			<!-- 主筛选栏：单行紧凑布局 -->
			<div class="flex items-center justify-between flex-wrap gap-3">
				<div class="flex items-center flex-wrap gap-2.5 flex-1 min-w-[320px]">
					<!-- 收支类型快捷切换（全部/支出/收入） -->
					<a-radio-group
						v-model:value="selectedType"
						button-style="solid"
						class="type-radio-group bg-slate-100/90 p-0.5 rounded-xl border-0 inline-flex"
						@change="handleFastFilterChange"
					>
						<a-radio-button value="">全部</a-radio-button>
						<a-radio-button value="expense">支出</a-radio-button>
						<a-radio-button value="income">收入</a-radio-button>
					</a-radio-group>

					<!-- 周期快捷 Pill 胶囊 -->
					<div
						class="inline-flex items-center bg-slate-100/90 p-0.5 rounded-xl border-0 gap-0.5 h-8 box-border"
					>
						<button
							v-for="p in periodPresets"
							:key="p.key"
							type="button"
							:class="[
								'border-0 text-xs px-2.5 py-1 rounded-lg cursor-pointer leading-snug transition-all duration-150',
								currentPeriodKey === p.key ?
									'bg-white text-indigo-600 font-semibold shadow-2xs'
								:	'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60',
							]"
							@click="selectPeriod(p.key)"
						>
							{{ p.label }}
						</button>
					</div>

					<!-- 业务时间范围（带常用预设） -->
					<a-range-picker
						v-model:value="dateRange"
						class="w-[250px] !rounded-xl !border-slate-200/80"
						:presets="rangePresets"
						:placeholder="['开始日期', '结束日期']"
						@change="handleDateRangeChange"
					/>

					<!-- 快速搜索框 -->
					<a-input
						v-model:value="searchInfo.name"
						placeholder="搜索账目名称..."
						class="w-[200px] !rounded-xl !border-slate-200/80"
						allow-clear
						@pressEnter="handleQuery"
						@change="handleSearchChange"
					>
						<template #prefix>
							<SearchOutlined class="text-slate-400" />
						</template>
					</a-input>
				</div>

				<!-- 操作按钮组 -->
				<div class="flex items-center justify-end gap-2">
					<button
						type="button"
						class="h-8 px-4 rounded-xl border-0 bg-indigo-500 text-white hover:bg-indigo-600 text-xs font-medium shadow-sm shadow-indigo-500/20 cursor-pointer transition-all duration-200"
						@click="handleQuery"
					>
						查询
					</button>
					<button
						type="button"
						class="h-8 px-3.5 rounded-xl border-0 bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 text-xs font-medium cursor-pointer transition-all duration-200"
						@click="handleCancelQuery"
					>
						重置
					</button>
					<button
						type="button"
						class="inline-flex items-center gap-1 h-8 px-2 border-0 bg-transparent text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
						@click="isExpanded = !isExpanded"
					>
						<span>{{ isExpanded ? '收起筛选' : '更多筛选' }}</span>
						<component
							:is="isExpanded ? UpOutlined : DownOutlined"
							class="text-[11px]"
						/>
					</button>
				</div>
			</div>

			<!-- 展开的高级筛选条件 (Tailwind Soft UI 柔和托底，彻底消除 preflight:false 下的四边默认框) -->
			<div
				v-show="isExpanded"
				class="mt-2.5 p-3 rounded-xl bg-slate-50/80 border-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
			>
				<div class="flex items-center gap-2">
					<span class="shrink-0 text-xs font-medium text-slate-500 w-14 text-right">
						账目类别
					</span>
					<a-input
						v-model:value="searchInfo.typeCode"
						placeholder="如：餐饮、日用、工资"
						class="flex-1 !rounded-xl !border-slate-200/80"
						allow-clear
						@change="handleSearchChange"
						@pressEnter="handleQuery"
					/>
				</div>
				<div class="flex items-center gap-2">
					<span class="shrink-0 text-xs font-medium text-slate-500 w-14 text-right">
						支付方式
					</span>
					<a-select
						v-model:value="searchInfo.fromSource"
						placeholder="选择支付方式"
						allow-clear
						class="flex-1"
						@change="handleSearchChange"
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
				</div>
				<div class="flex items-center gap-2">
					<span class="shrink-0 text-xs font-medium text-slate-500 w-14 text-right">
						归属成员
					</span>
					<a-select
						v-model:value="searchInfo.belongTo"
						placeholder="选择归属成员"
						:field-names="{ label: 'nickName', value: 'id' }"
						:options="userList"
						allow-clear
						class="flex-1"
						@change="handleSearchChange"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { FinanceManagerData } from '@/views/selfFinance/financeManager/config';
import { useUserInfo } from '@/composables/useUserInfo';
import { useDictInfo } from '@/composables/useDictInfo';
import { iconComponentMap } from '@/config/icons';
import { debounce } from 'lodash-es';
import {
	formatDayjs,
	nowDayjs,
	getMonthRangeDayjs,
	type Dayjs,
} from '@/utils/dayjs';
import {
	SearchOutlined,
	DownOutlined,
	UpOutlined,
	CreditCardOutlined,
} from '@ant-design/icons-vue';

// 组合式函数
const { userList } = useUserInfo();
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
	const sourceKey = String(source);
	const iconKey = financeSourceIconMap[sourceKey] || sourceKey;
	return iconComponentMap[`finance-${iconKey}`] || null;
};

// Props
interface Props {
	searchInfo: FinanceManagerData;
}

const props = defineProps<Props>();

// Emits
interface Emits {
	(e: 'update:searchInfo', value: FinanceManagerData): void;
	(e: 'query', resetPage?: boolean): void;
	(e: 'cancelQuery'): void;
}

const emit = defineEmits<Emits>();

// 响应式数据
const searchInfo = computed({
	get: () => props.searchInfo,
	set: (value) => emit('update:searchInfo', value),
});

// 快捷收支类型计算绑定
const selectedType = computed({
	get: () => searchInfo.value.incomeAndExpenses || '',
	set: (val: string) => {
		searchInfo.value.incomeAndExpenses = val;
	},
});

// 是否展开高级筛选
const isExpanded = ref<boolean>(false);

// 日期范围绑定
const dateRange = ref<[Dayjs, Dayjs] | undefined>(undefined);

// 快捷周期预设
const periodPresets = [
	{ label: '本月', key: 'thisMonth' },
	{ label: '上月', key: 'lastMonth' },
	{ label: '近30天', key: 'last30Days' },
	{ label: '全部', key: 'all' },
];

const currentPeriodKey = computed(() => {
	const start = searchInfo.value.infoDateStart;
	const end = searchInfo.value.infoDateEnd;
	if (!start && !end) return 'all';
	if (
		start &&
		end &&
		formatDayjs(start).isSame(nowDayjs().startOf('month'), 'day') &&
		formatDayjs(end).isSame(nowDayjs().endOf('month'), 'day')
	) {
		return 'thisMonth';
	}
	if (
		start &&
		end &&
		formatDayjs(start).isSame(
			nowDayjs().subtract(1, 'month').startOf('month'),
			'day',
		) &&
		formatDayjs(end).isSame(
			nowDayjs().subtract(1, 'month').endOf('month'),
			'day',
		)
	) {
		return 'lastMonth';
	}
	if (
		start &&
		end &&
		formatDayjs(start).isSame(
			nowDayjs().subtract(29, 'day').startOf('day'),
			'day',
		) &&
		formatDayjs(end).isSame(nowDayjs().endOf('day'), 'day')
	) {
		return 'last30Days';
	}
	return 'custom';
});

const selectPeriod = (key: string) => {
	debouncedQuery.cancel();
	if (key === 'thisMonth') {
		const [s, e] = getMonthRangeDayjs();
		searchInfo.value.infoDateStart = s;
		searchInfo.value.infoDateEnd = e;
		dateRange.value = [s, e];
	} else if (key === 'lastMonth') {
		const [s, e] = getMonthRangeDayjs(-1);
		searchInfo.value.infoDateStart = s;
		searchInfo.value.infoDateEnd = e;
		dateRange.value = [s, e];
	} else if (key === 'last30Days') {
		const s = nowDayjs().subtract(29, 'day').startOf('day');
		const e = nowDayjs().endOf('day');
		searchInfo.value.infoDateStart = s;
		searchInfo.value.infoDateEnd = e;
		dateRange.value = [s, e];
	} else if (key === 'all') {
		searchInfo.value.infoDateStart = undefined;
		searchInfo.value.infoDateEnd = undefined;
		dateRange.value = undefined;
	}
	emit('query', true);
};

// 快捷预设（日常记账高频维度：本月、上月、近30天、今年）
const rangePresets = ref([
	{
		label: '本月',
		value: getMonthRangeDayjs(),
	},
	{
		label: '上月',
		value: getMonthRangeDayjs(-1),
	},
	{
		label: '近30天',
		value: [
			nowDayjs().subtract(29, 'day').startOf('day'),
			nowDayjs().endOf('day'),
		] as [Dayjs, Dayjs],
	},
	{
		label: '今年',
		value: [
			nowDayjs().startOf('year'),
			nowDayjs().endOf('year'),
		] as [Dayjs, Dayjs],
	},
]);

// 监听外部 searchInfo 日期同步回 dateRange
watch(
	() => [props.searchInfo.infoDateStart, props.searchInfo.infoDateEnd],
	([start, end]) => {
		if (start && end) {
			dateRange.value = [formatDayjs(start), formatDayjs(end)];
		} else if (!start && !end) {
			dateRange.value = undefined;
		}
	},
	{ immediate: true },
);

// 日期选择事件
const handleDateRangeChange = (dates: any) => {
	if (dates && dates[0] && dates[1]) {
		searchInfo.value.infoDateStart = formatDayjs(dates[0]);
		searchInfo.value.infoDateEnd = formatDayjs(dates[1]);
	} else {
		searchInfo.value.infoDateStart = undefined;
		searchInfo.value.infoDateEnd = undefined;
	}
	debouncedQuery();
};

// 快捷切换收支（立即触发查询）
const handleFastFilterChange = () => {
	debouncedQuery.cancel();
	emit('query', true);
};

// 使用 lodash 防抖查询
const debouncedQuery = debounce(() => {
	emit('query', true);
}, 400);

const handleSearchChange = () => {
	debouncedQuery();
};

const handleQuery = () => {
	debouncedQuery.cancel();
	emit('query', true);
};

const handleCancelQuery = () => {
	debouncedQuery.cancel();
	const [s, e] = getMonthRangeDayjs();
	dateRange.value = [s, e];
	searchInfo.value = {
		incomeAndExpenses: '',
		infoDateStart: s,
		infoDateEnd: e,
	};
	emit('cancelQuery');
};

onUnmounted(() => {
	debouncedQuery.cancel();
});
</script>

<style lang="scss" scoped>
.search-box {
	:deep(.ant-select-selector) {
		border-radius: 12px !important;
		border-color: rgba(226, 232, 240, 0.9) !important;
	}
}

.type-radio-group {
	:deep(.ant-radio-button-wrapper) {
		height: 28px;
		line-height: 28px;
		padding: 0 12px;
		font-size: 12px;
		border: none !important;
		background: transparent !important;
		color: #64748b;
		border-radius: 8px;
		transition: all 0.15s ease;

		&::before {
			display: none !important;
		}

		&:hover {
			color: #0f172a;
		}

		&.ant-radio-button-wrapper-checked {
			background: #ffffff !important;
			color: #4f46e5 !important;
			font-weight: 600;
			box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		}
	}
}
</style>
