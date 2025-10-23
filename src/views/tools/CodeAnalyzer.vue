<!-- 代码分析工具组件 - oxc 功能已禁用 -->
<template>
	<div class="code-analyzer">
		<a-card title="⚠️ 代码分析工具（oxc 功能已禁用）" :bordered="false">
			<a-alert
				message="注意：oxc 依赖包不可用"
				description="oxc 相关功能已禁用。此组件保留用于将来升级。建议使用 ESLint 进行代码检查。"
				type="warning"
				show-icon
				:style="{ marginBottom: '20px' }"
			/>

			<a-button type="primary" @click="onShowGuide">
				📖 查看代码检查指南
			</a-button>

			<a-divider />

			<p>可用的代码检查命令：</p>
			<pre><code>{{ guide }}</code></pre>
		</a-card>
	</div>
</template>

<script setup lang="ts">
const guide = `# 使用 ESLint 检查代码

# 运行代码检查
yarn lint

# 自动修复问题
yarn lint:fix
`;

const onShowGuide = () => {
	const message = `可用命令：\n\n• yarn lint - 运行代码检查\n• yarn lint:fix - 自动修复问题`;
	alert(message);
};
</script>

<style scoped lang="less">
.code-analyzer {
	padding: 20px;

	pre {
		background: #f5f5f5;
		padding: 12px;
		border-radius: 4px;
		overflow-x: auto;
	}
}
</style>
