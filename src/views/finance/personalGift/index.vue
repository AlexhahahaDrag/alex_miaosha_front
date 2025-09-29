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
					>新增</a-button
				>
				<a-upload
					name="file"
					:showUploadList="false"
					:customRequest="customImageRequest"
				>
					<a-button type="primary">
						<upload-outlined></upload-outlined>
						导入
					</a-button>
				</a-upload>
				<a-button type="primary" danger @click="batchDelPersonalGift"
					>删除</a-button
				>
			</a-space>
		</div>
		<div class="content" style="min-height: 400px">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 1100 }"
				:row-selection="rowSelection"
				:style="{ minHeight: '400px' }"
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
							{{
								record.eventTime ?
									String(record.eventTime).substring(0, 10)
								:	''
							}}
						</span>
					</template>
				</template>
			</a-table>
			<PersonalGiftDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></PersonalGiftDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './personalGiftListTs';
import { columns } from './personalGiftListTs';
import {
	getPersonalGiftPage,
	deletePersonalGift,
	noticePersonalGift,
	importPersonalGift,
} from '@/api/finance/personalGift/personalGiftTs';
import { message } from 'ant-design-vue';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { DictInfo } from '@/views/finance/dict/dict';
import { UploadOutlined } from '@ant-design/icons-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (record: DataItem, selected: boolean, selectedRows: DataItem[]) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: DataItem[],
		changeRows: DataItem[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

const labelMap = ref<any>({
	eventName: { name: 'eventName', label: '事件名称' },
	amount: { name: 'amount', label: '金额' },
	otherPerson: { name: 'otherPerson', label: '其他人' },
	eventTime: { name: 'eventTime', label: '随礼时间' },
	remarks: { name: 'remarks', label: '备注' },
	action: { name: 'action', label: '动作' },
	noticeNum: { name: 'noticeNum', label: '通知次数' },
});

let searchInfo = ref<SearchInfo>({});

let actionList = ref<DictInfo[]>([]);

const getDictInfoList = (): void => {
	getDictList('gift_action').then((res) => {
		if (res.code == '200') {
			actionList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'gift_action',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

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

const noticePersonalInfo = (id: number) => {
	noticePersonalGift(id)
		.then((res: any) => {
			console.log(`res:`, res);
			if (res.code === '200') {
				getPersonalGiftListPage(searchInfo.value, pagination);
			} else {
				message.error(res?.message?.description || '失败，请联系管理员！');
			}
		})
		.catch((error: any) => {
			message.error(error?.description || '失败，请联系管理员！');
		});
};

const delPersonalGift = (ids: string): void => {
	deletePersonalGift(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getPersonalGiftListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
};

const batchDelPersonalGift = (): void => {
	let ids = '';
	if (rowIds && rowIds.length > 0) {
		rowIds.forEach((item: string) => {
			ids += item + ',';
		});
		ids = ids.substring(0, ids.length - 1);
	} else {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPersonalGift(ids);
};

const customImageRequest = (info: any) => {
	const formData = new FormData() as any;
	formData.append('file', info.file);
	importPersonalGift(formData).then((res) => {
		console.log(`res:`, res);
		if (res.code == '200') {
			console.log(`res:`, res);
			info.onSuccess(res.data, info.file);
			getPersonalGiftListPage(searchInfo.value, pagination);
		}
	});
};

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent): void => {
	console.log(e);
};

const getPersonalGiftListPage = (param: SearchInfo, cur: PageInfo): void => {
	loading.value = true;
	getPersonalGiftPage(param, cur.current, cur.pageSize)
		.then((res) => {
			if (res.code == '200') {
				dataSource.value = res.data.records;
				setTotal(res.data.total);
			} else {
				message.error((res && res.message) || '查询列表失败！');
			}
		})
		.finally(() => {
			loading.value = false;
		});
};

const init = (): void => {
	getDictInfoList();
	//获取个人随礼信息表页面数据
	getPersonalGiftListPage(searchInfo.value, pagination);
};

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
const editPersonalGift = (type: string, id?: number): void => {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
};

const handleOk = (v: boolean): void => {
	visible.value = v;
	getPersonalGiftListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean): void => {
	visible.value = v;
};
</script>
<style lang="scss" scoped></style>
