import type { TableColumnsType } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';

export const columns = ref<TableColumnsType>([
	{
		title: '用户名',
		dataIndex: 'username',
		key: 'username',
	},
	{
		title: '昵称',
		dataIndex: 'nickName',
		key: 'nickName',
	},
	{
		title: '性别',
		dataIndex: 'gender',
		key: 'gender',
	},
	{
		title: '个人头像',
		dataIndex: 'avatarUrl',
		key: 'avatarUrl',
	},
	{
		title: '生日',
		dataIndex: 'birthday',
		key: 'birthday',
	},
	{
		title: '手机',
		dataIndex: 'mobile',
		key: 'mobile',
	},
	{
		title: '职业',
		dataIndex: 'occupation',
		key: 'occupation',
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
	},
	{
		title: '所属机构',
		dataIndex: 'orgName',
		key: 'orgName',
	},
	{
		title: '角色名称',
		dataIndex: 'roleName',
		key: 'roleName',
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
	},
]);

export interface UserManagerInfo {
	id?: string;
	keyword?: string;
	username?: string;
	password?: string;
	gender?: string;
	avatar?: number;
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
	roleIds?: string[];
	roleInfoVoList?: Array<{ id?: string; roleName?: string; roleCode?: string }>;
}

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });

export const rulesRef = reactive({
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
			pattern: /^1[34578]\d{9}$/,
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
			message: '所属机构不能为空',
		},
	],
});
