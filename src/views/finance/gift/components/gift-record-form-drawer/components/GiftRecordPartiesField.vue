<template>
	<div class="gift-record-parties">
		<!-- 往来对象 (送给谁/来自谁) -->
		<a-form-item
			:label="direction === 'GIVE' ? '送给谁' : '来自谁'"
			:name="direction === 'GIVE' ? 'receiverPersonId' : 'giverPersonId'"
			:rules="contactRules"
		>
			<gift-contact-picker
				v-model:model-value="externalPersonIdModel"
				test-id="gift-record-form-receiver"
			/>

			<!-- 最近往来联系人快捷 Tag -->
			<div v-if="(recentContacts?.length ?? 0) > 0" class="recent-contacts-tags">
				<span class="label-text">最近往来:</span>
				<a-tag
					v-for="c in recentContacts"
					:key="c.id"
					class="contact-quick-tag"
					:color="
						String(externalPersonIdModel) === String(c.id) ? 'blue' : 'default'
					"
					@click="externalPersonIdModel = c.id"
				>
					{{ c.name }}
				</a-tag>
			</div>

			<!-- 选中联系人背景详情 -->
			<div v-if="selectedContactDetail" class="contact-detail-tip">
				💡 关系:
				<strong style="color: #1890ff">{{
					relationLabel(selectedContactDetail.relationType)
				}}</strong>
				· 历史往来:
				<strong>{{ selectedContactDetail.recordCount || 0 }}次</strong> · 累计收到:
				<strong style="color: #389e0d"
					>¥{{ selectedContactDetail.totalReceiveAmount || 0 }}</strong
				>
				| 累计送出:
				<strong style="color: #cf1322"
					>¥{{ selectedContactDetail.totalGiveAmount || 0 }}</strong
				>
			</div>
		</a-form-item>

		<!-- 经办成员 -->
		<a-form-item
			label="经办成员"
			:name="direction === 'GIVE' ? 'giverPersonId' : 'receiverPersonId'"
			:rules="orgMemberRules"
		>
			<gift-org-member-picker
				v-model:model-value="familyPersonIdModel"
				test-id="gift-record-form-giver"
			/>

			<!-- 经办人快速选择标签 -->
			<div class="family-members-tags" v-if="(familyMembersList?.length ?? 0) > 0">
				<span class="label-text">经办人:</span>
				<a-tag
					v-for="m in familyMembersList"
					:key="m.id"
					class="member-quick-tag"
					:color="
						String(familyPersonIdModel) === String(m.id) ? 'blue' : 'default'
					"
					@click="familyPersonIdModel = m.id"
				>
					{{ getMemberLabel(m) }}
				</a-tag>
			</div>
		</a-form-item>
	</div>
</template>

<script setup lang="ts">
import type { Rule } from 'ant-design-vue/es/form';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';

const externalPersonIdModel = defineModel<string>('externalPersonId');
const familyPersonIdModel = defineModel<string>('familyPersonId');

const props = withDefaults(
	defineProps<{
		direction?: string;
		contactRules?: Rule[];
		orgMemberRules?: Rule[];
		recentContacts?: Array<{ id: string; name: string }>;
		selectedContactDetail?: any | null;
		familyMembersList?: Array<{ id: string; name: string }>;
		selfPersonId?: string;
	}>(),
	{
		direction: 'GIVE',
		contactRules: () => [],
		orgMemberRules: () => [],
		recentContacts: () => [],
		selectedContactDetail: null,
		familyMembersList: () => [],
		selfPersonId: '',
	},
);

const { relationLabel } = useGiftRelationOptions();

const getMemberLabel = (member: { id: string; name: string }) => {
	if (props.selfPersonId && String(member.id) === String(props.selfPersonId)) {
		return `👤 ${member.name} (本人)`;
	}
	return member.name;
};
</script>

<style scoped lang="less">
.recent-contacts-tags,
.family-members-tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	margin-top: 6px;

	.label-text {
		font-size: 12px;
		color: #8c8c8c;
	}

	.contact-quick-tag,
	.member-quick-tag {
		cursor: pointer;
		margin: 0;
	}
}

.contact-detail-tip {
	margin-top: 6px;
	font-size: 12px;
	color: #595959;
	background: #f6ffed;
	border: 1px solid #b7eb8f;
	padding: 6px 10px;
	border-radius: 4px;
}
</style>
