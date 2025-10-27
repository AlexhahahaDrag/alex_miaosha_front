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
						<a-col :span="6">
							<a-form-item name="typeName" label="类别">
								<a-input
									v-model:value="searchInfo.typeName"
									placeholder="类别"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-form-item name="belongToName" label="分类名称">
								<a-input
									v-model:value="searchInfo.belongToName"
									placeholder="请输入分类名称"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="6">
							<a-space>
								<a-button type="primary" @click="query"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button type="primary" @click="editDict('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelDictManager"
					>删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record) => record.id"
				:pagination="pagination"
				@change="handleTableChange"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editDict('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								title="确认删除字典信息?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delDict(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
					<template v-else-if="column.key === 'isValid'">
						<a-tag
							:key="record.isValid"
							:color="record.isValid == 1 ? '#87d068' : 'grey'"
						>
							{{ record.isValid == 1 ? '有效' : '失效' }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<DictDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			>
			</DictDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DictInfo } from './config';
import type { ModelInfo } from '@/views/common/config';
import { columns } from './config';
import {
	getDictManagerPage,
	deleteDictManager,
} from '@/views/finance/dict/api';
import { message } from 'ant-design-vue';

let rowIds: (string | number)[] = [];

let loading = ref<boolean>(false);

let dataSource = ref();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (record: DictInfo, selected: boolean, selectedRows: DictInfo[]) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: DictInfo[],
		changeRows: DictInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

let searchInfo = ref<SearchInfo>({});

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getDictPage(searchInfo.value, pagination);
}

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getDictPage(searchInfo.value, pagination);
}

function delDict(ids: string) {
	deleteDictManager(ids)
		.then((res) => {
			if (res.code == '200') {
				message.success((res && '删除' + res.message) || '删除成功！', 3);
				getDictPage(searchInfo.value, pagination);
			} else {
				message.error((res && res.message) || '删除失败！', 3);
			}
		})
		.catch((e) => {
			message.error('删除异常，请联系管理员！', 3);
			console.log(e);
		});
}

function batchDelDictManager() {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delDict(rowIds.join(','));
}

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getDictPage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getDictManagerPage(param, cur.current, cur.pageSize).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

//新增和修改弹窗
function editDict(type: string, id?: number) {
	if (type == 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = undefined;
	} else if (type == 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id;
	}
	modelInfo.value.confirmLoading = true;
	visible.value = true;
}

const handleOk = (v: boolean) => {
	visible.value = v;
	getDictPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

// 初始化页面数据
const init = () => {
	//获取财务管理页面数据
	getDictPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
