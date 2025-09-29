// ESLint v9 Flat Config (TypeScript)
// 适配 unplugin-auto-import 和 unplugin-vue-components 的项目配置

import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import importPlugin from 'eslint-plugin-import';
import type { Linter } from 'eslint';

// 读取自动导入的全局变量
import autoImportGlobals from './.eslintrc-auto-import.json';

const config: Linter.FlatConfig[] = [
	// 忽略文件
	{
		ignores: [
			'vite.config.js',
			'vite.config.mts',
			'eslint.config.js',
			'dist/**',
			'node_modules/**',
			'components.d.ts',
			'src/auto-imports.d.ts',
			'.eslintrc-auto-import.json',
		],
	},

	// 基础 JS 推荐规则
	js.configs.recommended,

	// Vue 文件配置
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: typescriptParser,
				ecmaVersion: 2020,
				sourceType: 'module',
				extraFileExtensions: ['.vue'],
			},
			globals: {
				// Vue 3 宏
				defineEmits: 'readonly',
				defineProps: 'readonly',
				defineExpose: 'readonly',
				defineOptions: 'readonly',
				defineSlots: 'readonly',
				defineModel: 'readonly',
				withDefaults: 'readonly',
				// 自动导入的全局变量
				...autoImportGlobals.globals,
				// Node.js 环境变量
				process: 'readonly',
				console: 'readonly',
			},
		},
		plugins: {
			vue,
			'@typescript-eslint': typescript,
			import: importPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json',
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
				},
			},
		},
		rules: {
			...vue.configs['vue3-essential'].rules,
			...typescript.configs.recommended.rules,

			// 基础规则
			indent: [
				'error',
				'tab',
				{ SwitchCase: 1, ignoredNodes: ['ConditionalExpression'] },
			],
			semi: ['error', 'always'],
			quotes: [
				'error',
				'single',
				{ avoidEscape: true, allowTemplateLiterals: true },
			],
			'comma-dangle': ['error', 'always-multiline'],
			'comma-style': ['error', 'last'],
			'block-spacing': ['error', 'always'],
			'object-curly-spacing': ['error', 'always'],
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-unused-vars': 'off',
			'no-undef': 'off', // 关闭，因为自动导入会导致误报

			// Vue 规则
			'vue/script-setup-uses-vars': 'error',
			'vue/component-name-in-template-casing': ['error', 'kebab-case'],
			'vue/require-default-prop': 'off',
			'vue/singleline-html-element-content-newline': 'off',
			'vue/custom-event-name-casing': 'off',
			'vue/multi-word-component-names': 'off', // 关闭多词组件名要求

			// TypeScript 规则
			'@typescript-eslint/no-explicit-any': 'warn', // 改为警告而不是错误
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
			],
			// 强制使用 type 导入接口和类型
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: false,
					fixStyle: 'separate-type-imports',
				},
			],
			'@typescript-eslint/ban-ts-ignore': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',

			// 强制参数类型注解（你要求的核心规则）
			'@typescript-eslint/typedef': [
				'error',
				{
					parameter: true, // 要求函数参数有类型注解
					arrayDestructuring: false,
					objectDestructuring: false,
					variableDeclaration: false,
					memberVariableDeclaration: false,
					propertyDeclaration: false,
				},
			],

			// Import 规则
			'import/no-named-as-default': 'off',
			'import/namespace': ['error', { allowComputed: true }],
			'import/no-named-as-default-member': 'off',
			'import/no-unresolved': [
				'error',
				{
					ignore: [
						'^@/', // 忽略别名路径
						'^@v/',
						'^@u/',
						'^@a/',
						'^@r/',
						'^~/', // 可能的其他别名
						'^~icons/', // unplugin-icons 虚拟模块
						'^virtual:', // Vite 虚拟模块
						'^#/', // TypeScript 路径映射
					],
				},
			],
		},
	},

	// TypeScript 文件配置
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
			},
			globals: {
				// 自动导入的全局变量
				...autoImportGlobals.globals,
				// Node.js 环境变量
				process: 'readonly',
				console: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': typescript,
			import: importPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
					project: './tsconfig.json',
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
		},
		rules: {
			...typescript.configs.recommended.rules,

			// 基础规则
			indent: ['error', 'tab', { SwitchCase: 1 }],
			semi: ['error', 'always'],
			quotes: [
				'error',
				'single',
				{ avoidEscape: true, allowTemplateLiterals: true },
			],
			'comma-dangle': ['error', 'always-multiline'],
			'no-unused-vars': 'off',
			'no-undef': 'off', // 关闭，因为自动导入会导致误报

			// TypeScript 规则
			'@typescript-eslint/no-explicit-any': 'warn', // 改为警告
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
			],
			// 强制使用 type 导入接口和类型
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: false,
					fixStyle: 'separate-type-imports',
				},
			],
			'@typescript-eslint/typedef': [
				'error',
				{
					parameter: true, // 要求函数参数有类型注解
					arrayDestructuring: false,
					objectDestructuring: false,
					variableDeclaration: false,
					memberVariableDeclaration: false,
					propertyDeclaration: false,
				},
			],

			// Import 规则
			'import/no-unresolved': [
				'error',
				{
					ignore: [
						'^@/',
						'^@v/',
						'^@u/',
						'^@a/',
						'^@r/',
						'^~/',
						'^~icons/', // unplugin-icons 虚拟模块
						'^virtual:',
						'^#/',
					],
				},
			],
		},
	},

	// JavaScript 文件配置
	{
		files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				// Node.js 环境变量
				process: 'readonly',
				console: 'readonly',
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				global: 'readonly',
			},
		},
		rules: {
			// 基础规则
			indent: ['error', 'tab', { SwitchCase: 1 }],
			semi: ['error', 'always'],
			quotes: [
				'error',
				'single',
				{ avoidEscape: true, allowTemplateLiterals: true },
			],
			'comma-dangle': ['error', 'always-multiline'],
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		},
	},
];

export default config;
