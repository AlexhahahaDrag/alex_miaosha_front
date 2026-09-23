/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{vue,js,ts,jsx,tsx}',
	],
	darkMode: 'class', // 配合项目 html.dark 类名机制
	corePlugins: {
		preflight: false, // 核心避坑点：禁用 Preflight，防止重置 Ant Design Vue 4.x 原生排版与按钮
	},
	theme: {
		extend: {
			colors: {
				primary: 'var(--primary-color, #1677ff)',
			},
		},
	},
	plugins: [],
};
