export const rulesRef = reactive({
	username: [
		{
			required: true,
			message: '用户名称不能为空！',
		},
	],
	nickName: [
		{
			required: true,
			message: '昵称不能为空！',
		},
	],
	mobile: [
		{
			required: true,
			message: '电话号不能为空！',
		},
		{
			message: '输入的电话号不合法！',
			pattern: /^1[3|4|5|7|8][0-9]\d{8}$/,
		},
	],
	email: [
		{
			message: '输入的邮箱不合法！',
			pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.*[a-zA-Z0-9_-]+)+$/,
		},
	],
});
