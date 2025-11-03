<template>
	<div class="search-box">
		<!-- AI Agent: 个人随礼搜索表单组件 -->
		<a-form :model="searchInfo" :label-col="labelCol" :wrapper-col="wrapperCol">
			<a-row :gutter="24">
				<!-- 事件名称搜索字段 -->
				<a-col :span="6">
					<a-form-item
						:name="labelMap['eventName'].name"
						:label="labelMap['eventName'].label"
					>
						<a-input
							v-model:value="searchInfo.eventName"
							:placeholder="'请填写' + labelMap['eventName'].label"
							allow-clear
							@change="onQueryWithDebounce"
						/>
					</a-form-item>
				</a-col>
				<!-- 其他人员搜索字段 -->
				<a-col :span="6">
					<a-form-item
						:name="labelMap['otherPerson'].name"
						:label="labelMap['otherPerson'].label"
					>
						<a-input
							v-model:value="searchInfo.otherPerson"
							:placeholder="'请填写' + labelMap['otherPerson'].label"
							allow-clear
							@change="onQueryWithDebounce"
						/>
					</a-form-item>
				</a-col>
				<!-- 操作类型搜索字段 -->
				<a-col :span="6">
					<a-form-item
						:name="labelMap['action'].name"
						:label="labelMap['action'].label"
					>
						<a-select
							v-model:value="searchInfo.action"
							:placeholder="`请选择${labelMap['action'].label}`"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="actionList"
							:allowClear="true"
							@change="onQueryImmediate"
						/>
					</a-form-item>
				</a-col>

				<!-- 操作按钮 -->
				<a-col :span="6" style="text-align: right; margin-bottom: 10px">
					<a-space>
						<a-button type="primary" @click="onQueryImmediate">查找</a-button>
						<a-button type="primary" @click="onCancelQuery">清空</a-button>
					</a-space>
				</a-col>
			</a-row>
		</a-form>
	</div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import { debounce } from 'lodash-es';
import type { PersonalGiftInfo } from '../config';
import { labelCol, wrapperCol, labelMap } from '../config';
import { useDictInfo } from '@/composables/useDictInfo';

// 防抖延迟时间配置（毫秒）
const DEBOUNCE_DELAY = 800;

// 字典信息 - 获取操作类型选项
const { getDictByType } = useDictInfo('gift_action');
const actionList = computed(() => getDictByType('gift_action'));

// 定义接收的 props
interface Props {
	// 搜索信息
	modelValue?: PersonalGiftInfo;
}

// 定义事件
const emit = defineEmits<{
	// 查询事件
	query: [];
	// 清空查询事件
	cancelQuery: [];
	// 更新搜索信息
	'update:modelValue': [value: PersonalGiftInfo];
}>();

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => ({}),
});

// 搜索信息
const searchInfo = computed({
	get(): PersonalGiftInfo {
		return props.modelValue;
	},
	set(value: PersonalGiftInfo) {
		emit('update:modelValue', value);
	},
});

/**
 * 立即查询处理函数
 * 用于 select 选择或查找按钮点击时立刻查询
 */
const onQueryImmediate = (): void => {
	emit('query');
};

/**
 * 防抖查询处理函数
 * 用于 input 输入后，延迟 800ms 进行查询
 */
const onQueryWithDebounce = debounce((): void => {
	emit('query');
}, DEBOUNCE_DELAY);

/**
 * 清空查询条件处理函数
 * 清空搜索信息并触发清空事件
 */
const onCancelQuery = (): void => {
	searchInfo.value = {};
	onQueryImmediate();
};

// 组件卸载时，取消待处理的防抖操作
onBeforeUnmount(() => {
	onQueryWithDebounce.cancel();
});
</script>
<style lang="scss" scoped></style>
