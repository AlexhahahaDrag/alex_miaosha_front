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
								<a-button
									type="primary"
									data-testid="rbac-perm-btn-query"
									@click="() => query(false)"
								>
									查找
								</a-button>
								<a-button
									type="primary"
									data-testid="rbac-perm-btn-reset"
									@click="cancelQuery"
								>
									清空
								</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button
					v-permission="'permission:add'"
					type="primary"
					data-testid="rbac-perm-btn-add"
					@click="editPermissionInfo('add')"
				>
					新增
				</a-button>
				<a-button
					v-permission="'permission:delete'"
					type="primary"
					danger
					data-testid="rbac-perm-btn-batch-delete"
					@click="batchDelPermissionInfo"
				>
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
				data-testid="rbac-perm-table"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								v-permission="'permission:edit'"
								type="primary"
								size="small"
								data-testid="rbac-perm-row-edit"
								@click="editPermissionInfo('update', record.id)"
							>
								编辑
							</a-button>
							<span v-permission="'permission:delete'">
								<a-popconfirm
									title="确认删除?"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delPermissionInfo(record.id)"
									@cancel="cancel"
								>
									<a-button
										type="primary"
										size="small"
										danger
										data-testid="rbac-perm-row-delete"
									>
										删除
									</a-button>
								</a-popconfirm>
							</span>
						</a-space>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag :color="String(record.status) === '1' ? '#87d068' : 'grey'">
							{{ String(record.status) === '1' ? '有效' : '失效' }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<PermissionInfoDetail
				v-model:modelInfo="modelInfo"
				@success="() => query()"
			></PermissionInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import { useDictInfo } from '@/composables/useDictInfo';
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
import PermissionInfoDetail from './permissionInfoDetail/index.vue';
import { Modal, message } from 'ant-design-vue';
import { debounce } from 'lodash-es';

// 使用表格行选择组合式函数（保障 ID 为纯 string）
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected,
} = useRowSelection();

// 使用分页组合式函数，直接绑定查询回调，消除包装函数
const {
	pagination,
	handleTableChange,
	setTotal,
	resetPagination,
} = usePagination({
	onChange: (p) => getPermissionInfoListPage(searchInfo.value, p),
});

const { getDictByType } = useDictInfo('is_valid');

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

const searchInfo = ref<SearchInfo>({});

// 字典数据已通过 useDictInfo 自动加载
const statusList = computed(() => getDictByType('is_valid'));

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

const delPermissionInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deletePermissionInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelPermissionInfo = (): void => {
	if (!rowIds.value?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.value.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delPermissionInfo(rowIds.value.join(',')),
	});
};

const loading = ref<boolean>(false);

const dataSource = ref<PermissionInfo[]>([]);

const cancel = (e: MouseEvent) => {
	console.log(e);
};

const getPermissionInfoListPage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getPermissionInfoPage(param, cur.current, cur.pageSize);
		if (code === '200') {
			dataSource.value = data?.records || [];
			setTotal(data?.total || 0);
		} else {
			message.error(messageInfo || '查询列表失败！');
		}
	} finally {
		loading.value = false;
	}
};

const init = () => {
	// 获取权限信息表页面数据
	getPermissionInfoListPage(searchInfo.value, pagination);
};

onMounted(() => {
	init();
});

const modelInfo = ref<ModelInfo>({});

// 新增和修改弹窗
function editPermissionInfo(type: string, id?: string) {
	const isAdd = type === 'add';
	modelInfo.value.title = isAdd ? '新增明细' : '修改明细';
	modelInfo.value.id = isAdd ? null : (id !== undefined && id !== null ? String(id) : null);
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
}

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
