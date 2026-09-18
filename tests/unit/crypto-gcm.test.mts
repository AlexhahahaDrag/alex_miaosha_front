import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decrypt, encrypt, decryptGcm, encryptGcm } from '../../src/utils/crypto/index.ts';

describe('AES-GCM (v2.0) 前端加解密契约与兼容性测试', () => {
	const TEST_KEY = '20230610HelloDog';

	it('GCM 加密与解密对象数据成功还原', async () => {
		const payload = {
			code: 200,
			message: 'success',
			data: { userId: '1234567890', username: 'alex' },
		};

		const encrypted = await encryptGcm(payload, TEST_KEY);
		assert.ok(encrypted);
		assert.notEqual(encrypted, JSON.stringify(payload));

		const decrypted = await decryptGcm(encrypted, TEST_KEY);
		assert.deepEqual(decrypted, payload);
	});

	it('相同明文多次加密因随机 12B IV 而产生不同密文', async () => {
		const payload = { test: 'anti-replay' };
		const cipher1 = await encryptGcm(payload, TEST_KEY);
		const cipher2 = await encryptGcm(payload, TEST_KEY);

		assert.notEqual(cipher1, cipher2);
		assert.deepEqual(await decryptGcm(cipher1, TEST_KEY), payload);
		assert.deepEqual(await decryptGcm(cipher2, TEST_KEY), payload);
	});

	it('密文被恶意篡改时解密失败', async () => {
		const payload = { sensitive: 'payment_amount_1000' };
		const encrypted = await encryptGcm(payload, TEST_KEY);

		const buffer = Buffer.from(encrypted, 'base64');
		// 篡改密文主体中的一个字节
		buffer[buffer.length - 5] ^= 0x55;
		const tampered = buffer.toString('base64');

		await assert.rejects(async () => {
			await decryptGcm(tampered, TEST_KEY);
		});
	});

	it('空数据或非法长度处理', async () => {
		assert.equal(await decryptGcm(null, TEST_KEY), null);
		assert.equal(await decryptGcm('', TEST_KEY), null);

		const shortBase64 = Buffer.from(new Uint8Array(10)).toString('base64');
		await assert.rejects(async () => {
			await decryptGcm(shortBase64, TEST_KEY);
		});
	});

	it('保持向后兼容：现有 CBC decrypt 和 encrypt 正常运行', () => {
		const testData = { userId: '10086', name: 'legacy_user' };
		const cipher = encrypt(testData);
		const plain = decrypt(cipher);
		assert.deepEqual(plain, testData);
	});
});
