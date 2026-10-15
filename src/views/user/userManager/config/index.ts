import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from '@/utils/dayjs';

export const columns: TableColumnsType = [
	{
		title: '用户信息',
		key: 'userInfo',
		width: 220,
	},
	{
		title: '手机号',
		dataIndex: 'mobile',
		key: 'mobile',
		width: 130,
	},
	{
		title: '性别',
		dataIndex: 'gender',
		key: 'gender',
		width: 70,
		align: 'center',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		width: 90,
		align: 'center',
	},
	{
		title: '所属机构',
		dataIndex: 'orgName',
		key: 'orgName',
		width: 240,
	},
	{
		title: '角色',
		dataIndex: 'roleName',
		key: 'roleName',
		width: 180,
	},
	{
		title: '生日',
		dataIndex: 'birthday',
		key: 'birthday',
		width: 120,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 180,
		align: 'center',
	},
];

export interface UserManagerInfo {
	id?: string;
	keyword?: string;
	username?: string;
	password?: string;
	gender?: string;
	avatar?: string;
	email?: string;
	birthday?: Dayjs | string;
	mobile?: string;
	summary?: string;
	status?: string;
	nickName?: string;
	qqNumber?: string;
	weChat?: string;
	occupation?: string;
	github?: string;
	gitee?: string;
	person_resume?: string;
	avatarUrl?: string;
	orgName?: string;
	orgCode?: string;
	roleId?: string;
	roleName?: string;
	roleCode?: string;
	avatarThumbnailUrl?: string;
	orgId?: string;
	auxiliaryOrgIds?: string[];
	auxiliaryOrgList?: Array<{ id?: string; orgName?: string; orgCode?: string }>;
	auxiliaryOrgNames?: string;
	roleIds?: string[];
	roleInfoVoList?: Array<{ id?: string; roleName?: string; roleCode?: string }>;
}

export const labelCol = { span: 5 };
export const wrapperCol = { span: 19 };

export const rulesRef = {
	username: [
		{
			required: true,
			message: '用户名不能为空',
		},
	],
	nickName: [
		{
			required: true,
			message: '昵称不能为空',
		},
	],
	mobile: [
		{
			required: true,
			message: '电话号码不能为空',
		},
		{
			message: '输入的电话号码不合法',
			pattern: /^1[3-9]\d{9}$/,
		},
	],
	email: [
		{
			message: '输入的邮箱不合法',
			pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.*[a-zA-Z0-9_-]+)+$/,
		},
	],
	orgId: [
		{
			required: true,
			message: '所属主机构不能为空',
		},
	],
};
