<template>
	<a-popover
		v-model:open="visible"
		trigger="click"
		placement="bottomRight"
		overlay-class-name="theme-setting-popover"
	>
		<template #content>
			<div class="theme-setting-card">
				<div class="setting-header">
					<div class="title">主题与外观风格</div>
					<a-button
						type="link"
						size="small"
						class="reset-btn"
						@click="handleReset"
					>
						<template #icon><reload-outlined /></template>
						重置
					</a-button>
				</div>

				<div class="setting-item mode-row">
					<span class="label">暗黑模式</span>
					<a-switch
						:checked="themeStore.isDark"
						checked-children="黑夜"
						un-checked-children="白天"
						@change="themeStore.toggleDark"
					/>
				</div>

				<a-divider style="margin: 12px 0" />

				<div class="setting-item">
					<div class="label" style="margin-bottom: 8px">系统预设主题色</div>
					<div class="color-grid">
						<div
							v-for="preset in PRESET_COLORS"
							:key="preset.color"
							class="color-dot"
							:style="{ backgroundColor: preset.color }"
							:title="preset.name"
							@click="themeStore.setPrimaryColor(preset.color)"
						>
							<check-outlined
								v-if="themeStore.primaryColor.toLowerCase() === preset.color.toLowerCase()"
								class="check-icon"
							/>
						</div>
					</div>
				</div>

				<div class="setting-item custom-color-row">
					<span class="label">自选任意颜色</span>
					<div class="custom-color-picker">
						<span class="color-hex-tag">{{ themeStore.primaryColor.toUpperCase() }}</span>
						<label class="color-input-wrapper" title="选择自定义颜色">
							<input
								type="color"
								:value="themeStore.primaryColor"
								class="native-color-input"
								@input="handleCustomColor"
							/>
							<span
								class="color-preview"
								:style="{ backgroundColor: themeStore.primaryColor }"
							/>
						</label>
					</div>
				</div>
			</div>
		</template>

		<a-tooltip title="主题风格与自选色" placement="bottom">
			<button
				type="button"
				class="tool-btn"
				aria-label="主题设置"
			>
				<skin-outlined />
			</button>
		</a-tooltip>
	</a-popover>
</template>

<script setup lang="ts">
import { SkinOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import { useThemeStore, DEFAULT_PRIMARY_COLOR } from '@/store/modules/theme';

const themeStore = useThemeStore();
const visible = ref<boolean>(false);

const PRESET_COLORS = [
	{ name: '拂晓蓝 (默认)', color: '#1677ff' },
	{ name: '极光绿', color: '#52c41a' },
	{ name: '薄暮红', color: '#f5222d' },
	{ name: '酱紫', color: '#722ed1' },
	{ name: '日落橙', color: '#fa8c16' },
	{ name: '炫酷青', color: '#13c2c2' },
];

const handleCustomColor = (e: Event) => {
	const target = e.target as HTMLInputElement;
	if (target?.value) {
		themeStore.setPrimaryColor(target.value);
	}
};

const handleReset = () => {
	themeStore.setPrimaryColor(DEFAULT_PRIMARY_COLOR);
	if (themeStore.isDark) {
		themeStore.toggleDark(false);
	}
};
</script>

<style lang="scss" scoped>
.theme-setting-card {
	width: 260px;
	padding: 4px 2px;

	.setting-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;

		.title {
			font-size: 14px;
			font-weight: 600;
			color: #1e293b;
		}

		.reset-btn {
			padding: 0;
			font-size: 12px;
			color: #64748b;

			&:hover {
				color: var(--primary-color, #1677ff);
			}
		}
	}

	.setting-item {
		.label {
			font-size: 13px;
			color: #475569;
		}

		&.mode-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&.custom-color-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 14px;
		}
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;

		.color-dot {
			width: 28px;
			height: 28px;
			border-radius: 6px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

			&:hover {
				transform: scale(1.15);
			}

			.check-icon {
				color: #ffffff;
				font-size: 14px;
				font-weight: bold;
				filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
			}
		}
	}

	.custom-color-picker {
		display: flex;
		align-items: center;
		gap: 8px;

		.color-hex-tag {
			font-family: monospace;
			font-size: 12px;
			background: #f1f5f9;
			padding: 2px 6px;
			border-radius: 4px;
			color: #475569;
		}

		.color-input-wrapper {
			position: relative;
			width: 26px;
			height: 26px;
			border-radius: 6px;
			cursor: pointer;
			overflow: hidden;
			display: inline-block;
			border: 1px solid #cbd5e1;

			.native-color-input {
				position: absolute;
				top: -10px;
				left: -10px;
				width: 48px;
				height: 48px;
				opacity: 0;
				cursor: pointer;
			}

			.color-preview {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
	}
}

.tool-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	padding: 0;
	border: 1px solid transparent;
	border-radius: 8px;
	background: transparent;
	color: #64748b;
	font-size: 16px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		color: #1e293b;
		background: #f1f5f9;
		border-color: #e2e8f0;
	}
}
</style>
