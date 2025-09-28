<template>
	<div class="search">
		<div class="search-box">
			<a-form
				:model="searchInfo"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
			>
				<a-row :gutter="24">
					<a-col :span="6">
						<a-form-item name="name" label="名称">
							<a-input
								v-model:value="searchInfo.name"
								placeholder="名称"
								@change="handleSearchChange"
								allow-clear
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="typeCode" label="类别">
							<a-input
								v-model:value="searchInfo.typeCode"
								placeholder="请输入类别"
								@change="handleSearchChange"
								allow-clear
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="fromSource" label="来源">
							<a-select
								ref="select"
								v-model:value="searchInfo.fromSource"
								placeholder="请输入来源"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="fromSourceList"
								@change="handleSearchChange"
								:allowClear="true"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="incomeAndExpenses" label="收支类型">
							<a-select
								ref="select"
								v-model:value="searchInfo.incomeAndExpenses"
								placeholder="请输入收支类型"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="incomeAndExpensesList"
								@change="handleSearchChange"
								:allowClear="true"
							></a-select>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="6">
						<a-form-item name="belongTo" label="属于">
							<a-select
								ref="select"
								v-model:value="searchInfo.belongTo"
								placeholder="请选择归属人"
								:field-names="{ label: 'nickName', value: 'id' }"
								:options="userList"
								@change="handleSearchChange"
								:allowClear="true"
							></a-select>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="infoDateStart" label="业务时间从">
							<a-date-picker
								v-model:value="infoDateStart"
								@change="handleSearchChange"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6">
						<a-form-item name="infoDateEnd" label="至">
							<a-date-picker
								v-model:value="infoDateEnd"
								@change="handleSearchChange"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="6" style="text-align: right">
						<a-space>
							<a-button type="primary" @click="handleQuery"> 查找</a-button>
							<a-button type="primary" @click="handleCancelQuery"
								>清空</a-button
							>
						</a-space>
					</a-col>
				</a-row>
			</a-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import type { SearchInfo } from '../../config';
import { getDictList } from '@/api/finance/dict/dictManager';
import { useUserInfo } from '@/composables/useUserInfo';
import type { Dayjs } from 'dayjs';
import type { DictInfo } from '@/views/finance/dict/dict';

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();

// Props
interface Props {
	searchInfo: SearchInfo;
}

// Emits
interface Emits {
	(e: 'update:searchInfo', value: SearchInfo): void;
	(e: 'query'): void;
	(e: 'cancelQuery'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const searchInfo = computed({
	get: () => props.searchInfo,
	set: (value) => emit('update:searchInfo', value),
});

const fromSourceList = ref<DictInfo[]>([]);
const incomeAndExpensesList = ref<DictInfo[]>([]);
const infoDateStart = ref<string | Dayjs>();
const infoDateEnd = ref<string | Dayjs>();

// 表单布局配置
const labelCol = { span: 5 };
const wrapperCol = { span: 19 };

// 事件处理
const handleSearchChange = () => {
	// 触发查询
	console.log(`111111111111111111`, searchInfo.value);
};

const handleQuery = () => {
	emit('query');
};

const handleCancelQuery = () => {
	// 清空搜索信息
	searchInfo.value = {};
	infoDateStart.value = '';
	infoDateEnd.value = '';
	emit('cancelQuery');
};

// 获取字典数据
const getDictInfoList = async () => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getDictList('pay_way,income_expense_type');
	if (code == '200') {
		fromSourceList.value = data.filter(
			(item: { belongTo: string }) => item.belongTo == 'pay_way',
		);
		incomeAndExpensesList.value = data.filter(
			(item: { belongTo: string }) => item.belongTo == 'income_expense_type',
		);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

// 初始化
onMounted(() => {
	// 获取字典数据
	getDictInfoList();
	// 用户数据由 useUserInfo 组合式函数自动处理
});
</script>

<style lang="scss" scoped>
.search {
	margin-bottom: 16px;
}

.search-box {
	background: #fff;
	padding: 16px;
	border-radius: 6px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
