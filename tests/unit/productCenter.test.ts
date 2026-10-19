import { describe, expect, it } from 'vitest';
import {
	ATTR_TYPE_OPTIONS,
	ENABLE_STATUS_OPTIONS,
	SEARCH_TYPE_OPTIONS,
	SHOW_DESC_OPTIONS,
	columns as attrColumns,
} from '@/views/product/pmsAttr/config';
import {
	DEFAULT_SHOP_SOURCE_OPTIONS,
	columns as productColumns,
} from '@/views/product/pmsShopProduct/config';

/**
 * 递归规范化商品与属性相关对象的雪花 ID（string 防精度丢失护城河）
 */
export function normalizeProductIds<T = any>(data: T): T {
	if (!data || typeof data !== 'object') return data;
	if (Array.isArray(data)) {
		return data.map((item) => normalizeProductIds(item)) as unknown as T;
	}
	const result: Record<string, any> = { ...data };
	for (const key of Object.keys(result)) {
		const val = result[key];
		if (key === 'id' || key.endsWith('Id') || key.endsWith('id')) {
			if (typeof val === 'number' || typeof val === 'bigint') {
				result[key] = String(val);
			}
		} else if (val && typeof val === 'object') {
			result[key] = normalizeProductIds(val);
		}
	}
	return result as T;
}

describe('Product Center - pmsAttr & pmsShopProduct 规范与 ID 安全', () => {
	describe('pmsAttr 属性与规格常量枚举契约', () => {
		it('ATTR_TYPE_OPTIONS 应包含销售、基本及双重属性 3 种枚举', () => {
			expect(ATTR_TYPE_OPTIONS).toHaveLength(3);
			expect(ATTR_TYPE_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2]);
			expect(ATTR_TYPE_OPTIONS[0].label).toContain('销售属性');
			expect(ATTR_TYPE_OPTIONS[1].label).toContain('基本属性');
		});

		it('ENABLE_STATUS_OPTIONS 与 SEARCH_TYPE_OPTIONS 应具备明确启禁用状态', () => {
			expect(ENABLE_STATUS_OPTIONS).toEqual([
				{ label: '已启用', value: 1, status: 'enabled' },
				{ label: '已禁用', value: 0, status: 'disabled' },
			]);
			expect(SEARCH_TYPE_OPTIONS).toEqual([
				{ label: '支持检索', value: 1 },
				{ label: '无需检索', value: 0 },
			]);
			expect(SHOW_DESC_OPTIONS).toEqual([
				{ label: '快速展示', value: 1 },
				{ label: '默认隐藏', value: 0 },
			]);
		});

		it('attrColumns 列配置应符合三段式规范并包含核心列', () => {
			const colKeys = attrColumns.value.map((col: any) => col.key || col.dataIndex);
			expect(colKeys).toContain('attrName');
			expect(colKeys).toContain('attrType');
			expect(colKeys).toContain('valueSelect');
			expect(colKeys).toContain('catelogId');
			expect(colKeys).toContain('operation');
		});
	});

	describe('pmsShopProduct 商城秒杀商品列配置与来源渠道', () => {
		it('productColumns 应固定操作列在右侧并格式化价格列', () => {
			const opCol = productColumns.value.find((col: any) => col.key === 'operation');
			expect(opCol).toBeDefined();
			expect(opCol?.fixed).toBe('right');

			const priceCol = productColumns.value.find((col: any) => col.key === 'price');
			expect(priceCol?.align).toBe('right');
		});

		it('DEFAULT_SHOP_SOURCE_OPTIONS 应包含京东与淘宝两大数据源', () => {
			expect(DEFAULT_SHOP_SOURCE_OPTIONS).toEqual([
				{ typeCode: 'jd', typeName: '京东商城' },
				{ typeCode: 'tb', typeName: '淘宝/天猫' },
			]);
		});
	});

	describe('商品中心 ID 精度安全纯函数 normalizeProductIds', () => {
		it('应将超大 64 位雪花 ID 及 catelogId、skuId 转为 string', () => {
			const raw = {
				id: 1847192837192837192n,
				catelogId: 987654321012345678n,
				skuId: 10023,
				price: 99.8,
				name: '秒杀运动跑鞋',
			};
			const res = normalizeProductIds(raw);
			expect(res.id).toBe('1847192837192837192');
			expect(res.catelogId).toBe('987654321012345678');
			expect(res.skuId).toBe('10023');
			// 业务金额与名称类型保持原生
			expect(res.price).toBe(99.8);
			expect(res.name).toBe('秒杀运动跑鞋');
		});

		it('应递归处理商品列表数组与规格属性嵌套对象', () => {
			const rawList = [
				{
					id: 111,
					attrs: [
						{ attrId: 222, attrName: '颜色' },
						{ attrId: 333, attrName: '尺码' },
					],
				},
			];
			const resList = normalizeProductIds(rawList);
			expect(resList[0].id).toBe('111');
			expect(resList[0].attrs[0].attrId).toBe('222');
			expect(resList[0].attrs[1].attrId).toBe('333');
		});
	});
});
