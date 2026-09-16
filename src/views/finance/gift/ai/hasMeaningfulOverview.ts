import type { GiftRecordSummary } from '@/views/finance/gift/config';

/** Analysis overview may expose per-direction counts in addition to record summary fields. */
export type GiftOverviewLike = GiftRecordSummary & {
	receiveCount?: number;
	giveCount?: number;
	returnCount?: number;
};

/**
 * True when overview has non-zero gift activity (aligned with mobile GiftAiInsightCard gate).
 * Rejects all-zero payloads where fields are merely present (e.g. recordCount: 0).
 */
export function hasMeaningfulOverview(
	overview?: GiftOverviewLike | null,
): boolean {
	if (!overview) return false;

	return (
		Number(overview.recordCount || 0) > 0 ||
		Number(overview.receiveCount || 0) > 0 ||
		Number(overview.giveCount || 0) > 0 ||
		Number(overview.returnCount || 0) > 0 ||
		Number(overview.receiveAmount || 0) !== 0 ||
		Number(overview.giveAmount || 0) !== 0 ||
		Number(overview.returnAmount || 0) !== 0 ||
		Number(overview.netAmount || 0) !== 0
	);
}
