<template>
	<div>
		<a-modal
			v-model:open="modelInfo.open"
			:width="modelInfo?.width || '3000px'"
			:title="modelInfo?.title || 'Basic Modal'"
			@ok="handleOk"
			okText="保存"
			:confirmLoading="modelConfig.confirmLoading"
			:destroyOnClose="modelConfig.destroyOnClose"
			@cancel="handleCancel"
		>
			<template #footer>
				<a-button key="back" @click="handleCancel">取消</a-button>
				<a-button
					key="submit"
					type="primary"
					:loading="loading"
					@click="handleOk"
					>保存
				</a-button>
			</template>
			<a-form
				ref="formRef"
				name="PmsShopProductForm"
				class="ant-advanced-search-form"
				disabled
				:model="formState"
				:label-col="labelCol"
				:wrapper-col="wrapperCol"
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
import {
	getPmsShopProductDetail,
	addPmsShopProduct,
	editPmsShopProduct,
	getProductHisInfo,
} from '@/views/product/pmsShopProduct/api';
import type { PmsShopProductData } from '@/views/product/pmsShopProduct/config';
import type { FormInstance } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import { getDictList } from '@/views/finance/dict/api';
import type { DictInfo } from '@/views/finance/dict/config';
import type { barItem } from '@/views/finance/financeAnalysis/chart/bar';
import type { ModelInfo } from '@/views/common/config';

type ProductHistoryItem = {
	price?: number;
	createDate?: string;
};

type PmsShopProductDetail = PmsShopProductData & {
	id?: string | number;
	comparePrice?: number;
	lowestPrice?: number;
	highestPrice?: number;
	skuId?: string;
};

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
const loading = ref<boolean>(false);
const formRef = ref<FormInstance>();
const dayData = ref<number[]>([]);
const sourceName = ref<string>('');

const modelConfig = reactive({
	confirmLoading: true,
	destroyOnClose: true,
});

const modelInfo = defineModel<ModelInfo>('modelInfo', { default: () => ({}) });
const formState = ref<PmsShopProductDetail>({});
const dayConfig = ref<barItem>({
	xAxis: [],
	series: [],
	xTile: '天数',
	yTitle: '金钱(元)',
	yNameGap: 30,
	tooltip: {},
	legend: [],
	color: '#aa55ff',
});

const emit = defineEmits(['success']);

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
	modelInfo.value.open = false;
};

// 保存商品网上商品信息
const savePmsShopProductManager = async () => {
	try {
		const api = formState.value.id ? editPmsShopProduct : addPmsShopProduct;
		const { code, message: messageInfo } = await api(formState.value);
		if (code === '200') {
			message.success(messageInfo || '保存成功！');
			modelInfo.value.open = false;
			emit('success');
			formState.value = {};
		} else {
			message.error(messageInfo || '保存失败！');
		}
	} finally {
		loading.value = false;
	}
};

const getProductHisDaysInfo = async (skuId: string, dateStr: string | null) => {
	const {
		code,
		data,
		message: messageInfo,
	} = await getProductHisInfo(skuId, dateStr);
	if (String(code) !== '200') {
		message.error(messageInfo || '查询列表失败！');
		return;
	}
	const records = (data || []) as ProductHistoryItem[];
	const series = records.map((item) => item.price ?? 0);
	const xAxis = records.map((item) => item.createDate ?? '');
	dayConfig.value = {
		xAxis,
		series,
		xTile: '天数',
		yTitle: '金钱(元)',
		yNameGap: 50,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
			formatter(
				param: Array<{ axisValue: string; marker: string; value: number }>,
			) {
				let tip = `<p style="margin: 0">${param[0]?.axisValue || ''}日</p>`;
				param.forEach((element) => {
					tip += `<p style="margin: 0">${element.marker}花费: ${
						element.value ?? 0
					}元</p>`;
				});
				return tip;
			},
		},
		color: '#aa55ff',
	};
	dayData.value = series;
};

// 初始化数据
const init = async () => {
	const id = modelInfo.value?.id;
	if (!id) {
		modelConfig.confirmLoading = false;
		formState.value = {};
		sourceName.value = '';
		dayData.value = [];
		return;
	}
	const [dictRes, detailRes] = await Promise.all([
		getDictList('shop_type'),
		getPmsShopProductDetail(String(id)),
	]);

	if (String(detailRes.code) !== '200' || !detailRes.data) {
		message.error(detailRes.message || '查询失败！');
		return;
	}

	formState.value = detailRes.data;
	modelConfig.confirmLoading = false;

	if (String(dictRes.code) === '200' && dictRes.data?.length) {
		const matched = (dictRes.data as DictInfo[]).find(
			(item) => String(item.typeCode) === String(detailRes.data?.source),
		);
		sourceName.value = matched?.typeName || '';
	} else {
		sourceName.value = '';
	}

	if (formState.value.skuId) {
		await getProductHisDaysInfo(formState.value.skuId, '');
	} else {
		dayData.value = [];
	}
};

watch(
	() => modelInfo.value.open,
	(newVal) => {
		if (newVal) {
			init();
		}
	},
	{
		immediate: true,
	},
);
</script>
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
