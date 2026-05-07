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
								:name="labelMap['permissionCode'].name"
								:label="labelMap['permissionCode'].label"
							>
								<a-input
									v-model:value="searchInfo.permissionCode"
									:placeholder="'请填写' + labelMap['permissionCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['permissionName'].name"
								:label="labelMap['permissionName'].label"
							>
								<a-input
									v-model:value="searchInfo.permissionName"
									:placeholder="'请填写' + labelMap['permissionName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['summary'].name"
								:label="labelMap['summary'].label"
							>
								<a-input
									v-model:value="searchInfo.summary"
									:placeholder="'请填写' + labelMap['summary'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['status'].name"
								:label="labelMap['status'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.status"
									:placeholder="'请输入' + labelMap['status'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="statusList"
									:allowClear="true"
								>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['options'].name"
								:label="labelMap['options'].label"
							>
								<a-input
									v-model:value="searchInfo.options"
									:placeholder="'请填写' + labelMap['options'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" style="text-align: right">
							<a-space>
								<a-button type="primary" @click="query(true)"> 查找</a-button>
								<a-button type="primary" @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button v-permission="'permission:add'" type="primary" @click="editPermissionInfo('add')">
					新增
				</a-button>
				<a-button v-permission="'permission:delete'" type="primary" danger @click="batchDelPermissionInfo">
					删除
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
								v-permission="'permission:edit'"
								type="primary"
								size="small"
								@click="editPermissionInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								v-permission="'permission:delete'"
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delPermissionInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<PermissionInfoDetail
				ref="editInfo"
				v-model:modelInfo="modelInfo"
				@success="handleSuccess"
			></PermissionInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('is_valid');
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	type SearchInfo,
	columns,
	type PermissionInfo,
	labelMap,
} from './permissionInfoListTs';
import {
	getPermissionInfoPage,
	deletePermissionInfo,
} from '@/views/user/permissionInfo/api';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

let searchInfo = ref<SearchInfo>({});

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (
		record: PermissionInfo,
		selected: boolean,
		selectedRows: PermissionInfo[],
	) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: PermissionInfo[],
		changeRows: PermissionInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 字典数据已通过 useDictInfo 自动加载

function cancelQuery() {
	searchInfo.value = {};
	query(true);
}

function query(resetPage = false) {
	if (resetPage) {
		resetPagination();
	}
	getPermissionInfoListPage(searchInfo.value, pagination);
}

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getPermissionInfoListPage(searchInfo.value, pagination);
};

const delPermissionInfo = async (ids: string | number) => {
	const { code, message: messageInfo } = await deletePermissionInfo(String(ids));
	if (code === '200') {
		message.success(messageInfo || '删除成功！', 3);
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelPermissionInfo = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delPermissionInfo(rowIds.join(','));
};

let loading = ref<boolean>(false);

let dataSource = ref<PermissionInfo[]>([]);

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getPermissionInfoListPage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getPermissionInfoPage(param, cur.current, cur.pageSize).finally(
		() => {
			loading.value = false;
		},
	);
	if (code === '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

const init = () => {
	//获取权限信息表页面数据
	getPermissionInfoListPage(searchInfo.value, pagination);
};

init();

const modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editPermissionInfo(type: string, id?: string) {
	if (type === 'add') {
		modelInfo.value.title = '新增明细';
		modelInfo.value.id = null;
	} else if (type === 'update') {
		modelInfo.value.title = '修改明细';
		modelInfo.value.id = id ?? null;
	}
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

const handleSuccess = () => {
	query(false);
};

// 查询条件防抖：任意查询条件变化 300ms 后触发查询，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>
<style lang="scss" scoped></style>
