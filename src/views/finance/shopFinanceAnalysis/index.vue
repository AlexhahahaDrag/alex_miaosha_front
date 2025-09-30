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
				</a-space>
			</div>
		</div>

		<div class="content">
			<div style="background-color: #ececec; padding: 10px">
				<a-row :gutter="16">
					<!-- <a-col :span="4">
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
          <a-col :span="4" v-for="item in balanceList.slice(0, 3)">
            <a-card :title="item.typeName" :bordered="false">
              <p style="font-size: 20px">{{ item.amount }}</p>
            </a-card>
          </a-col>
        </a-row>
        <a-row :gutter="16" style="padding-top: 10px">
          <a-col :span="4" v-for="item in balanceList.slice(3)">
            <a-card :title="item.typeName" :bordered="false">
              <p style="font-size: 20px">{{ item.amount }}</p>
            </a-card>
          </a-col>-->
				</a-row>
				<a-row :gutter="16" style="padding-top: 10px">
					<div class="mainGrid">
						<div class="div1">
							<ShopPieChart
								title="当月收入分析"
								height="100%"
								width="100%"
								:data="pieShopData"
								:tooltip="tooltip"
							>
							</ShopPieChart>
						</div>
						<div class="div2">
							<ShopPieChart
								title="当月支出分析"
								height="100%"
								width="100%"
								:data="piePayWayData"
								:tooltip="tooltip"
							>
							</ShopPieChart>
						</div>
					</div>
				</a-row>
				<a-row :gutter="16" style="padding-top: 10px">
					<div class="mainGrid">
						<div class="div1">
							<ShopBarChart
								height="100%"
								width="100%"
								title="日消费"
								:data="dayData"
								:config="dayConfig"
							>
							</ShopBarChart>
						</div>
						<div class="div2">
							<ShopBarChart
								height="100%"
								width="100%"
								title="月消费"
								:data="monthData"
								:config="monthConfig"
							>
							</ShopBarChart>
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
	getDayShopFinanceInfo,
	getMonthShopFinanceInfo,
	getShopNameInfo,
	getPayWayInfo,
} from '@/views/finance/shopFinanceAnalysis/api';
import type { ShopFinanceDetail } from '@/views/finance/shopFinance/shopFinanceDetail/shopFinanceDetailTs';
import type { ItemInfo } from './shopAnalysis';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from './chart/shopBar';

const dateFormatter = 'YYYY-MM';

let sum = ref<any>(0);

let searchDateTime = ref<Dayjs>(dayjs());

let pieShopData = ref<object[]>([]);

const getShopNameInfoInfo = (dateStr: string) => {
	getShopNameInfo(dateStr).then(
		(res: { code: string; data: ShopFinanceDetail[]; message: any }) => {
			if (res.code == '200') {
				sum.value = 0;
				if (res.data && res.data.length) {
					let shop: ItemInfo[] = [];
					res.data.forEach((item: { shopName: any; saleAmount: any }) => {
						shop.push({ name: item.shopName, value: item.saleAmount });
					});
					pieShopData.value = shop;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
};

let piePayWayData = ref<object[]>([]);

const getPayWayInfoInfo = (dateStr: string) => {
	getPayWayInfo(dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let shop: ItemInfo[] = [];
					res.data.forEach((item: { payWayName: any; saleAmount: any }) => {
						shop.push({ name: item.payWayName, value: item.saleAmount });
					});
					piePayWayData.value = shop;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
};

let dayConfig = ref<barItem>({
	xAxis: [],
	series: [[]],
	xTile: '天数',
	yTitle: ['销售额', '件数'],
	yNameGap: 30,
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter(param: any) {
			let tip = '';
			tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}日</p>`;
			param.forEach(
				(element: {
					axisValue: any;
					marker: any;
					value: any;
					seriesName: any;
				}) => {
					tip += `<p style="margin: 0;text-align: left">${element.marker}${element.seriesName}: ${element.value ? element.value : 0.0}${element.seriesName === '销售额' ? '元' : '件'}</p>`;
				},
			);
			return tip;
		},
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#aa55ff',
});

let monthData = ref<any>([]);

let monthConfig = ref<barItem>({
	xAxis: [],
	series: [[]],
	xTile: '月份',
	yTitle: ['销售额', '件数'],
	yNameGap: 30,
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
		formatter(param: any) {
			let tip = '';
			tip += `<p style="margin: 0;text-align: left">${param[0].axisValue}日</p>`;
			param.forEach(
				(element: {
					axisValue: any;
					marker: any;
					value: any;
					seriesName: any;
				}) => {
					tip += `<p style="margin: 0;text-align: left">${element.marker}${element.seriesName}: ${element.value ? element.value : 0.0}${element.seriesName === '销售额' ? '元' : '件'}</p>`;
				},
			);
			return tip;
		},
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#5555ff',
});

let dayData = ref<any>([]);

const getDayShopFinanceInfoInfo = (dateStr: string) => {
	getDayShopFinanceInfo(dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let series = [] as any;
					let numSeries = [] as any;
					let xAxis = [] as any;
					res.data.forEach((item) => {
						series.push(item.saleAmount);
						xAxis.push(item.infoDate.substring(8, 10));
						numSeries.push(item.saleNum);
					});
					let seriesAll = [] as any[];
					seriesAll[0] = series;
					seriesAll[1] = numSeries;
					dayConfig.value.xAxis = xAxis;
					dayConfig.value.series = seriesAll;
					dayData.value = seriesAll;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
};

const getMonthShopFinanceInfoInfo = (dateStr: string) => {
	getMonthShopFinanceInfo(dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let series = [] as any;
					let numSeries = [] as any;
					let xAxis = [] as any;
					res.data.forEach((item) => {
						series.push(item.saleAmount);
						xAxis.push(item.infoDate);
						numSeries.push(item.saleNum);
					});
					let seriesAll = [] as any[];
					seriesAll[0] = series;
					seriesAll[1] = numSeries;
					monthConfig.value.xAxis = xAxis;
					monthConfig.value.series = seriesAll;
					monthData.value = seriesAll;
				}
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		},
	);
};

function getInfo() {
	let dateStr = searchDateTime.value.format(dateFormatter);
	getShopNameInfoInfo(dateStr);
	getPayWayInfoInfo(dateStr);
	getDayShopFinanceInfoInfo(dateStr);
	getMonthShopFinanceInfoInfo(dateStr);
}

const changeMonth = () => {
	getInfo();
};

onMounted(() => {
	getInfo();
});

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
@/views/finance/financeManager/financeManagerDetail/detail
