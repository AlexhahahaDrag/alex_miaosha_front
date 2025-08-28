import type { Dayjs } from 'dayjs';

export interface SearchInfo {
	username?: string;
}

export const columns = ref<any>([
	// {
	//   title: "id",
	//   dataIndex: "id",
	//   key: "id",
	// },
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
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 160,
	},
]);

export interface DataItem {
	id?: number;
	username?: string;
	password?: string;
	gender?: number;
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
}
