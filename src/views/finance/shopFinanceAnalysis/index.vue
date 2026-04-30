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
import type { ShopFinanceData } from '@/views/finance/shopFinance/config';
import type { ItemInfo } from './shopAnalysis';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { formatTime } from '@/utils/dayjs';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import type { barItem } from './chart/shopBar';

interface ApiResult<T> {
	code: string;
	data?: T;
	message?: string;
}

interface PayWayInfoItem {
	payWayName?: string;
	saleAmount?: number;
}

interface TrendPoint {
	saleAmount?: number;
	saleNum?: number;
	infoDate?: string;
}

interface TooltipItem {
	axisValue: string;
	marker: string;
	value?: number;
	seriesName: string;
}

const dateFormatter = 'YYYY-MM';

const searchDateTime = ref<Dayjs>(dayjs());
const pieShopData = ref<ItemInfo[]>([]);
const piePayWayData = ref<ItemInfo[]>([]);
const dayData = ref<number[][]>([]);
const monthData = ref<number[][]>([]);

const tooltip = ref({
	trigger: 'item',
	formatter: '{b} : {c}元({d}%)',
});

const buildTooltipFormatter = (dateUnit: string) => {
	return (param: TooltipItem[]) => {
		const axisValue = param[0]?.axisValue || '';
		let tip = `<p style="margin: 0;text-align: left">${axisValue}${dateUnit}</p>`;
		param.forEach((item) => {
			const value = item.value ?? 0;
			const unit = item.seriesName === '销售额' ? '元' : '件';
			tip += `<p style="margin: 0;text-align: left">${item.marker}${item.seriesName}: ${value}${unit}</p>`;
		});
		return tip;
	};
};

const dayConfig = ref<barItem>({
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
		formatter: buildTooltipFormatter('日'),
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#aa55ff',
});

const monthConfig = ref<barItem>({
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
		formatter: buildTooltipFormatter('月'),
	},
	legend: [],
	dataType: ['bar', 'line'],
	color: '#5555ff',
});

const buildSeriesData = (
	data: TrendPoint[],
	getXAxisLabel: (item: TrendPoint) => string,
) => {
	const saleAmountSeries: number[] = [];
	const saleNumSeries: number[] = [];
	const xAxis: string[] = [];

	data.forEach((item) => {
		saleAmountSeries.push(item.saleAmount || 0);
		saleNumSeries.push(item.saleNum || 0);
		xAxis.push(getXAxisLabel(item));
	});

	return {
		xAxis,
		seriesAll: [saleAmountSeries, saleNumSeries] as number[][],
	};
};

const getShopNameInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getShopNameInfo(dateStr)) as ApiResult<ShopFinanceData[]>;
	if (code === '200') {
		pieShopData.value = (data || []).map((item) => ({
			name: item.shopName || '',
			value: item.saleAmount || 0,
		}));
		return;
	}
	message.error(messageInfo || '查询列表失败！');
};

const getPayWayInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getPayWayInfo(dateStr)) as ApiResult<PayWayInfoItem[]>;
	if (code === '200') {
		piePayWayData.value = (data || []).map((item) => ({
			name: item.payWayName || '',
			value: item.saleAmount || 0,
		}));
		return;
	}
	message.error(messageInfo || '查询列表失败！');
};

const getDayShopFinanceInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getDayShopFinanceInfo(dateStr)) as ApiResult<TrendPoint[]>;
	if (code === '200') {
		const { xAxis, seriesAll } = buildSeriesData(data || [], (item) =>
			formatTime(item.infoDate),
		);
		dayConfig.value.xAxis = xAxis;
		dayConfig.value.series = seriesAll as unknown as string[][];
		dayData.value = seriesAll;
		return;
	}
	message.error(messageInfo || '查询列表失败！');
};

const getMonthShopFinanceInfoInfo = async (dateStr: string) => {
	const {
		code,
		data,
		message: messageInfo,
	} = (await getMonthShopFinanceInfo(dateStr)) as ApiResult<TrendPoint[]>;
	if (code === '200') {
		const { xAxis, seriesAll } = buildSeriesData(
			data || [],
			(item) => item.infoDate || '',
		);
		monthConfig.value.xAxis = xAxis;
		monthConfig.value.series = seriesAll as unknown as string[][];
		monthData.value = seriesAll;
		return;
	}
	message.error(messageInfo || '查询列表失败！');
};

const getInfo = async () => {
	const dateStr = searchDateTime.value.format(dateFormatter);
	await Promise.all([
		getShopNameInfoInfo(dateStr),
		getPayWayInfoInfo(dateStr),
		getDayShopFinanceInfoInfo(dateStr),
		getMonthShopFinanceInfoInfo(dateStr),
	]);
};

const changeMonth = () => {
	void getInfo();
};

onMounted(() => {
	void getInfo();
});
</script>
<style lang="scss" scoped>
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
