import { describe, expect, it } from 'vitest';
import { hasMeaningfulOverview } from './hasMeaningfulOverview';

describe('hasMeaningfulOverview', () => {
	it('returns false for null, undefined, or empty overview', () => {
		expect(hasMeaningfulOverview(null)).toBe(false);
		expect(hasMeaningfulOverview(undefined)).toBe(false);
		expect(hasMeaningfulOverview({})).toBe(false);
	});

	it('returns false when fields exist but are all zero', () => {
		expect(
			hasMeaningfulOverview({
				recordCount: 0,
				receiveAmount: 0,
				giveAmount: 0,
				returnAmount: 0,
				netAmount: 0,
			}),
		).toBe(false);
	});

	it('returns true for non-zero record or amount fields', () => {
		expect(hasMeaningfulOverview({ recordCount: 1 })).toBe(true);
		expect(hasMeaningfulOverview({ receiveAmount: 100 })).toBe(true);
		expect(hasMeaningfulOverview({ giveAmount: -50 })).toBe(true);
		expect(hasMeaningfulOverview({ returnAmount: 20 })).toBe(true);
		expect(hasMeaningfulOverview({ netAmount: 10 })).toBe(true);
		expect(hasMeaningfulOverview({ receiveCount: 2 })).toBe(true);
	});
});
