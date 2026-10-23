import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';

vi.mock('@/views/finance/gift/api', () => ({
	getGiftEventTypeOptions: vi.fn().mockResolvedValue({ code: '200', data: { presets: [], customs: [] } }),
	getGiftPersonRelationOptions: vi.fn().mockResolvedValue({ code: '200', data: { presets: [], customs: [] } }),
}));

import { useGiftEventTypeOptions } from '@/composables/useGiftEventTypeOptions';
import { useGiftRelationOptions } from '@/composables/useGiftRelationOptions';
import { useTable } from '@/composables/useTable';
import { useRowSelection } from '@/composables/usePagination';

describe('PC 端业务 Composables 现代化与多态入参测试 (vuejs-skills)', () => {
	describe('1. useGiftEventTypeOptions 多态入参 (MaybeRefOrGetter) 支持', () => {
		const { isPresetEventType, eventLabel, resolveFilterEventType } = useGiftEventTypeOptions();

		it('支持普通 string 原始值传参（向下兼容）', () => {
			expect(isPresetEventType('WEDDING')).toBe(true);
			expect(isPresetEventType('UNKNOWN_EVENT')).toBe(false);
			expect(eventLabel('WEDDING')).toBe('婚礼');
			expect(resolveFilterEventType('9100000000000000001')).toBe('WEDDING');
		});

		it('支持 Vue Ref<string> 响应式多态传参', () => {
			const eventTypeRef = ref('BIRTH');
			expect(isPresetEventType(eventTypeRef)).toBe(true);
			expect(eventLabel(eventTypeRef)).toBe('满月');

			eventTypeRef.value = 'HOUSEWARMING';
			expect(eventLabel(eventTypeRef)).toBe('乔迁');
		});

		it('支持 Getter 函数 () => string 动态解包', () => {
			const form = { currentEvent: 'BIRTHDAY' };
			expect(isPresetEventType(() => form.currentEvent)).toBe(true);
			expect(eventLabel(() => form.currentEvent)).toBe('寿宴');

			form.currentEvent = 'EDUCATION';
			expect(eventLabel(() => form.currentEvent)).toBe('升学');
		});
	});

	describe('2. useGiftRelationOptions 多态入参 (MaybeRefOrGetter) 支持', () => {
		const { isPresetRelationType, relationLabel } = useGiftRelationOptions();

		it('支持普通 string 原始值判定', () => {
			expect(isPresetRelationType('FRIEND')).toBe(true);
			expect(relationLabel('FRIEND')).toBe('朋友');
		});

		it('支持 Ref 响应式传参并正确取值', () => {
			const relRef = ref('COLLEAGUE');
			expect(isPresetRelationType(relRef)).toBe(true);
			expect(relationLabel(relRef)).toBe('同事');

			relRef.value = 'RELATIVE';
			expect(relationLabel(relRef)).toBe('亲属');
		});

		it('支持 Getter 动态取值', () => {
			const person = { relation: 'NEIGHBOR' };
			expect(isPresetRelationType(() => person.relation)).toBe(true);
			expect(relationLabel(() => person.relation)).toBe('邻里');
		});
	});

	describe('3. 雪花 ID 精度安全契约防线 (useTable & useRowSelection)', () => {
		it('useRowSelection 必须严格将所有勾选 Key 转换为 String，防止超大数字截断', () => {
			const { rowSelection, selectedRowKeys } = useRowSelection();

			// 模拟传入超大雪花算法 ID
			const rawKeys = ['1810856881968091138', 1810856881968091200n as any];
			rowSelection.value.onChange(rawKeys);

			expect(selectedRowKeys.value[0]).toBe('1810856881968091138');
			expect(typeof selectedRowKeys.value[0]).toBe('string');
			expect(selectedRowKeys.value[1]).toBe('1810856881968091200');
			expect(typeof selectedRowKeys.value[1]).toBe('string');
		});

		it('useTable rowSelection 严格保持 string 映射', () => {
			const { rowSelection, selectedRowKeys } = useTable({ autoLoad: false });

			rowSelection.onChange(['1847192837192837192', 123 as any]);

			expect(selectedRowKeys.value).toEqual(['1847192837192837192', '123']);
			expect(typeof selectedRowKeys.value[0]).toBe('string');
		});
	});
});
