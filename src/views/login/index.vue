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
			<!-- Left Side: Interactive Visuals -->
			<div class="login-visual">
				<div class="login-visual-panel">
					<div class="panel-copy">
						<h2 class="copy-title">{{ alexFriendsTitle }}</h2>
						<p class="copy-slogan">{{ platformSlogan }}</p>
						<div class="copy-divider"></div>
						<ul class="copy-features">
							<li v-for="friend in alexFriends" :key="friend.id">
								<span :class="['feature-dot', friend.colorClass]"></span>
								<component
									:is="featureIconMap[friend.colorClass]"
									class="feature-icon"
								/>
								<span class="feature-label">{{ friend.role }}</span>
								<span class="feature-name">{{ friend.name }}</span>
							</li>
						</ul>
						<div class="copy-divider"></div>
						<p class="copy-warm">{{ platformWarmLine }}</p>
					</div>
					<div class="panel-stage">
						<div class="character-halo"></div>
						<div class="character-ground"></div>
						<div
							class="character-container"
							:class="{ 'is-entered': pageEntered }"
						>
							<div
								v-for="char in characters"
								:key="char.id"
								:class="['character', char.colorClass]"
								:style="getCharacterStyle(char)"
							>
								<div class="eyes">
									<div
										class="eye"
										:style="{
											height: char.isBlinking ? '2px' : '15px',
										}"
									>
										<div
											v-if="!char.isBlinking"
											class="pupil"
											:style="getPupilStyle()"
										></div>
									</div>
									<div
										class="eye"
										:style="{
											height: char.isBlinking ? '2px' : '15px',
										}"
									>
										<div
											v-if="!char.isBlinking"
											class="pupil"
											:style="getPupilStyle()"
										></div>
									</div>
								</div>
								<div v-if="char.hasMouth" class="mouth"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="visual-gradient"></div>
			</div>

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
import type { FormInstance } from 'ant-design-vue';
import type { UnwrapRef } from 'vue';
import type { LoginParams } from '@/views/login/config';
import { loginRules, options } from '@/views/login/config';
import {
	ALEX_FRIENDS,
	ALEX_FRIENDS_TITLE,
	PLATFORM_SLOGAN,
	PLATFORM_WARM_LINE,
	type CharacterColorClass,
} from '@/views/login/config/alexFriends';
import { useUserStore } from '@/store/modules/user/user';
import {
	UserOutlined,
	LockOutlined,
	BarChartOutlined,
	ApartmentOutlined,
	RobotOutlined,
} from '@ant-design/icons-vue';
import { decryptSimple, encrypt } from '@/utils/crypto';
import { useLoginStore } from '@/store/modules/login-store';

interface CharacterItem {
	id: number;
	name: string;
	role: string;
	colorClass: CharacterColorClass;
	baseHeight: number;
	hasMouth: boolean;
	isBlinking: boolean;
}

const alexFriends = ALEX_FRIENDS;
const alexFriendsTitle = ALEX_FRIENDS_TITLE;
const platformSlogan = PLATFORM_SLOGAN;
const platformWarmLine = PLATFORM_WARM_LINE;

const featureIconMap: Record<CharacterColorClass, typeof UserOutlined> = {
	coral: UserOutlined,
	purple: BarChartOutlined,
	black: ApartmentOutlined,
	yellow: RobotOutlined,
};

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
const particlesReady = ref(false);
const pageEntered = ref(false);
const formRef = ref<FormInstance>();
const blinkTimerIds = ref<number[]>([]);

// Mouse tracking for eyes
const mousePos = reactive({ x: 0, y: 0 });
const isEmailFocused = ref(false);
const isPasswordFocused = ref(false);

const characters = reactive<CharacterItem[]>(
	ALEX_FRIENDS.map((friend) => ({
		...friend,
		isBlinking: false,
	})),
);

const handleMouseMove = (e: MouseEvent) => {
	mousePos.x = e.clientX;
	mousePos.y = e.clientY;
};

const getCharacterStyle = (char: CharacterItem) => {
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

const getPupilStyle = () => {
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

const scheduleBlink = (charIndex: number) => {
	const delay = Math.random() * 4000 + 8000;
	const blinkStartTimer = window.setTimeout(() => {
		characters[charIndex].isBlinking = true;
		const blinkEndTimer = window.setTimeout(() => {
			characters[charIndex].isBlinking = false;
			scheduleBlink(charIndex);
		}, 150);
		blinkTimerIds.value.push(blinkEndTimer);
	}, delay);
	blinkTimerIds.value.push(blinkStartTimer);
};

const clearBlinkTimers = () => {
	blinkTimerIds.value.forEach((timerId) => window.clearTimeout(timerId));
	blinkTimerIds.value = [];
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
	characters.forEach((_, index) => scheduleBlink(index));
});

onUnmounted(() => {
	window.removeEventListener('keydown', onKeydownEnter);
	clearBlinkTimers();
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
	background-color: transparent;
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	z-index: 1;
	border-right: 1px solid rgba(255, 255, 255, 0.05);

	.login-visual-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 36px 48px 20px;
		position: relative;
		z-index: 2;
	}

	.panel-copy {
		flex-shrink: 0;

		.copy-title {
			margin: 0 0 8px;
			font-size: 26px;
			font-weight: 700;
			color: rgba(255, 255, 255, 0.92);
		}

		.copy-slogan {
			margin: 0;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.55);
		}

		.copy-divider {
			height: 1px;
			margin: 20px 0;
			background: linear-gradient(
				90deg,
				rgba(22, 119, 255, 0.45),
				rgba(255, 255, 255, 0.08),
				transparent
			);
		}

		.copy-features {
			list-style: none;
			padding: 0;
			margin: 0;

			li {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 14px;
				font-size: 15px;
				color: rgba(255, 255, 255, 0.78);
			}

			.feature-dot {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				flex-shrink: 0;

				&.coral {
					background-color: #f07050;
				}
				&.purple {
					background-color: #7c4dff;
				}
				&.black {
					background-color: #334155;
					box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.35);
				}
				&.yellow {
					background-color: #fdd835;
				}
			}

			.feature-icon {
				font-size: 15px;
				color: #1677ff;
			}

			.feature-label {
				flex: 1;
			}

			.feature-name {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.4);
				letter-spacing: 0.02em;
			}
		}

		.copy-warm {
			margin: 0;
			font-size: 15px;
			font-weight: 500;
			color: rgba(255, 255, 255, 0.65);
			letter-spacing: 0.04em;
		}
	}

	.panel-stage {
		flex: 1;
		min-height: 300px;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		position: relative;
		margin-top: 8px;
	}

	.character-halo {
		position: absolute;
		bottom: 48px;
		left: 50%;
		transform: translateX(-50%);
		width: 420px;
		height: 300px;
		background: radial-gradient(
			ellipse at center,
			rgba(22, 119, 255, 0.2) 0%,
			rgba(22, 119, 255, 0.06) 45%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 0;
	}

	.character-ground {
		position: absolute;
		bottom: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 460px;
		height: 28px;
		background: radial-gradient(
			ellipse at center,
			rgba(0, 0, 0, 0.45) 0%,
			rgba(22, 119, 255, 0.08) 35%,
			transparent 72%
		);
		pointer-events: none;
		z-index: 1;
	}

	#tsparticles {
		display: none;
	}

	.character-container {
		display: flex;
		align-items: flex-end;
		gap: 0;
		position: relative;
		z-index: 2;
		width: 100%;
		justify-content: center;
		opacity: 0;
		transform: translateY(24px);

		&.is-entered {
			animation: character-rise-in 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275)
				forwards;
		}
	}

	.character {
		width: 145px;
		border-radius: 72px 72px 0 0;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding-top: 48px;
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow:
			0 0 28px rgba(22, 119, 255, 0.22),
			0 8px 24px rgba(0, 0, 0, 0.25);
		outline: 2px solid rgba(22, 119, 255, 0.14);

		&:hover {
			transform: translateY(-6px);
			box-shadow:
				0 0 36px rgba(22, 119, 255, 0.32),
				0 12px 28px rgba(0, 0, 0, 0.28);
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
		background:
			radial-gradient(
				circle at 50% 85%,
				rgba(22, 119, 255, 0.08) 0%,
				transparent 45%
			),
			radial-gradient(
				circle at 50% 20%,
				rgba(0, 0, 0, 0.28) 0%,
				transparent 50%
			);
		pointer-events: none;
	}
}

@keyframes character-rise-in {
	from {
		opacity: 0;
		transform: translateY(24px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@media (prefers-reduced-motion: reduce) {
	.login-visual .character-container {
		opacity: 1;
		transform: translateY(0);

		&.is-entered {
			animation: none;
		}
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
