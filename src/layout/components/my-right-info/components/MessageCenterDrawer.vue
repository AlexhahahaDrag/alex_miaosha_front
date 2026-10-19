<template>
	<a-drawer
		v-model:open="drawerVisible"
		title="消息与到期提醒中心"
		placement="right"
		:width="460"
		class="message-center-drawer"
		data-testid="pc-message-drawer"
	>
		<template #extra>
			<a-space :size="8">
				<a-button
					size="small"
					type="primary"
					ghost
					:disabled="summary.unreadTotal <= 0"
					data-testid="pc-message-btn-read-all"
					@click="handleMarkAllRead"
				>
					<template #icon><check-outlined /></template>
					全部已读
				</a-button>
				<a-button
					size="small"
					type="primary"
					data-testid="pc-message-btn-publish"
					@click="openPublishModal"
				>
					<template #icon><plus-outlined /></template>
					新增提醒
				</a-button>
			</a-space>
		</template>

		<!-- 分类标签栏 -->
		<div class="drawer-filter-header">
			<a-tabs
				v-model:activeKey="activeTab"
				size="small"
				@change="handleTabChange"
			>
				<a-tab-pane
					v-for="tab in MESSAGE_CATEGORY_TABS"
					:key="tab.key"
				>
					<template #tab>
						<span :data-testid="`pc-message-tab-${tab.key}`">
							{{ tab.label }}
							<a-badge
								v-if="getTabUnread(tab.summaryField) > 0"
								:count="getTabUnread(tab.summaryField)"
								:number-style="{
									backgroundColor: '#ff4d4f',
									fontSize: '11px',
									marginLeft: '4px',
								}"
							/>
						</span>
					</template>
				</a-tab-pane>
			</a-tabs>

			<div class="search-and-unread-row">
				<a-input-search
					v-model:value="keyword"
					placeholder="搜索事件、消费券或猫超卡名称..."
					allow-clear
					size="small"
					class="search-input"
					@search="handleSearch"
				/>
				<a-checkbox
					v-model:checked="onlyUnread"
					data-testid="pc-message-checkbox-unread"
					@change="handleSearch"
				>
					仅看未读
				</a-checkbox>
			</div>
		</div>

		<!-- 消息列表 -->
		<a-spin :spinning="loading">
			<div
				v-if="messageList.length > 0"
				class="message-items-wrap"
				data-testid="pc-message-list"
			>
				<div
					v-for="item in messageList"
					:key="item.id"
					class="message-item-card"
					:class="{
						'is-unread': item.readStatus === 0,
						'is-high': item.priority === 'HIGH',
					}"
					:data-testid="`pc-message-item-${item.id}`"
				>
					<div class="item-top-row">
						<div class="tag-and-title">
							<a-tag
								:color="resolvePcMessageTagMeta(item).color"
								class="msg-tag"
							>
								{{ resolvePcMessageTagMeta(item).text }}
							</a-tag>
							<span
								v-if="item.readStatus === 0"
								class="unread-badge-dot"
							></span>
							<span class="item-title">{{ item.title }}</span>
						</div>
					</div>

					<p class="item-content">{{ item.content }}</p>

					<div class="item-footer-row">
						<span class="item-time">
							提醒日期：{{ item.remindDate || item.createTime || '--' }}
						</span>
						<a-space :size="6">
							<a-button
								v-if="resolvePcMessageJumpRoute(item)"
								type="link"
								size="small"
								:data-testid="`pc-message-jump-${item.id}`"
								@click="handleJumpToBiz(item)"
							>
								去处理 <right-outlined />
							</a-button>
							<a-button
								v-if="item.readStatus === 0"
								type="text"
								size="small"
								:data-testid="`pc-message-read-${item.id}`"
								@click="handleMarkSingleRead(item)"
							>
								标为已读
							</a-button>
							<a-popconfirm
								title="确定删除这条提醒消息吗？"
								ok-text="删除"
								cancel-text="取消"
								@confirm="handleDeleteItem(item)"
							>
								<a-button
									type="text"
									danger
									size="small"
									:data-testid="`pc-message-delete-${item.id}`"
								>
									删除
								</a-button>
							</a-popconfirm>
						</a-space>
					</div>
				</div>

				<div class="pagination-row">
					<a-pagination
						v-model:current="pageNum"
						:page-size="pageSize"
						:total="total"
						size="small"
						show-less-items
						@change="handlePageChange"
					/>
				</div>
			</div>

			<a-empty
				v-else
				:description="onlyUnread ? '当前没有未读消息提醒' : '暂无消息与到期提醒'"
				data-testid="pc-message-empty"
				style="margin-top: 64px"
			/>
		</a-spin>

		<!-- 发布自定义提醒弹窗 -->
		<a-modal
			v-model:open="publishModalVisible"
			title="新增系统提醒 / 备忘通知"
			ok-text="立即发布"
			cancel-text="取消"
			:confirm-loading="publishing"
			:width="440"
			destroy-on-close
			@ok="handlePublishSubmit"
		>
			<a-form
				layout="vertical"
				style="margin-top: 12px"
			>
				<a-form-item
					label="提醒标题"
					required
				>
					<a-input
						v-model:value="publishForm.title"
						placeholder="例如：本周末盘点猫超卡与消费券余额"
						:maxlength="80"
						show-count
						data-testid="pc-message-input-title"
					/>
				</a-form-item>
				<a-form-item
					label="提醒内容"
					required
				>
					<a-textarea
						v-model:value="publishForm.content"
						placeholder="请输入详细提醒事项描述..."
						:rows="3"
						:maxlength="500"
						show-count
						data-testid="pc-message-input-content"
					/>
				</a-form-item>
				<a-form-item label="重要程度">
					<a-radio-group v-model:value="publishForm.priority">
						<a-radio-button value="NORMAL">普通通知</a-radio-button>
						<a-radio-button value="MEDIUM">重要提醒</a-radio-button>
						<a-radio-button value="HIGH">紧急预警</a-radio-button>
					</a-radio-group>
				</a-form-item>
			</a-form>
		</a-modal>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	CheckOutlined,
	PlusOutlined,
	RightOutlined,
} from '@ant-design/icons-vue';
import {
	deleteSysMessages,
	getSysMessagePage,
	getSysMessageSummary,
	markAllSysMessageRead,
	markSysMessageRead,
	publishSysMessage,
} from '@/views/message/api';
import {
	MESSAGE_CATEGORY_TABS,
	resolvePcMessageJumpRoute,
	resolvePcMessageTagMeta,
	type MessagePriority,
	type MessageType,
	type SysMessageInfoData,
	type SysMessageSummaryData,
} from '@/views/message/config';

const props = defineProps<{
	open: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void;
	(e: 'summary-change', summary: SysMessageSummaryData): void;
}>();

const router = useRouter();

const drawerVisible = computed({
	get: () => props.open,
	set: (val: boolean) => emit('update:open', val),
});

const activeTab = ref<MessageType>('ALL');
const keyword = ref<string>('');
const onlyUnread = ref<boolean>(false);

const loading = ref<boolean>(false);
const messageList = ref<SysMessageInfoData[]>([]);
const pageNum = ref<number>(1);
const pageSize = 10;
const total = ref<number>(0);

const summary = ref<SysMessageSummaryData>({
	unreadTotal: 0,
	systemUnread: 0,
	giftEventUnread: 0,
	couponExpireUnread: 0,
	cardExpireUnread: 0,
});

const publishModalVisible = ref<boolean>(false);
const publishing = ref<boolean>(false);
const publishForm = ref<{
	title: string;
	content: string;
	priority: MessagePriority;
}>({
	title: '',
	content: '',
	priority: 'NORMAL',
});

const getTabUnread = (field?: keyof SysMessageSummaryData): number => {
	if (!field) return 0;
	return Number(summary.value[field] || 0);
};

const loadSummary = async () => {
	try {
		const { code, data } = await getSysMessageSummary();
		if (code === '200' && data) {
			summary.value = {
				unreadTotal: Number(data.unreadTotal || 0),
				systemUnread: Number(data.systemUnread || 0),
				giftEventUnread: Number(data.giftEventUnread || 0),
				couponExpireUnread: Number(data.couponExpireUnread || 0),
				cardExpireUnread: Number(data.cardExpireUnread || 0),
			};
			emit('summary-change', summary.value);
		}
	} catch (error) {
		console.error('加载消息统计失败:', error);
	}
};

const loadMessages = async () => {
	loading.value = true;
	try {
		const query: Partial<SysMessageInfoData> = {
			msgType: activeTab.value === 'ALL' ? undefined : activeTab.value,
			onlyUnread: onlyUnread.value ? true : undefined,
			keyword: keyword.value.trim() || undefined,
		};
		const { code, data, message: msgText } = await getSysMessagePage(query, pageNum.value, pageSize);
		if (code === '200' && data) {
			messageList.value = data.records || [];
			total.value = Number(data.total || 0);
		} else {
			message.error(msgText || '查询消息列表失败');
		}
	} catch (error) {
		console.error('查询消息列表失败:', error);
	} finally {
		loading.value = false;
	}
};

const refreshAll = async () => {
	await Promise.all([loadSummary(), loadMessages()]);
};

watch(
	() => props.open,
	(opened) => {
		if (opened) {
			pageNum.value = 1;
			refreshAll();
		}
	},
);

const handleTabChange = () => {
	pageNum.value = 1;
	loadMessages();
};

const handleSearch = () => {
	pageNum.value = 1;
	loadMessages();
};

const handlePageChange = (page: number) => {
	pageNum.value = page;
	loadMessages();
};

const handleMarkSingleRead = async (item: SysMessageInfoData) => {
	if (!item.id || item.readStatus === 1) return;
	try {
		const { code, message: msgText } = await markSysMessageRead(item.id);
		if (code === '200') {
			item.readStatus = 1;
			await loadSummary();
			if (onlyUnread.value) {
				await loadMessages();
			}
		} else {
			message.error(msgText || '标记已读失败');
		}
	} catch (error) {
		console.error('标记已读失败:', error);
	}
};

const handleMarkAllRead = async () => {
	try {
		const targetType = activeTab.value === 'ALL' ? undefined : activeTab.value;
		const { code, message: msgText } = await markAllSysMessageRead(targetType);
		if (code === '200') {
			message.success('已全部标为已读');
			await refreshAll();
		} else {
			message.error(msgText || '操作失败');
		}
	} catch (error) {
		console.error('全部标为已读失败:', error);
	}
};

const handleDeleteItem = async (item: SysMessageInfoData) => {
	if (!item.id) return;
	try {
		const { code, message: msgText } = await deleteSysMessages(item.id);
		if (code === '200') {
			message.success('已删除');
			await refreshAll();
		} else {
			message.error(msgText || '删除失败');
		}
	} catch (error) {
		console.error('删除消息失败:', error);
	}
};

const handleJumpToBiz = async (item: SysMessageInfoData) => {
	if (item.id && item.readStatus === 0) {
		await handleMarkSingleRead(item);
	}
	const routePath = resolvePcMessageJumpRoute(item);
	if (routePath) {
		drawerVisible.value = false;
		router.push(routePath);
	}
};

const openPublishModal = () => {
	publishForm.value = {
		title: '',
		content: '',
		priority: 'NORMAL',
	};
	publishModalVisible.value = true;
};

const handlePublishSubmit = async () => {
	const title = publishForm.value.title.trim();
	const content = publishForm.value.content.trim();
	if (!title || !content) {
		message.warning('请填写提醒标题和内容');
		return;
	}
	publishing.value = true;
	try {
		const { code, message: msgText } = await publishSysMessage({
			title,
			content,
			priority: publishForm.value.priority,
			msgType: 'SYSTEM',
			subType: 'ANNOUNCE',
		});
		if (code === '200') {
			message.success('发布成功');
			publishModalVisible.value = false;
			pageNum.value = 1;
			await refreshAll();
		} else {
			message.error(msgText || '发布失败');
		}
	} catch (error) {
		console.error('发布提醒失败:', error);
	} finally {
		publishing.value = false;
	}
};

defineExpose({
	loadSummary,
});
</script>

<style lang="scss" scoped>
.drawer-filter-header {
	margin-bottom: 14px;
}

.search-and-unread-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-top: 4px;

	.search-input {
		flex: 1;
	}
}

.message-items-wrap {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.message-item-card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 10px;
	padding: 12px 14px;
	transition: all 0.2s ease;

	&:hover {
		border-color: #cbd5e1;
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
	}

	&.is-unread {
		border-left: 3px solid #1677ff;
		background: #fafcff;
	}

	&.is-unread.is-high {
		border-left-color: #ff4d4f;
	}
}

.item-top-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6px;
}

.tag-and-title {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
}

.msg-tag {
	margin-inline-end: 0;
}

.unread-badge-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: #ff4d4f;
	flex-shrink: 0;
}

.item-title {
	font-size: 14px;
	font-weight: 600;
	color: #1e293b;
}

.item-content {
	margin: 4px 0 8px;
	font-size: 13px;
	color: #475569;
	line-height: 1.55;
}

.item-footer-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 6px;
	border-top: 1px dashed #f1f5f9;
	font-size: 12px;
	color: #94a3b8;
}

.pagination-row {
	display: flex;
	justify-content: flex-end;
	margin-top: 8px;
}
</style>
