<template>
	<a-card
		title="我的待办与日程提醒"
		:bordered="false"
		class="personal-todo-card"
		data-testid="dash-user-todo-card"
	>
		<template #extra>
			<a-tag color="blue" data-testid="dash-user-pending-count">
				待完成: {{ activeTodoCount }}
			</a-tag>
		</template>

		<!-- 快速新增待办 -->
		<div class="add-todo-bar">
			<a-input
				v-model:value="newTodoText"
				placeholder="记录一件新的待办事项或赴宴提醒..."
				data-testid="dash-user-new-todo-input"
				@press-enter="handleAddTodo"
			>
				<template #suffix>
					<a-button
						type="primary"
						size="small"
						data-testid="dash-user-add-todo-btn"
						@click="handleAddTodo"
					>
						添加
					</a-button>
				</template>
			</a-input>
		</div>

		<!-- 待办清单 -->
		<div class="todo-item-list" data-testid="dash-user-todo-list">
			<div
				v-for="item in todoItems"
				:key="item.id"
				class="todo-row"
				:class="{ completed: item.done }"
				:data-testid="`dash-user-todo-item-${item.id}`"
			>
				<div class="todo-check-line">
					<a-checkbox
						v-model:checked="item.done"
						:data-testid="`dash-user-todo-check-${item.id}`"
						@change="handleStatusChange(item)"
					/>
					<span class="todo-text">{{ item.text }}</span>
				</div>
				<div class="todo-meta">
					<a-tag v-if="item.tag" :color="item.tagColor" size="small">{{ item.tag }}</a-tag>
					<span class="todo-due-date">{{ item.dueDate }}</span>
					<a-button
						type="text"
						danger
						size="small"
						class="del-btn"
						:data-testid="`dash-user-todo-del-${item.id}`"
						@click="handleDelete(item.id)"
					>
						<template #icon><delete-outlined /></template>
					</a-button>
				</div>
			</div>
		</div>
	</a-card>
</template>

<script setup lang="ts">
import { DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface TodoItem {
	id: string;
	text: string;
	done: boolean;
	dueDate: string;
	tag?: string;
	tagColor?: string;
}

const newTodoText = ref('');

const todoItems = ref<TodoItem[]>([
	{
		id: '1',
		text: '参加表哥婚礼答谢宴并送礼金 ¥1,000',
		done: false,
		dueDate: '本周六 12:00',
		tag: '礼尚往来',
		tagColor: 'volcano',
	},
	{
		id: '2',
		text: '核对上周末李总乔迁之喜随礼回单',
		done: false,
		dueDate: '今天下午',
		tag: '人情档案',
		tagColor: 'cyan',
	},
	{
		id: '3',
		text: '关注今晚 20:00 热门秒杀活动预热',
		done: false,
		dueDate: '今晚 20:00',
		tag: '爆款秒杀',
		tagColor: 'orange',
	},
	{
		id: '4',
		text: '修改并强化个人账户登录密码',
		done: true,
		dueDate: '已完成',
		tag: '账户安全',
		tagColor: 'green',
	},
]);

const activeTodoCount = computed(
	() => todoItems.value.filter((item) => !item.done).length,
);

const handleAddTodo = () => {
	const trimmed = newTodoText.value.trim();
	if (!trimmed) {
		message.warning('请输入待办内容！');
		return;
	}
	todoItems.value.unshift({
		id: String(Date.now()),
		text: trimmed,
		done: false,
		dueDate: '近期',
		tag: '日常待办',
		tagColor: 'blue',
	});
	newTodoText.value = '';
	message.success('成功添加待办事项！');
};

const handleStatusChange = (item: TodoItem) => {
	if (item.done) {
		message.success(`已完成：${item.text}`);
	}
};

const handleDelete = (id: string) => {
	todoItems.value = todoItems.value.filter((i) => i.id !== id);
	message.success('已删除待办项');
};
</script>

<style scoped lang="scss">
.personal-todo-card {
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

	.add-todo-bar {
		margin-bottom: 16px;
	}

	.todo-item-list {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.todo-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 14px;
			background: #f8fafc; /* Tailwind bg-slate-50 */
			border: 1px solid #f1f5f9;
			border-radius: 12px; /* Tailwind rounded-xl */
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

			&:hover {
				background: #ffffff;
				border-color: #bfdbfe; /* Tailwind border-blue-200 */
				box-shadow: 0 4px 12px rgba(37, 99, 235, 0.06);

				.del-btn {
					opacity: 1;
				}
			}

			&.completed {
				background: #f8fafc;
				border-color: #f1f5f9;
				opacity: 0.65;

				.todo-text {
					text-decoration: line-through;
					color: #94a3b8;
				}
			}

			.todo-check-line {
				display: flex;
				align-items: center;
				gap: 10px;
				flex: 1;
				min-width: 0;

				.todo-text {
					font-size: 13px;
					font-weight: 500;
					color: #0f172a; /* Tailwind slate-900 */
					word-break: break-all;
				}
			}

			.todo-meta {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-shrink: 0;
				margin-left: 8px;

				.todo-due-date {
					font-size: 12px;
					color: #94a3b8;
				}

				.del-btn {
					opacity: 0.3;
					transition: opacity 0.2s ease;
				}
			}
		}
	}
}
</style>
