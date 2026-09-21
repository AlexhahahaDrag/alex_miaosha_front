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
				v-for="(item, idx) in auditEvents"
				:key="idx"
				:color="item.color"
			>
				<div class="audit-item-content">
					<div class="audit-title-line">
						<span class="audit-actor">{{ item.actor }}</span>
						<span class="audit-action">{{ item.action }}</span>
						<a-tag :color="item.tagColor" size="small">{{ item.tag }}</a-tag>
					</div>
					<div class="audit-detail">{{ item.detail }}</div>
					<div class="audit-time">{{ item.time }}</div>
				</div>
			</a-timeline-item>
		</a-timeline>
	</a-card>
</template>

<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue';

const router = useRouter();

const auditEvents = ref([
	{
		actor: 'super_admin',
		action: '更新系统数据权限策略',
		tag: 'RBAC授权',
		tagColor: 'purple',
		color: 'purple',
		detail: '调整 org_admin 机构行级隔离 AST 语法树解析缓存时长至 3600s',
		time: '12分钟前',
	},
	{
		actor: 'super_admin',
		action: 'Nacos 服务配置热更新',
		tag: '服务治理',
		tagColor: 'blue',
		color: 'blue',
		detail: '推送 alex-finance-dev 限流规则与 DeepSeek AI 降级熔断阈值',
		time: '45分钟前',
	},
	{
		actor: 'system_daemon',
		action: 'Redis 共享菜单缓存预热',
		tag: '内存缓存',
		tagColor: 'green',
		color: 'green',
		detail: '完成全局全量共享菜单树 LoginKey:login:in:menu_all_tree 异步重建',
		time: '2小时前',
	},
	{
		actor: 'security_guard',
		action: '拦截异常越权请求',
		tag: '安全告警',
		tagColor: 'red',
		color: 'red',
		detail: '拦截到跨机构访问 gift_record_info_t 异常 SQL 参数，触发防重入告警',
		time: '5小时前',
	},
]);

const handleViewAllLogs = () => {
	router.push('/user/operate-log');
};
</script>

<style scoped lang="scss">
.audit-timeline-card {
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f0f0f0;
		font-weight: 600;
	}

	.audit-timeline {
		padding-top: 10px;

		:deep(.ant-timeline-item-last) {
			padding-bottom: 0;
		}

		.audit-item-content {
			.audit-title-line {
				display: flex;
				align-items: center;
				gap: 8px;
				flex-wrap: wrap;
				margin-bottom: 4px;

				.audit-actor {
					font-weight: 600;
					color: #262626;
					font-size: 13px;
				}

				.audit-action {
					color: #595959;
					font-size: 13px;
				}
			}

			.audit-detail {
				font-size: 12px;
				color: #8c8c8c;
				line-height: 1.5;
				margin-bottom: 4px;
			}

			.audit-time {
				font-size: 11px;
				color: #bfbfbf;
			}
		}
	}
}
</style>
