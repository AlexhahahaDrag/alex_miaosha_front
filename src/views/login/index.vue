<template>
	<div class="login-wrapper" @mousemove="handleMouseMove">
		<vue-particles
			v-if="particlesReady"
			id="tsparticles"
			@particles-loaded="particlesLoaded"
			:options="options"
		></vue-particles>

		<div class="login-container">
			<!-- Left Side: Interactive Visuals -->
			<div class="login-visual">
				<div class="character-container">
					<div
						v-for="char in characters"
						:key="char.id"
						:class="['character', char.colorClass]"
						:style="getCharacterStyle(char)"
					>
						<div class="eyes">
							<div
								class="eye"
								:style="{ height: char.isBlinking ? '2px' : '15px' }"
							>
								<div
									v-if="!char.isBlinking"
									class="pupil"
									:style="getPupilStyle(char, 'left')"
								></div>
							</div>
							<div
								class="eye"
								:style="{ height: char.isBlinking ? '2px' : '15px' }"
							>
								<div
									v-if="!char.isBlinking"
									class="pupil"
									:style="getPupilStyle(char, 'right')"
								></div>
							</div>
						</div>
						<div v-if="char.hasMouth" class="mouth"></div>
					</div>
				</div>
				<!-- Optional subtle particles overlay simplified -->
				<div class="visual-gradient"></div>
			</div>

			<!-- Right Side: Login Form -->
			<div class="login-content">
				<div class="login-form-wrapper">
					<div class="title-container">
						<h1 class="main-title">Alex 管理系统</h1>
						<p class="sub-title">一个你最需要的系统</p>
					</div>

					<a-form
						ref="formRef"
						:model="loginForm"
						class="login-form"
						:rules="loginRules"
						layout="vertical"
					>
						<a-form-item label="Username" name="username">
							<a-input
								v-model:value="loginForm.username"
								placeholder="Enter your username"
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

						<a-form-item label="Password" name="password">
							<a-input-password
								v-model:value="loginForm.password"
								placeholder="••••••••"
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
								Remember for 30 days
							</a-checkbox>
							<span class="forgot-link">Forgot password?</span>
						</div>

						<a-button
							type="primary"
							block
							size="large"
							:loading="loading"
							@click="onSubmit"
							class="login-btn"
						>
							Log in
						</a-button>

						<!-- <p class="signup-prompt">
							Don't have an account? <span>Sign up</span>
						</p> -->
					</a-form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import type { UnwrapRef } from 'vue';
import type { ValidateErrorEntity } from 'ant-design-vue/es/form/interface';
import type { LoginParams } from '@/views/login/config';
import { loginRules, options } from '@/views/login/config';
import { useUserStore } from '@/store/modules/user/user';
import {
	UserOutlined,
	LockOutlined,
	GoogleOutlined,
} from '@ant-design/icons-vue';
import { decryptSimple, encrypt } from '@/utils/crypto';
import { useLoginStore } from '@/store/modules/login-store';

const router = useRouter();
const userStore = useUserStore();
const loginStore = useLoginStore();
const formRef = ref();
const particlesReady = ref(false);

const initParticles = async () => {
	const instance = getCurrentInstance();
	const app = instance?.appContext.app;
	if (!app) return;

	const globalKey = '__particles_installed__';
	const win = window as unknown as Record<string, unknown>;
	if (!win[globalKey]) {
		const [{ default: Particles }, { loadSlim }] = await Promise.all([
			import('@tsparticles/vue3'),
			import('@tsparticles/slim'),
		]);
		app.use(Particles, {
			init: async (engine) => {
				await loadSlim(engine);
			},
		});
		win[globalKey] = true;
	}
	particlesReady.value = true;
};

// 登录表单
const loginForm: UnwrapRef<LoginParams> = reactive({
	username: '',
	password: '',
	isRememberMe: false,
});

// 登录按钮加载状态
const loading = ref<boolean>(false);

// Mouse tracking for eyes
const mousePos = reactive({ x: 0, y: 0 });
const handleMouseMove = (e: MouseEvent) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
};

// Form focus states for characters
const isEmailFocused = ref(false);
const isPasswordFocused = ref(false);

const characters = reactive([
	{
		id: 1,
		colorClass: 'coral',
		baseHeight: 140,
		hasMouth: false,
		isBlinking: false,
	},
	{
		id: 2,
		colorClass: 'purple',
		baseHeight: 260,
		hasMouth: false,
		isBlinking: false,
	},
	{
		id: 3,
		colorClass: 'black',
		baseHeight: 200,
		hasMouth: true,
		isBlinking: false,
	},
	{
		id: 4,
		colorClass: 'yellow',
		baseHeight: 180,
		hasMouth: true,
		isBlinking: false,
	},
]);

const getCharacterStyle = (char: any) => {
	let transform = 'translateY(20px)';
	let height = `${char.baseHeight}px`;

	if (isEmailFocused.value) {
		// Tilting towards the form (right)
		transform = 'translateY(20px) skewX(-12deg) translateX(40px)';
		height = `${char.baseHeight + 40}px`;
	} else if (isPasswordFocused.value) {
		// Hiding or tilting away
		transform = 'translateY(20px) skewX(12deg) translateX(-20px)';
	}

	return {
		height,
		transform,
		transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
	};
};

const getPupilStyle = (char: any, side: string) => {
	// Calculate relative mouse position considering character movement
	let offsetX = 0;
	if (isEmailFocused.value) offsetX = 40;
	if (isPasswordFocused.value) offsetX = -20;

	const dx = mousePos.x - (window.innerWidth / 4 + offsetX);
	const dy = mousePos.y - window.innerHeight / 2;
	const angle = Math.atan2(dy, dx);

	// Shyness factor: during password focus, eyes look away
	let distance = Math.min(4, Math.sqrt(dx * dx + dy * dy) / 50);
	let finalAngle = angle;

	if (isPasswordFocused.value) {
		finalAngle += Math.PI; // Look opposite way
		distance = 2; // Fixed look away
	}

	return {
		transform: `translate(${Math.cos(finalAngle) * distance}px, ${Math.sin(finalAngle) * distance}px)`,
		transition: 'transform 0.1s ease-out',
	};
};

// Blinking logic
const scheduleBlink = (charIndex: number) => {
	const delay = Math.random() * 4000 + 2000;
	setTimeout(() => {
		characters[charIndex].isBlinking = true;
		setTimeout(() => {
			characters[charIndex].isBlinking = false;
			scheduleBlink(charIndex);
		}, 150);
	}, delay);
};

/**
 * AI Agent
 * 监听键盘 Enter，触发登录
 */
const onKeydownEnter = (e: KeyboardEvent) => {
	if (e.isComposing) return;
	if (e.key !== 'Enter') return;
	if (loading.value) return;
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
			if (loginForm.isRememberMe) {
				loginStore.setLoginInfo(encrypt(param));
			} else {
				loginStore.setLoginInfo('');
			}
			const res = await userStore.login(param);
			if (res) {
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
onMounted(async () => {
	await initParticles();

	// 绑定回车登录
onMounted(() => {
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
	// Start blinking for each character
	characters.forEach((_, index) => scheduleBlink(index));
});

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydownEnter);
});

// 粒子加载完成
const particlesLoaded = async (container: unknown) => {
	console.log('Particles container loaded', container);
};
</script>

<style lang="scss" scoped>
.login-wrapper {
	display: flex;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
	background-color: transparent;
	position: relative;
	align-items: center;
	justify-content: center;
}

.login-container {
	width: 90%;
	max-width: 1300px;
	height: 70vh;
	min-height: 650px;
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
	flex: 1.1;
	background-color: transparent;
	position: relative;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding-bottom: 0;
	overflow: hidden;
	z-index: 1;
	border-right: 1px solid rgba(255, 255, 255, 0.05);

	#tsparticles {
		display: none; /* Hide container-local particles if any */
	}

	.character-container {
		display: flex;
		align-items: flex-end;
		gap: 0;
		position: relative;
		z-index: 2;
		width: 100%;
		justify-content: center;
		transform: translateY(20px);
	}

	.character {
		width: 120px;
		border-radius: 60px 60px 0 0;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-top: 40px;
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

		&:hover {
			transform: translateY(-5px);
		}

		&.coral {
			background-color: #f07050;
			z-index: 4;
		}
		&.purple {
			background-color: #7c4dff;
			z-index: 1;
			margin-left: -20px;
		}
		&.black {
			background-color: #111;
			z-index: 3;
			margin-left: -30px;

			/* Conan Shadow Man expressive eyes */
			.eye {
				width: 18px;
				height: 14px;
				border-radius: 80% 20% 80% 20%;
			}
			.eye:first-child {
				transform: rotate(15deg);
			}
			.eye:last-child {
				transform: scaleX(-1) rotate(15deg);
			}

			/* Shadow Man white grin */
			.mouth {
				width: 36px;
				height: 16px;
				background-color: #fff;
				margin-top: 12px;
				border-radius: 0 0 18px 18px;
			}
		}
		&.yellow {
			background-color: #fdd835;
			z-index: 2;
			margin-left: -20px;
			.eye {
				background-color: #1a1a1a !important;
			}
			.pupil {
				background-color: #fff !important;
			}
		}

		.eyes {
			display: flex;
			gap: 15px;
		}

		.eye {
			width: 15px;
			height: 15px;
			background-color: #fff;
			border-radius: 50%;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: height 0.1s ease-in-out;
		}

		.pupil {
			width: 6px;
			height: 6px;
			background-color: #1a1a1a;
			border-radius: 50%;
			transition: transform 0.1s ease-out;
		}

		.mouth {
			width: 30px;
			height: 2px;
			background-color: #1a1a1a;
			margin-top: 20px;
			border-radius: 1px;
		}
	}

	.visual-gradient {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle at center,
			transparent 0%,
			rgba(0, 0, 0, 0.2) 100%
		);
		pointer-events: none;
	}
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
		border-radius: 8px;
		padding: 10px 15px;
		border: 1px solid #e2e8f0;

		&:hover,
		&:focus-within {
			border-color: #7c4dff;
			box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.1);
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
			color: #7c4dff;
			font-weight: 500;
			cursor: pointer;
			&:hover {
				text-decoration: underline;
			}
		}
	}

	.login-btn {
		height: 48px;
		border-radius: 8px;
		background-color: #1a1a1a;
		border: none;
		font-weight: 600;
		font-size: 16px;
		margin-bottom: 20px;

		&:hover {
			background-color: #333;
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
