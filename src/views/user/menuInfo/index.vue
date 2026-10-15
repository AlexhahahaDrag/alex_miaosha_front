<template>
	<div
		class="menu-management-screen min-h-full p-4 lg:p-6 bg-slate-50/60 dark:bg-slate-950 transition-colors"
	>
		<!-- 1. 页面头部与紧凑指标 -->
		<div
			class="screen-header mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="w-2.5 h-6 rounded-full bg-blue-600 flex-shrink-0 shadow-xs"
					></span>
					<h1
						class="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0"
					>
						菜单管理
					</h1>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-5 font-normal"
				>
					左侧树状层级导航，右侧聚焦展示所选目录下的明细与功能项（双栏架构）
				</p>
			</div>

			<!-- 概览徽标 -->
			<div class="flex items-center gap-3">
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs"
					>
						<AppstoreOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">顶级模块</span>
						<span class="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
							{{ fullMenuTree.length }}
						</span>
					</div>
				</div>
				<div
					class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 shadow-2xs"
				>
					<div
						class="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs"
					>
						<CheckCircleOutlined />
					</div>
					<div class="flex items-baseline gap-1.5">
						<span class="text-xs text-slate-400 dark:text-slate-500 font-medium">节点总数</span>
						<span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
							{{ totalTreeCount }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 2. 主工作区：左侧树 + 右侧工作区 -->
		<div class="flex flex-col lg:flex-row gap-5 items-start">
			<!-- 左侧目录树卡片 (w-full lg:w-72 flex-shrink-0) -->
			<div
				class="w-full lg:w-72 flex-shrink-0 bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs"
			>
				<div
					class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3"
				>
					<span class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
						<ApartmentOutlined class="text-blue-600" />
						<span>目录架构</span>
					</span>
					<a-button
						size="small"
						type="link"
						class="text-xs !p-0"
						@click="toggleTreeExpand"
					>
						{{ isTreeAllExpanded ? '全部收起' : '全部展开' }}
					</a-button>
				</div>

				<!-- 树快速过滤搜索框 -->
				<div class="mb-3">
					<a-input
						v-model:value="treeSearchKey"
						placeholder="搜索目录名称..."
						allow-clear
						size="small"
						class="rounded-lg"
					>
						<template #prefix>
							<SearchOutlined class="text-slate-400 text-xs" />
						</template>
					</a-input>
				</div>

				<!-- 置顶全部菜单选项 -->
				<div
					:class="[
						'px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all mb-2',
						selectedTreeKeys.length === 0 || selectedTreeKeys[0] === 'ALL'
							? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
							: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
					]"
					@click="handleSelectAllNode"
				>
					<span class="flex items-center gap-2">
						<FolderOpenOutlined />
						<span>全部菜单（全量平铺）</span>
					</span>
					<span
						class="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-800"
					>
						{{ totalTreeCount }}
					</span>
				</div>

				<!-- 树组件容器 -->
				<div class="menu-tree-container overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
					<a-tree
						v-model:selectedKeys="selectedTreeKeys"
						v-model:expandedKeys="treeExpandedKeys"
						:tree-data="filteredTreeData"
						:field-names="{ title: 'title', key: 'id', children: 'children' }"
						show-line
						class="modern-menu-ant-tree"
						@select="onTreeSelect"
					>
						<template #title="{ title, record }">
							<span class="text-xs select-none font-medium flex items-center gap-1.5">
								<span
									v-if="!record.parentId || String(record.parentId) === '0'"
									class="text-blue-600"
								>
									📁
								</span>
								<span v-else class="text-emerald-600">
									📄
								</span>
								<span>{{ title }}</span>
								<span
									v-if="record.children && record.children.length > 0"
									class="text-[10px] text-slate-400 font-mono ml-auto"
								>
									({{ record.children.length }})
								</span>
							</span>
						</template>
					</a-tree>
				</div>
			</div>

			<!-- 右侧工作区 (flex-1 min-w-0) -->
			<div class="flex-1 min-w-0 w-full flex flex-col gap-5">
				<!-- 搜索与筛选栏 -->
				<div
					class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-4 shadow-xs"
				>
					<a-form
						:model="searchInfo"
						layout="inline"
						class="flex flex-wrap items-center gap-y-3 gap-x-4"
					>
						<a-form-item label="名称/标题" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.title"
								placeholder="输入标题或路由名"
								class="rounded-lg w-44"
								allow-clear
								@keyup.enter="query"
							/>
						</a-form-item>

						<a-form-item label="权限标识" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.permissionCode"
								placeholder="如 user:list"
								class="rounded-lg w-40"
								allow-clear
								@keyup.enter="query"
							/>
						</a-form-item>

						<a-form-item label="状态" class="!mr-0 mb-0">
							<a-select
								v-model:value="searchInfo.status"
								placeholder="选择状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								class="rounded-lg w-28"
								allow-clear
							/>
						</a-form-item>

						<div class="flex items-center gap-2.5 ml-auto">
							<a-button
								type="primary"
								data-testid="rbac-menu-btn-query"
								class="rounded-lg px-4"
								@click="query"
							>
								<template #icon><SearchOutlined /></template>
								查找
							</a-button>
							<a-button
								data-testid="rbac-menu-btn-reset"
								class="rounded-lg px-4"
								@click="cancelQuery"
							>
								<template #icon><ReloadOutlined /></template>
								重置
							</a-button>
						</div>
					</a-form>
				</div>

				<!-- 表格卡片 -->
				<div
					class="table-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
				>
					<!-- 提示条与操作栏 -->
					<div
						class="table-toolbar px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
					>
						<div class="flex items-center gap-2.5 flex-wrap">
							<span class="text-base font-bold text-slate-800 dark:text-slate-100">
								{{ activeParentNode ? `【${activeParentNode.title}】及其全部下级列表` : '全部菜单列表（全层级平铺）' }}
							</span>
							<span
								class="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono font-medium"
							>
								共 {{ currentTableData.length }} 项
							</span>

							<!-- 当前聚焦标签 -->
							<span
								v-if="activeParentNode"
								class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-400 flex items-center gap-1.5"
							>
								<span>当前聚焦：{{ activeParentNode.title }}（含子孙下级）</span>
								<CloseCircleOutlined
									class="cursor-pointer hover:text-blue-800 text-[11px]"
									title="清除聚焦，查看全量"
									@click="handleSelectAllNode"
								/>
							</span>
						</div>

						<div class="flex items-center gap-2.5">
							<a-button
								v-permission="'menu:add'"
								type="primary"
								data-testid="rbac-menu-btn-add"
								class="inline-flex items-center gap-1.5 shadow-xs rounded-lg font-medium"
								@click="handleAddFromCurrentContext"
							>
								<template #icon><PlusOutlined /></template>
								{{ activeParentNode ? `在【${activeParentNode.title}】下新增` : '新增顶级菜单' }}
							</a-button>

							<span v-permission="'menu:delete'">
								<a-popconfirm
									v-if="rowIds.length > 0"
									:title="`确认批量删除选中的 ${rowIds.length} 个菜单?`"
									ok-text="确认"
									cancel-text="取消"
									@confirm="batchDelMenuInfo"
								>
									<a-button
										type="primary"
										danger
										data-testid="rbac-menu-btn-batch-delete"
										class="rounded-lg font-medium"
									>
										<template #icon><DeleteOutlined /></template>
										批量删除 ({{ rowIds.length }})
									</a-button>
								</a-popconfirm>
							</span>
						</div>
					</div>

					<!-- 平铺表格体 (单层无横向挤压，干净透彻) -->
					<div class="px-2 pt-2 pb-4">
						<a-table
							:data-source="currentTableData"
							:columns="columns"
							:loading="loading"
							:row-key="(record: any) => String(record.id)"
							:pagination="false"
							:scroll="{ x: 'max-content' }"
							:row-selection="rowSelection"
							class="modern-menu-table"
							data-testid="rbac-menu-table"
						>
							<template #bodyCell="{ column, record }">
								<!-- 菜单标题（带类型徽标，清爽无代码变量噪音） -->
								<template v-if="column.key === 'title'">
									<div class="inline-flex items-center gap-2">
										<span
											v-if="!record.parentId || String(record.parentId) === '0'"
											class="text-blue-600 dark:text-blue-400 text-sm flex-shrink-0"
										>
											<FolderOutlined />
										</span>
										<span
											v-else-if="String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'"
											class="text-slate-400 dark:text-slate-500 text-sm flex-shrink-0"
										>
											<FileProtectOutlined />
										</span>
										<span
											v-else
											class="text-emerald-600 dark:text-emerald-400 text-sm flex-shrink-0"
										>
											<FileTextOutlined />
										</span>

										<span
											:class="[
												!record.parentId || String(record.parentId) === '0'
													? 'font-bold text-slate-900 dark:text-slate-100 text-[13.5px]'
													: String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'
													? 'text-slate-500 dark:text-slate-400 text-xs'
													: 'font-medium text-slate-800 dark:text-slate-200 text-xs',
											]"
										>
											{{ record.title }}
										</span>

										<!-- 类型微胶囊 -->
										<span
											v-if="!record.parentId || String(record.parentId) === '0'"
											class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60 ml-0.5 select-none"
										>
											目录
										</span>
										<span
											v-else-if="String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'"
											class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-500 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 ml-0.5 select-none"
										>
											内页
										</span>
										<span
											v-else
											class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60 ml-0.5 select-none"
										>
											菜单
										</span>
									</div>
								</template>

								<!-- 所属上级（平铺列表中的直观归属） -->
								<template v-else-if="column.key === 'parentTitle'">
									<span
										v-if="!record.parentTitle || record.parentTitle === '根目录'"
										class="text-xs text-slate-400 dark:text-slate-500 font-mono"
									>
										根目录
									</span>
									<span
										v-else
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
									>
										<ApartmentOutlined class="text-[10px] text-blue-500" />
										<span>{{ record.parentTitle }}</span>
									</span>
								</template>

								<!-- 权限标识 (支持快速点击复制) -->
								<template v-else-if="column.key === 'permissionCode'">
									<span
										v-if="record.permissionCode"
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 hover:bg-blue-100 cursor-pointer transition-colors"
										title="点击复制权限标识"
										@click="copyPermissionCode(record.permissionCode)"
									>
										<span>{{ record.permissionCode }}</span>
										<CopyOutlined class="text-[10px] opacity-70" />
									</span>
									<span v-else class="text-slate-400 text-xs">-</span>
								</template>

								<!-- 隐藏菜单 -->
								<template v-else-if="column.key === 'hideInMenu'">
									<span
										v-if="
											String(record.hideInMenu) === '1' ||
											String(record.hideInMenu) === 'true'
										"
										class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
									>
										隐藏
									</span>
									<span
										v-else
										class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
									>
										显示
									</span>
								</template>

								<!-- 状态（行内微开关） -->
								<template v-else-if="column.key === 'status'">
									<a-switch
										:checked="String(record.status) === '1'"
										checked-children="启用"
										un-checked-children="禁用"
										:loading="record._statusLoading"
										size="small"
										@change="(val: boolean) => handleToggleStatus(record, val)"
									/>
								</template>

								<!-- 操作列 -->
								<template v-else-if="column.key === 'operation'">
									<div class="flex items-center justify-center gap-1">
										<a-button
											v-permission="'menu:add'"
											type="link"
											size="small"
											data-testid="rbac-menu-row-add-child"
											class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
											@click="handleAddChild(record)"
										>
											<template #icon><PlusOutlined /></template>
											子项
										</a-button>

										<a-button
											v-permission="'menu:edit'"
											type="link"
											size="small"
											data-testid="rbac-menu-row-edit"
											class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400"
											@click="editMenuInfo('update', String(record.id))"
										>
											<template #icon><EditOutlined /></template>
											编辑
										</a-button>

										<span v-permission="'menu:delete'">
											<a-popconfirm
												:title="`确认删除【${record.title || record.name}】?`"
												ok-text="确认"
												cancel-text="取消"
												@confirm="delMenuInfo(String(record.id))"
											>
												<a-button
													type="link"
													size="small"
													danger
													data-testid="rbac-menu-row-delete"
													class="inline-flex items-center gap-0.5 text-xs font-medium !px-1.5 text-rose-500 hover:text-rose-700 dark:text-rose-400"
												>
													<template #icon><DeleteOutlined /></template>
													删除
												</a-button>
											</a-popconfirm>
										</span>
									</div>
								</template>
							</template>
						</a-table>
					</div>
				</div>
			</div>
		</div>

		<!-- 详情与新增弹窗 -->
		<menu-info-detail
			v-model:model-info="modelInfo"
			@success="() => reloadAll()"
		></menu-info-detail>
	</div>
</template>

<script setup lang="ts">
import {
	AppstoreOutlined,
	CheckCircleOutlined,
	SearchOutlined,
	ReloadOutlined,
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	CopyOutlined,
	FolderOutlined,
	FolderOpenOutlined,
	FileTextOutlined,
	FileProtectOutlined,
	ApartmentOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import MenuInfoDetail from '@/views/user/menuInfo/menuInfoDetail/index.vue';
import {
	getMenuInfoTree,
	deleteMenuInfo,
	editMenuInfo as apiEditMenuInfo,
} from '@/views/user/menuInfo/api';
import { columns } from '@/views/user/menuInfo/config';
import { useDictInfo } from '@/composables/useDictInfo';
import type { ModelInfo } from '@/types/modal';
import type { MenuInfoData } from '@/views/user/menuInfo/config';

// 3. Hooks
const { getDictByType } = useDictInfo('is_valid');

// 表格选择
const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

// 4. State
const loading = ref<boolean>(false);
const fullMenuTree = ref<MenuInfoData[]>([]);
const searchInfo = ref<MenuInfoData>({});
const modelInfo = ref<ModelInfo>({});

// 左侧树状态
const treeSearchKey = ref<string>('');
const selectedTreeKeys = ref<string[]>([]);
const treeExpandedKeys = ref<string[]>([]);
const activeParentNode = ref<MenuInfoData | null>(null);

const statusList = computed(() => getDictByType('is_valid'));

// 节点总数
const totalTreeCount = computed(() => {
	const countNodes = (nodes: MenuInfoData[]): number => {
		if (!Array.isArray(nodes)) return 0;
		return nodes.reduce(
			(acc, curr) => acc + 1 + (curr.children ? countNodes(curr.children) : 0),
			0,
		);
	};
	return countNodes(fullMenuTree.value);
});

// 所有包含子项的节点 Key
const allTreeKeys = computed(() => {
	const keys: string[] = [];
	const traverse = (nodes: MenuInfoData[]) => {
		if (!Array.isArray(nodes)) return;
		for (const n of nodes) {
			if (n.id) keys.push(String(n.id));
			if (n.children && n.children.length > 0) traverse(n.children);
		}
	};
	traverse(fullMenuTree.value);
	return keys;
});

const isTreeAllExpanded = computed(
	() => allTreeKeys.value.length > 0 && treeExpandedKeys.value.length >= allTreeKeys.value.length,
);

const toggleTreeExpand = () => {
	if (isTreeAllExpanded.value) {
		treeExpandedKeys.value = [];
	} else {
		treeExpandedKeys.value = [...allTreeKeys.value];
	}
};

// 树节点过滤
const filteredTreeData = computed(() => {
	const key = treeSearchKey.value.trim().toLowerCase();
	if (!key) return fullMenuTree.value;

	const filterBranch = (nodes: MenuInfoData[]): MenuInfoData[] => {
		const res: MenuInfoData[] = [];
		for (const node of nodes) {
			const matchSelf =
				(node.title && node.title.toLowerCase().includes(key)) ||
				(node.name && node.name.toLowerCase().includes(key));
			const children = node.children ? filterBranch(node.children) : [];
			if (matchSelf || children.length > 0) {
				res.push({
					...node,
					children,
				});
			}
		}
		return res;
	};
	return filterBranch(fullMenuTree.value);
});

// 递归收集节点及其所有后代为纯一维数组（必须解构剥离 children 属性，确保 Ant Table 绝不渲染 + 号展开列）
const flattenNodeAndDescendants = (
	node: MenuInfoData,
	parentTitle = '根目录',
): MenuInfoData[] => {
	const { children, ...pureItem } = node;
	const flatItem: MenuInfoData = {
		...pureItem,
		parentTitle,
	};
	const result: MenuInfoData[] = [flatItem];
	if (Array.isArray(children) && children.length > 0) {
		const currentTitle = node.title || node.name || '未命名';
		for (const child of children) {
			result.push(...flattenNodeAndDescendants(child, currentTitle));
		}
	}
	return result;
};

// 平铺全树所有节点
const flattenAllTree = (nodes: MenuInfoData[], parentTitle = '根目录'): MenuInfoData[] => {
	const list: MenuInfoData[] = [];
	for (const n of nodes) {
		list.push(...flattenNodeAndDescendants(n, parentTitle));
	}
	return list;
};

// 右侧表格展示的数据源（纯平铺一维数组，彻底杜绝 children 字段与 + 号）
const currentTableData = computed(() => {
	let rawList: MenuInfoData[] = [];

	if (activeParentNode.value) {
		// 当前选中了某个节点，平铺展示该节点本身 + 其所有的下级和孙级等后代
		const pTitle =
			activeParentNode.value.parentId && String(activeParentNode.value.parentId) !== '0'
				? findNodeById(fullMenuTree.value, String(activeParentNode.value.parentId))?.title ||
				  '未知上级'
				: '根目录';
		rawList = flattenNodeAndDescendants(activeParentNode.value, pTitle);
	} else {
		// 默认展示全量菜单平铺列表
		rawList = flattenAllTree(fullMenuTree.value);
	}

	// 结合右侧搜索条件过滤
	const { title, permissionCode, status } = searchInfo.value;
	return rawList.filter((item) => {
		if (title) {
			const t = title.trim().toLowerCase();
			const matchTitle = item.title && item.title.toLowerCase().includes(t);
			const matchName = item.name && item.name.toLowerCase().includes(t);
			if (!matchTitle && !matchName) return false;
		}
		if (permissionCode) {
			const p = permissionCode.trim().toLowerCase();
			if (!item.permissionCode || !item.permissionCode.toLowerCase().includes(p)) return false;
		}
		if (status !== undefined && status !== null && String(status) !== '') {
			if (String(item.status) !== String(status)) return false;
		}
		return true;
	});
});

// 5. Actions
const handleSelectAllNode = () => {
	selectedTreeKeys.value = ['ALL'];
	activeParentNode.value = null;
};

// 递归查找指定 ID 的节点
const findNodeById = (nodes: MenuInfoData[], id: string): MenuInfoData | null => {
	for (const node of nodes) {
		if (String(node.id) === String(id)) return node;
		if (node.children && node.children.length > 0) {
			const found = findNodeById(node.children, id);
			if (found) return found;
		}
	}
	return null;
};

const onTreeSelect = (keys: any[]) => {
	if (!keys || keys.length === 0 || keys[0] === 'ALL') {
		handleSelectAllNode();
		return;
	}
	const targetId = String(keys[0]);
	const found = findNodeById(fullMenuTree.value, targetId);
	if (found) {
		activeParentNode.value = found;
		selectedTreeKeys.value = [targetId];
	} else {
		handleSelectAllNode();
	}
};

const copyPermissionCode = async (codeStr: string) => {
	try {
		await navigator.clipboard.writeText(codeStr);
		message.success(`已复制: ${codeStr}`);
	} catch {
		message.info(codeStr);
	}
};

const query = () => {
	// 纯响应式计算过滤，触发视觉刷新
};

const cancelQuery = () => {
	searchInfo.value = {};
};

const delMenuInfo = async (ids: string) => {
	const { code, message: messageInfo } = await deleteMenuInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！');
		clearSelection();
		await reloadAll();
	} else {
		message.error(messageInfo || '删除失败！');
	}
};

const batchDelMenuInfo = () => {
	if (!rowIds.value.length) {
		message.warning('请先选择数据！');
		return;
	}
	Modal.confirm({
		title: '确认删除',
		content: `确定删除选中的 ${rowIds.value.length} 条数据吗？`,
		okText: '删除',
		okType: 'danger',
		cancelText: '取消',
		onOk: () => delMenuInfo(rowIds.value.join(',')),
	});
};

const editMenuInfo = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增顶级菜单' : '编辑菜单明细',
		open: true,
		id: isAdd ? undefined : (id ?? null),
		parentId: isAdd ? '0' : undefined,
	};
};

// 在当前选中的上下文模块下新增
const handleAddFromCurrentContext = () => {
	if (activeParentNode.value) {
		modelInfo.value = {
			title: `新增菜单 - 所属上级【${activeParentNode.value.title}】`,
			open: true,
			id: undefined,
			parentId: String(activeParentNode.value.id),
		};
	} else {
		editMenuInfo('add');
	}
};

// 行级快捷向当前行节点下挂子项
const handleAddChild = (parentRecord: MenuInfoData) => {
	modelInfo.value = {
		title: `新增子菜单 - 所属上级【${parentRecord.title || parentRecord.name}】`,
		open: true,
		id: undefined,
		parentId: String(parentRecord.id),
	};
};

const handleToggleStatus = async (record: any, checked: boolean) => {
	const newStatus = checked ? '1' : '0';
	record._statusLoading = true;
	try {
		const { code, message: msg } = await apiEditMenuInfo({
			...record,
			id: String(record.id),
			status: newStatus,
		});
		if (code === '200') {
			record.status = newStatus;
			message.success(`${record.title || record.name} 已${checked ? '启用' : '禁用'}`);
		} else {
			message.error(msg || '状态更新失败');
		}
	} catch {
		message.error('网络异常，更新失败');
	} finally {
		record._statusLoading = false;
	}
};

const reloadAll = async () => {
	loading.value = true;
	try {
		const { code, data, message: msg } = await getMenuInfoTree();
		if (code === '200' && Array.isArray(data)) {
			fullMenuTree.value = data;

			// 默认展开一级目录节点，层次清晰直观
			if (treeExpandedKeys.value.length === 0) {
				treeExpandedKeys.value = data.map((d: any) => String(d.id));
			}

			// 如果之前有选中的节点，刷新其引用
			if (activeParentNode.value && activeParentNode.value.id) {
				const refreshed = findNodeById(data, String(activeParentNode.value.id));
				activeParentNode.value = refreshed;
			}
		} else {
			message.error(msg || '获取菜单树失败！');
		}
	} finally {
		loading.value = false;
	}
};

// 初始化
reloadAll();
</script>

<style lang="scss" scoped>
.menu-tree-container {
	:deep(.ant-tree) {
		background: transparent;
	}

	:deep(.ant-tree-node-content-wrapper) {
		border-radius: 8px;
		transition: background-color 0.15s ease;
		padding: 3px 6px;

		&:hover {
			background-color: #f1f5f9;
		}
	}

	:deep(.ant-tree-node-selected) {
		background-color: #e0f2fe !important;
		color: #0284c7 !important;
		font-weight: 600;
	}
}

.modern-menu-table {
	:deep(.ant-table) {
		background: transparent;
	}

	:deep(.ant-table-thead > tr > th) {
		background: #f1f5f9;
		color: #334155;
		font-weight: 700;
		font-size: 13px;
		letter-spacing: 0.02em;
		border-bottom: 1px solid #e2e8f0;
		padding: 13px 16px;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #f1f5f9;
		padding: 12px 16px;
		transition: background-color 0.2s ease;
	}

	:deep(.ant-table-tbody > tr:hover > td) {
		background: #f8fafc !important;
	}
}

:global(html.dark) {
	.menu-tree-container {
		:deep(.ant-tree-node-content-wrapper:hover) {
			background-color: #1e293b;
		}
		:deep(.ant-tree-node-selected) {
			background-color: #0c4a6e !important;
			color: #38bdf8 !important;
		}
	}

	.modern-menu-table {
		:deep(.ant-table-thead > tr > th) {
			background: #0f172a;
			color: #94a3b8;
			border-bottom: 1px solid #1e293b;
		}

		:deep(.ant-table-tbody > tr > td) {
			border-bottom: 1px solid #1e293b;
		}

		:deep(.ant-table-tbody > tr:hover > td) {
			background: #1e293b !important;
		}
	}
}
</style>
