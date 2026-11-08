<template>
	<div class="login-visual">
		<div class="login-visual-panel">
			<div class="panel-copy">
				<h2 class="copy-title">{{ alexFriendsTitle }}</h2>
				<p class="copy-slogan">{{ platformSlogan }}</p>
				<div class="copy-divider"></div>
				<ul class="copy-features">
					<li
						v-for="friend in alexFriends"
						:key="friend.id"
						:class="{ 'is-hovered': hoveredCharId === friend.id }"
						@mouseenter="hoveredCharId = friend.id"
						@mouseleave="hoveredCharId = null"
					>
						<span :class="['feature-dot', friend.colorClass]"></span>
						<component
							:is="featureIconMap[friend.colorClass]"
							class="feature-icon"
						/>
						<span class="feature-label">{{ friend.role }}</span>
						<span class="feature-name">{{ friend.name }}</span>
						<span class="feature-badge">{{ friend.greeting }}</span>
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
						v-for="(char, index) in characters"
						:key="char.id"
						class="character-wrapper"
						:style="{ zIndex: char.zIndex }"
						@mouseenter="hoveredCharId = char.id"
						@mouseleave="hoveredCharId = null"
					>
						<!-- 角色气泡语录 -->
						<transition name="bubble-fade">
							<div
								v-if="hoveredCharId === char.id"
								class="speech-bubble"
							>
								<span>{{ char.greeting }}</span>
								<div class="bubble-arrow"></div>
							</div>
						</transition>

						<!-- 角色主体（高矮胖瘦差异化） -->
						<div
							:class="[
								'character',
								char.colorClass,
								char.bodyShape,
								{ 'is-hovered': hoveredCharId === char.id },
								{ 'is-shy': isPasswordFocused },
								{ 'is-peeking': isEmailFocused },
							]"
							:style="getCharacterStyle(char, index)"
						>
							<!-- 角色配饰 -->
							<div
								v-if="char.accessory === 'antenna'"
								class="accessory-antenna"
							>
								<div class="antenna-ball"></div>
								<div class="antenna-stem"></div>
							</div>

							<div
								v-if="char.accessory === 'tuft'"
								class="accessory-tuft"
							></div>

							<div
								v-if="char.accessory === 'glasses'"
								class="accessory-glasses"
								:style="{ top: `${char.baseHeight > 200 ? 23 : 19}px` }"
							>
								<div class="glasses-lens left"></div>
								<div class="glasses-bridge"></div>
								<div class="glasses-lens right"></div>
							</div>

							<!-- 眼睛区域 -->
							<div
								class="eyes"
								:style="{ gap: `${char.eyeGap}px` }"
							>
								<div
									:class="[
										'eye',
										{ 'is-closed': isPasswordFocused || char.isBlinking },
									]"
									:style="{
										width: `${char.eyeSize}px`,
										height: isPasswordFocused || char.isBlinking ? '3px' : `${char.eyeSize}px`,
									}"
								>
									<div
										v-if="!char.isBlinking && !isPasswordFocused"
										class="pupil"
										:style="getPupilStyle(char, index)"
									>
										<div class="pupil-glint"></div>
									</div>
								</div>

								<div
									:class="[
										'eye',
										{ 'is-closed': isPasswordFocused || char.isBlinking },
									]"
									:style="{
										width: `${char.eyeSize}px`,
										height: isPasswordFocused || char.isBlinking ? '3px' : `${char.eyeSize}px`,
									}"
								>
									<div
										v-if="!char.isBlinking && !isPasswordFocused"
										class="pupil"
										:style="getPupilStyle(char, index)"
									>
										<div class="pupil-glint"></div>
									</div>
								</div>
							</div>

							<!-- 软萌腮红 -->
							<div class="blush-group">
								<div class="blush left"></div>
								<div class="blush right"></div>
							</div>

							<!-- 多样化嘴型 -->
							<div
								v-if="char.hasMouth"
								:class="['mouth', `mouth-${char.mouthType}`]"
							></div>
						</div>

						<!-- 角色专属底部软阴影 -->
						<div
							class="char-shadow"
							:style="getShadowStyle(char)"
						></div>
					</div>
				</div>
			</div>
		</div>
		<div class="visual-gradient"></div>
	</div>
</template>

<script setup lang="ts">
import {
	UserOutlined,
	BarChartOutlined,
	ApartmentOutlined,
	RobotOutlined,
} from '@ant-design/icons-vue';
import {
	ALEX_FRIENDS,
	ALEX_FRIENDS_TITLE,
	PLATFORM_SLOGAN,
	PLATFORM_WARM_LINE,
	type AlexFriendDefinition,
	type CharacterColorClass,
} from '@/views/login/config/alexFriends';

const props = defineProps<{
	isEmailFocused: boolean;
	isPasswordFocused: boolean;
	mousePos: { x: number; y: number };
	pageEntered: boolean;
}>();

interface CharacterItem extends AlexFriendDefinition {
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

const blinkTimerIds = ref<number[]>([]);
const hoveredCharId = ref<number | null>(null);

const characters = reactive<CharacterItem[]>(
	ALEX_FRIENDS.map((friend) => ({
		...friend,
		isBlinking: false,
	})),
);

/** 计算角色在各个状态下的外观与微动作 */
const getCharacterStyle = (char: CharacterItem, index: number) => {
	let transform = `rotate(${char.leanAngle}deg)`;
	let height = `${char.baseHeight}px`;

	// 输入用户名：好奇探头（离表单近的倾角和踮脚程度递进）
	if (props.isEmailFocused) {
		const skewMap = [-6, -10, -12, -14];
		const liftMap = [16, 28, 22, 14];
		const skew = skewMap[index] ?? -10;
		const lift = liftMap[index] ?? 20;
		transform = `translateY(-${lift}px) skewX(${skew}deg) translateX(26px) scale(1.02)`;
		height = `${char.baseHeight + 12}px`;
	} else if (props.isPasswordFocused) {
		// 输入密码：害羞转身微退
		const shiftXMap = [-12, -18, -14, -8];
		const shift = shiftXMap[index] ?? -12;
		transform = `translateX(${shift}px) rotate(${char.leanAngle * -1.8}deg) scale(0.98)`;
	} else if (hoveredCharId.value === char.id) {
		// 鼠标悬停欢快跳起
		transform = `translateY(-14px) scale(1.05) rotate(${char.leanAngle * 0.5}deg)`;
	}

	return {
		width: `${char.baseWidth}px`,
		height,
		borderRadius: char.borderRadius,
		transform,
		transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
	};
};

/** 脚底独立投影随动作同步缩放 */
const getShadowStyle = (char: CharacterItem) => {
	let scale = 1;
	let opacity = 0.55;

	if (hoveredCharId.value === char.id) {
		scale = 0.78;
		opacity = 0.25;
	} else if (props.isEmailFocused) {
		scale = 0.9;
		opacity = 0.4;
	}

	return {
		width: `${char.baseWidth * 0.82}px`,
		transform: `scale(${scale})`,
		opacity,
		transition: 'all 0.35s ease',
	};
};

/** 视线追踪鼠标：按各自水平定位独立计算聚焦夹角 */
const getPupilStyle = (char: CharacterItem, index: number) => {
	if (props.isPasswordFocused) {
		return { transform: 'translate(0, 0)' };
	}

	// 四个角色的大致屏幕横向锚点偏移（Mini, Aleo, Nova, Sunny）
	const charOffsets = [-86, -26, 32, 90];
	const charCenterX = window.innerWidth / 4 + (charOffsets[index] ?? 0) + (props.isEmailFocused ? 28 : 0);
	const charCenterY = window.innerHeight * 0.68;

	const dx = props.mousePos.x - charCenterX;
	const dy = props.mousePos.y - charCenterY;
	const angle = Math.atan2(dy, dx);

	// 最大视线偏移量依角色眼睛大小自适应
	const maxDistance = char.eyeSize <= 13 ? 2.5 : 3.8;
	const distance = Math.min(maxDistance, Math.hypot(dx, dy) / 45);

	return {
		transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
		transition: 'transform 0.1s ease-out',
	};
};

const getRandomValue = (): number => {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / (0xffffffff + 1);
};

/** 错峰高频自然眨眼（3~6秒间隔） */
const scheduleBlink = (charIndex: number) => {
	const delay = getRandomValue() * 3200 + 2800;
	const blinkStartTimer = window.setTimeout(() => {
		characters[charIndex].isBlinking = true;
		const blinkEndTimer = window.setTimeout(() => {
			characters[charIndex].isBlinking = false;
			scheduleBlink(charIndex);
		}, 140);
		blinkTimerIds.value.push(blinkEndTimer);
	}, delay);
	blinkTimerIds.value.push(blinkStartTimer);
};

const clearBlinkTimers = () => {
	blinkTimerIds.value.forEach((timerId) => window.clearTimeout(timerId));
	blinkTimerIds.value = [];
};

onMounted(() => {
	characters.forEach((_, idx) => scheduleBlink(idx));
});

onUnmounted(() => {
	clearBlinkTimers();
});
</script>

<style scoped lang="less">
.login-visual {
	flex: 1.15;
	background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
	position: relative;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

.login-visual-panel {
	position: relative;
	z-index: 2;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 40px;
}

.panel-copy {
	color: #ffffff;
	max-width: 440px;
}

.copy-title {
	font-size: 26px;
	font-weight: 700;
	color: #ffffff;
	margin: 0 0 8px;
}

.copy-slogan {
	font-size: 14px;
	color: #94a3b8;
	margin: 0;
	line-height: 1.5;
}

.copy-divider {
	height: 1px;
	background: rgba(255, 255, 255, 0.08);
	margin: 16px 0;
}

.copy-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;

	li {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: #cbd5e1;
		padding: 5px 8px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.25s ease;

		&:hover,
		&.is-hovered {
			background: rgba(255, 255, 255, 0.07);
			transform: translateX(4px);
			color: #ffffff;

			.feature-badge {
				opacity: 1;
				transform: translateX(0);
			}
		}

		.feature-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;

			&.coral {
				background: #f43f5e;
				box-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
			}
			&.purple {
				background: #a855f7;
				box-shadow: 0 0 8px rgba(168, 85, 247, 0.6);
			}
			&.black {
				background: #0284c7;
				box-shadow: 0 0 8px rgba(2, 132, 199, 0.6);
			}
			&.yellow {
				background: #eab308;
				box-shadow: 0 0 8px rgba(234, 179, 8, 0.6);
			}
		}

		.feature-icon {
			font-size: 14px;
			color: #94a3b8;
		}

		.feature-label {
			color: #94a3b8;
			font-size: 12px;
		}

		.feature-name {
			font-weight: 600;
			color: #f8fafc;
		}

		.feature-badge {
			margin-left: auto;
			font-size: 11px;
			color: #38bdf8;
			background: rgba(56, 189, 248, 0.12);
			padding: 2px 8px;
			border-radius: 10px;
			opacity: 0;
			transform: translateX(-4px);
			transition: all 0.25s ease;
		}
	}
}

.copy-warm {
	font-size: 13px;
	color: #64748b;
	margin: 0;
}

.panel-stage {
	position: relative;
	width: 100%;
	height: 330px;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}

/* 舞台光晕 */
.character-halo {
	position: absolute;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	width: 440px;
	height: 240px;
	background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.18) 0%, rgba(139, 92, 246, 0.1) 45%, transparent 70%);
	pointer-events: none;
	filter: blur(24px);
	z-index: 0;
}

.character-ground {
	position: absolute;
	bottom: 0;
	left: 5%;
	right: 5%;
	height: 18px;
	background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.65) 0%, transparent 75%);
	z-index: 0;
}

.character-container {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	gap: 14px;
	width: 100%;
	height: 100%;
	transform: translateY(60px);
	opacity: 0;
	transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	position: relative;
	z-index: 1;

	&.is-entered {
		transform: translateY(0);
		opacity: 1;
	}
}

.character-wrapper {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
}

/* 角色语音气泡 */
.speech-bubble {
	position: absolute;
	top: -46px;
	background: rgba(15, 23, 42, 0.9);
	color: #ffffff;
	font-size: 12px;
	font-weight: 500;
	padding: 5px 12px;
	border-radius: 12px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
	white-space: nowrap;
	pointer-events: none;
	z-index: 10;

	.bubble-arrow {
		position: absolute;
		bottom: -5px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid rgba(15, 23, 42, 0.9);
	}
}

.bubble-fade-enter-active,
.bubble-fade-leave-active {
	transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-fade-enter-from,
.bubble-fade-leave-to {
	opacity: 0;
	transform: translateY(6px) scale(0.92);
}

/* 3D 软胶质感小人核心 */
.character {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 22px;
	transform-origin: bottom center;

	/* 3D 软胶光影与渐变 */
	&.coral {
		background: linear-gradient(180deg, #fb7185 0%, #f43f5e 52%, #e11d48 100%);
		box-shadow:
			inset 0 4px 8px rgba(255, 255, 255, 0.42),
			inset 0 -6px 12px rgba(159, 18, 57, 0.45),
			0 14px 26px rgba(0, 0, 0, 0.35);
	}

	&.purple {
		background: linear-gradient(180deg, #c084fc 0%, #a855f7 50%, #7e22ce 100%);
		box-shadow:
			inset 0 4px 8px rgba(255, 255, 255, 0.4),
			inset 0 -6px 12px rgba(107, 33, 168, 0.45),
			0 14px 26px rgba(0, 0, 0, 0.35);
	}

	&.black {
		background: linear-gradient(180deg, #38bdf8 0%, #0284c7 50%, #0369a1 100%);
		box-shadow:
			inset 0 4px 8px rgba(255, 255, 255, 0.42),
			inset 0 -6px 12px rgba(7, 89, 133, 0.45),
			0 14px 26px rgba(0, 0, 0, 0.35);
	}

	&.yellow {
		background: linear-gradient(180deg, #fde047 0%, #eab308 52%, #ca8a04 100%);
		box-shadow:
			inset 0 4px 8px rgba(255, 255, 255, 0.52),
			inset 0 -6px 12px rgba(161, 98, 7, 0.45),
			0 14px 26px rgba(0, 0, 0, 0.35);
	}

	/* 配饰：天线 (Sunny) */
	.accessory-antenna {
		position: absolute;
		top: -16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;

		.antenna-ball {
			width: 9px;
			height: 9px;
			background: #fef08a;
			border-radius: 50%;
			box-shadow: 0 0 10px #facc15;
			animation: pulse-glow 2s ease-in-out infinite;
		}

		.antenna-stem {
			width: 2.5px;
			height: 9px;
			background: rgba(255, 255, 255, 0.7);
			border-radius: 2px;
		}
	}

	/* 配饰：呆毛 (Nova) */
	.accessory-tuft {
		position: absolute;
		top: -10px;
		left: 48%;
		width: 10px;
		height: 12px;
		border-right: 2.5px solid #e0f2fe;
		border-top: 2.5px solid #e0f2fe;
		border-radius: 0 12px 0 0;
		transform: rotate(-15deg);
		pointer-events: none;
	}

	/* 配饰：眼镜 (Aleo) */
	.accessory-glasses {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 3px;
		pointer-events: none;
		z-index: 4;

		.glasses-lens {
			width: 17px;
			height: 17px;
			border: 2px solid rgba(255, 255, 255, 0.85);
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.12);
			box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3);
		}

		.glasses-bridge {
			width: 5px;
			height: 2px;
			background: rgba(255, 255, 255, 0.85);
			border-radius: 1px;
		}
	}

	/* 眼睛 */
	.eyes {
		display: flex;
		align-items: center;
		position: relative;
		z-index: 2;

		.eye {
			background: #ffffff;
			border-radius: 50%;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
			transition: height 0.15s ease;

			&.is-closed {
				background: transparent;
				border-bottom: 2.5px solid #0f172a;
				border-radius: 0 0 10px 10px;
				box-shadow: none;
			}

			.pupil {
				width: 52%;
				height: 52%;
				background: #0f172a;
				border-radius: 50%;
				position: relative;

				/* 眼神高光点 */
				.pupil-glint {
					position: absolute;
					top: 15%;
					right: 18%;
					width: 32%;
					height: 32%;
					background: #ffffff;
					border-radius: 50%;
				}
			}
		}
	}

	/* 软萌腮红 */
	.blush-group {
		position: absolute;
		top: 36px;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		padding: 0 8px;
		pointer-events: none;

		.blush {
			width: 7px;
			height: 4px;
			background: rgba(255, 255, 255, 0.28);
			border-radius: 50%;
			filter: blur(0.5px);
		}
	}

	/* 多样化嘴型 */
	.mouth {
		margin-top: 7px;
		position: relative;
		z-index: 2;

		&.mouth-smile {
			width: 8px;
			height: 4px;
			border-bottom: 2px solid #0f172a;
			border-radius: 0 0 8px 8px;
		}

		&.mouth-calm {
			width: 6px;
			height: 2px;
			background: #0f172a;
			border-radius: 2px;
		}

		&.mouth-happy {
			width: 10px;
			height: 5px;
			background: #0f172a;
			border-radius: 0 0 10px 10px;
		}

		&.mouth-cat {
			width: 7px;
			height: 4px;
			border-bottom: 2px solid #0f172a;
			border-radius: 0 0 6px 6px;
		}
	}
}

/* 角色脚底独立软阴影 */
.char-shadow {
	height: 8px;
	margin-top: 4px;
	border-radius: 50%;
	background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 75%);
}

.visual-gradient {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
	pointer-events: none;
}

@keyframes pulse-glow {
	0%, 100% {
		box-shadow: 0 0 8px #facc15;
		transform: scale(1);
	}
	50% {
		box-shadow: 0 0 16px #fde047;
		transform: scale(1.15);
	}
}
</style>
