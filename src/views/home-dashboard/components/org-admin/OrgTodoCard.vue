<template>
	<a-card
		:title="isFamilyContext ? '家庭待办与人情提醒' : '机构待办与审核事项'"
		:bordered="false"
		class="org-todo-card"
		data-testid="dash-org-todo-card"
	>
		<template #extra>
			<a-tag :color="pendingCount > 0 ? 'orange' : 'green'" data-testid="dash-org-todo-pending-count">
				待处理: {{ pendingCount }}
			</a-tag>
		</template>

		<a-empty
			v-if="todoList.length === 0"
			description="暂无待处理人情还礼事项，往来井然有序"
			style="padding: 20px 0"
		/>
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
							{{ item.priority === 'high' ? '待还礼' : '常规' }}
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
import { getGiftRecordPage } from '@/views/finance/gift/api';

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

const loadTodos = async () => {
	if (props.isFamilyContext) {
		try {
			const { code, data } = await getGiftRecordPage(
				{ returnStatus: '0', direction: 'RECEIVE' },
				1,
				5,
			);
			if (code === '200' && data?.records) {
				if (data.records.length > 0) {
					todoList.value = data.records.map((r: any) => ({
						id: String(r.id),
						title: `【待还礼】${r.personName || r.giverPersonName || '亲友'} 在「${r.eventName || '宴席礼'}」随礼 ¥${Number(r.amount || 0).toLocaleString()}`,
						priority: 'high',
						time: r.payTime ? String(r.payTime).split(' ')[0] : '待还礼',
						actionName: '去还礼',
					}));
				} else {
					todoList.value = [];
				}
			}
		} catch (err) {
			console.error('加载待还礼提醒异常：', err);
		}
	} else {
		todoList.value = [...defaultOrgTodos];
	}
};

const pendingCount = computed(() => todoList.value.length);

const handleAction = async (item: OrgTodoItem) => {
	if (props.isFamilyContext) {
		await router.push('/finance/gift/record');
	} else {
		message.success(`已处理待办事项：${item.title}`);
		todoList.value = todoList.value.filter((t) => t.id !== item.id);
	}
};

watch(
	() => props.isFamilyContext,
	() => {
		void loadTodos();
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
			align-items: flex-start;
			gap: 10px;

			.priority-tag {
				margin-top: 2px;
				font-size: 11px;
				border-radius: 9999px; /* Tailwind rounded-full */
				font-weight: 500;
				padding: 0 8px;
			}

			.todo-text-wrap {
				.todo-title {
					font-size: 13px;
					font-weight: 600;
					color: #0f172a; /* Tailwind slate-900 */
					line-height: 1.4;
					margin-bottom: 2px;
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
