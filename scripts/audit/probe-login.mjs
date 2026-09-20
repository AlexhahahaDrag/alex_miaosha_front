import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const u = process.env.RBAC_MANAGER_USER;
const p = process.env.RBAC_MANAGER_PASS;
const urls = [
	'http://localhost:30001/api/v1/user/login',
	'http://localhost:30001/api/v1/t-user/login',
	'http://localhost:30006/api/v1/user/login',
];

for (const url of urls) {
	try {
		const r = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: u, password: p }),
		});
		const t = await r.text();
		console.log('URL', url, 'status', r.status, 'body', t.slice(0, 300));
	} catch (e) {
		console.log('URL', url, 'ERR', String(e));
	}
}
