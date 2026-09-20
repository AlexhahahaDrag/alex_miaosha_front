<template>
	<div class="search">
		<div class="search-box">
			<!-- 主筛选栏：单行紧凑布局 -->
			<div class="filter-main-row">
				<div class="filter-left-group">
					<!-- 收支类型快捷切换（全部/支出/收入） -->
					<a-radio-group
						v-model:value="selectedType"
						button-style="solid"
						class="type-radio-group"
						@change="handleFastFilterChange"
					>
						<a-radio-button value="">全部</a-radio-button>
						<a-radio-button value="expense">支出</a-radio-button>
						<a-radio-button value="income">收入</a-radio-button>
					</a-radio-group>

					<!-- 业务时间范围（带常用预设） -->
					<a-range-picker
						v-model:value="dateRange"
						class="date-range-picker"
						:presets="rangePresets"
						:placeholder="['开始日期', '结束日期']"
						@change="handleDateRangeChange"
					/>

					<!-- 快速搜索框 -->
					<a-input
						v-model:value="searchInfo.name"
						placeholder="搜索账目名称..."
						class="quick-search-input"
						allow-clear
						@pressEnter="handleQuery"
						@change="handleSearchChange"
					>
						<template #prefix>
							<SearchOutlined class="search-prefix-icon" />
						</template>
					</a-input>
				</div>

				<!-- 操作按钮组 -->
				<div class="filter-right-group">
					<a-space>
						<a-button type="primary" @click="handleQuery">查询</a-button>
						<a-button @click="handleCancelQuery">重置</a-button>
						<a-button type="link" class="expand-btn" @click="isExpanded = !isExpanded">
							<span>{{ isExpanded ? '收起筛选' : '更多筛选' }}</span>
							<component :is="isExpanded ? UpOutlined : DownOutlined" />
						</a-button>
					</a-space>
				</div>
			</div>

			<!-- 展开的高级筛选条件 -->
			<div v-show="isExpanded" class="filter-expand-row">
				<a-divider style="margin: 12px 0" />
				<a-row :gutter="16" align="middle">
					<a-col :xs="24" :sm="12" :md="8" :lg="6">
						<div class="expand-item">
							<span class="expand-label">账目类别</span>
							<a-input
								v-model:value="searchInfo.typeCode"
								placeholder="如：餐饮、日用、工资"
								allow-clear
								@change="handleSearchChange"
								@pressEnter="handleQuery"
							/>
						</div>
					</a-col>
					<a-col :xs="24" :sm="12" :md="8" :lg="6">
						<div class="expand-item">
							<span class="expand-label">支付方式</span>
							<a-select
								v-model:value="searchInfo.fromSource"
								placeholder="选择支付方式"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="fromSourceList"
								allow-clear
								class="expand-select"
								@change="handleSearchChange"
							/>
						</div>
					</a-col>
					<a-col :xs="24" :sm="12" :md="8" :lg="6">
						<div class="expand-item">
							<span class="expand-label">归属成员</span>
							<a-select
								v-model:value="searchInfo.belongTo"
								placeholder="选择归属成员"
								:field-names="{ label: 'nickName', value: 'id' }"
								:options="userList"
								allow-clear
								class="expand-select"
								@change="handleSearchChange"
							/>
						</div>
					</a-col>
				</a-row>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { FinanceManagerData } from '@/views/finance/financeManager/config';
import { useUserInfo } from '@/composables/useUserInfo';
import { useDictInfo } from '@/composables/useDictInfo';
import { debounce } from 'lodash-es';
import dayjs, { type Dayjs } from 'dayjs';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons-vue';

// 组合式函数
const { userList } = useUserInfo();
const { getDictByType } = useDictInfo('pay_way');

const fromSourceList = computed(() => getDictByType('pay_way'));

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
const isExpanded = ref(false);

// 日期范围绑定
const dateRange = ref<[Dayjs, Dayjs] | undefined>(undefined);

// 快捷预设（日常记账高频维度：本月、上月、近30天、今年）
const rangePresets = ref([
	{
		label: '本月',
		value: [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs],
	},
	{
		label: '上月',
		value: [
			dayjs().subtract(1, 'month').startOf('month'),
			dayjs().subtract(1, 'month').endOf('month'),
		] as [Dayjs, Dayjs],
	},
	{
		label: '近30天',
		value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] as [
			Dayjs,
			Dayjs,
		],
	},
	{
		label: '今年',
		value: [dayjs().startOf('year'), dayjs().endOf('year')] as [Dayjs, Dayjs],
	},
]);

// 监听外部 searchInfo 日期同步回 dateRange
watch(
	() => [props.searchInfo.infoDateStart, props.searchInfo.infoDateEnd],
	([start, end]) => {
		if (start && end) {
			dateRange.value = [dayjs(start), dayjs(end)];
		} else if (!start && !end) {
			dateRange.value = undefined;
		}
	},
	{ immediate: true },
);

// 日期选择事件
const handleDateRangeChange = (dates: any) => {
	if (dates && dates[0] && dates[1]) {
		searchInfo.value.infoDateStart = dayjs(dates[0]);
		searchInfo.value.infoDateEnd = dayjs(dates[1]);
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
	dateRange.value = undefined;
	searchInfo.value = {
		incomeAndExpenses: '',
	};
	emit('cancelQuery');
};

onUnmounted(() => {
	debouncedQuery.cancel();
});
</script>

<style lang="scss" scoped>
.search {
	margin-bottom: 16px;
}

.search-box {
	background: #fff;
	padding: 14px 18px;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	border: 1px solid #f0f0f0;
}

.filter-main-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12px;
}

.filter-left-group {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	flex: 1;
	min-width: 320px;
}

.type-radio-group {
	:deep(.ant-radio-button-wrapper) {
		height: 32px;
		line-height: 30px;
		padding: 0 14px;
		font-size: 13px;
	}
}

.date-range-picker {
	width: 260px;
}

.quick-search-input {
	width: 200px;
}

.search-prefix-icon {
	color: #bfbfbf;
}

.filter-right-group {
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.expand-btn {
	padding: 0 4px;
	font-size: 13px;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.filter-expand-row {
	margin-top: 4px;
}

.expand-item {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;

	.expand-label {
		flex-shrink: 0;
		font-size: 13px;
		color: #595959;
		width: 60px;
		text-align: right;
	}

	.expand-select {
		width: 100%;
	}
}
</style>
