import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	normalizeGiftIds,
	normalizeGiftResponse,
	shouldNormalizeGiftId,
} from '../../src/views/finance/gift/api/normalize.ts';

/**
 * Gift 模块"ID 安全"契约锁（Node 22 内置 test runner，原生 TS 类型剥离，零依赖）：
 * 后端 Long 主键经 Long2StringSerializer 转 string，前端 normalizeGiftIds 是兜底防线。
 * 本文件锁住递归转换行为，防止后续改动破坏前后端 ID 契约（number 精度丢失低位变 00）。
 *
 * 运行：npm run test:unit
 * 注：vitest 4 与本项目 Vite 8（Rolldown）运行时不兼容（describe 阶段崩溃），故用 node:test。
 */
describe('shouldNormalizeGiftId', () => {
	it('命中公共审计字段与 *Id 后缀', () => {
		assert.equal(shouldNormalizeGiftId('id'), true);
		assert.equal(shouldNormalizeGiftId('creator'), true);
		assert.equal(shouldNormalizeGiftId('eventId'), true);
		assert.equal(shouldNormalizeGiftId('relatedRecordId'), true);
	});

	it('普通业务字段不命中', () => {
		assert.equal(shouldNormalizeGiftId('amount'), false);
		assert.equal(shouldNormalizeGiftId('personName'), false);
		// 大小写敏感：Id 后缀是驼峰约定，identity 这类不误伤
		assert.equal(shouldNormalizeGiftId('identity'), false);
	});
});

describe('normalizeGiftIds', () => {
	it('number 型 ID 转 string', () => {
		// 注意：超过 MAX_SAFE_INTEGER 的 ID 一旦成为 number 就已失真
		// （9007199254740993 字面量会解析成 ...992），转 string 只能兜底安全范围内的 ID；
		// 真正的防线是后端 Long2StringSerializer 让 ID 根本不以 number 形态进前端
		const output = normalizeGiftIds({ id: 9007199254740991, eventId: 42 });
		assert.equal(output.id, '9007199254740991');
		assert.equal(output.eventId, '42');
	});

	it('bigint 型 ID 转 string（超安全整数精度不丢失）', () => {
		const output = normalizeGiftIds({ id: 1234567890123456789n });
		assert.equal(output.id, '1234567890123456789');
	});

	it('已是 string 的 ID 保持原样', () => {
		const output = normalizeGiftIds({ id: '123', giverPersonId: '456' });
		assert.equal(output.id, '123');
		assert.equal(output.giverPersonId, '456');
	});

	it('非 ID 字段不受影响', () => {
		const output = normalizeGiftIds({ amount: 666.88, remark: '婚宴' });
		assert.equal(output.amount, 666.88);
		assert.equal(output.remark, '婚宴');
	});

	it('递归处理嵌套对象与数组', () => {
		const output = normalizeGiftIds({
			records: [
				{ id: 1, relatedRecordId: 2, amount: 100 },
				{ id: 3, person: { id: 4, personName: '张三' } },
			],
		});
		assert.equal(output.records[0].id, '1');
		assert.equal(output.records[0].relatedRecordId, '2');
		assert.equal(output.records[0].amount, 100);
		assert.equal(output.records[1].person.id, '4');
		assert.equal(output.records[1].person.personName, '张三');
	});

	it('原始值 / null / undefined 原样返回', () => {
		assert.equal(normalizeGiftIds(null), null);
		assert.equal(normalizeGiftIds(undefined), undefined);
		assert.equal(normalizeGiftIds('abc'), 'abc');
		assert.equal(normalizeGiftIds(123), 123);
	});
});

describe('normalizeGiftResponse', () => {
	it('响应 data 内的 ID 全部转 string', () => {
		const res = normalizeGiftResponse({
			code: '200',
			message: 'ok',
			data: { id: 10, list: [{ eventId: 20 }] },
		} as never);
		const data = res.data as unknown as {
			id: string;
			list: { eventId: string }[];
		};
		assert.equal(data.id, '10');
		assert.equal(data.list[0].eventId, '20');
	});

	it('data 为 null 时响应原样返回', () => {
		const resNull = { code: '200', message: 'ok', data: null } as never;
		assert.equal(normalizeGiftResponse(resNull), resNull);
	});
});
