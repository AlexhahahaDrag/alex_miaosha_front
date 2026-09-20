import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(root, '.env'), override: true });

const u = process.env.RBAC_MANAGER_USER;
const p = process.env.RBAC_MANAGER_PASS;
const url = `http://localhost:30001/api/am-user/api/v1/user/login?username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`;

const r = await fetch(url, {
	method: 'POST',
	headers: {
		Accept: 'application/json',
		Origin: 'http://localhost:3000',
		Referer: 'http://localhost:3000/',
	},
});
console.log('status', r.status);
for (const [k, v] of r.headers) console.log('h', k, v);
console.log('body', (await r.text()).slice(0, 400));
