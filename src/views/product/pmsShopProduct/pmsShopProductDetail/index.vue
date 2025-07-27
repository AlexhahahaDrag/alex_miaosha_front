<template>
	<div>
		<a-modal
			:open="props.open"
			:width="
				props.modelInfo && props.modelInfo.width ?
					props.modelInfo.width
				:	'3000px'
			"
			:title="
				props.modelInfo && props.modelInfo.title ?
					props.modelInfo.title
				:	'Basic Modal'
			"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<template #footer>
				<a-button key="back" @click="handleCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					@click="handleOk"
					>保存</a-button
				>
			</template>
			<a-form
				ref="formRef"
				name="PmsShopProductForm"
				class="ant-advanced-search-form"
				disabled
				:model="formState"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
				@finish="onFinish"
				@finishFailed="onFinishFailed"
			>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="name" label="name">
							<span>{{ formState.name }}</span>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="image" label="图片url">
							<a-image :width="120" :src="formState.image" />
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="price" label="价格">
							<span
								v-if="
									formState.comparePrice &&
									formState.price &&
									formState.price < formState.comparePrice
								"
								style="font-weight: 900; font-style: oblique; color: red"
							>
								{{ formState.price }}</span
							>
							<span v-else>{{ formState.price }}</span>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="comparePrice" label="对比价格">
							<span>{{ formState.comparePrice }}</span>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="lowestPrice" label="历史最低价格">
							<span>{{ formState.lowestPrice }}</span>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="hignestPrice" label="历史最高价格">
							<span>{{ formState.highestPrice }}</span>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="icons" label="标签">
							<span>{{ formState.icons }}</span>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="productUrl" label="产品连接">
							<a :href="formState.productUrl">查看商城商品信息</a>
						</a-form-item>
					</a-col>
				</a-row>
				<a-row :gutter="24">
					<a-col :span="12">
						<a-form-item name="shop" label="商铺">
							<span>{{ formState.shop }}</span>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="source" label="来源">
							<span> {{ sourceName }}</span>
						</a-form-item>
					</a-col>
				</a-row>
			</a-form>
			<!-- <div>
      <chart :options="options" width="50%" height="400px" />
    </div> -->
			<div class="mainGrid">
				<div class="div1">
					<line-chart
						height="100%"
						width="100%"
						title="近三十日数据变化"
						:data="dayData"
						:config="dayConfig"
					>
					</line-chart>
				</div>
			</div>
		</a-modal>
	</div>
</template>
<script lang="ts" setup>
import type { PmsShopProductDetail } from './pmsShopProductDetailTs';
import {
	getPmsShopProductDetail,
	addOrEditPmsShopProduct,
	getProductHisInfo,
} from '@/api/product/pmsShopProduct/pmsShopProductTs';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import type { ModelInfo } from '../pmsShopProductListTs';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { barItem } from '@/views/finance/financeAnalysis/chart/bar';

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let loading = ref<boolean>(false);

const formRef = ref<FormInstance>();

let dayData = ref<any>([]);

const modelConfig = {
	confirmLoading: true,
	destroyOnClose: true,
};

interface Props {
	open?: boolean;
	modelInfo?: ModelInfo;
}
const props = defineProps<Props>();

let formState = ref<PmsShopProductDetail>({});

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

// const options = {
//   xAxis: {
//     type: 'category',
//     data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//   },
//   yAxis: {
//     type: 'value'
//   },
//   series: [
//     {
//       data: [150, 230, 224, 218, 135, 147, 260],
//       type: 'line'
//     }
//   ]
// };

const emit = defineEmits(['handleOk', 'handleCancel']);

const handleOk = () => {
	loading.value = true;
	if (formRef.value) {
		formRef.value
			.validateFields()
			.then(() => savePmsShopProductManager())
			.catch(() => {
				loading.value = false;
			});
	}
};

const handleCancel = () => {
	emit('handleCancel', false);
};

//保存商品网上商品信息信息
function savePmsShopProductManager() {
	let method = '';
	if (formState.value.id) {
		method = 'put';
	} else {
		method = 'post';
	}
	addOrEditPmsShopProduct(method, formState.value)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && res.message) || '保存成功！');
				emit('handleOk', false);
			} else {
				message.error((res && res.message) || '保存失败！');
			}
			formState.value = {};
		})
		.catch((error: any) => {
			let data = error?.response?.data;
			if (data) {
				message.error(data?.message || '保存失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
}

const onFinish = (values: any) => {
	console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};

let sourceName = ref<string>('');

function getProductHisDaysInfo(skuId: string, dateStr: string | null) {
	getProductHisInfo(skuId, dateStr).then(
		(res: { code: string; data: any[]; message: any }) => {
			if (res.code == '200') {
				if (res.data) {
					let series = [] as any;
					let xAxis = [] as any;
					res.data.forEach((item) => {
						series.push(item.price);
						xAxis.push(item.createDate);
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
										tip += `<p style="margin: 0">${element.marker}${name}: ${
											element.value ? element.value : 0.0
										}${unit}</p>`;
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

function init() {
	if (props.modelInfo) {
		if (props.modelInfo.id) {
			Promise.all([
				getDictList('shop_type'),
				getPmsShopProductDetail(props.modelInfo.id),
			]).then((res: any[]) => {
				if (res[0].code == '200' && res[0].data?.length && res[1].data) {
					res[0].data.forEach(
						(item: { typeCode: string; typeName: Ref<string> }) => {
							if (item.typeCode == res[1].data.source) {
								sourceName.value = item.typeName;
							}
						},
					);
				} else {
					message.error((res[0] && res[0].message) || '查询列表失败！');
				}
				if (res[1].code == '200') {
					formState.value = res[1].data;
					modelConfig.confirmLoading = false;
				} else {
					message.error((res[1] && res[1].message) || '查询失败！');
				}
			});
		} else {
			modelConfig.confirmLoading = false;
			formState.value = {};
		}
	}
	if (formState.value?.skuId) {
		getProductHisDaysInfo(formState.value.skuId, '');
	}
}

watch(
	() => props.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
		deep: true,
	},
);

defineExpose({ handleOk, handleCancel });
</script>
<style lang="scss" scoped></style>
<style lang="scss" scoped>
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
