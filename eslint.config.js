import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const commonGlobals = {
	// Vue 3 Composition API
	defineEmits: 'readonly',
	defineProps: 'readonly',
	defineExpose: 'readonly',
	defineOptions: 'readonly',
	defineSlots: 'readonly',
	defineModel: 'readonly',
	withDefaults: 'readonly',
	// Vue 3 reactivity
	ref: 'readonly',
	reactive: 'readonly',
	computed: 'readonly',
	watch: 'readonly',
	watchEffect: 'readonly',
	// Vue 3 lifecycle
	onMounted: 'readonly',
	onUnmounted: 'readonly',
	onUpdated: 'readonly',
	onBeforeMount: 'readonly',
	onBeforeUnmount: 'readonly',
	onBeforeUpdate: 'readonly',
	// Vue 3 utilities
	nextTick: 'readonly',
	toRef: 'readonly',
	toRefs: 'readonly',
	unref: 'readonly',
	// Vue 3 core
	createApp: 'readonly',
	// Browser globals
	window: 'readonly',
	document: 'readonly',
	console: 'readonly',
	localStorage: 'readonly',
	sessionStorage: 'readonly',
	URLSearchParams: 'readonly',
	Element: 'readonly',
	HTMLElement: 'readonly',
	MouseEvent: 'readonly',
	FormData: 'readonly',
	File: 'readonly',
	FileReader: 'readonly',
	// Node.js globals
	process: 'readonly',
	Buffer: 'readonly',
	global: 'readonly',
	// TypeScript globals
	DefineComponent: 'readonly',
	PropType: 'readonly',
	Ref: 'readonly',
	// Vue Router
	useRoute: 'readonly',
	useRouter: 'readonly',
	// Ant Design Vue
	TreeDataItem: 'readonly',
	// Pinia
	storeToRefs: 'readonly',
};

export default [
	// 忽略文件配置
	{
		ignores: ['vite.config.js', 'dist/**', 'node_modules/**', '*.min.js'],
	},

	// JavaScript 文件配置
	js.configs.recommended,

	// TypeScript 文件配置
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: commonGlobals,
		},
		plugins: {
			'@typescript-eslint': tseslint,
			import: importPlugin,
			prettier: prettier,
		},
		rules: {
			// TypeScript 规则
			'@typescript-eslint/ban-ts-ignore': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
			],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/consistent-type-imports': 'error',

			// Import 规则
			'import/no-named-as-default': 'off',
			'import/namespace': [2, { allowComputed: true }],
			'import/no-named-as-default-member': 'off',
			'import/no-unresolved': [2, { ignore: ['^@', '^~icons/', './'] }],

			// 基础规则
			'no-console': 'off',
			'no-debugger': 'off',
			'no-undef': 'off', // TypeScript handles this
			'quote-props': 'off',
			'comma-dangle': ['error', 'always-multiline'],
			'comma-style': ['error', 'last'],
			'no-mixed-operators': 'off',
			'no-unused-vars': 'off',
			'no-redeclare': 'off', // TypeScript handles this
			'block-spacing': ['error', 'always'],
			'object-curly-spacing': ['error', 'always'],
			semi: ['error', 'always'],
			quotes: [
				2,
				'single',
				{
					avoidEscape: true,
					allowTemplateLiterals: true,
				},
			],
			indent: ['error', 4, { SwitchCase: 1 }],
			'template-curly-spacing': 'off',

			// Prettier 规则
			'prettier/prettier': 'error',
		},
	},

	// Vue 文件配置
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tsparser,
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: commonGlobals,
		},
		plugins: {
			vue: vue,
			'@typescript-eslint': tseslint,
			import: importPlugin,
			prettier: prettier,
		},
		rules: {
			...vue.configs['vue3-essential'].rules,
			...vue.configs['vue3-recommended'].rules,

			// Vue 特定规则
			'vue/script-setup-uses-vars': 'error',
			'vue/require-default-prop': 'off', // 关闭这个规则，因为 Vue 3 不强制要求
			'vue/singleline-html-element-content-newline': 'off',
			'vue/component-name-in-template-casing': [
				'error',
				'kebab-case',
				{
					registeredComponentsOnly: true,
					ignores: [],
				},
			],
			'vue/custom-event-name-casing': 'off',
			'vue/experimental-script-setup-vars': 'off',
			'vue/multi-word-component-names': 'off', // 关闭多词组件名规则
			'vue/no-useless-template-attributes': 'off',
			'vue/require-valid-default-prop': 'off',
			'vue/require-v-for-key': 'off', // 暂时关闭，可以后续修复
			'vue/valid-v-for': 'off', // 暂时关闭，可以后续修复
			'vue/no-dupe-keys': 'off', // 暂时关闭，可以后续修复

			// TypeScript 规则 (for Vue files)
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
			],
			'@typescript-eslint/consistent-type-imports': 'error',

			// Import 规则
			'import/no-unresolved': [2, { ignore: ['^@', '^~icons/', './'] }],

			// 基础规则
			'no-console': 'off',
			'no-debugger': 'off',
			'no-undef': 'off', // Vue 和 TypeScript 处理这个
			'no-redeclare': 'off', // Vue 和 TypeScript 处理这个

			// Prettier 规则
			'prettier/prettier': 'error',
		},
	},

	// Prettier 配置
	prettierConfig,
];
