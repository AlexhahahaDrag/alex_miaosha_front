import {
	getGiftEventList,
	getGiftOrgMemberOptions,
	getGiftPersonList,
} from '@/views/finance/gift/api';
import type {
	GiftEventInfo,
	GiftPersonInfo,
} from '@/views/finance/gift/config';

interface GiftRecordOptionsCacheState {
	events: GiftEventInfo[];
	contacts: GiftPersonInfo[];
	orgMembers: GiftPersonInfo[];
	warmed: boolean;
	warming: boolean;
}

const createEmptyState = (): GiftRecordOptionsCacheState => ({
	events: [],
	contacts: [],
	orgMembers: [],
	warmed: false,
	warming: false,
});

const cacheState = ref<GiftRecordOptionsCacheState>(createEmptyState());
let warmupTask: Promise<void> | null = null;

export function useGiftRecordOptionsCache() {
	const warmup = async (force = false) => {
		if (!force && cacheState.value.warmed) {
			return;
		}
		if (!force && warmupTask) {
			return warmupTask;
		}
		warmupTask = (async () => {
			cacheState.value.warming = true;
			try {
				const [eventRes, contactRes, orgMemberRes] = await Promise.all([
					getGiftEventList(),
					getGiftPersonList({ personScope: 'CONTACT' }),
					getGiftOrgMemberOptions(),
				]);
				cacheState.value.events =
					eventRes.code === '200' ? eventRes.data || [] : [];
				cacheState.value.contacts =
					contactRes.code === '200' ? contactRes.data || [] : [];
				cacheState.value.orgMembers =
					orgMemberRes.code === '200' ? orgMemberRes.data || [] : [];
				cacheState.value.warmed = true;
			} finally {
				cacheState.value.warming = false;
				warmupTask = null;
			}
		})();
		return warmupTask;
	};

	const invalidate = () => {
		cacheState.value = createEmptyState();
		warmupTask = null;
	};

	const findSelfPersonId = (loginUserId?: string): string | undefined => {
		if (!loginUserId || !cacheState.value.orgMembers.length) {
			return undefined;
		}
		const self = cacheState.value.orgMembers.find(
			(item) => item.bindUserId && String(item.bindUserId) === loginUserId,
		);
		return self?.id ? String(self.id) : undefined;
	};

	return {
		cacheState: readonly(cacheState),
		warmup,
		invalidate,
		findSelfPersonId,
		isWarmed: () => cacheState.value.warmed,
		isWarming: () => cacheState.value.warming,
		getEvents: () => cacheState.value.events,
		getContacts: () => cacheState.value.contacts,
		getOrgMembers: () => cacheState.value.orgMembers,
	};
}
