<template>
	<div class="login-wrapper" @mousemove="handleMouseMove">
		<component
			v-if="particlesReady"
			:is="'VueParticles'"
			id="tsparticles"
			@particles-loaded="particlesLoaded"
			:options="options"
		></component>

		<header class="login-brand-header">
			<div class="login-logo">A</div>
			<div class="login-brand-text">
				<h1>Alex Platform</h1>
				<p>Enterprise Management System</p>
			</div>
		</header>

		<div class="login-container">
			<!-- Left Side: Interactive Visuals 解耦子组件 -->
			<login-visual-panel
				:is-email-focused="isEmailFocused"
				:is-password-focused="isPasswordFocused"
				:mouse-pos="mousePos"
				:page-entered="pageEntered"
			/>

			<!-- Right Side: Login Form -->
			<div class="login-content">
				<div class="login-form-wrapper">
					<div class="title-container">
						<h1 class="main-title">用户登录</h1>
						<p class="sub-title">企业级管理平台</p>
					</div>

					<a-form
						ref="formRef"
						:model="loginForm"
						class="login-form"
						:rules="loginRules"
						layout="vertical"
					>
						<a-form-item label="用户名" name="username">
							<a-input
								v-model:value="loginForm.username"
								allow-clear
								placeholder="请输入用户名"
								autocomplete="on"
								size="large"
								@focus="isEmailFocused = true"
								@blur="isEmailFocused = false"
							>
								<template #prefix>
									<user-outlined />
								</template>
							</a-input>
						</a-form-item>

						<a-form-item label="密码" name="password">
							<a-input-password
								v-model:value="loginForm.password"
								placeholder="请输入密码"
								autocomplete="on"
								size="large"
								@focus="isPasswordFocused = true"
								@blur="isPasswordFocused = false"
							>
								<template #prefix>
									<lock-outlined />
								</template>
							</a-input-password>
						</a-form-item>

						<div class="form-footer">
							<a-checkbox v-model:checked="loginForm.isRememberMe">
								30 天内免登录
							</a-checkbox>
							<span class="forgot-link">忘记密码？</span>
						</div>

						<a-button
							type="primary"
							block
							size="large"
							:loading="loading"
							@click="onSubmit"
							class="login-btn"
						>
							登 录
						</a-button>

						<!-- <p class="signup-prompt">
							Don't have an account? <span>Sign up</span>
						</p> -->
					</a-form>
				</div>
			</div>
		</div>

		<footer class="login-page-footer">
			<span>© 2026 Alex Technology</span>
			<span>Version 0.1.0</span>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import type { UnwrapRef } from 'vue';
import type { FormInstance } from 'ant-design-vue';
import type { LoginParams } from '@/views/login/config';
import { loginRules, options } from '@/views/login/config';
import { useUserStore } from '@/store/modules/user/user';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { decryptSimple, encrypt } from '@/utils/crypto';
import { useLoginStore } from '@/store/modules/login';

const particlesGlobalKey = '__particles_installed__';

const router = useRouter();
const userStore = useUserStore();
const loginStore = useLoginStore();

// 登录表单
const loginForm: UnwrapRef<LoginParams> = reactive({
	username: '',
	password: '',
	isRememberMe: false,
});

// 登录按钮加载状态
const loading = ref<boolean>(false);
const particlesReady = ref<boolean>(false);
const pageEntered = ref<boolean>(false);
const formRef = ref<FormInstance>();

// Mouse tracking for eyes
const mousePos = reactive({ x: 0, y: 0 });
const isEmailFocused = ref<boolean>(false);
const isPasswordFocused = ref<boolean>(false);

const handleMouseMove = (e: MouseEvent) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
};

const initParticles = async () => {
	const instance = getCurrentInstance();
	const app = instance?.appContext.app;
	if (!app) return;

	const win = window as unknown as Record<string, unknown>;
	if (!win[particlesGlobalKey]) {
		const [{ default: Particles }, { loadSlim }] = await Promise.all([
			import('@tsparticles/vue3'),
			import('@tsparticles/slim'),
		]);
		app.use(Particles, {
			init: async (engine) => {
				await loadSlim(engine);
			},
		});
		win[particlesGlobalKey] = true;
	}
	particlesReady.value = true;
};

const onKeydownEnter = (e: KeyboardEvent) => {
	if (e.isComposing) return;
	if (e.key !== 'Enter') return;
	if (loading.value) return;
	onSubmit();
};

const onSubmit = async () => {
	if (loading.value) return;

	loading.value = true;
	try {
		await formRef.value?.validate();
		const params: LoginParams = {
			username: loginForm.username,
			password: loginForm.password,
			isRememberMe: loginForm.isRememberMe,
		};
		loginStore.setLoginInfo(loginForm.isRememberMe ? encrypt(params) : '');
		const success = await userStore.login(params);
		if (success) {
			await router.push('/');
		}
	} catch (error) {
		console.error('login failed', error);
	} finally {
		loading.value = false;
	}
};

onMounted(async () => {
	await initParticles();
	pageEntered.value = true;
	window.addEventListener('keydown', onKeydownEnter);
	const loginInfo = loginStore.getLoginInfo;
	if (loginInfo) {
		const info = decryptSimple(loginInfo) as LoginParams;
		if (info) {
			loginForm.username = info.username || '';
			loginForm.password = info.password || '';
			loginForm.isRememberMe = info.isRememberMe || false;
		}
	}
});

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydownEnter);
});

const particlesLoaded = (container: unknown) => {
	console.log('Particles container loaded', container);
};
</script>

<style lang="less" scoped>
.login-wrapper {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	position: relative;
	align-items: center;
	justify-content: center;
	background:
		radial-gradient(
			ellipse 80% 50% at 20% 40%,
			rgba(22, 119, 255, 0.12),
			transparent
		),
		radial-gradient(
			ellipse 60% 40% at 80% 60%,
			rgba(64, 150, 255, 0.1),
			transparent
		),
		linear-gradient(135deg, #0f172a, #111827, #1e293b);
}

.login-brand-header {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 32px;
	z-index: 10;

	.login-logo {
		width: 44px;
		height: 44px;
		border-radius: 8px;
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #fff;
		font-size: 22px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.login-brand-text {
		h1 {
			margin: 0;
			font-size: 24px;
			font-weight: 700;
			color: #fff;
		}
		p {
			margin: 4px 0 0;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.55);
		}
	}
}

.login-page-footer {
	position: absolute;
	bottom: 24px;
	left: 0;
	right: 0;
	display: flex;
	justify-content: center;
	gap: 48px;
	font-size: 13px;
	color: rgba(255, 255, 255, 0.35);
	z-index: 10;
}

.login-container {
	width: 90%;
	max-width: 1400px;
	height: 75vh;
	min-height: 680px;
	display: flex;
	background-color: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(15px);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 32px;
	overflow: hidden;
	box-shadow:
		0 25px 50px -12px rgba(0, 0, 0, 0.5),
		0 0 0 1px rgba(255, 255, 255, 0.05);
	position: relative;
	z-index: 10;
}

/* Left Side Styles */
.login-visual {
	flex: 1.65;
	border-right: 1px solid rgba(255, 255, 255, 0.05);
}


/* Right Side Styles */
.login-content {
	flex: 1;
	background-color: rgba(255, 255, 255, 0.98);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60px;
	z-index: 1;

	.login-form-wrapper {
		width: 100%;
		max-width: 420px;
	}

	.title-container {
		margin-bottom: 40px;
		.main-title {
			font-size: 32px;
			font-weight: 700;
			color: #1a1a1a;
			margin-bottom: 8px;
		}
		.sub-title {
			font-size: 16px;
			color: #666;
		}
	}

	:deep(.ant-form-item-label > label) {
		font-weight: 500;
		color: #333;
	}

	:deep(.ant-input-affix-wrapper-large),
	:deep(.ant-input-password-large) {
		border-radius: 10px;
		padding: 10px 15px;
		border: 1px solid #e2e8f0;

		&:hover,
		&:focus-within {
			border-color: #1677ff;
			box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
		}

		.ant-input {
			font-size: 16px;
		}

		.anticon {
			color: #94a3b8;
			font-size: 18px;
		}
	}

	.form-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;

		.forgot-link {
			color: #1677ff;
			font-weight: 500;
			cursor: pointer;
			&:hover {
				text-decoration: underline;
			}
		}
	}

	.login-btn {
		height: 48px;
		border-radius: 10px;
		background-color: #1677ff;
		border: none;
		font-weight: 600;
		font-size: 16px;
		margin-bottom: 20px;

		&:hover {
			background-color: #4096ff;
		}
	}

	.social-login {
		.google-btn {
			height: 48px;
			border-radius: 8px;
			border: 1px solid #e2e8f0;
			font-weight: 500;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10px;
			color: #1a1a1a;

			&:hover {
				background-color: #f8fafc;
				border-color: #cbd5e1;
			}
		}
	}

	.signup-prompt {
		text-align: center;
		margin-top: 30px;
		color: #666;
		span {
			color: #7c4dff;
			font-weight: 600;
			cursor: pointer;
			&:hover {
				text-decoration: underline;
			}
		}
	}
}

/* Mobile Responsive */
@media (max-width: 992px) {
	.login-brand-header {
		margin-bottom: 20px;

		.login-brand-text h1 {
			font-size: 20px;
		}
	}

	.login-page-footer {
		position: relative;
		bottom: auto;
		margin-top: 24px;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.login-container {
		height: auto;
		min-height: auto;
		flex-direction: column;
		width: 95%;
		border-radius: 20px;
	}
	.login-visual {
		display: none;
	}
	.login-content {
		flex: 1;
		padding: 40px 20px;
	}
}
</style>
