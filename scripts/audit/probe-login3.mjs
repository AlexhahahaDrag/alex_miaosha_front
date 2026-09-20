import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const u = process.env.RBAC_MANAGER_USER;
const p = process.env.RBAC_MANAGER_PASS;
const qs = `username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`;

const urls = [
	`http://localhost:3000/api/am-user/api/v1/user/login?${qs}`,
	`http://localhost:30001/am-user/api/v1/user/login?${qs}`,
	`http://localhost:30001/api/am-user/api/v1/user/login?${qs}`,
];

for (const url of urls) {
	try {
		const r = await fetch(url, { method: 'POST' });
		const t = await r.text();
		console.log(r.status, url.split('?')[0], t.slice(0, 180).replace(/\s+/g, ' '));
	} catch (e) {
		console.log('ERR', url.split('?')[0], String(e));
	}
}
