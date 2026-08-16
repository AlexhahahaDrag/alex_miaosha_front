import { AES, Utf8, Base64, CBC, Pkcs7 } from 'crypto-es';

// 十六位十六进制数作为密钥
const key = Utf8.parse('20230610HelloDog');
// 十六位十六进制数作为密钥偏移量
const iv = Utf8.parse('1234567890123456');

// 解密方法
export function decrypt(word: string | null) {
	if (!word) {
		return null;
	}
	const base64 = Base64.parse(word);
	const src = Base64.stringify(base64);
	const decrypt = AES.decrypt(src, key, {
		iv: iv,
		mode: CBC,
		padding: Pkcs7,
	});
	const decryptedStr = Utf8.stringify(decrypt).toString();
	return JSON.parse(JSON.parse(decryptedStr));
}

// 加密方法
export function encrypt(word: unknown) {
	const src = Utf8.parse(JSON.stringify(word));
	const encrypted = AES.encrypt(src, key, {
		iv: iv,
		mode: CBC,
		padding: Pkcs7,
	});
	return encrypted.toString();
}

// 解密方法（简单版，用于本地存储）
export function decryptSimple(word: string | null) {
	if (!word) {
		return null;
	}
	const decrypt = AES.decrypt(word, key, {
		iv: iv,
		mode: CBC,
		padding: Pkcs7,
	});
	const decryptedStr = Utf8.stringify(decrypt).toString();
	return JSON.parse(decryptedStr);
}
