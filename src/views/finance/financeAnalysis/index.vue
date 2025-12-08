<template>
	<div class="page-info">
		<div class="search">
			<div class="search-box">
				<a-space>
					<a-date-picker
						v-model:value="searchDateTime"
						picker="month"
						:locale="locale"
						@change="changeMonth"
					/>
					<a-select
						style="width: 100px"
						ref="select"
						v-model:value="searchUser"
						:field-names="{ label: 'nickName', value: 'id' }"
						:options="userList"
						placeholder="请选择用户"
						@change="changeMonth"
					>
					</a-select>
				</a-space>
			</div>
		</div>

		<div class="content">
			<div style="background-color: #ececec; padding: 10px">
				<a-row :gutter="16">
					<a-col :span="4">
						<a-card title="总金额" :bordered="false">
							<p style="font-size: 20px">{{ sum }}</p>
						</a-card>
					</a-col>
					<a-col :span="4">
						<a-card title="月总消费" :bordered="false">
							<p style="font-size: 20px">{{ monthExpenseSum }}</p>
						</a-card>
					</a-col>
					<a-col :span="4">
						<a-card title="月总收入" :bordered="false">
							<p style="font-size: 20px">{{ monthIncomeSum }}</p>
						</a-card>
					</a-col>
					<a-col
						:span="4"
						v-for="(item, index) in balanceList.slice(0, 3)"
						:key="index"
					>
						<a-card :title="item.typeName" :bordered="false">
							<p style="font-size: 20px">{{ item.amount }}</p>
						</a-card>
					</a-col>
				</a-row>
				<a-row :gutter="16" style="padding-top: 10px">
					<a-col
						:span="4"
						v-for="(item, index) in balanceList.slice(3)"
						:key="index"
					>
						<a-card :title="item.typeName" :bordered="false">
							<p style="font-size: 20px">{{ item.amount }}</p>
						</a-card>
					</a-col>
				</a-row>
				<a-row :gutter="16" style="padding-top: 10px">
					<div class="mainGrid">
						<div class="div1">
							<pie-chart
								title="当月收入分析"
								height="100%"
								width="100%"
								:data="pieIncomeData"
								:tooltip="tooltip"
							>
							</pie-chart>
						</div>
						<div class="div2">
							<pie-chart
								title="当月支出分析"
								height="100%"
								width="100%"
								:data="pieExpenseData"
								:tooltip="tooltip"
							>
							</pie-chart>
						</div>
					</div>
				</a-row>
				<a-row :gutter="16" style="padding-top: 10px">
					<div class="mainGrid">
						<div class="div1">
							<bar-chart
								height="100%"
								width="100%"
								title="日消费"
								:data="dayData"
								:config="dayConfig"
							>
							</bar-chart>
						</div>
						<div class="div2">
							<bar-chart
								height="100%"
								width="100%"
								title="月消费"
								:data="monthData"
								:config="monthConfig"
							>
							</bar-chart>
						</div>
					</div>
				</a-row>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	getBalance,
	getIncomeAndExpense,
	getDayExpense,
	getMonthExpense,
} from '@/views/finance/financeAnalysis/api';
import type { FinanceManagerData } from '@/views/finance/financeManager/config';
import * as math from 'mathjs';
import type { ItemInfo } from './analysis';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from './chart/bar';
import { useUserStore } from '@/store/modules/user/user';
import { useUserInfo } from '@/composables/useUserInfo';
import type { UserInfo } from '@/types/store';

const dateFormatter = 'YYYY-MM';

// 使用 useUserInfo 组合式函数
const { userList } = useUserInfo();

const balanceList = ref<FinanceManagerData | any>([]);
let userInfo = useUserStore()?.getUserInfo;
let sum = ref<math.BigNumber>(math.bignumber(0));
let monthExpenseSum = ref<math.BigNumber>(math.bignumber(0));
let monthIncomeSum = ref<math.BigNumber>(math.bignumber(0));

let searchUser = ref<number>(userInfo?.id || 0);

// 初始化用户列表，添加"所有人"选项
userList.value = [{ id: 0, nickName: '所有人' } as UserInfo];

let searchDateTime = ref<Dayjs>(dayjs());

function getBalanceInfo(userId: number, dateStr: string) {
	getBalance(userId, dateStr).then(
		(res: { code: string; data: FinanceManagerData[]; message: any }) => {
			if (res.code == '200') {
				sum.value = math.bignumber(0);
				balanceList.value = res.data;
				if (res.data && res.data.length) {
					res.data.forEach(
						(item) =>
							(sum.value = math.add(
								sum.value,
								math.bignumber(item.amount ? item.amount : 0),
							)),
					);
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
}

function getIncomeAndExpenseInfo(userId: number, dateStr: string) {
	getIncomeAndExpense(userId, dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					monthExpenseSum.value = math.bignumber(0);
					monthIncomeSum.value = math.bignumber(0);
					let dd: ItemInfo[] = [];
					res.data
						.filter((item) => item.incomeAndExpenses == 'income')
						.forEach((item: { typeCode: any; amount: any }) => {
							dd.push({ name: item.typeCode, value: item.amount });
							monthIncomeSum.value = math.add(
								monthIncomeSum.value,
								math.bignumber(item.amount ? item.amount : 0),
							);
						});
					pieIncomeData.value = dd;
					let expense: ItemInfo[] = [];
					res.data
						.filter((item) => item.incomeAndExpenses == 'expense')
						.forEach((item: { typeCode: any; amount: any }) => {
							expense.push({ name: item.typeCode, value: item.amount });
							monthExpenseSum.value = math.add(
								monthExpenseSum.value,
								math.bignumber(item.amount ? item.amount : 0),
							);
						});
					pieExpenseData.value = expense;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
}

let dayConfig = ref<barItem>({
	xAxis: [],
	series: [],
	xTile: '天数',
	yTitle: '金钱(元)',
	yNameGap: 30,
	tooltip: {},
	legend: [],
	color: '#aa55ff',
});

let monthData = ref<any>([]);

let monthConfig = ref<barItem>({
	xAxis: [],
	series: [],
	xTile: '月份',
	yTitle: '金钱(元)',
	yNameGap: 30,
	tooltip: {},
	legend: [],
	color: '#5555ff',
});

let dayData = ref<any>([]);

function getDayExpenseInfo(userId: number, dateStr: string) {
	getDayExpense(userId, dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let series = [] as any;
					let xAxis = [] as any;
					res.data.forEach((item) => {
						series.push(item.amount);
						xAxis.push(item.infoDate);
					});
					dayConfig.value = {
						xAxis: xAxis,
						series: series,
						xTile: '天数',
						yTitle: '金钱(元)',
						yNameGap: 50,
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'shadow',
							},
							formatter(param: any) {
								let tip = '';
								let unit = '元';
								let name = '花费';
								tip += `<p style="margin: 0">${param[0].axisValue}日</p>`;
								param.forEach(
									(element: {
										axisValue: any;
										marker: any;
										value: any;
										seriesName: any;
									}) => {
										tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
									},
								);
								return tip;
							},
						},
						color: '#aa55ff',
					};
					dayData.value = series;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
}

function getMonthExpenseInfo(userId: number, dateStr: string) {
	getMonthExpense(userId, dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let series = [] as any;
					let xAxis = [] as any;
					res.data.forEach((item) => {
						series.push(item.amount);
						xAxis.push(item.infoDate);
					});
					monthConfig.value = {
						xAxis: xAxis,
						series: series,
						yTitle: '金钱(元)',
						xTile: '月份',
						yNameGap: 50,
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'shadow',
							},
							formatter(param: any) {
								let tip = '';
								let unit = '元';
								let name = '花费';
								tip += `<p style="margin: 0">${param[0].axisValue}月</p>`;
								param.forEach(
									(element: {
										axisValue: any;
										marker: any;
										value: any;
										seriesName: any;
									}) => {
										tip += `<p style="margin: 0">${element.marker}${name}: ${element.value ? element.value : 0.0}${unit}</p>`;
									},
								);
								return tip;
							},
						},
						color: '#5555ff',
					};
					monthData.value = series;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
}

function getInfo() {
	let dateStr = searchDateTime.value.format(dateFormatter);
	getBalanceInfo(searchUser.value, dateStr);
	getIncomeAndExpenseInfo(searchUser.value, dateStr);
	getDayExpenseInfo(searchUser.value, dateStr);
	getMonthExpenseInfo(searchUser.value, dateStr);
}

const changeMonth = () => {
	getInfo();
};

onMounted(() => {
	getInfo();
});

let pieExpenseData = ref<object[]>([]);

let pieIncomeData = ref<object[]>([]);

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});
</script>
<style lang="scss" scoped>
.search-box {
}

.page-info {
	width: 100%;

	.search {
		background: rgb(237, 240, 237);
		border-radius: 10px 10px 10px 10px;
	}

	.search-box {
		padding-top: 15px;
		padding-left: 20px;
		padding-bottom: 10px;
	}

	.button {
		margin-top: 10px;
	}

	.content {
		margin-top: 10px;
	}
}

.mainGrid {
	width: 100%;
	height: 350px;

	.div1 {
		display: inline-block;
		/*转为行内块儿 */
		width: 48%;
		height: 95%;
		text-align: center;
		line-height: 100%;
		color: blue;
		background-color: white;
		margin-left: 10px;
		margin-right: 10px;
		border-radius: 5px;
		/*--调节圆周程度*/
	}

	.div2 {
		display: inline-block;
		/*转为行内块儿 */
		width: 49%;
		height: 95%;
		text-align: center;
		line-height: 100%;
		color: aliceblue;
		background-color: white;
		margin-right: 10px;
		border-radius: 5px;
		/*--调节圆周程度*/
	}
}
</style>

<style lang="scss" scoped></style>
