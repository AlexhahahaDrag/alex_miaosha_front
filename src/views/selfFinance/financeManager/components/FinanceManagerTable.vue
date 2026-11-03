<template>
	<div
		class="content finance-table-card flex-1 min-h-0 flex flex-col relative bg-white rounded-2xl border-0 shadow-sm shadow-slate-200/60 px-4 overflow-hidden"
		ref="tableContainerRef"
	>
		<div
			class="table-card-header shrink-0 flex items-center justify-between py-2.5 px-1 border-b border-solid border-slate-100 gap-3"
		>
			<div class="flex items-center gap-2">
				<span class="text-sm font-semibold text-slate-900">账单流水明细</span>
				<span
					class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 font-mono tabular-nums"
				>
					{{ Number(pagination.total || 0).toLocaleString() }} 笔
				</span>
				<span
					v-if="selectedRowIds.length"
					class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-[11px] font-semibold text-indigo-600"
				>
					已勾选 {{ selectedRowIds.length }} 项
				</span>
			</div>
			<div class="flex items-center gap-2">
				<slot name="headerActions" />
			</div>
		</div>

		<a-table
			class="modern-finance-table"
			:dataSource="dataSource"
			:columns="columns"
			:loading="loading"
			:row-key="(record: FinanceManagerData) => record.id || ''"
			:pagination="false"
			@change="handleTableChange"
			:scroll="{ x: 1000, y: tableScrollY }"
			:row-selection="rowSelection"
		>
			<template #bodyCell="{ column, record }">
				<!-- 1. 复合列：账目名称 + 状态呼吸点 + 归属人与时间 -->
				<template v-if="column.key === 'name'">
					<div class="compound-name-cell flex flex-col gap-1 py-0.5 min-w-0">
						<div class="flex items-center gap-2 min-w-0">
							<span
								:class="[
									'w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200',
									record.isValid === '1' ?
										'bg-emerald-500 ring-2 ring-emerald-500/20'
									:	'bg-slate-300 ring-2 ring-slate-200',
								]"
								:title="record.isValid === '1' ? '状态：有效' : '状态：失效'"
							/>
							<span
								class="cell-name-text text-[13px] font-semibold text-slate-900 hover:text-indigo-600 leading-snug tracking-tight truncate transition-colors"
								:title="record.name || '未命名账目'"
							>
								{{ record.name || '未命名账目' }}
							</span>
						</div>
						<div
							class="flex items-center gap-1.5 text-[11px] text-slate-400 pl-3.5"
						>
							<span
								v-if="record.belongToName"
								class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium leading-tight"
							>
								<UserOutlined class="text-[10px] text-slate-400" />
								{{ record.belongToName }}
							</span>
							<span
								v-if="record.belongToName && record.infoDate"
								class="text-slate-300"
								>·</span
							>
							<span
								v-if="record.infoDate"
								class="font-mono tabular-nums text-slate-400"
							>
								{{ formatTime(record.infoDate) }}
							</span>
						</div>
					</div>
				</template>

				<!-- 2. 类别列：语义化无框柔光胶囊 -->
				<template v-else-if="column.key === 'typeCode'">
					<span
						v-if="record.typeCode"
						class="category-pill inline-flex items-center justify-center min-w-[72px] gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
						:style="getCategoryPillStyle(record.typeCode)"
						@click="$emit('filter-category', record.typeCode)"
						:title="`点击仅筛选【${record.typeCode}】`"
					>
						<span class="text-[11px] leading-none">{{
							getCategoryEmoji(record.typeCode)
						}}</span>
						<span class="leading-tight">{{ record.typeCode }}</span>
					</span>
					<span v-else class="text-slate-300">-</span>
				</template>

				<!-- 3. 支付方式列：图标徽章与品牌无框胶囊 -->
				<template v-else-if="column.key === 'fromSource'">
					<div
						class="from-source-pill inline-flex items-center justify-center min-w-[78px] gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-full text-xs text-slate-700 font-medium"
					>
						<component
							v-if="getFinanceIconComponent(record.fromSource)"
							:is="getFinanceIconComponent(record.fromSource)"
							class="w-3.5 h-3.5 shrink-0"
						/>
						<CreditCardOutlined
							v-else
							class="text-[13px] text-slate-400 shrink-0"
						/>
						<span class="whitespace-nowrap">{{
							getFromSourceName(record.fromSource)
						}}</span>
					</div>
				</template>

				<!-- 4. 金额列：等宽、靠右对齐、正负红绿自解释 -->
				<template v-else-if="column.key === 'amount'">
					<div
						:class="[
							'amount-container flex items-baseline justify-end pr-1.5 font-bold font-mono tabular-nums tracking-tight',
							record.incomeAndExpenses === 'income' ?
								'text-emerald-600'
							:	'text-rose-600',
						]"
					>
						<span class="text-[13px] mr-px">{{
							record.incomeAndExpenses === 'income' ? '+' : '-'
						}}</span>
						<span class="text-xs mr-0.5 opacity-85">¥</span>
						<span class="text-[15px]">{{ formatAmount(record.amount) }}</span>
					</div>
				</template>

				<!-- 5. 操作列：Taste-Skill 磁吸微胶囊按钮 -->
				<template v-else-if="column.key === 'operation'">
					<div
						class="table-actions-group inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
					>
						<button
							type="button"
							class="table-action-btn inline-flex items-center gap-1 px-2 py-1 rounded-lg border-0 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.08] active:scale-95 cursor-pointer text-xs font-medium leading-tight whitespace-nowrap shrink-0 transition-all duration-200 outline-none"
							data-testid="btn-view-finance"
							@click="$emit('edit', 'view', record.id)"
							title="查看明细"
						>
							<EyeOutlined class="text-[11px]" />
							<span>查看</span>
						</button>
						<template v-if="canEditRecord(record)">
							<button
								type="button"
								class="table-action-btn inline-flex items-center gap-1 px-2 py-1 rounded-lg border-0 bg-transparent text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700 hover:scale-[1.08] active:scale-95 cursor-pointer text-xs font-medium leading-tight whitespace-nowrap shrink-0 transition-all duration-200 outline-none"
								data-testid="btn-edit-finance"
								@click="$emit('edit', 'update', record.id)"
								title="编辑账目"
							>
								<EditOutlined class="text-[11px]" />
								<span>编辑</span>
							</button>
						</template>
						<template v-if="canDeleteRecord(record)">
							<a-popconfirm
								title="确认删除该笔账目?"
								ok-text="确认"
								cancel-text="取消"
								@confirm="$emit('delete', record.id)"
							>
								<button
									type="button"
									class="table-action-btn inline-flex items-center gap-1 px-2 py-1 rounded-lg border-0 bg-transparent text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 hover:scale-[1.08] active:scale-95 cursor-pointer text-xs font-medium leading-tight whitespace-nowrap shrink-0 transition-all duration-200 outline-none"
									data-testid="btn-delete-finance"
									title="删除账目"
								>
									<DeleteOutlined class="text-[11px]" />
									<span>删除</span>
								</button>
							</a-popconfirm>
						</template>
					</div>
				</template>
			</template>
		</a-table>

		<!-- 常驻表格底栏工具条 (Sticky Action Toolbar) -->
		<div
			class="table-footer-toolbar shrink-0 h-11 flex items-center justify-between px-1 bg-white border-0 border-t border-solid border-slate-100 z-10"
		>
			<div class="flex items-center gap-2">
				<template v-if="selectedRowIds.length">
					<span
						class="inline-flex items-center px-2 py-0.5 bg-indigo-500/10 rounded-full text-indigo-600 text-xs font-medium"
					>
						已选
						<strong class="font-bold mx-0.5 font-mono">{{
							selectedRowIds.length
						}}</strong>
						项
					</span>
					<a-divider type="vertical" />
					<a-popconfirm
						:title="`确认批量删除选中的 ${selectedRowIds.length} 笔账目?`"
						ok-text="确认"
						cancel-text="取消"
						@confirm="$emit('batch-delete')"
					>
						<button
							type="button"
							class="inline-flex items-center gap-1 border-0 bg-transparent px-1 text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
						>
							<DeleteOutlined />
							<span>批量删除</span>
						</button>
					</a-popconfirm>
					<button
						type="button"
						class="border-0 bg-transparent px-1 text-xs text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
						@click="$emit('clear-selected')"
					>
						清空选择
					</button>
				</template>
				<template v-else>
					<span class="text-xs text-slate-400">
						共
						<span class="text-slate-900 font-semibold font-mono tabular-nums">{{
							Number(pagination.total || 0).toLocaleString()
						}}</span>
						笔账目
					</span>
				</template>
			</div>
			<div class="toolbar-right flex items-center">
				<a-pagination
					size="small"
					:current="pagination.current"
					:page-size="pagination.pageSize"
					:total="pagination.total"
					:show-size-changer="pagination.showSizeChanger"
					:page-size-options="pagination.pageSizeOptions"
					:show-quick-jumper="pagination.showQuickJumper"
					:show-total="pagination.showTotal"
					@change="handlePageChange"
					@showSizeChange="handleSizeChange"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	DeleteOutlined,
	UserOutlined,
	CreditCardOutlined,
	EyeOutlined,
	EditOutlined,
} from '@ant-design/icons-vue';
import { formatTime } from '@/utils/dayjs';
import { iconComponentMap } from '@/config/icons';
import {
	getCategoryEmoji,
	type FinanceManagerData,
} from '@/views/selfFinance/financeManager/config';

// 仅在获取支付方式图标时使用的映射（避免使用 includes 模糊匹配产生误判）
const financeSourceIconMap: Record<string, string> = {
	hfw: 'hf',
	hfm: 'hf',
	hfmj: 'hf',
	dfw: 'df',
	dfm: 'df',
};

const getFinanceIconComponent = (source?: string) => {
	if (!source) return null;
	const iconKey = financeSourceIconMap[source] || source;
	return iconComponentMap[`finance-${iconKey}`] || null;
};

defineProps<{
	dataSource: FinanceManagerData[];
	columns: any[];
	loading: boolean;
	tableScrollY: number;
	rowSelection: any;
	selectedRowIds: (string | number)[];
	pagination: any;
	canEditRecord: (record: FinanceManagerData) => boolean;
	canDeleteRecord: (record: FinanceManagerData) => boolean;
	getCategoryPillStyle: (typeCode: string) => any;
	formatAmount: (amount?: number | string) => string;
	getFromSourceName: (val?: string) => string;
}>();

const emit = defineEmits<{
	(e: 'edit', action: 'add' | 'update' | 'view', id?: string): void;
	(e: 'delete', id?: string): void;
	(e: 'batch-delete'): void;
	(e: 'clear-selected'): void;
	(e: 'filter-category', typeCode: string): void;
	(e: 'table-change', pagination: any, filters: any, sorter: any): void;
	(e: 'page-change', page: number, pageSize: number): void;
	(e: 'size-change', current: number, size: number): void;
}>();

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
	emit('table-change', pagination, filters, sorter);
};

const handlePageChange = (page: number, pageSize: number) => {
	emit('page-change', page, pageSize);
};

const handleSizeChange = (current: number, size: number) => {
	emit('size-change', current, size);
};
</script>

<style scoped lang="less">
.content {
	:deep(.ant-table-wrapper) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;

		.ant-spin-nested-loading {
			flex: 1;
			min-height: 0;
			display: flex;
			flex-direction: column;

			.ant-spin-container {
				flex: 1;
				min-height: 0;
				display: flex;
				flex-direction: column;

				.ant-table {
					flex: 1;
					min-height: 0;

					.ant-table-thead > tr > th {
						background: #f8fafc !important;
						color: #64748b;
						font-size: 11px;
						font-weight: 600;
						letter-spacing: 0.04em;
						padding: 10px 12px;
						border-bottom: 1px solid #f1f5f9;

						&::before {
							display: none !important;
						}
					}

					.ant-table-tbody > tr > td {
						padding: 9px 12px;
						border-bottom: 1px solid #f1f5f9;
						transition: background-color 0.15s ease;

						&.ant-table-cell-fix-right {
							white-space: nowrap !important;
						}
					}

					.ant-table-tbody > tr:hover > td {
						background: rgba(79, 106, 246, 0.03) !important;
					}

					.ant-table-container {
						height: 100%;
						display: flex;
						flex-direction: column;

						.ant-table-body {
							flex: 1;
							min-height: 0;
						}
					}
				}
			}
		}
	}

	.toolbar-right {
		:deep(.ant-pagination) {
			margin: 0 !important;
		}
	}
}
</style>
