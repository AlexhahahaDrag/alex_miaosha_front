<template>
	<div class="page-info">
		<div class="left-content">
			<a-tree
				checkable
				:tree-data="treeData"
				v-model:expandedKeys="expandedKeys"
				v-model:selectedKeys="selectedKeys"
				v-model:checkedKeys="checkedKeys"
			>
			</a-tree>
		</div>
		<div class="right-content">
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
									:name="labelMap['orgCode'].name"
									:label="labelMap['orgCode'].label"
								>
									<a-input
										v-model:value="searchInfo.orgCode"
										:placeholder="'请填写' + labelMap['orgCode'].label"
										allow-clear
									/>
								</a-form-item>
							</a-col>
							<a-col :span="8">
								<a-form-item
									:name="labelMap['orgName'].name"
									:label="labelMap['orgName'].label"
								>
									<a-input
										v-model:value="searchInfo.orgName"
										:placeholder="'请填写' + labelMap['orgName'].label"
										allow-clear
									/>
								</a-form-item>
							</a-col>
							<a-col :span="8" style="text-align: right">
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
					<a-button type="primary" @click="editOrgInfo('add')">新增</a-button>
					<a-button type="primary" @click="query">导入</a-button>
					<a-button type="primary" danger @click="batchDelOrgInfo"
						>删除</a-button
					>
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
					:scroll="{ x: 1100 }"
					:row-selection="rowSelection"
				>
					<template #bodyCell="{ column, record }">
						<template v-if="column.key === 'operation'">
							<a-space>
								<a-button
									type="primary"
									size="small"
									@click="editOrgInfo('update', record.id)"
									>编辑</a-button
								>
								<a-popconfirm
									title="确认删除?"
									ok-text="确认"
									cancel-text="取消"
									@confirm="delOrgInfo(record.id)"
									@cancel="cancel"
								>
									<a-button type="primary" size="small" danger>删除</a-button>
								</a-popconfirm>
							</a-space>
							<span></span>
						</template>
						<template v-else-if="column.key === 'status'">
							<a-tag
								:key="record.status"
								:color="
									record.status == 0 ? '#C0C0C0'
									: record.status == 1 ? '#f50'
									: '#87d068'
								"
							>
								{{
									record.status == 0 ? '过期'
									: record.status == 1 ? '待过期'
									: '有效'
								}}
							</a-tag>
						</template>
					</template>
				</a-table>
			</div>
			<OrgInfoDetail
				ref="editInfo"
				:open="visible"
				:modelInfo="modelInfo"
				@handleOk="handleOk"
				@handleCancel="handleCancel"
			></OrgInfoDetail>
		</div>
	</div>
</template>
<script setup lang="ts">
import type { ModelInfo } from '@/views/common/config';
import type { PageInfo } from '@/composables/usePagination';
import { usePagination } from '@/composables/usePagination';
import type { SearchInfo, DataItem } from './orgInfoListTs';
import { columns } from './orgInfoListTs';
import { getOrgInfoPage, deleteOrgInfo } from '@/api/user/orgInfo/orgInfoTs';
import { message } from 'ant-design-vue';
import type { TreeDataItem } from 'ant-design-vue/es/tree/interface';
import { getDictList } from '@/api/finance/dict/dictManager';
import type { DictInfo } from '@/views/finance/dict/dict';

// todo: 修改布局  统一设置 添加树组件 添加查询组件
const treeData: TreeDataItem[] = [
	{
		title: 'parent 1',
		key: '0-0',
		children: [
			{
				title: 'parent 1-0',
				key: '0-0-0',
				disabled: true,
				children: [
					{ title: 'leaf', key: '0-0-0-0', disableCheckbox: true },
					{ title: 'leaf', key: '0-0-0-1' },
				],
			},
			{
				title: 'parent 1-1',
				key: '0-0-1',
				children: [{ key: '0-0-1-0', slots: { title: 'title0010' } }],
			},
		],
	},
];
// 使用分页组合式函数
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
} = usePagination();

const expandedKeys = ref<string[]>(['0-0-0', '0-0-1']);
const selectedKeys = ref<string[]>(['0-0-0', '0-0-1']);
const checkedKeys = ref<string[]>(['0-0-0', '0-0-1']);
watch(expandedKeys, () => {
	console.log('expandedKeys', expandedKeys);
});
watch(selectedKeys, () => {
	console.log('selectedKeys', selectedKeys);
});
watch(checkedKeys, () => {
	console.log('checkedKeys', checkedKeys);
});

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
	orgCode: { name: 'orgCode', label: '机构编码' },
	orgName: { name: 'orgName', label: '机构名称' },
	orgShortName: { name: 'orgShortName', label: '机构简称' },
	parentId: { name: 'parentId', label: '父级机构id' },
	summary: { name: 'summary', label: '简介最多150字' },
	status: { name: 'status', label: '状态' },
});

let searchInfo = ref<SearchInfo>({});

let statusList = ref<DictInfo[]>([]);

const getDictInfoList = () => {
	getDictList('is_valid').then((res) => {
		if (res.code == '200') {
			statusList.value = res.data.filter(
				(item: { belongTo: string }) => item.belongTo == 'is_valid',
			);
		} else {
			message.error((res && res.message) || '查询列表失败！');
		}
	});
};

function cancelQuery() {
	searchInfo.value = {};
}

function query() {
	getOrgInfoListPage(searchInfo.value, pagination);
}

function handleTableChange(pagination: PageInfo) {
	paginationChange(pagination);
	getOrgInfoListPage(searchInfo.value, pagination);
}

function delOrgInfo(ids: string) {
	deleteOrgInfo(ids).then((res) => {
		if (res.code == '200') {
			message.success((res && '删除' + res.message) || '删除成功！', 3);
			getOrgInfoListPage(searchInfo.value, pagination);
		} else {
			message.error((res && res.message) || '删除失败！', 3);
		}
	});
}

function batchDelOrgInfo() {
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
	delOrgInfo(ids);
}

let loading = ref<boolean>(false);

let dataSource = ref();

const cancel = (e: MouseEvent) => {
	console.log(e);
};

function getOrgInfoListPage(param: SearchInfo, cur: PageInfo) {
	loading.value = true;
	getOrgInfoPage(param, cur.current, cur.pageSize)
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
}

function init() {
	getDictInfoList();
	//获取机构表页面数据
	getOrgInfoListPage(searchInfo.value, pagination);
}

init();

let visible = ref<boolean>(false);

let modelInfo = ref<ModelInfo>({});

//新增和修改弹窗
function editOrgInfo(type: string, id?: number) {
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
	getOrgInfoListPage(searchInfo.value, pagination);
};

const handleCancel = (v: boolean) => {
	visible.value = v;
};
</script>
<style lang="scss" scoped>
.page-info {
	display: flex;
	height: 600px;
	.left-content {
		width: 50%;
	}
}
</style>
