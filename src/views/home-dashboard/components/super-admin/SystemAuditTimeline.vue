<template>
	<a-card
		title="高风险操作与安全审计流"
		:bordered="false"
		class="audit-timeline-card"
		data-testid="dash-super-audit-card"
	>
		<template #extra>
			<a-button
				type="link"
				size="small"
				data-testid="dash-super-more-logs-btn"
				@click="handleViewAllLogs"
			>
				查看全量日志
				<right-outlined />
			</a-button>
		</template>

		<a-timeline class="audit-timeline" data-testid="dash-super-audit-timeline">
			<a-timeline-item
				v-for="item in auditEvents"
				:key="item.id"
				:color="item.color || item.tagColor"
			>
				<div class="audit-item-content">
					<div class="audit-title-line">
						<span class="audit-actor">{{ item.operator }}</span>
						<span class="audit-action">{{ item.title }}</span>
						<a-tag :color="item.tagColor" size="small">{{ item.tag }}</a-tag>
					</div>
					<div class="audit-detail">{{ item.description }}</div>
					<div class="audit-time">{{ item.operateTime }}</div>
				</div>
			</a-timeline-item>
		</a-timeline>
	</a-card>
</template>

<script setup lang="ts">
import {
	getSystemAuditTimeline,
	type SystemAuditLogData,
} from '@/views/home-dashboard/api';
import { RightOutlined } from '@ant-design/icons-vue';

const router = useRouter();

interface DisplayAuditItem extends SystemAuditLogData {
	color?: string;
}

const defaultEvents: DisplayAuditItem[] = [
	{
		id: 'evt-101',
		operator: 'super_admin',
		title: '更新系统数据权限策略',
		tag: 'RBAC授权',
		tagColor: 'purple',
		color: 'purple',
		description: '调整 org_admin 机构行级隔离 AST 语法树解析缓存时长至 3600s',
		operateTime: '12分钟前',
	},
	{
		id: 'evt-102',
		operator: 'super_admin',
		title: 'Nacos 服务配置热更新',
		tag: '服务治理',
		tagColor: 'blue',
		color: 'blue',
		description: '推送 alex-finance-dev 限流规则与 DeepSeek AI 降级熔断阈值',
		operateTime: '45分钟前',
	},
	{
		id: 'evt-103',
		operator: 'system_daemon',
		title: 'Redis 共享菜单缓存预热',
		tag: '内存缓存',
		tagColor: 'green',
		color: 'green',
		description: '完成全局全量共享菜单树 LoginKey:login:in:menu_all_tree 异步重建',
		operateTime: '2小时前',
	},
	{
		id: 'evt-104',
		operator: 'security_guard',
		title: '拦截异常越权请求',
		tag: '安全告警',
		tagColor: 'red',
		color: 'red',
		description: '拦截到跨机构访问 gift_record_info_t 异常 SQL 参数，触发防重入告警',
		operateTime: '5小时前',
	},
];

const auditEvents = ref<DisplayAuditItem[]>([...defaultEvents]);

const fetchAuditTimeline = async () => {
	try {
		const { code, data } = await getSystemAuditTimeline();
		if ((code === '200' || code === '00000') && Array.isArray(data) && data.length > 0) {
			auditEvents.value = data.map((d) => ({
				...d,
				color: d.tagColor || 'blue',
			}));
		}
	} catch (e) {
		console.warn('获取系统审计时间线异常，保持默认安全展示', e);
	}
};

onMounted(() => {
	void fetchAuditTimeline();
});

const handleViewAllLogs = () => {
	router.push('/system/logManager');
};
</script>

<style scoped lang="scss">
.audit-timeline-card {
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

	.audit-timeline {
		padding: 12px 8px 0 8px;

		.audit-item-content {
			.audit-title-line {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 4px;

				.audit-actor {
					font-weight: 700;
					color: #0f172a;
					font-size: 13px;
				}

				.audit-action {
					color: #334155;
					font-size: 13px;
				}
			}

			.audit-detail {
				font-size: 12px;
				color: #64748b;
				margin-bottom: 4px;
				line-height: 1.5;
			}

			.audit-time {
				font-size: 11px;
				color: #94a3b8;
			}
		}
	}
}
</style>
