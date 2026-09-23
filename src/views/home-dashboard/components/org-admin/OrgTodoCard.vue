<template>
	<a-card
		:title="isFamilyContext ? '家庭最新人情事由' : '机构待办与审核事项'"
		:bordered="false"
		class="org-todo-card"
		data-testid="dash-org-todo-card"
	>
		<template #extra>
			<a-space :size="8" align="center">
				<a-tag
					:color="itemCount > 0 ? (isFamilyContext ? 'blue' : 'orange') : 'green'"
					:class="{ 'clickable-tag': isFamilyContext }"
					data-testid="dash-org-todo-pending-count"
					@click="isFamilyContext ? goToEventManagement() : undefined"
				>
					{{ isFamilyContext ? `共 ${totalEvents} 场事由` : `待处理: ${itemCount}` }}
				</a-tag>
				<a-button
					v-if="isFamilyContext"
					type="link"
					size="small"
					class="view-more-btn"
					data-testid="dash-org-event-view-more"
					@click="goToEventManagement"
				>
					查看更多
					<RightOutlined />
				</a-button>
			</a-space>
		</template>

		<a-empty
			v-if="eventList.length === 0 && isFamilyContext"
			description="暂无近期家庭人情事由，办宴或赴礼后将在此汇聚"
			style="padding: 20px 0"
		/>
		<a-empty
			v-else-if="todoList.length === 0 && !isFamilyContext"
			description="暂无待处理机构事项，运转井然有序"
			style="padding: 20px 0"
		/>

		<!-- 家庭事由展示列表 -->
		<a-list
			v-else-if="isFamilyContext"
			:data-source="eventList"
			size="small"
			data-testid="dash-org-event-list"
		>
			<template #renderItem="{ item }">
				<a-list-item class="todo-list-item">
					<template #actions>
						<a-button
							type="link"
							size="small"
							:data-testid="`dash-org-event-view-${item.id}`"
							@click="viewEventDetail(item)"
						>
							查看礼簿
						</a-button>
					</template>
					<div class="todo-meta-wrap">
						<a-tag :color="getEventTypeColor(item.type)" class="priority-tag">
							{{ item.type }}
						</a-tag>
						<div class="todo-text-wrap">
							<div class="todo-title">
								<span class="event-name">「{{ item.name }}」</span>
								<span class="event-host" v-if="item.host">· 办事人: {{ item.host }}</span>
							</div>
							<div class="todo-time-row">
								<span class="time-col" v-if="item.time">{{ item.time }}</span>
								<span class="dot-col" v-if="item.time">·</span>
								<span class="count-col">{{ item.count }} 位亲友参与</span>
								<span class="dot-col">·</span>
								<span class="amount-col text-emerald-600" v-if="item.receiveAmount > 0">
									收礼 ¥{{ item.receiveAmount.toLocaleString() }}
								</span>
								<span class="amount-col text-rose-600" v-else-if="item.giveAmount > 0">
									随礼 ¥{{ item.giveAmount.toLocaleString() }}
								</span>
								<span class="amount-col text-slate-600" v-else>
									流转 ¥{{ item.totalAmount.toLocaleString() }}
								</span>
							</div>
						</div>
					</div>
				</a-list-item>
			</template>
		</a-list>

		<!-- 机构待办列表 -->
		<a-list v-else :data-source="todoList" size="small" data-testid="dash-org-todo-list">
			<template #renderItem="{ item }">
				<a-list-item class="todo-list-item">
					<template #actions>
						<a-button
							type="link"
							size="small"
							:data-testid="`dash-org-todo-handle-${item.id}`"
							@click="handleAction(item)"
						>
							{{ item.actionName }}
						</a-button>
					</template>
					<div class="todo-meta-wrap">
						<a-tag :color="item.priority === 'high' ? 'red' : 'blue'" class="priority-tag">
							{{ item.priority === 'high' ? '紧急' : '常规' }}
						</a-tag>
						<div class="todo-text-wrap">
							<div class="todo-title">{{ item.title }}</div>
							<div class="todo-time">{{ item.time }}</div>
						</div>
					</div>
				</a-list-item>
			</template>
		</a-list>
	</a-card>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { RightOutlined } from '@ant-design/icons-vue';
import { getGiftEventBusinessPage } from '@/views/finance/gift/api';

const props = withDefaults(
	defineProps<{
		isFamilyContext?: boolean;
	}>(),
	{
		isFamilyContext: false,
	},
);

const router = useRouter();

interface OrgTodoItem {
	id: string;
	title: string;
	priority: 'high' | 'normal';
	time: string;
	actionName: string;
}

interface FamilyEventItem {
	id: string;
	name: string;
	type: string;
	host: string;
	time: string;
	count: number;
	receiveAmount: number;
	giveAmount: number;
	totalAmount: number;
}

const defaultOrgTodos: OrgTodoItem[] = [
	{
		id: '1',
		title: '研发一部 李四 申请调动至 华东运营中心',
		priority: 'high',
		time: '30分钟前',
		actionName: '审批调动',
	},
	{
		id: '2',
		title: '秒杀商品"限定手办"库存仅剩 5 件，请确认是否补货',
		priority: 'high',
		time: '2小时前',
		actionName: '补库存',
	},
	{
		id: '3',
		title: '部门大额随礼记账单（¥2,000）待归档复核',
		priority: 'normal',
		time: '4小时前',
		actionName: '确认复核',
	},
	{
		id: '4',
		title: '本季度机构礼尚往来支出预算超额预警（超支 3.5%）',
		priority: 'normal',
		time: '昨天',
		actionName: '查看报表',
	},
];

const todoList = ref<OrgTodoItem[]>([...defaultOrgTodos]);
const eventList = ref<FamilyEventItem[]>([]);
const totalEvents = ref(0);

const EVENT_TYPE_NAMES: Record<string, string> = {
	WEDDING: '婚礼',
	BIRTH: '满月',
	HOUSEWARMING: '乔迁',
	EDUCATION: '升学',
	BIRTHDAY: '寿宴',
	SPRING_FESTIVAL: '春节',
	MID_AUTUMN: '中秋',
	DRAGON_BOAT: '端午',
	FUNERAL: '白事',
	THANKS: '感谢',
	VISIT: '拜访',
	STUDY: '考学',
	OTHER: '其他',
};

const formatEventTypeName = (type?: string) => {
	if (!type) return '人情';
	const upper = String(type).trim().toUpperCase();
	return EVENT_TYPE_NAMES[upper] || EVENT_TYPE_NAMES[type] || type;
};

const getEventTypeColor = (type?: string) => {
	const name = formatEventTypeName(type);
	if (name.includes('婚') || name.includes('喜')) return 'magenta';
	if (name.includes('满月') || name.includes('生') || name.includes('百日')) return 'purple';
	if (name.includes('寿') || name.includes('年')) return 'orange';
	if (name.includes('乔迁') || name.includes('房')) return 'cyan';
	if (name.includes('升学') || name.includes('考')) return 'blue';
	if (name.includes('丧') || name.includes('白')) return 'default';
	return 'blue';
};

const loadData = async () => {
	if (props.isFamilyContext) {
		try {
			const { code, data } = await getGiftEventBusinessPage({}, 1, 5);
			if (code === '200' && data?.records) {
				totalEvents.value = data.total ?? data.records.length;
				eventList.value = data.records.map((r: any) => ({
					id: String(r.id),
					name: r.eventName || '未命名事由',
					type: formatEventTypeName(r.eventType),
					host: r.hostPersonName || '',
					time: r.eventTime ? String(r.eventTime).split(' ')[0] : '',
					count: Number(r.participantCount || 0),
					receiveAmount: Number(r.receiveAmount || 0),
					giveAmount: Number(r.giveAmount || 0),
					totalAmount: Number(r.totalAmount || (Number(r.receiveAmount || 0) + Number(r.giveAmount || 0))),
				}));
			} else {
				eventList.value = [];
				totalEvents.value = 0;
			}
		} catch (err) {
			console.error('加载家庭人情事由异常：', err);
		}
	} else {
		todoList.value = [...defaultOrgTodos];
	}
};

const itemCount = computed(() => (props.isFamilyContext ? eventList.value.length : todoList.value.length));

const viewEventDetail = async (_item: FamilyEventItem) => {
	await router.push('/finance/gift/event');
};

const goToEventManagement = async () => {
	await router.push('/finance/gift/event');
};

const handleAction = async (item: OrgTodoItem) => {
	message.success(`已处理待办事项：${item.title}`);
	todoList.value = todoList.value.filter((t) => t.id !== item.id);
};

watch(
	() => props.isFamilyContext,
	() => {
		void loadData();
	},
	{ immediate: true },
);
</script>

<style scoped lang="scss">
.org-todo-card {
	border-radius: 16px; /* Tailwind rounded-2xl */
	border: 1px solid #e2e8f0; /* Tailwind border-slate-200 */
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;
	background: #ffffff;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f1f5f9;
		font-weight: 700;
		color: #0f172a;
		font-size: 15px;
		letter-spacing: -0.2px;
		padding: 0 20px;
	}

	.view-more-btn {
		font-size: 13px;
		color: #3b82f6;
		padding: 0 2px;
		display: inline-flex;
		align-items: center;
		height: 24px;
		line-height: 24px;
		font-weight: 500;

		&:hover {
			color: #1d4ed8;
		}

		:deep(.anticon) {
			font-size: 11px;
			margin-left: 2px;
		}
	}

	.clickable-tag {
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			opacity: 0.85;
			transform: translateY(-1px);
		}
	}

	.todo-list-item {
		padding: 12px 14px;
		border-radius: 10px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		margin-bottom: 4px;
		border-bottom: 1px solid #f8fafc;

		&:hover {
			background: #f8fafc; /* Tailwind bg-slate-50 */
		}

		.todo-meta-wrap {
			display: flex;
			align-items: center;
			gap: 14px;
			width: 100%;
			min-width: 0;

			.priority-tag {
				width: 50px;
				height: 24px;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				text-align: center;
				flex-shrink: 0;
				margin: 0;
				font-size: 12px;
				font-weight: 600;
				border-radius: 6px;
				padding: 0;
			}

			.todo-text-wrap {
				flex: 1;
				min-width: 0;

				.todo-title {
					font-size: 13px;
					font-weight: 600;
					color: #0f172a; /* Tailwind slate-900 */
					line-height: 1.4;
					margin-bottom: 3px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;

					.event-name {
						color: #0f172a;
					}

					.event-host {
						color: #475569;
						margin-left: 2px;
						font-weight: 500;
					}
				}

				.todo-time-row {
					display: flex;
					align-items: center;
					gap: 6px;
					font-size: 12px;
					color: #64748b; /* Tailwind slate-500 */
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;

					.dot-col {
						color: #cbd5e1;
					}

					.amount-col {
						font-weight: 600;
					}
				}

				.todo-time {
					font-size: 12px;
					color: #94a3b8; /* Tailwind slate-400 */
					font-weight: 400;
				}
			}
		}
	}
}
</style>
