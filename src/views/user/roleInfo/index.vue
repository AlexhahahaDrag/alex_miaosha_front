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
								:name="labelMap['roleCode'].name"
								:label="labelMap['roleCode'].label"
							>
								<a-input
									v-model:value="searchInfo.roleCode"
									:placeholder="'请填写' + labelMap['roleCode'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col :span="8">
							<a-form-item
								:name="labelMap['roleName'].name"
								:label="labelMap['roleName'].label"
							>
								<a-input
									v-model:value="searchInfo.roleName"
									:placeholder="'请填写' + labelMap['roleName'].label"
									allow-clear
								/>
							</a-form-item>
						</a-col>
						<a-col style="text-align: right">
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
				<a-button type="primary" @click="editRoleInfo('add')">新增</a-button>
				<a-button type="primary" danger @click="batchDelRoleInfo">
					删除
				</a-button>
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
				:scroll="{ x: 'max-content', y: 520 }"
				:row-selection="rowSelection"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								type="primary"
								size="small"
								@click="editRoleInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-button
								type="primary"
								size="small"
								@click="roleAuthorizationInfo(record.id)"
							>
								授权
							</a-button>
							<a-popconfirm
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delRoleInfo(record.id)"
								@cancel="cancel"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
					<template v-else-if="column.key === 'status'">
						<a-tag
							:key="record.status"
							:color="record.status == '1' ? '#87d068' : 'grey'"
						>
							{{ record.status == '1' ? '有效' : '失效' }}
						</a-tag>
					</template>
				</template>
			</a-table>
			<role-info-detail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></role-info-detail>
			<authorization-detail
				ref="authorizationInfo"
				:open="authorizationModal.open"
				:data="authorizationModal"
				@handleOk="handleOk"
				@handleCancel="handleAuthorizationCancel"
			></authorization-detail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import {
	type SearchInfo,
	columns,
	type RoleInfo,
	labelMap,
} from './roleInfoListTs';
import { getRoleInfoPage, deleteRoleInfo } from '@/views/user/roleInfo/api';
import { message } from 'ant-design-vue';

// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	setCurrent,
} = usePagination();

const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });

let rowIds: (string | number)[] = [];

let searchInfo = ref<SearchInfo>({});

let loading = ref<boolean>(false);

let dataSource = ref<RoleInfo[]>([]);

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
	onSelect: (record: RoleInfo, selected: boolean, selectedRows: RoleInfo[]) => {
		console.log(record, selected, selectedRows);
	},
	onSelectAll: (
		selected: boolean,
		selectedRows: RoleInfo[],
		changeRows: RoleInfo[],
	) => {
		console.log(selected, selectedRows, changeRows);
	},
});

// 字典数据已通过 useDictInfo 自动加载

const cancelQuery = () => {
	searchInfo.value = {};
};

const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getRoleInfoListPage(searchInfo.value, pagination);
};

const delRoleInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteRoleInfo(ids);
	if (code == '200') {
		message.success(messageInfo || '删除成功！', 3);
		// 刷新列表
		setCurrent(1);
		getRoleInfoListPage(searchInfo.value, pagination);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelRoleInfo = (): void => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！', 3);
		return;
	}
	delRoleInfo(rowIds.join(','));
};

const cancel = (e: MouseEvent) => {
	console.log(e);
};

//新增和修改弹窗
const editRoleInfo = (type: string, id?: number) => {
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

const handleOk = (v: boolean) => {
	visible.value = v;
	getRoleInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};

const authorizationModal = ref<any>({ open: false });

const roleAuthorizationInfo = (id: number) => {
	authorizationModal.value.open = true;
	authorizationModal.value.id = id;
};

const handleAuthorizationCancel = () => {
	authorizationModal.value.open = false;
};

const getRoleInfoListPage = async (param: SearchInfo, cur: PageInfo) => {
	loading.value = true;
	const {
		code,
		data,
		message: messageInfo,
	} = await getRoleInfoPage(param, cur.current, cur.pageSize).finally(() => {
		loading.value = false;
	});
	if (code == '200') {
		dataSource.value = data?.records || [];
		setTotal(data?.total || 0);
	} else {
		message.error(messageInfo || '查询列表失败！');
	}
};

function query() {
	getRoleInfoListPage(searchInfo.value, pagination);
}

// 初始化页面数据
const init = () => {
	authorizationModal.value = { open: false };
	//获取角色信息表页面数据
	getRoleInfoListPage(searchInfo.value, pagination);
};

init();
</script>
<style lang="scss" scoped></style>
