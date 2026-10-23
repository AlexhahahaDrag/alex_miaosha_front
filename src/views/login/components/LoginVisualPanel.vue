<template>
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
	type CharacterColorClass,
} from '@/views/login/config/alexFriends';

const props = defineProps<{
	isEmailFocused: boolean;
	isPasswordFocused: boolean;
	mousePos: { x: number; y: number };
	pageEntered: boolean;
}>();

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

const blinkTimerIds = ref<number[]>([]);

const characters = reactive<CharacterItem[]>(
	ALEX_FRIENDS.map((friend) => ({
		...friend,
		isBlinking: false,
	})),
);

const getCharacterStyle = (char: CharacterItem) => {
	let transform = 'translateY(20px)';
	let height = `${char.baseHeight}px`;

	if (props.isEmailFocused) {
		transform = 'translateY(20px) skewX(-12deg) translateX(40px)';
		height = `${char.baseHeight + 40}px`;
	} else if (props.isPasswordFocused) {
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
	if (props.isEmailFocused) offsetX = 40;
	if (props.isPasswordFocused) offsetX = -20;

	const dx = props.mousePos.x - (window.innerWidth / 4 + offsetX);
	const dy = props.mousePos.y - window.innerHeight / 2;
	const angle = Math.atan2(dy, dx);

	let distance = Math.min(4, Math.hypot(dx * dx + dy * dy) / 50);
	let finalAngle = angle;

	if (props.isPasswordFocused) {
		finalAngle += Math.PI;
		distance = 2;
	}

	return {
		transform: `translate(${Math.cos(finalAngle) * distance}px, ${Math.sin(finalAngle) * distance}px)`,
		transition: 'transform 0.1s ease-out',
	};
};

const getRandomValue = (): number => {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / (0xffffffff + 1);
};

const scheduleBlink = (charIndex: number) => {
	const delay = getRandomValue() * 4000 + 8000;
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

onMounted(() => {
	characters.forEach((_, idx) => scheduleBlink(idx));
});

onUnmounted(() => {
	clearBlinkTimers();
});
</script>

<style scoped lang="less">
.login-visual {
	flex: 1.1;
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
	background: rgba(255, 255, 255, 0.1);
	margin: 18px 0;
}

.copy-features {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 12px;

	li {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13.5px;
		color: #cbd5e1;

		.feature-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;

			&.coral {
				background: #f43f5e;
			}
			&.purple {
				background: #8b5cf6;
			}
			&.black {
				background: #0284c7;
			}
			&.yellow {
				background: #eab308;
			}
		}

		.feature-icon {
			font-size: 15px;
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
	}
}

.copy-warm {
	font-size: 13px;
	color: #94a3b8;
	margin: 0;
}

.panel-stage {
	position: relative;
	width: 100%;
	height: 280px;
	display: flex;
	justify-content: center;
	align-items: flex-end;
}

.character-ground {
	position: absolute;
	bottom: 0;
	left: 10%;
	right: 10%;
	height: 14px;
	background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, transparent 70%);
}

.character-container {
	display: flex;
	align-items: flex-end;
	justify-content: center;
	gap: 20px;
	width: 100%;
	height: 100%;
	transform: translateY(100px);
	opacity: 0;
	transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);

	&.is-entered {
		transform: translateY(0);
		opacity: 1;
	}
}

.character {
	width: 64px;
	border-radius: 32px 32px 8px 8px;
	position: relative;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 24px;

	&.coral {
		background: #f43f5e;
	}
	&.purple {
		background: #8b5cf6;
	}
	&.black {
		background: #0284c7;
	}
	&.yellow {
		background: #eab308;
	}

	.eyes {
		display: flex;
		gap: 12px;

		.eye {
			width: 15px;
			background: #ffffff;
			border-radius: 50%;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;

			.pupil {
				width: 7px;
				height: 7px;
				background: #0f172a;
				border-radius: 50%;
			}
		}
	}

	.mouth {
		width: 10px;
		height: 4px;
		background: #0f172a;
		border-radius: 0 0 10px 10px;
		margin-top: 8px;
	}
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
</style>
