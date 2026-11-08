export type CharacterColorClass = 'coral' | 'purple' | 'black' | 'yellow';

export type CharacterBodyShape = 'chubby' | 'slim' | 'athletic' | 'plump';

export type CharacterMouthType = 'smile' | 'calm' | 'happy' | 'cat';

export type CharacterAccessory = 'glasses' | 'antenna' | 'tuft';

export interface AlexFriendDefinition {
	id: number;
	name: string;
	role: string;
	greeting: string;
	colorClass: CharacterColorClass;
	bodyShape: CharacterBodyShape;
	baseWidth: number;
	baseHeight: number;
	borderRadius: string;
	eyeSize: number;
	eyeGap: number;
	mouthType: CharacterMouthType;
	accessory?: CharacterAccessory;
	leanAngle: number;
	zIndex: number;
	hasMouth: boolean;
}

/** Alex Friends IP 角色定义，供登录页 / 404 / 空状态复用 */
export const ALEX_FRIENDS: AlexFriendDefinition[] = [
	{
		id: 1,
		name: 'Mini',
		role: '用户管理',
		greeting: '权限守护小团子',
		colorClass: 'coral',
		bodyShape: 'chubby',
		baseWidth: 84,
		baseHeight: 146,
		borderRadius: '44px 44px 20px 20px',
		eyeSize: 15,
		eyeGap: 16,
		mouthType: 'smile',
		leanAngle: 2.5,
		zIndex: 3,
		hasMouth: true,
	},
	{
		id: 2,
		name: 'Aleo',
		role: '数据分析',
		greeting: '洞察全局数据控',
		colorClass: 'purple',
		bodyShape: 'slim',
		baseWidth: 50,
		baseHeight: 292,
		borderRadius: '25px 25px 8px 8px',
		eyeSize: 13,
		eyeGap: 7,
		mouthType: 'calm',
		accessory: 'glasses',
		leanAngle: -1.5,
		zIndex: 1,
		hasMouth: true,
	},
	{
		id: 3,
		name: 'Nova',
		role: '工作流引擎',
		greeting: '高效流转推进器',
		colorClass: 'black',
		bodyShape: 'athletic',
		baseWidth: 64,
		baseHeight: 224,
		borderRadius: '32px 32px 10px 10px',
		eyeSize: 15,
		eyeGap: 11,
		mouthType: 'happy',
		accessory: 'tuft',
		leanAngle: 1.2,
		zIndex: 2,
		hasMouth: true,
	},
	{
		id: 4,
		name: 'Sunny',
		role: 'AI 助手',
		greeting: '智能灵感小助手',
		colorClass: 'yellow',
		bodyShape: 'plump',
		baseWidth: 76,
		baseHeight: 180,
		borderRadius: '40px 40px 16px 16px',
		eyeSize: 16,
		eyeGap: 13,
		mouthType: 'cat',
		accessory: 'antenna',
		leanAngle: -2.2,
		zIndex: 3,
		hasMouth: true,
	},
];

export const PLATFORM_SLOGAN = '统一管理 · 统一权限 · 统一数据';

export const PLATFORM_WARM_LINE = '让管理更简单';

export const ALEX_FRIENDS_TITLE = 'Meet Alex Friends';
