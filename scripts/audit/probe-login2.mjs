import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const u = process.env.RBAC_MANAGER_USER;
const p = process.env.RBAC_MANAGER_PASS;
const accounts = [
	[u, p],
	[process.env.RBAC_SUPER_USER, process.env.RBAC_SUPER_PASS],
];

const paths = [
	'http://localhost:30001/api/am-user/api/v1/user/login',
	'http://localhost:30001/api/v1/user/login',
	'http://localhost:30006/api/v1/user/login',
];

for (const [user, pass] of accounts) {
	for (const base of paths) {
		const url = `${base}?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;
		try {
			const r = await fetch(url, { method: 'POST' });
			const t = await r.text();
			console.log(user, base, r.status, t.slice(0, 200).replace(/\s+/g, ' '));
		} catch (e) {
			console.log(user, base, 'ERR', String(e));
		}
	}
}
