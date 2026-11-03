import { describe, it, expect, afterEach, vi } from 'vitest';

vi.mock('@/router', () => ({
	default: {
		push: vi.fn(),
		currentRoute: { value: { name: 'home' } },
	},
}));

vi.mock('@/store/modules/user/user', () => ({
	useUserStore: () => ({
		getToken: 'test-token',
		resetAuth: vi.fn(),
	}),
}));

import { getRequestTimeout } from '@/utils/request/request';

describe('Axios Request Timeout Contract Test', () => {
	const originalMode = import.meta.env.MODE;
	const originalViteMode = import.meta.env.VITE_MODE;
	const originalTimeout = import.meta.env.VITE_APP_REQUEST_TIMEOUT;

	afterEach(() => {
		(import.meta.env as any).MODE = originalMode;
		(import.meta.env as any).VITE_MODE = originalViteMode;
		(import.meta.env as any).VITE_APP_REQUEST_TIMEOUT = originalTimeout;
	});

	it('开发环境 (development) 超时时间应为 1 分钟 (60000ms)', () => {
		(import.meta.env as any).MODE = 'development';
		(import.meta.env as any).VITE_MODE = 'development';
		(import.meta.env as any).VITE_APP_REQUEST_TIMEOUT = undefined;

		expect(getRequestTimeout()).toBe(60000);
	});

	it('测试环境 (test) 超时时间应为 45 秒 (45000ms)', () => {
		(import.meta.env as any).MODE = 'test';
		(import.meta.env as any).VITE_MODE = 'test';
		(import.meta.env as any).VITE_APP_REQUEST_TIMEOUT = undefined;

		expect(getRequestTimeout()).toBe(45000);
	});

	it('正式环境 (production) 超时时间应为 30 秒 (30000ms)', () => {
		(import.meta.env as any).MODE = 'production';
		(import.meta.env as any).VITE_MODE = 'production';
		(import.meta.env as any).VITE_APP_REQUEST_TIMEOUT = undefined;

		expect(getRequestTimeout()).toBe(30000);
	});

	it('配置了 VITE_APP_REQUEST_TIMEOUT 环境变量时应优先使用', () => {
		(import.meta.env as any).MODE = 'development';
		(import.meta.env as any).VITE_APP_REQUEST_TIMEOUT = '120000';

		expect(getRequestTimeout()).toBe(120000);
	});
});
