import CryptoJS from 'crypto-js';

// 十六位十六进制数作为密钥
const key = CryptoJS.enc.Utf8.parse('20230610HelloDog');
// 十六位十六进制数作为密钥偏移量
const iv = CryptoJS.enc.Utf8.parse('1234567890123456');

// 解密方法
export function decrypt(word: string | null) {
	if (!word) {
		return null;
	}
	const base64 = CryptoJS.enc.Base64.parse(word);
	const src = CryptoJS.enc.Base64.stringify(base64);
	const decrypt = CryptoJS.AES.decrypt(src, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	let decryptedStr = CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return JSON.parse(JSON.parse(decryptedStr));
}

// 加密方法
export function encrypt(word: unknown) {
	const src = CryptoJS.enc.Utf8.parse(JSON.stringify(word));
	const encrypted = CryptoJS.AES.encrypt(src, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	return encrypted.toString();
}

// 解密方法（简单版，用于本地存储）
export function decryptSimple(word: string | null) {
	if (!word) {
		return null;
	}
	const decrypt = CryptoJS.AES.decrypt(word, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	});
	const decryptedStr = CryptoJS.enc.Utf8.stringify(decrypt).toString();
	return JSON.parse(decryptedStr);
}
