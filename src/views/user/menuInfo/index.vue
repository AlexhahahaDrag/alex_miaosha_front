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
									v-model:value="searchInfo.hideInMenu"
									:placeholder="'请选择' + labelMap['hideInMenu'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="hideInMenuList"
									allow-clear
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
									v-model:value="searchInfo.status"
									:placeholder="'请选择' + labelMap['status'].label"
									:field-names="{ label: 'typeName', value: 'typeCode' }"
									:options="statusList"
									allow-clear
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
								<a-button type="primary" @click="() => query(true)"
									>查找</a-button
								>
								<a-button @click="cancelQuery">清空</a-button>
							</a-space>
						</a-col>
					</a-row>
				</a-form>
			</div>
		</div>
		<div class="button">
			<a-space>
				<a-button
					v-permission="'menu:add'"
					type="primary"
					@click="editMenuInfo('add')"
				>
					新增
				</a-button>
				<a-button
					v-permission="'menu:delete'"
					type="primary"
					danger
					@click="batchDelMenuInfo"
				>
					删除
				</a-button>
			</a-space>
		</div>
		<div class="content">
			<a-table
				:data-source="dataSource"
				:columns="columns"
				:loading="loading"
				:row-key="(record: any) => record.id"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:row-selection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'operation'">
						<a-space>
							<a-button
								v-permission="'menu:add'"
								type="primary"
								size="small"
								@click="openSubMenuManager(record)"
							>
								子菜单
							</a-button>
							<a-button
								v-permission="'menu:edit'"
								type="primary"
								size="small"
								@click="editMenuInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-popconfirm
								v-permission="'menu:delete'"
								title="确认删除?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delMenuInfo(record.id)"
							>
								<a-button type="primary" size="small" danger>删除</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>

			<!-- 自定义组件使用 kebab-case 命名 -->
			<menu-info-detail
				v-model:model-info="modelInfo"
				@success="() => query()"
			></menu-info-detail>

			<sub-menu-manager
				v-model:model-info="subMenuManagerInfo"
			></sub-menu-manager>
		</div>
	</div>
</template>

<script setup lang="ts">
// 1. Imports (框架 > 公共组件 > 业务组件 > 工具函数 > 类型定义)
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import MenuInfoDetail from './menuInfoDetail/index.vue';
import SubMenuManager from './subMenuManager/index.vue';
import { getMenuInfoPage, deleteMenuInfo } from '@/views/user/menuInfo/api';
import { columns, labelMap } from '@/views/user/menuInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import { usePagination, type PageInfo } from '@/composables/usePagination';
import type { ModelInfo } from '@/views/common/config';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 3. Hooks
const { getDictByType } = useDictInfo('true_or_false,is_valid');
const {
	pagination,
	handleTableChange: paginationChange,
	setTotal,
	resetPagination,
} = usePagination();

// 4. State
const labelCol = ref({ span: 5 });
const wrapperCol = ref({ span: 19 });
const loading = ref<boolean>(false);
const dataSource = ref<MenuInfoData[]>([]);
const searchInfo = ref<MenuInfoData>({});
const modelInfo = ref<ModelInfo>({});
const subMenuManagerInfo = ref<ModelInfo>({});

let rowIds: (string | number)[] = [];

const hideInMenuList = computed(() => getDictByType('true_or_false'));
const statusList = computed(() => getDictByType('is_valid'));

const rowSelection = ref({
	checkStrictly: false,
	onChange: (selectedRowKeys: (string | number)[]) => {
		rowIds = selectedRowKeys;
	},
});

// 5. Actions (业务处理逻辑)
const handleTableChange = (paginationInfo: PageInfo) => {
	paginationChange(paginationInfo);
	getMenuInfoListPage(searchInfo.value, pagination);
};

const query = (resetPage = false) => {
	triggerDebouncedQuery.cancel();
	if (resetPage) {
		resetPagination();
	}
	getMenuInfoListPage(searchInfo.value, pagination);
};

const cancelQuery = () => {
	searchInfo.value = { parentId: '0' };
	query(true);
};

const delMenuInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteMenuInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！');
		query(true);
	} else {
		message.error(messageInfo || '删除失败！');
	}
};

const batchDelMenuInfo = () => {
	if (!rowIds?.length) {
		message.warning('请先选择数据！');
		return;
	}
	delMenuInfo(rowIds.join(','));
};

const editMenuInfo = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增明细' : '修改明细',
		open: true,
		id: isAdd ? undefined : (id ?? null),
		parentId: isAdd ? '0' : undefined,
	};
};

const openSubMenuManager = (record: MenuInfoData) => {
	subMenuManagerInfo.value = {
		title: `子菜单管理 - ${record.title || record.name}`,
		open: true,
		id: String(record.id),
	};
};

// 移除冗余的 handleSuccess 函数

const triggerDebouncedQuery = debounce(() => {
	query(true);
}, 300);

const getMenuInfoListPage = async (param: MenuInfoData, cur: PageInfo) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getMenuInfoPage(param, cur.current, cur.pageSize);
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
	searchInfo.value.parentId = '0';
	getMenuInfoListPage(searchInfo.value, pagination);
};

// 7. Watchers
watch(
	() => searchInfo.value,
	() => {
		triggerDebouncedQuery();
	},
	{ deep: true },
);

// 初始化
init();

// 8. Emits
// 此组件为页面级，暂无 emits
</script>

<style lang="scss" scoped></style>
