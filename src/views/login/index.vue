<template>
	<div class="login-container">
		<!--引入粒子特效-->
		<vue-particles
			id="tsparticles"
			@particles-loaded="particlesLoaded"
			:options="options"
		/>
		<div class="login-form-container">
			<a-form
				ref="formRef"
				:model="loginForm"
				class="login-form"
				:rules="loginRules"
			>
				<div class="title-container">
					<div class="title">alex管理后台</div>
					<p class="sub-title">Alex Admin Console</p>
				</div>

				<a-form-item name="username">
					<a-input
						v-model:value="loginForm.username"
						placeholder="请输入用户名"
						autocomplete="on"
						size="large"
						class="custom-input"
					>
						<template #prefix>
							<user-outlined class="input-icon" />
						</template>
					</a-input>
				</a-form-item>
				<a-form-item name="password">
					<a-input-password
						v-model:value="loginForm.password"
						type="password"
						placeholder="请输入密码"
						autocomplete="on"
						size="large"
						class="custom-input"
					>
						<template #prefix>
							<lock-outlined class="input-icon" />
						</template>
					</a-input-password>
				</a-form-item>

				<div class="login-options">
					<a-checkbox
						v-model:checked="loginForm.isRememberMe"
						class="remember-me"
					>
						记住我
					</a-checkbox>
					<!-- <a class="forgot-password">忘记密码?</a> -->
				</div>

				<a-form-item>
					<a-button
						type="primary"
						@click="onSubmit"
						style="width: 100%"
						:loading="loading"
						size="large"
						class="submit-btn"
					>
						登录
					</a-button>
				</a-form-item>
			</a-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { UnwrapRef } from 'vue';
import type { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
import type { LoginParams } from '@/views/login/config';
import { loginRules, options } from '@/views/login/config';
import { useUserStore } from '@/store/modules/user/user';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { decryptSimple, encrypt } from '@/utils/crypto';
import { useLoginStore } from '@/store/modules/login-store';

const router = useRouter();
const userStore = useUserStore();
const loginStore = useLoginStore();
const formRef = ref();

// 登录表单
const loginForm: UnwrapRef<LoginParams> = reactive({
	username: '',
	password: '',
	isRememberMe: false,
});

// 登录按钮加载状态
const loading = ref<boolean>(false);

/**
 * AI Agent
 * 监听键盘 Enter，触发登录
 * - 使用 window 监听，避免受组件内部 focus/事件冒泡影响
 * - loading 时不重复触发
 * - 输入法组合输入过程中不触发（避免回车上屏时误触）
 */
const onKeydownEnter = (e: KeyboardEvent) => {
	if (e.isComposing) {
		return;
	}
	if (e.key !== 'Enter') {
		return;
	}
	if (loading.value) {
		return;
	}
	onSubmit();
};

// 登录提交
const onSubmit = () => {
	loading.value = true;
	formRef.value
		.validate()
		.then(async () => {
			let param: LoginParams = {
				username: loginForm.username,
				password: loginForm.password,
				isRememberMe: loginForm.isRememberMe,
			};
			// 如果记住我，则加密登录信息
			if (loginForm.isRememberMe) {
				// 加密登录信息
				loginStore.setLoginInfo(encrypt(param));
			} else {
				// 清空登录信息
				loginStore.setLoginInfo('');
			}
			const res = await userStore.login(param);
			if (res) {
				// 登录成功，跳转首页
				router.push('/');
			}
		})
		.catch((error: ValidateErrorEntity<LoginParams>) => {
			console.log('error', error);
		})
		.finally(() => {
			loading.value = false;
		});
};

// 生命周期钩子
onMounted(() => {
	// AI Agent: 绑定回车登录
	window.addEventListener('keydown', onKeydownEnter);

	// 获取登录信息
	const loginInfo = loginStore.getLoginInfo;
	// 如果登录信息存在，则解密登录信息
	if (loginInfo) {
		const info = decryptSimple(loginInfo) as LoginParams;
		// 如果解密成功，则设置登录表单
		if (info) {
			loginForm.username = info.username || '';
			loginForm.password = info.password || '';
			loginForm.isRememberMe = info.isRememberMe || false;
		}
	}
});

onUnmounted(() => {
	// AI Agent: 移除回车登录监听，避免影响其它页面
	window.removeEventListener('keydown', onKeydownEnter);
});

// 粒子加载完成
const particlesLoaded = async (container: unknown) => {
	console.log('Particles container loaded', container);
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #000000;
$dark_gray: #889aa4;
$light_gray: #eee;
$form_bg: rgba(255, 255, 255, 0.05);

.login-container {
	position: fixed;
	height: 100%;
	width: 100%;
	background-color: $bg;
	display: flex;
	justify-content: center;
	align-items: center;

	.login-form-container {
		position: relative;
		z-index: 1;
		width: 380px;
		padding: 40px;
		background: rgba(30, 30, 30, 0.6); // 深色半透明背景
		backdrop-filter: blur(10px); // 毛玻璃效果
		border-radius: 16px;
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
		border: 1px solid rgba(255, 255, 255, 0.1);

		.title-container {
			text-align: center;
			margin-bottom: 30px;

			.title {
				font-size: 28px;
				color: #fff;
				font-weight: 600;
				margin-bottom: 8px;
			}

			.sub-title {
				font-size: 14px;
				color: #8c8c8c;
				margin: 0;
			}
		}

		:deep(.ant-input-affix-wrapper) {
			background-color: #000000;
			border: 1px solid #434343;
			color: #fff;
			height: 44px;
			border-radius: 6px;
			transition: all 0.3s;

			&:hover,
			&:focus-within {
				border-color: #1890ff;
				box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
			}

			input {
				background-color: transparent;
				color: #fff;
				&::placeholder {
					color: #5a5a5a;
				}

				// 解决自动填充背景变白的问题
				&:-webkit-autofill,
				&:-webkit-autofill:hover,
				&:-webkit-autofill:focus,
				&:-webkit-autofill:active {
					transition: background-color 5000s ease-in-out 0s;
					-webkit-text-fill-color: #fff !important;
					caret-color: #fff;
					box-shadow: 0 0 0 1000px #000000 inset !important;
				}
			}

			.anticon {
				color: #8c8c8c;
				margin-right: 10px;
			}
		}

		:deep(.ant-input) {
			background-color: transparent;
			color: #fff;
		}

		.login-options {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24px;
			margin-top: -5px;

			.remember-me {
				color: #8c8c8c;
				:deep(.ant-checkbox-inner) {
					background-color: transparent;
					border-color: #434343;
				}
			}

			.forgot-password {
				color: #8c8c8c;
				font-size: 14px;
				cursor: pointer;
				&:hover {
					color: #1890ff;
				}
			}
		}

		.submit-btn {
			height: 44px;
			font-size: 16px;
			border-radius: 6px;
			background-color: #1890ff;
			border-color: #1890ff;
			font-weight: 500;

			&:hover {
				background-color: #40a9ff;
				border-color: #40a9ff;
			}
		}
	}
}
</style>
