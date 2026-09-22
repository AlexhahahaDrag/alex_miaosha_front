import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore, DEFAULT_PRIMARY_COLOR } from '@/store/modules/theme';

describe('theme store', () => {
	const classList = new Set<string>();
	const styleProps = new Map<string, string>();

	beforeEach(() => {
		setActivePinia(createPinia());
		classList.clear();
		styleProps.clear();

		(globalThis as any).document = {
			documentElement: {
				classList: {
					add: (cls: string) => classList.add(cls),
					remove: (cls: string) => classList.delete(cls),
					toggle: (cls: string, force?: boolean) => {
						const shouldHave = force !== undefined ? force : !classList.has(cls);
						if (shouldHave) classList.add(cls);
						else classList.delete(cls);
						return shouldHave;
					},
					contains: (cls: string) => classList.has(cls),
				},
				style: {
					setProperty: (key: string, val: string) => styleProps.set(key, val),
					getPropertyValue: (key: string) => styleProps.get(key) || '',
				},
			},
		};
	});

	afterEach(() => {
		delete (globalThis as any).document;
	});

	it('should initialize with default primary color and light mode', () => {
		const themeStore = useThemeStore();
		expect(themeStore.primaryColor).toBe(DEFAULT_PRIMARY_COLOR);
		expect(themeStore.isDark).toBe(false);
	});

	it('should set primary color and update CSS variable', () => {
		const themeStore = useThemeStore();
		themeStore.setPrimaryColor('#52c41a');
		expect(themeStore.primaryColor).toBe('#52c41a');
		expect(styleProps.get('--primary-color')).toBe('#52c41a');
	});

	it('should toggle dark mode and update html class', () => {
		const themeStore = useThemeStore();
		themeStore.toggleDark(true);
		expect(themeStore.isDark).toBe(true);
		expect(classList.has('dark')).toBe(true);

		themeStore.toggleDark(false);
		expect(themeStore.isDark).toBe(false);
		expect(classList.has('dark')).toBe(false);
	});

	it('should sync document state on initTheme', () => {
		const themeStore = useThemeStore();
		themeStore.setPrimaryColor('#722ed1');
		themeStore.toggleDark(true);

		classList.clear();
		styleProps.clear();

		themeStore.initTheme();
		expect(styleProps.get('--primary-color')).toBe('#722ed1');
		expect(classList.has('dark')).toBe(true);
	});
});
