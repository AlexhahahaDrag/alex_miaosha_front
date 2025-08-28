module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/typescript/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking', // ✅ 新增：启用强类型检查规则
		'@vue/prettier',
		'@vue/prettier/@typescript-eslint',
		'plugin:import/recommended',
		'plugin:import/typescript',
	],
	plugins: ['import', '@typescript-eslint'],
	parserOptions: {
		ecmaVersion: 2020,
		project: './tsconfig.json', // ✅ 确保 ESLint 能读取 TS 类型信息
		tsconfigRootDir: __dirname,
	},
	globals: {
		defineEmits: 'readonly',
		defineProps: 'readonly',
	},
	rules: {
		indent: ['error', 4, { SwitchCase: 1 }],
		'vue/script-setup-uses-vars': 'error',
		'import/no-named-as-default': 'off',
		'import/namespace': [2, { allowComputed: true }],
		'import/no-named-as-default-member': 'off',
		'import/no-unresolved': [2, { ignore: ['^@'] }],
		'@typescript-eslint/consistent-type-imports': 'error',
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'quote-props': 'off',
		'comma-dangle': ['error', 'always-multiline'],
		'comma-style': ['error', 'last'],
		'no-mixed-operators': 'off',
		'no-unused-vars': ['off'],
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
		/* vue 项目专用 */
		'vue/require-default-prop': 'on',
		'vue/singleline-html-element-content-newline': ['on'],
		'vue/component-name-in-template-casing': [
			'error',
			'kebab-case',
			{
				registeredComponentsOnly: true,
				ignores: [],
			},
		],
		'vue/custom-event-name-casing': 'off',

		/* typescript */
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/no-var-requires': 'off',

		// ✅ 修改这里：禁止使用 any
		'@typescript-eslint/no-explicit-any': 'error',

		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
		],

		// ✅ 强化 any 检查：禁止不安全操作
		'@typescript-eslint/no-unsafe-assignment': 'error',
		'@typescript-eslint/no-unsafe-call': 'error',
		'@typescript-eslint/no-unsafe-member-access': 'error',
		'@typescript-eslint/no-unsafe-return': 'error',

		'@typescript-eslint/typedef': [
			'error',
			{
				parameter: true,
				arrayDestructuring: false,
				objectDestructuring: false,
				variableDeclaration: false,
				memberVariableDeclaration: false,
				propertyDeclaration: false,
			},
		],
		'template-curly-spacing': 'off',
		'vue/experimental-script-setup-vars': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
	},
};
