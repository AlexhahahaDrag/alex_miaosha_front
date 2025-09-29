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
								:name="labelMap['name'].name"
								:label="labelMap['name'].label"
							>
								<a-input
									v-model:value="searchInfo.name"
									:placeholder="'请填写' + labelMap['name'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['title'].name"
								:label="labelMap['title'].label"
							>
								<a-input
									v-model:value="searchInfo.title"
									:placeholder="'请填写' + labelMap['title'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['component'].name"
								:label="labelMap['component'].label"
							>
								<a-input
									v-model:value="searchInfo.component"
									:placeholder="'请填写' + labelMap['component'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['redirect'].name"
								:label="labelMap['redirect'].label"
							>
								<a-input
									v-model:value="searchInfo.redirect"
									:placeholder="'请填写' + labelMap['redirect'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['icon'].name"
								:label="labelMap['icon'].label"
							>
								<a-input
									v-model:value="searchInfo.icon"
									:placeholder="'请填写' + labelMap['icon'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="8">
							<a-form-item
								:name="labelMap['hideInMenu'].name"
								:label="labelMap['hideInMenu'].label"
							>
								<a-select
									ref="select"
									v-model:value="searchInfo.hideInMenu"
									:placeholder="'请输入' + labelMap['hideInMenu'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="hideInMenuList"
									:allowClear="true"
								>
								</a-select>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['parentId'].name"
								:label="labelMap['parentId'].label"
							>
								<a-input
									v-model:value="searchInfo.parentId"
									:placeholder="'请填写' + labelMap['parentId'].label"
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
								:name="labelMap['orderBy'].name"
								:label="labelMap['orderBy'].label"
							>
								<a-input
									v-model:value="searchInfo.orderBy"
									:placeholder="'请填写' + labelMap['orderBy'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
					</a-row>
					<a-row :gutter="24">
						<a-col :span="20" style="text-align: right">
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
				<a-button type="primary" @click="editMenuInfo('add')">新增</a-button>
				<a-button type="primary" @click="query">导入</a-button>
				<a-button type="primary" danger @click="batchDelMenuInfo"
					>删除</a-button
				>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: any) => record.id"
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
								@click="editMenuInfo('update', record.id)"
								>编辑</a-button
							>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delMenuInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
						<span></span>
					</template>
				</template>
			</a-table>
			<MenuInfoDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></MenuInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import { useDictInfo } from '@/composables/useDictInfo';

const { getDictByType } = useDictInfo('true_or_false,is_valid');
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	type SearchInfo,
	columns,
	type DataItem,
	labelMap,
} from './menuInfoListTs';
import {
	getMenuInfoPage,
	deleteMenuInfo,
} from '@/api/user/menuInfo/menuInfoTs';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

let searchInfo = ref<SearchInfo>({});

// 字典数据已通过 useDictInfo 自动加载
const hideInMenuList = computed(() => getDictByType('true_or_false'));
const statusList = computed(() => getDictByType('is_valid'));

let loading = ref<boolean>(false);

let dataSource = ref<DataItem[]>([]);

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

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

// 字典数据已通过 useDictInfo 自动加载

function cancelQuery() {
	searchInfo.value = {};
	triggerDebouncedQuery.cancel();
	pagination.current = 1;
	getMenuInfoListPage(searchInfo.value, pagination);
}

function query() {
	triggerDebouncedQuery.cancel();
	getMenuInfoListPage(searchInfo.value, pagination);
}

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getMenuInfoListPage(searchInfo.value, pagination);
};

function delMenuInfo(ids: string) {
	deleteMenuInfo(ids).then((res: any) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getMenuInfoListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelMenuInfo() {
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
	delMenuInfo(ids);
}

const cancel = (e: MouseEvent) => {
	console.log(e);
};

function getMenuInfoListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getMenuInfoPage(param, cur.current, cur.pageSize)
		.then((res: any) => {
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
}

function init() {
	//获取菜单管理表页面数据
	getMenuInfoListPage(searchInfo.value, pagination);
}

//新增和修改弹窗
function editMenuInfo(type: string, id?: number) {
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
	getMenuInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

// 查询条件防抖：任意查询条件变化时，300ms 内只触发一次请求，并将页码重置为第一页
const triggerDebouncedQuery = debounce(() => {
	pagination.current = 1;
	getMenuInfoListPage(searchInfo.value, pagination);
}, 300);

//初始化
init();

watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);
</script>
<style lang="scss" scoped></style>
