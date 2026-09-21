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
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f0f0f0;
		font-weight: 600;
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
			padding: 10px 12px;
			background: #fbfcfe;
			border: 1px solid #f0f2f6;
			border-radius: 8px;
			transition: all 0.2s ease;

			&:hover {
				background: #ffffff;
				border-color: #d6e4ff;
				.del-btn {
					opacity: 1;
				}
			}

			&.completed {
				background: #f5f5f5;
				border-color: #e8e8e8;

				.todo-text {
					text-decoration: line-through;
					color: #8c8c8c;
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
					color: #262626;
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
					font-size: 11px;
					color: #8c8c8c;
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
