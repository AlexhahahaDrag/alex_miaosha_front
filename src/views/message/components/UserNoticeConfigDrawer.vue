<template>
	<a-drawer
		v-model:open="drawerVisible"
		title="消息推送渠道偏好"
		placement="right"
		:width="560"
		class="user-notice-config-drawer"
		data-testid="pc-user-notice-config-drawer"
	>
		<template #extra>
			<a-button
				size="small"
				data-testid="pc-notice-config-btn-refresh"
				:loading="loading"
				@click="loadConfigs"
			>
				<template #icon><reload-outlined /></template>
				刷新
			</a-button>
		</template>

		<!-- 顶部说明卡片 -->
		<div class="mb-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
			<info-circle-outlined class="mt-0.5 text-sm text-blue-500" />
			<div class="leading-relaxed">
				<span class="font-semibold">默认全量放行：</span>
				每个业务默认在站内信与微信服务号双渠道发送。开关切换后即时生效；<span class="underline decoration-blue-400 font-medium">全局总控具备一票否决权</span>，总控关闭后对应子项将静音。
			</div>
		</div>

		<a-spin :spinning="loading">
			<div class="space-y-4">
				<!-- 全局总控卡片 (GLOBAL) -->
				<div
					v-if="globalConfig"
					class="relative overflow-hidden rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 p-4 shadow-sm dark:border-blue-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40"
					data-testid="notice-config-global-card"
				>
					<div class="flex items-center justify-between pb-3 border-b border-blue-100/70 dark:border-slate-800">
						<div class="flex items-center gap-2.5">
							<span class="text-xl">⚡</span>
							<div>
								<div class="flex items-center gap-2">
									<h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">
										{{ globalConfig.noticeName || '全局通知总控' }}
									</h4>
									<span class="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-xs">
										一票否决
									</span>
								</div>
								<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
									{{ globalConfig.noticeDesc || '关闭后将静音所有业务通知' }}
								</p>
							</div>
						</div>
					</div>

					<div class="mt-3.5 grid grid-cols-2 gap-3">
						<!-- 全局站内信 -->
						<div class="flex items-center justify-between rounded-xl bg-white/80 p-2.5 px-3 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-700">
							<span class="text-xs font-medium text-slate-700 dark:text-slate-200">
								站内信总开关
							</span>
							<a-switch
								v-model:checked="globalConfig.internalEnabled"
								size="small"
								:loading="savingCode === 'GLOBAL_INTERNAL'"
								data-testid="switch-internal-GLOBAL"
								@change="(checked: boolean) => handleToggle(globalConfig!, 'internal', checked)"
							/>
						</div>

						<!-- 全局微信推送 -->
						<div class="flex items-center justify-between rounded-xl bg-white/80 p-2.5 px-3 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-700">
							<span class="text-xs font-medium text-slate-700 dark:text-slate-200">
								微信模板消息总开关
							</span>
							<a-switch
								v-model:checked="globalConfig.wechatEnabled"
								size="small"
								:loading="savingCode === 'GLOBAL_WECHAT'"
								data-testid="switch-wechat-GLOBAL"
								@change="(checked: boolean) => handleToggle(globalConfig!, 'wechat', checked)"
							/>
						</div>
					</div>
				</div>

				<!-- 业务分类独立开关列表 -->
				<div>
					<div class="mb-2.5 flex items-center justify-between px-1">
						<span class="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							各业务分类精细化偏好 ({{ childConfigs.length }}项)
						</span>
						<span class="text-[11px] text-slate-400 dark:text-slate-500">
							各子项独立控制
						</span>
					</div>

					<div class="space-y-2.5" data-testid="notice-config-list">
						<div
							v-for="item in childConfigs"
							:key="item.noticeCode"
							class="rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-blue-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
							:data-testid="`notice-item-${item.noticeCode}`"
						>
							<!-- 业务头部 -->
							<div class="flex items-start gap-2.5">
								<span class="text-lg">
									{{ getMeta(item.noticeCode).icon }}
								</span>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2">
										<h5 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
											{{ item.noticeName }}
										</h5>
										<span
											class="inline-block rounded px-1.5 py-0.2 text-[10px] font-medium"
											:class="getMeta(item.noticeCode).badgeClass"
										>
											{{ item.noticeCode }}
										</span>
									</div>
									<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
										{{ item.noticeDesc }}
									</p>
								</div>
							</div>

							<!-- 双渠道切换操作栏 -->
							<div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
								<!-- 站内信开关 -->
								<div class="flex items-center gap-2">
									<span class="text-xs text-slate-600 dark:text-slate-300">
										站内信
									</span>
									<a-tooltip
										v-if="!isGlobalInternalActive"
										title="全局站内信总控已关闭，一票否决生效中"
									>
										<span class="inline-block cursor-not-allowed">
											<a-switch
												:checked="false"
												size="small"
												disabled
												:data-testid="`switch-internal-${item.noticeCode}`"
											/>
										</span>
									</a-tooltip>
									<a-switch
										v-else
										v-model:checked="item.internalEnabled"
										size="small"
										:loading="savingCode === `${item.noticeCode}_INTERNAL`"
										:data-testid="`switch-internal-${item.noticeCode}`"
										@change="(checked: boolean) => handleToggle(item, 'internal', checked)"
									/>
								</div>

								<!-- 微信服务号模板消息开关 -->
								<div class="flex items-center gap-2">
									<span class="text-xs text-slate-600 dark:text-slate-300">
										微信推送
									</span>
									<a-tooltip
										v-if="!isGlobalWechatActive"
										title="全局微信推送总控已关闭，一票否决生效中"
									>
										<span class="inline-block cursor-not-allowed">
											<a-switch
												:checked="false"
												size="small"
												disabled
												:data-testid="`switch-wechat-${item.noticeCode}`"
											/>
										</span>
									</a-tooltip>
									<a-switch
										v-else
										v-model:checked="item.wechatEnabled"
										size="small"
										:loading="savingCode === `${item.noticeCode}_WECHAT`"
										:data-testid="`switch-wechat-${item.noticeCode}`"
										@change="(checked: boolean) => handleToggle(item, 'wechat', checked)"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</a-spin>

		<template #footer>
			<div class="flex items-center justify-between">
				<span class="text-xs text-slate-400 dark:text-slate-500">
					✓ 配置变动已自动实时同步至云端
				</span>
				<a-button @click="drawerVisible = false">
					完成并关闭
				</a-button>
			</div>
		</template>
	</a-drawer>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import {
	InfoCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons-vue';
import {
	getMyNoticeConfigs,
	saveMyNoticeConfig,
} from '@/views/message/api';
import {
	NOTICE_BIZ_META_MAP,
	type NoticeBizMeta,
	type UserNoticeConfigData,
} from '@/views/message/config';

interface Props {
	open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	(e: 'update:open', val: boolean): void;
}>();

const drawerVisible = computed({
	get: () => props.open,
	set: (val: boolean) => emit('update:open', val),
});

const loading = ref<boolean>(false);
const savingCode = ref<string | null>(null);
const allConfigs = ref<UserNoticeConfigData[]>([]);

const globalConfig = computed<UserNoticeConfigData | undefined>(() =>
	allConfigs.value.find((c) => c.noticeCode === 'GLOBAL'),
);

const childConfigs = computed<UserNoticeConfigData[]>(() =>
	allConfigs.value.filter((c) => c.noticeCode !== 'GLOBAL'),
);

const isGlobalInternalActive = computed<boolean>(() =>
	Boolean(globalConfig.value?.internalEnabled),
);

const isGlobalWechatActive = computed<boolean>(() =>
	Boolean(globalConfig.value?.wechatEnabled),
);

const getMeta = (noticeCode: string): NoticeBizMeta => {
	return (
		NOTICE_BIZ_META_MAP[noticeCode] || {
			code: noticeCode,
			icon: '📌',
			badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
			color: 'slate',
		}
	);
};

const loadConfigs = async () => {
	loading.value = true;
	try {
		const { code, data, message: msg } = await getMyNoticeConfigs();
		if (code === '00000' && Array.isArray(data)) {
			allConfigs.value = data;
		} else {
			message.error(msg || '加载通知配置失败');
		}
	} catch (err: unknown) {
		message.error('网络异常，获取通知设置失败');
	} finally {
		loading.value = false;
	}
};

const handleToggle = async (
	item: UserNoticeConfigData,
	channel: 'internal' | 'wechat',
	checked: boolean,
) => {
	const saveKey = `${item.noticeCode}_${channel.toUpperCase()}`;
	savingCode.value = saveKey;

	const previousInternal = item.internalEnabled;
	const previousWechat = item.wechatEnabled;

	// 乐观更新
	if (channel === 'internal') {
		item.internalEnabled = checked;
	} else {
		item.wechatEnabled = checked;
	}

	try {
		const { code, message: msg } = await saveMyNoticeConfig({
			noticeCode: item.noticeCode,
			internalEnabled: item.internalEnabled,
			wechatEnabled: item.wechatEnabled,
		});

		if (code === '00000') {
			message.success(`${item.noticeName || item.noticeCode} 配置已更新`);
		} else {
			// 回滚
			if (channel === 'internal') {
				item.internalEnabled = previousInternal;
			} else {
				item.wechatEnabled = previousWechat;
			}
			message.error(msg || '更新通知配置失败');
		}
	} catch (err: unknown) {
		// 回滚
		if (channel === 'internal') {
			item.internalEnabled = previousInternal;
		} else {
			item.wechatEnabled = previousWechat;
		}
		message.error('网络请求异常，保存配置失败');
	} finally {
		savingCode.value = null;
	}
};

watch(
	() => props.open,
	(val) => {
		if (val && allConfigs.value.length === 0) {
			loadConfigs();
		}
	},
	{ immediate: true },
);
</script>

<style scoped>
/* 纯 Tailwind CSS 构建，无需任何多余 scoped css */
</style>
