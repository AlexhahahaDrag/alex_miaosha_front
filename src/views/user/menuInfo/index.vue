<template>
	<div
		class="menu-management-screen h-full flex flex-col p-4 lg:p-5 bg-slate-50/60 dark:bg-slate-950 transition-colors overflow-hidden"
	>
		<!-- 1. 页面头部与极简概览胶囊 (Impeccable Distill: 移除重复的图标方块瓷砖) -->
		<div
			class="screen-header mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0"
		>
			<div>
				<div class="flex items-center gap-2.5">
					<span
						class="w-2 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0 shadow-2xs"
					></span>
					<h1
						class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 m-0 leading-none"
					>
						菜单管理
					</h1>
					<span
						class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50/80 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 ml-1"
					>
						<AppstoreOutlined class="text-[11px]" />
						<span>顶级模块 {{ fullMenuTree.length }}</span>
						<span class="opacity-40">·</span>
						<span>总节点 {{ totalTreeCount }}</span>
					</span>
				</div>
				<p
					class="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 ml-4.5 font-normal"
				>
					配置系统多级导航菜单、前端路由映射与按钮级权限标识
				</p>
			</div>
		</div>

		<!-- 2. 主工作区：左侧树 (264px) + 右侧工作区 (Zero-Page-Scroll 满屏自适应) -->
		<div class="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 items-stretch overflow-hidden">
			<!-- 左侧目录树卡片 -->
			<div
				class="w-full lg:w-64 flex-shrink-0 bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs flex flex-col overflow-hidden"
			>
				<div
					class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-2.5 flex-shrink-0"
				>
					<span class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
						<ApartmentOutlined class="text-blue-600" />
						<span>目录层级导航</span>
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
				<div class="mb-2.5 flex-shrink-0">
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
						'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all mb-2 flex-shrink-0',
						selectedTreeKeys.length === 0 || selectedTreeKeys[0] === 'ALL'
							? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
							: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900',
					]"
					@click="handleSelectAllNode"
				>
					<span class="flex items-center gap-1.5">
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
				<div class="menu-tree-container flex-1 min-h-0 overflow-y-auto pr-1">
					<a-tree
						v-model:selectedKeys="selectedTreeKeys"
						v-model:expandedKeys="treeExpandedKeys"
						:tree-data="(filteredTreeData as any)"
						:field-names="{ title: 'title', key: 'id', children: 'children' }"
						show-line
						class="modern-menu-ant-tree"
						@select="onTreeSelect"
					>
						<template #title="{ title, dataRef }">
							<span class="text-xs select-none font-medium inline-flex items-center gap-1.5">
								<FolderFilled
									v-if="!dataRef?.parentId || String(dataRef.parentId) === '0'"
									class="text-blue-500 text-xs flex-shrink-0"
								/>
								<FileProtectOutlined
									v-else-if="String(dataRef?.hideInMenu) === '1' || String(dataRef?.hideInMenu) === 'true'"
									class="text-slate-400 text-xs flex-shrink-0"
								/>
								<FileTextOutlined
									v-else
									class="text-emerald-500 text-xs flex-shrink-0"
								/>
								<span class="truncate">{{ title }}</span>
								<span
									v-if="dataRef?.children?.length"
									class="text-[10px] text-slate-400 font-mono ml-0.5"
								>
									({{ dataRef.children.length }})
								</span>
							</span>
						</template>
					</a-tree>
				</div>
			</div>

			<!-- 右侧工作区 (flex-1 min-w-0) -->
			<div class="flex-1 min-w-0 min-h-0 flex flex-col gap-3.5 overflow-hidden">
				<!-- 搜索与筛选栏 (Ponytail D5: 内存 computed 实时过滤，移除无意义空 query 按钮) -->
				<div
					class="filter-card bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl px-4 py-2.5 shadow-xs flex-shrink-0"
				>
					<a-form
						:model="searchInfo"
						layout="inline"
						class="flex flex-wrap items-center gap-y-2 gap-x-3"
					>
						<a-form-item label="名称/路由" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.title"
								placeholder="输入标题或路由名"
								class="rounded-lg w-44"
								allow-clear
							>
								<template #prefix>
									<SearchOutlined class="text-slate-400 text-xs" />
								</template>
							</a-input>
						</a-form-item>

						<a-form-item label="权限标识" class="!mr-0 mb-0">
							<a-input
								v-model:value="searchInfo.permissionCode"
								placeholder="如 user:list"
								class="rounded-lg w-40 font-mono"
								allow-clear
							>
								<template #prefix>
									<SafetyCertificateOutlined class="text-slate-400 text-xs" />
								</template>
							</a-input>
						</a-form-item>

						<a-form-item label="状态" class="!mr-0 mb-0">
							<a-select
								v-model:value="searchInfo.status"
								placeholder="全部状态"
								:field-names="{ label: 'typeName', value: 'typeCode' }"
								:options="statusList"
								class="rounded-lg w-28"
								allow-clear
							/>
						</a-form-item>

						<div class="flex items-center gap-2 ml-auto">
							<a-button
								data-testid="rbac-menu-btn-reset"
								class="rounded-lg px-3.5"
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
					class="table-card flex-1 min-h-0 bg-[var(--card-bg)] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col overflow-hidden"
				>
					<!-- 提示条与操作栏 (Impeccable Clarify: 消除同行重复两次的上级名称) -->
					<div
						class="table-toolbar px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 flex-shrink-0"
					>
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-sm font-bold text-slate-800 dark:text-slate-100">
								{{ activeParentNode ? `${activeParentNode.title} · 下级菜单` : '全部菜单列表' }}
							</span>
							<span
								class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono font-medium"
							>
								共 {{ currentTableData.length }} 项
							</span>

							<button
								v-if="activeParentNode"
								type="button"
								class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
								title="清除目录聚焦，查看全部菜单"
								@click="handleSelectAllNode"
							>
								<span>查看全部</span>
								<CloseCircleOutlined class="text-[11px]" />
							</button>
						</div>

						<div class="flex items-center gap-2">
							<a-button
								v-permission="'menu:add'"
								type="primary"
								data-testid="rbac-menu-btn-add"
								class="inline-flex items-center gap-1 shadow-xs rounded-lg font-medium"
								@click="handleAddFromCurrentContext"
							>
								<template #icon><PlusOutlined /></template>
								{{ activeParentNode ? `在【${activeParentNode.title}】下新增` : '新增顶级菜单' }}
							</a-button>

							<span v-permission="'menu:delete'">
								<a-popconfirm
									:title="`确认批量删除选中的 ${rowIds.length} 个菜单?`"
									ok-text="确认"
									cancel-text="取消"
									:disabled="rowIds.length === 0"
									@confirm="delMenuInfo(rowIds.join(','))"
								>
									<a-button
										type="primary"
										danger
										:disabled="rowIds.length === 0"
										data-testid="rbac-menu-btn-batch-delete"
										class="rounded-lg font-medium"
									>
										<template #icon><DeleteOutlined /></template>
										批量删除{{ rowIds.length > 0 ? ` (${rowIds.length})` : '' }}
									</a-button>
								</a-popconfirm>
							</span>
						</div>
					</div>

					<!-- 紧凑复合表格体 (Taste-Skill VISUAL_DENSITY=8, 8列紧凑排版 + 内部自适应滚动) -->
					<div class="flex-1 min-h-0 px-2 pt-1.5 pb-2 overflow-hidden">
						<a-table
							:data-source="currentTableData"
							:columns="columns"
							:loading="loading"
							:row-key="(record: any) => String(record.id)"
							:pagination="false"
							size="middle"
							:scroll="{ x: 1080, y: 'calc(100vh - 285px)' }"
							:row-selection="rowSelection"
							class="modern-menu-table"
							data-testid="rbac-menu-table"
						>
							<template #bodyCell="{ column, record }">
								<!-- 1. 菜单信息复合列 (标题 + 类型徽标 + 副行 name & icon) -->
								<template v-if="column.key === 'title'">
									<div class="flex items-start gap-2.5 py-0.5">
										<div
											:class="[
												'w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 border mt-0.5',
												!record.parentId || String(record.parentId) === '0'
													? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/50'
													: String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'
													? 'bg-slate-100 text-slate-500 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
													: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50',
											]"
										>
											<FolderOutlined v-if="!record.parentId || String(record.parentId) === '0'" />
											<FileProtectOutlined
												v-else-if="String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'"
											/>
											<FileTextOutlined v-else />
										</div>

										<div class="flex flex-col min-w-0">
											<div class="flex items-center gap-1.5">
												<span
													:class="[
														'truncate leading-tight',
														!record.parentId || String(record.parentId) === '0'
															? 'font-bold text-slate-900 dark:text-slate-100 text-[13px]'
															: 'font-semibold text-slate-800 dark:text-slate-200 text-xs',
													]"
												>
													{{ record.title || '-' }}
												</span>
												<span
													v-if="!record.parentId || String(record.parentId) === '0'"
													class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60 flex-shrink-0"
												>
													目录
												</span>
												<span
													v-else-if="String(record.hideInMenu) === '1' || String(record.hideInMenu) === 'true'"
													class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-500 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 flex-shrink-0"
												>
													内页
												</span>
												<span
													v-else
													class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-normal bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60 flex-shrink-0"
												>
													菜单
												</span>
											</div>
											<div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
												<span>{{ record.name || '-' }}</span>
												<template v-if="record.icon">
													<span>·</span>
													<span class="text-slate-400">{{ record.icon }}</span>
												</template>
											</div>
										</div>
									</div>
								</template>

								<!-- 2. 所属上级 -->
								<template v-else-if="column.key === 'parentTitle'">
									<span
										v-if="!record.parentTitle || record.parentTitle === '根目录'"
										class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
									>
										根目录
									</span>
									<span
										v-else
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
									>
										<ApartmentOutlined class="text-[10px] text-blue-500" />
										<span class="truncate max-w-[90px]">{{ record.parentTitle }}</span>
									</span>
								</template>

								<!-- 3. 路由与组件复合列 (path + component) -->
								<template v-else-if="column.key === 'path'">
									<div class="flex flex-col min-w-0 py-0.5">
										<span
											class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200 truncate"
											:title="record.path"
										>
											{{ record.path || '-' }}
										</span>
										<div class="flex items-center gap-1 mt-0.5">
											<span
												v-if="record.component === 'Layout'"
												class="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-mono bg-blue-50/80 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50"
											>
												Layout
											</span>
											<span
												v-else
												class="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate"
												:title="record.component"
											>
												{{ record.component || '-' }}
											</span>
										</div>
									</div>
								</template>

								<!-- 4. 权限标识 (支持快速点击复制) -->
								<template v-else-if="column.key === 'permissionCode'">
									<span
										v-if="record.permissionCode"
										class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 hover:bg-blue-100 cursor-pointer transition-colors"
										title="点击复制权限标识"
										@click="copyPermissionCode(record.permissionCode)"
									>
										<span class="truncate max-w-[115px]">{{ record.permissionCode }}</span>
										<CopyOutlined class="text-[10px] opacity-70 flex-shrink-0" />
									</span>
									<span v-else class="text-slate-400 text-xs">-</span>
								</template>

								<!-- 5. 可见性 (导航显示/隐藏 + 首页标识) -->
								<template v-else-if="column.key === 'hideInMenu'">
									<div class="inline-flex items-center gap-1">
										<span
											v-if="
												String(record.hideInMenu) === '1' ||
												String(record.hideInMenu) === 'true'
											"
											class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
										>
											隐藏
										</span>
										<span
											v-else
											class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50/70 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
										>
											显示
										</span>
										<span
											v-if="String(record.showInHome) === '1' || String(record.showInHome) === 'true'"
											class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
											title="在首页展示"
										>
											首页
										</span>
									</div>
								</template>

								<!-- 6. 排序 -->
								<template v-else-if="column.key === 'orderBy'">
									<span
										class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
									>
										{{ record.orderBy ?? '-' }}
									</span>
								</template>

								<!-- 7. 状态（行内微开关） -->
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

								<!-- 8. 操作列 (查看只读 + 子项 + 编辑 + 删除) -->
								<template v-else-if="column.key === 'operation'">
									<div class="flex items-center justify-center gap-1">
										<a-button
											type="link"
											size="small"
											data-testid="rbac-menu-row-view"
											class="table-action-btn view-action-btn"
											@click="viewMenuInfo(String(record.id))"
										>
											<template #icon><EyeOutlined /></template>
											查看
										</a-button>

										<a-button
											v-permission="'menu:add'"
											type="link"
											size="small"
											data-testid="rbac-menu-row-add-child"
											class="table-action-btn auth-action-btn"
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
											class="table-action-btn edit-action-btn"
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
													class="table-action-btn delete-action-btn"
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

		<!-- 详情与新增抽屉 (复用父组件 fullMenuTree，消除重复请求) -->
		<menu-info-detail
			v-model:model-info="modelInfo"
			:tree-data="fullMenuTree"
			@success="() => reloadAll()"
		></menu-info-detail>
	</div>
</template>

<script setup lang="ts">
import {
	AppstoreOutlined,
	SearchOutlined,
	ReloadOutlined,
	PlusOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	CopyOutlined,
	FolderOutlined,
	FolderFilled,
	FolderOpenOutlined,
	FileTextOutlined,
	FileProtectOutlined,
	ApartmentOutlined,
	CloseCircleOutlined,
	SafetyCertificateOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
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

const { getDictByType } = useDictInfo('is_valid');

const {
	selectedRowKeys: rowIds,
	rowSelection,
	clearSelected: clearSelection,
} = useRowSelection();

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
	treeExpandedKeys.value = isTreeAllExpanded.value ? [] : [...allTreeKeys.value];
};

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

// 递归收集节点及其所有后代为纯一维数组（剥离 children 属性，防止 Ant Table 渲染树形 + 号）
const flattenNodeAndDescendants = (
	node: MenuInfoData,
	parentTitle = '根目录',
): MenuInfoData[] => {
	const { children, ...pureItem } = node;
	const result: MenuInfoData[] = [{ ...pureItem, parentTitle }];
	if (Array.isArray(children) && children.length > 0) {
		const currentTitle = node.title || node.name || '未命名';
		for (const child of children) {
			result.push(...flattenNodeAndDescendants(child, currentTitle));
		}
	}
	return result;
};

const flattenAllTree = (nodes: MenuInfoData[], parentTitle = '根目录'): MenuInfoData[] => {
	const list: MenuInfoData[] = [];
	for (const n of nodes) {
		list.push(...flattenNodeAndDescendants(n, parentTitle));
	}
	return list;
};

const currentTableData = computed(() => {
	let rawList: MenuInfoData[] = [];

	if (activeParentNode.value) {
		const pTitle =
			activeParentNode.value.parentId && String(activeParentNode.value.parentId) !== '0'
				? findNodeById(fullMenuTree.value, String(activeParentNode.value.parentId))?.title ||
				  '未知上级'
				: '根目录';
		rawList = flattenNodeAndDescendants(activeParentNode.value, pTitle);
	} else {
		rawList = flattenAllTree(fullMenuTree.value);
	}

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

const handleSelectAllNode = () => {
	selectedTreeKeys.value = ['ALL'];
	activeParentNode.value = null;
};

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

const cancelQuery = () => {
	searchInfo.value = {};
};

const delMenuInfo = async (ids: string) => {
	if (!ids) return;
	const { code, message: messageInfo } = await deleteMenuInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！');
		clearSelection();
		await reloadAll();
	} else {
		message.error(messageInfo || '删除失败！');
	}
};

const viewMenuInfo = (id: string) => {
	modelInfo.value = {
		title: '查看菜单明细',
		open: true,
		id,
		readonly: true,
	};
};

const editMenuInfo = (type: string, id?: string) => {
	const isAdd = type === 'add';
	modelInfo.value = {
		title: isAdd ? '新增顶级菜单' : '编辑菜单明细',
		open: true,
		id: isAdd ? undefined : (id ?? null),
		parentId: isAdd ? '0' : undefined,
		readonly: false,
	};
};

const handleAddFromCurrentContext = () => {
	if (activeParentNode.value) {
		modelInfo.value = {
			title: `新增菜单 - 所属上级【${activeParentNode.value.title}】`,
			open: true,
			id: undefined,
			parentId: String(activeParentNode.value.id),
			readonly: false,
		};
	} else {
		editMenuInfo('add');
	}
};

const handleAddChild = (parentRecord: MenuInfoData) => {
	modelInfo.value = {
		title: `新增子菜单 - 所属上级【${parentRecord.title || parentRecord.name}】`,
		open: true,
		id: undefined,
		parentId: String(parentRecord.id),
		readonly: false,
	};
};

const handleToggleStatus = async (record: any, checked: boolean) => {
	const newStatus = checked ? '1' : '0';
	record._statusLoading = true;
	try {
		const { parentTitle, _statusLoading, children, ...cleanRecord } = record;
		const { code, message: msg } = await apiEditMenuInfo({
			...cleanRecord,
			id: String(record.id),
			status: newStatus,
		});
		if (code === '200') {
			record.status = newStatus;
			const sourceNode = findNodeById(fullMenuTree.value, String(record.id));
			if (sourceNode) {
				sourceNode.status = newStatus;
			}
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

			if (treeExpandedKeys.value.length === 0) {
				treeExpandedKeys.value = data.map((d: any) => String(d.id));
			}

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
		font-size: 12.5px;
		letter-spacing: 0.02em;
		border-bottom: 1px solid #e2e8f0;
		padding: 10px 12px;
	}

	:deep(.ant-table-tbody > tr > td) {
		border-bottom: 1px solid #f1f5f9;
		padding: 9px 12px;
		transition: background-color 0.15s ease;
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
