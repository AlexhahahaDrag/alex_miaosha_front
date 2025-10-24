<template>
	<div class="page-info">
		<div class="search">
			<div class="search-box">
				<a-form
					:model="searchInfo"
					:label-col="labelCol"
					:wrapper-col="wrapperCol"
				>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['eventName'].name"
								:label="labelMap['eventName'].label"
							>
								<a-input
									v-model:value="searchInfo.eventName"
									:placeholder="'请填写' + labelMap['eventName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['otherPerson'].name"
								:label="labelMap['otherPerson'].label"
							>
								<a-input
									v-model:value="searchInfo.otherPerson"
									:placeholder="'请填写' + labelMap['otherPerson'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['action'].name"
								:label="labelMap['action'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.action"
									:placeholder="'请输入' + labelMap['action'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="actionList"
									:allowClear="true"
								>
								</a-select>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" style="text-align: right; margin-bottom: 10px">
							<a-space>
								<a-button type="primary" @click="query"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button" style="margin-left: 10px">
			<a-space>
				<a-button type="primary" @click="editPersonalGift('add')"
					>新增
				</a-button>
				<a-upload
					name="file"
					:showUploadList="false"
					:customRequest="customImportRequest"
				>
					<a-button type="primary">
						<upload-outlined></upload-outlined>
						导入
					</a-button>
				</a-upload>
				<a-button type="primary" danger @click="batchDelPersonalGift">
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content" style="min-height: 400px">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => record.id"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
				:style="{ minHeight: '400px' }"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="noticePersonalInfo(record.id)"
								>通知</a-button
							>
							<a-button
								type="primary"
								size="small"
								@click="editPersonalGift('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPersonalGift(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'action'">
						<a-tag
							:key="record.action"
							:color="record.action == 'give' ? 'red' : 'green'"
						>
							{{ record.action == 'give' ? '随礼' : '收礼' }}
						</a-tag>
					</template>
					<template v-else-if="column.key === 'eventTime'">
						<span>
							{{ formatDate(record.eventTime) }}
						</span>
					</template>
				</template>
			</a-table>
		</div>
		<PersonalGiftDetail
			ref="editInfo"
			:open="modelInfo?.open"
			:modelInfo="modelInfo"
			@handleOk="handleOk"
			@handleCancel="handleCancel"
		></PersonalGiftDetail>
	</div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { PersonalGiftInfo } from './config';
import { columns, labelCol, wrapperCol, labelMap } from './config';
import {
	getPersonalGiftPage,
	deletePersonalGift,
	noticePersonalGift,
	importPersonalGift,
} from '@/views/finance/personalGift/api';
import { formatDate } from '@/utils/dayjs';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('action');

const actionList = computed(() => getDictByType('action'));

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

let rowIds: (string | number)[] = [];

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: PersonalGiftInfo,
		selected: boolean,
		selectedRows: PersonalGiftInfo[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: PersonalGiftInfo[],
		changeRows: PersonalGiftInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 加载状态
let loading = ref<boolean>(false);
// 数据源
let dataSource = ref<PersonalGiftInfo[]>([]);
// 搜索条件
let searchInfo = ref<PersonalGiftInfo>({});
// 弹窗信息
let modelInfo = ref<ModelInfo>({});

// 清空查询条件
const cancelQuery = (): void => {
	searchInfo.value = {};
};

const query = (): void => {
	getPersonalGiftListPage(searchInfo.value, pagination);
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getPersonalGiftListPage(searchInfo.value, pagination);
};

const noticePersonalInfo = async (id: number): Promise<void> => {
	const { code, message: messageInfo } = await noticePersonalGift(id);
	if (code == '200') {
		message.success(messageInfo || '通知成功！', 3);
		getPersonalGiftListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '通知失败！', 3);
	}
};

// 删除个人随礼信息表信息
const delPersonalGift = async (ids: string): Promise<void> => {
	const { code, message: messageInfo } = await deletePersonalGift(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		getPersonalGiftListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

// 批量删除个人随礼信息表信息
const batchDelPersonalGift = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPersonalGift(rowIds.join(','));
};

// 导入个人随礼信息表信息
const customImportRequest = async (info: unknown): Promise<void> => {
	const formData = new FormData();
	formData.append('file', (info as { file: File }).file);
	const { code, message: messageInfo } = await importPersonalGift(formData);
	if (code == '200') {
		message.success(messageInfo || '导入成功！', 3);
		getPersonalGiftListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '导入失败！', 3);
	}
};

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getPersonalGiftListPage = async (
	param: PersonalGiftInfo,
	cur: PageInfo,
): Promise<void> => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getPersonalGiftPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

//新增和修改弹窗
const editPersonalGift = (type: string, id?: number): void => {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value = { ...modelInfo.value, confirmLoading: true, open: true };
};

// 保存个人随礼信息表信息
const handleOk = (v: boolean): void => {
	modelInfo.value.open = v;
	getPersonalGiftListPage(searchInfo.value, pagination);
};

// 取消个人随礼信息表信息
const handleCancel = (v: boolean): void => {
	modelInfo.value.open = v;
};

const init = (): void => {
	modelInfo.value = { open: false, confirmLoading: false };
	//获取个人随礼信息表页面数据
	getPersonalGiftListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
