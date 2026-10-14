<template>
	<div class="gift-person-profile-view">
		<div class="profile-head">
			<span class="profile-avatar">
				<img
					v-if="profileAvatarUrl"
					class="profile-avatar__img"
					:src="profileAvatarUrl"
					alt=""
				/>
				<template v-else>{{ firstName(profile.person?.personName) }}</template>
			</span>
			<h3>{{ profile.person?.personName || '-' }}</h3>
			<p>
				{{ relationLabel(profile.person?.relationType) }} ·
				{{ profile.person?.phone || '-' }}
			</p>
		</div>

		<div class="profile-metrics">
			<div>
				<span>累计送礼</span>
				<strong class="amount-out">{{
					money(profile.person?.totalGiveAmount)
				}}</strong>
			</div>
			<div>
				<span>累计收礼</span>
				<strong class="amount-in">{{
					money(profile.person?.totalReceiveAmount)
				}}</strong>
			</div>
		</div>

		<a-divider>基本信息</a-divider>
		<a-descriptions :column="1" size="small" bordered>
			<a-descriptions-item label="手机号">
				{{ profile.person?.phone || '-' }}
			</a-descriptions-item>
			<a-descriptions-item label="关系">
				{{ relationLabel(profile.person?.relationType) }}
			</a-descriptions-item>
			<a-descriptions-item label="关系等级">
				<a-tag :color="getGradeColor(profile.person?.relationGrade)">
					{{ getGradeLabel(profile.person?.relationGrade) }}
				</a-tag>
			</a-descriptions-item>
			<a-descriptions-item label="备注">
				{{ profile.person?.remark || '-' }}
			</a-descriptions-item>
		</a-descriptions>

		<a-divider>往来历史</a-divider>
		<a-list :data-source="profile.records || []" size="small">
			<template #renderItem="{ item }">
				<a-list-item>
					<a-list-item-meta
						:title="`${directionLabel(item.direction)} ${money(item.amount)}`"
						:description="`${formatDate(item.payTime) || '-'} ${item.remark || ''}`"
					/>
				</a-list-item>
			</template>
		</a-list>
	</div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/dayjs';
import {
	directionLabel,
	money,
	personAvatarSrc,
	type GiftPersonProfile,
} from '@/views/finance/gift/config';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';

const props = defineProps<{
	profile: GiftPersonProfile;
}>();

const { relationLabel } = useGiftRelationOptions();

const profileAvatarUrl = computed(() => {
	return personAvatarSrc(props.profile?.person);
});

const firstName = (name?: string) => {
	return name?.trim()?.slice(0, 1) || '友';
};

const getGradeLabel = (grade?: string) => {
	switch (grade) {
		case 'CORE':
			return '⭐ 核心关系';
		case 'IMPORTANT':
			return '🟢 重要关系';
		case 'NORMAL':
			return '🔵 普通关系';
		case 'WEAK':
			return '⚪ 弱关系';
		default:
			return grade || '普通关系';
	}
};

const getGradeColor = (grade?: string) => {
	switch (grade) {
		case 'CORE':
			return 'gold';
		case 'IMPORTANT':
			return 'green';
		case 'NORMAL':
			return 'blue';
		case 'WEAK':
			return 'default';
		default:
			return 'blue';
	}
};
</script>

<style scoped lang="less">
.profile-head {
	text-align: center;

	h3 {
		margin: 12px 0 4px;
		font-size: 18px;
	}

	p {
		margin: 0;
		color: #667085;
	}
}

.profile-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 88px;
	height: 88px;
	border-radius: 50%;
	overflow: hidden;
	background: #eff6ff;
	color: #2563eb;
	font-size: 32px;
	font-weight: 800;
}

.profile-avatar__img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.profile-metrics {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px;
	margin-top: 18px;

	div {
		padding: 14px;
		background: #f8fafc;
		border-radius: 7px;
	}

	span {
		display: block;
		margin-bottom: 8px;
		color: #667085;
		font-size: 12px;
	}
}

.amount-in {
	color: #16a34a;
	font-size: 20px;
}

.amount-out {
	color: #dc2626;
	font-size: 20px;
}
</style>
