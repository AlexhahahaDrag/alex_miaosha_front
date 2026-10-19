<template>
	<div class="account-record-screen">
		<!-- 1. 顶部业务コンソール头部 -->
		<header class="screen-header">
			<div class="header-left">
				<div class="header-icon-box">
					<AccountBookOutlined />
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1 class="page-title">个人账户与卡券记录</h1>
						<span class="stat-pill">
							共 <strong>{{ pagination.total || 0 }}</strong> 项记录
						</span>
						<span class="stat-pill stat-pill-emerald">
							本页有效合计 <strong>¥{{ formatAmount(activePageAmountSum) }}</strong>
						</span>
						<span
							v-if="warningRecordCount > 0"
							class="stat-pill stat-pill-amber"
						>
							待过期/已过期 <strong>{{ warningRecordCount }}</strong> 项
						</span>
					</div>
					<p class="page-subtitle">
						集中管理个人猫超卡、购物金、礼品卡等具有有效期的账户资产与到期提醒状态
					</p>
				</div>
			</div>

			<div class="header-actions">
				<a-popconfirm
					v-if="selectedRowKeys.length > 0"
					:title="`确认批量删除选中的 ${selectedRowKeys.length} 条记录吗？`"
					ok-text="确认删除"
					cancel-text="取消"
					@confirm="batchDelAccountRecordInfo"
				>
					<a-button danger class="action-btn">
						<template #icon><DeleteOutlined /></template>
						批量删除 ({{ selectedRowKeys.length }})
					</a-button>
				</a-popconfirm>
				<a-button
					type="primary"
					class="action-btn primary-btn"
					data-testid="account-record-add-btn"
					@click="editAccountRecordInfo('add')"
				>
					<template #icon><PlusOutlined /></template>
					新增账户记录
				</a-button>
			</div>
		</header>

		<!-- 2. 筛选工具卡片 -->
		<section class="filter-card">
			<div class="filter-row">
				<div class="filter-inputs">
					<div class="filter-item">
						<span class="filter-label">名称检索</span>
						<a-input
							id="search_name"
							name="name"
							v-model:value="searchInfo.name"
							placeholder="搜索卡券或账户名称..."
							allow-clear
							class="filter-input"
							@pressEnter="query(true)"
							@change="query(true)"
						>
							<template #prefix>
								<SearchOutlined class="text-slate-400" />
							</template>
						</a-input>
					</div>

					<div class="filter-item">
						<span class="filter-label">归属账号</span>
						<a-select
							id="search_account"
							name="account"
							v-model:value="searchInfo.account"
							placeholder="全部账号"
							:field-names="{ label: 'typeName', value: 'typeCode' }"
							:options="accountList"
							allow-clear
							class="filter-select"
							@change="query(true)"
						/>
					</div>
				</div>

				<div class="filter-btns">
					<a-button type="primary" class="filter-btn" @click="query(true)">
						<template #icon><SearchOutlined /></template>
						查询
					</a-button>
					<a-button class="filter-btn" @click="cancelQuery">
						<template #icon><ReloadOutlined /></template>
						重置
					</a-button>
				</div>
			</div>
		</section>

		<!-- 3. 表格数据卡片 -->
		<section class="table-card">
			<div class="table-card-header">
				<div class="table-title-wrap">
					<span class="table-title">账户资产台账</span>
					<span v-if="selectedRowKeys.length" class="selection-badge">
						已选 {{ selectedRowKeys.length }} 项
						<a class="clear-link" @click="clearSelected">清空</a>
					</span>
				</div>
			</div>

			<a-table
				class="modern-account-table"
				:dataSource="dataSource"
				:columns="columns"
				:loading="loading"
				:rowKey="(record: AccountRecordInfo) => String(record.id || '')"
				:pagination="pagination"
				:scroll="{ x: 'max-content' }"
				:rowSelection="rowSelection"
				@change="handleTableChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.key === 'name'">
						<div class="name-cell">
							<span class="name-dot"></span>
							<span class="name-text">{{ record.name || '—' }}</span>
						</div>
					</template>

					<template v-else-if="column.key === 'accountName'">
						<span v-if="record.accountName || record.account" class="account-pill">
							<CreditCardOutlined class="mr-1 text-blue-500" />
							{{ record.accountName || record.account }}
						</span>
						<span v-else class="text-slate-300">—</span>
					</template>

					<template v-else-if="column.key === 'amount'">
						<span class="amount-cell">
							¥{{ formatAmount(record?.amount) }}
						</span>
					</template>

					<template v-else-if="column.key === 'avliDate'">
						<span class="date-cell">
							<CalendarOutlined class="mr-1 text-slate-400" />
							{{ record.avliDate ? formatDate(record.avliDate) : '—' }}
						</span>
					</template>

					<template v-else-if="column.key === 'isSend'">
						<span
							class="send-pill"
							:class="Number(record.isSend) === 1 ? 'is-sent' : 'is-unsent'"
						>
							{{ Number(record.isSend) === 1 ? '已发送' : '未发送' }}
						</span>
					</template>

					<template v-else-if="column.key === 'status'">
						<span
							class="status-pill"
							:class="
								Number(record.status) === 0 ? 'status-expired'
								: Number(record.status) === 1 ? 'status-expiring'
								: 'status-valid'
							"
						>
							<span class="status-dot"></span>
							{{
								Number(record.status) === 0 ? '已过期'
								: Number(record.status) === 1 ? '待过期'
								: '有效'
							}}
						</span>
					</template>

					<template v-else-if="column.key === 'operation'">
						<a-space :size="4">
							<a-button
								type="link"
								size="small"
								class="op-btn view-btn"
								@click="editAccountRecordInfo('view', record.id)"
							>
								查看
							</a-button>
							<a-divider type="vertical" />
							<a-button
								type="link"
								size="small"
								class="op-btn"
								@click="editAccountRecordInfo('update', record.id)"
							>
								编辑
							</a-button>
							<a-divider type="vertical" />
							<a-popconfirm
								title="确认删除该条账户记录吗？"
								ok-text="确认"
								cancel-text="取消"
								@confirm="delAccountRecordInfo(String(record.id))"
							>
								<a-button type="link" size="small" danger class="op-btn">
									删除
								</a-button>
							</a-popconfirm>
						</a-space>
					</template>
				</template>
			</a-table>
		</section>

		<account-record-info-detail
			v-model:modelInfo="modelInfo"
			@success="handleSuccess"
		/>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	AccountBookOutlined,
	PlusOutlined,
	DeleteOutlined,
	SearchOutlined,
	ReloadOutlined,
	CreditCardOutlined,
	CalendarOutlined,
} from '@ant-design/icons-vue';
import type { ModelInfo } from '@/types/modal';
import type { AccountRecordInfo } from '@/views/selfFinance/accountRecordInfo/config';
import { columns } from '@/views/selfFinance/accountRecordInfo/config';
import { formatAmount } from '@/utils/amountInfo';
import {
	getAccountRecordInfoPage,
	deleteAccountRecordInfo,
} from '@/views/selfFinance/accountRecordInfo/api';
import { useDictInfo } from '@/composables/useDictInfo';
import { formatDate } from '@/utils/dayjs';
import { usePagination, useRowSelection } from '@/composables/usePagination';

const { getDictByType } = useDictInfo('account_type');
const accountList = computed(() => getDictByType('account_type'));

const { selectedRowKeys, rowSelection, clearSelected } = useRowSelection();

const { pagination, handleTableChange, setTotal, resetPagination } =
	usePagination({
		onChange: (p) => getAccountRecordInfoListPage(searchInfo.value, p),
	});

const searchInfo = ref<AccountRecordInfo>({});
const loading = ref<boolean>(false);
const dataSource = ref<AccountRecordInfo[]>([]);
const modelInfo = ref<ModelInfo>({});

// 当前页有效金额合计
const activePageAmountSum = computed(() => {
	return (dataSource.value || [])
		.filter((item) => Number(item.status) !== 0)
		.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

// 待过期或已过期预警条数
const warningRecordCount = computed(() => {
	return (dataSource.value || []).filter(
		(item) => Number(item.status) === 0 || Number(item.status) === 1,
	).length;
});

const query = (resetPage = false) => {
	if (resetPage) {
		resetPagination();
	}
	getAccountRecordInfoListPage(searchInfo.value, pagination);
};

const cancelQuery = () => {
	searchInfo.value = {};
	query(true);
};

const delAccountRecordInfo = async (ids: string) => {
	if (!ids) return;
	const { code, message: messageInfo } = await deleteAccountRecordInfo(ids);
	if (code === '200') {
		message.success(messageInfo ? `删除${messageInfo}` : '删除成功！', 3);
		clearSelected();
		query(true);
	} else {
		message.error(messageInfo || '删除失败！', 3);
	}
};

const batchDelAccountRecordInfo = () => {
	if (!selectedRowKeys.value?.length) {
		message.warning('请先选择要删除的数据！', 3);
		return;
	}
	delAccountRecordInfo(selectedRowKeys.value.join(','));
};

const getAccountRecordInfoListPage = async (
	param: AccountRecordInfo,
	cur: PageInfo,
) => {
	loading.value = true;
	try {
		const {
			code,
			data,
			message: messageInfo,
		} = await getAccountRecordInfoPage(param, cur.current, cur.pageSize);
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

const initPage = () => {
	pagination.current = 1;
	pagination.pageSize = 10;
};

const editAccountRecordInfo = (type: string, id?: string | number) => {
	const isAdd = type === 'add';
	const isView = type === 'view';
	modelInfo.value.title =
		isAdd ? '新增账户记录'
		: isView ? '账户记录详情'
		: '编辑账户记录';
	modelInfo.value.id =
		isAdd ? undefined
		: id !== undefined ? String(id)
		: undefined;
	modelInfo.value.readonly = isView;
	modelInfo.value.confirmLoading = true;
	modelInfo.value.open = true;
};

const handleSuccess = () => {
	getAccountRecordInfoListPage(searchInfo.value, pagination);
};

onMounted(() => {
	initPage();
	getAccountRecordInfoListPage(searchInfo.value, pagination);
});
</script>

<style lang="scss" scoped>
.account-record-screen {
	display: flex;
	flex-direction: column;
	gap: 14px;
	padding: 16px;
	min-height: calc(100vh - 110px);
	background: #f8fafc;
}

.screen-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 16px 20px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
	flex-wrap: wrap;

	.header-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.header-icon-box {
		width: 42px;
		height: 42px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		color: #2563eb;
		font-size: 20px;
		border: 1px solid #bfdbfe;
		flex-shrink: 0;
	}

	.header-titles {
		display: flex;
		flex-direction: column;
		gap: 4px;

		.title-row {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
		}

		.page-title {
			margin: 0;
			font-size: 17px;
			font-weight: 700;
			color: #0f172a;
			letter-spacing: -0.01em;
		}

		.page-subtitle {
			margin: 0;
			font-size: 12px;
			color: #64748b;
		}
	}

	.stat-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 9px;
		border-radius: 999px;
		font-size: 12px;
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
		font-variant-numeric: tabular-nums;

		strong {
			font-weight: 700;
			color: #0f172a;
		}

		&.stat-pill-emerald {
			background: #ecfdf5;
			color: #047857;
			border-color: #a7f3d0;
			strong {
				color: #065f46;
			}
		}

		&.stat-pill-amber {
			background: #fffbeb;
			color: #b45309;
			border-color: #fde68a;
			strong {
				color: #92400e;
			}
		}
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.action-btn {
		height: 36px;
		border-radius: 8px;
		font-weight: 500;

		&.primary-btn {
			box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
		}
	}
}

.filter-card {
	padding: 14px 18px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);

	.filter-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.filter-inputs {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: 8px;

		.filter-label {
			font-size: 13px;
			font-weight: 500;
			color: #475569;
			white-space: nowrap;
		}

		.filter-input {
			width: 220px;
			border-radius: 8px;
		}

		.filter-select {
			width: 180px;
		}
	}

	.filter-btns {
		display: flex;
		align-items: center;
		gap: 8px;

		.filter-btn {
			border-radius: 8px;
		}
	}
}

.table-card {
	flex: 1;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 12px;
	padding: 0 16px 12px;
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);

	.table-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 4px;
		border-bottom: 1px solid #f1f5f9;
		margin-bottom: 4px;

		.table-title-wrap {
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.table-title {
			font-size: 14px;
			font-weight: 700;
			color: #0f172a;
		}

		.selection-badge {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 2px 10px;
			border-radius: 999px;
			background: #eff6ff;
			border: 1px solid #bfdbfe;
			font-size: 12px;
			color: #1d4ed8;
			font-weight: 600;

			.clear-link {
				color: #2563eb;
				font-weight: 500;
				cursor: pointer;
				&:hover {
					text-decoration: underline;
				}
			}
		}
	}
}

.name-cell {
	display: inline-flex;
	align-items: center;
	gap: 8px;

	.name-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #3b82f6;
		flex-shrink: 0;
	}

	.name-text {
		font-weight: 600;
		color: #0f172a;
	}
}

.account-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 9px;
	border-radius: 6px;
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	font-size: 12px;
	font-weight: 500;
	color: #334155;
}

.amount-cell {
	font-size: 14px;
	font-weight: 700;
	color: #0f172a;
	font-variant-numeric: tabular-nums;
}

.date-cell {
	font-size: 13px;
	color: #475569;
	font-variant-numeric: tabular-nums;
}

.send-pill {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;

	&.is-sent {
		background: #f1f5f9;
		color: #64748b;
	}

	&.is-unsent {
		background: #ecfdf5;
		color: #047857;
	}
}

.status-pill {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 2px 9px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}

	&.status-valid {
		background: #ecfdf5;
		color: #047857;
		border: 1px solid #a7f3d0;
		.status-dot {
			background: #10b981;
		}
	}

	&.status-expiring {
		background: #fffbeb;
		color: #b45309;
		border: 1px solid #fde68a;
		.status-dot {
			background: #f59e0b;
		}
	}

	&.status-expired {
		background: #f1f5f9;
		color: #64748b;
		border: 1px solid #cbd5e1;
		.status-dot {
			background: #94a3b8;
		}
	}
}

.op-btn {
	padding: 0 2px;
	font-size: 13px;

	&.view-btn {
		color: #475569;
		&:hover {
			color: #1677ff;
		}
	}
}
</style>
