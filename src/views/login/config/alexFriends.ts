export type CharacterColorClass = 'coral' | 'purple' | 'black' | 'yellow';

export interface AlexFriendDefinition {
	id: number;
	name: string;
	role: string;
	colorClass: CharacterColorClass;
	baseHeight: number;
	hasMouth: boolean;
}

/** Alex Friends IP 角色定义，供登录页 / 404 / 空状态复用 */
export const ALEX_FRIENDS: AlexFriendDefinition[] = [
	{
		id: 1,
		name: 'Mini',
		role: '用户管理',
		colorClass: 'coral',
		baseHeight: 168,
		hasMouth: false,
	},
	{
		id: 2,
		name: 'Aleo',
		role: '数据分析',
		colorClass: 'purple',
		baseHeight: 312,
		hasMouth: false,
	},
	{
		id: 3,
		name: 'Nova',
		role: '工作流引擎',
		colorClass: 'black',
		baseHeight: 240,
		hasMouth: true,
	},
	{
		id: 4,
		name: 'Sunny',
		role: 'AI 助手',
		colorClass: 'yellow',
		baseHeight: 216,
		hasMouth: true,
	},
];

export const PLATFORM_SLOGAN = '统一管理 · 统一权限 · 统一数据';

export const PLATFORM_WARM_LINE = '让管理更简单';

export const ALEX_FRIENDS_TITLE = 'Meet Alex Friends';
