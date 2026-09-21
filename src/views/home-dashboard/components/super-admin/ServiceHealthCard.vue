<template>
	<a-card
		title="微服务集群运行健康度"
		:bordered="false"
		class="service-health-card"
		data-testid="dash-super-service-health"
	>
		<template #extra>
			<a-button
				type="link"
				size="small"
				:loading="refreshing"
				data-testid="dash-super-service-refresh-btn"
				@click="handleRefresh"
			>
				<template #icon><sync-outlined :spin="refreshing" /></template>
				刷新探针
			</a-button>
		</template>

		<div class="service-list">
			<div
				v-for="svc in serviceList"
				:key="svc.serviceId"
				class="service-item"
				:data-testid="`dash-service-${svc.serviceId}`"
			>
				<div class="service-meta">
					<div class="service-title-line">
						<span class="status-indicator online"></span>
						<span class="service-name">{{ svc.name }}</span>
						<a-tag color="purple" class="service-port">:{{ svc.port }}</a-tag>
					</div>
					<div class="service-desc">{{ svc.desc }}</div>
				</div>
				<div class="service-perf">
					<span class="latency-text">
						<span class="latency-val">{{ svc.latency }}</span> ms
					</span>
					<a-tag color="success" class="status-tag">NORMAL</a-tag>
				</div>
			</div>
		</div>
	</a-card>
</template>

<script setup lang="ts">
import { MICRO_SERVICES, type MicroServiceNode } from '../../config';
import { SyncOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const serviceList = ref<MicroServiceNode[]>([...MICRO_SERVICES]);
const refreshing = ref(false);

const handleRefresh = () => {
	refreshing.value = true;
	setTimeout(() => {
		// 模拟探针心跳波动
		serviceList.value = serviceList.value.map((s) => ({
			...s,
			latency: Math.floor(Math.random() * 25) + 12,
		}));
		refreshing.value = false;
		message.success('微服务集群心跳探测正常，全部节点在线！');
	}, 600);
};
</script>

<style scoped lang="scss">
.service-health-card {
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
	margin-bottom: 20px;

	:deep(.ant-card-head) {
		border-bottom: 1px solid #f0f0f0;
		font-weight: 600;
	}

	.service-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.service-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: #fbfcfe;
		border: 1px solid #f0f2f6;
		border-radius: 8px;
		transition: all 0.2s ease;

		&:hover {
			background: #ffffff;
			border-color: #d6e4ff;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		}

		.service-meta {
			.service-title-line {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 4px;

				.service-name {
					font-size: 14px;
					font-weight: 600;
					color: #262626;
				}

				.service-port {
					font-size: 12px;
					padding: 0 6px;
					font-family: monospace;
				}
			}

			.service-desc {
				font-size: 12px;
				color: #8c8c8c;
			}
		}

		.service-perf {
			display: flex;
			align-items: center;
			gap: 12px;

			.latency-text {
				font-size: 12px;
				color: #8c8c8c;

				.latency-val {
					font-weight: 600;
					color: #52c41a;
				}
			}

			.status-tag {
				font-size: 11px;
				font-weight: bold;
				margin: 0;
			}
		}
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;

		&.online {
			background: #52c41a;
			box-shadow: 0 0 8px rgba(82, 196, 26, 0.6);
		}
	}
}
</style>
