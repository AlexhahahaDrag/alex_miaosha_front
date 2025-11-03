import type { TableColumnsType } from 'ant-design-vue';

export const columns = ref<TableColumnsType>([
	{
		title: '姓名',
		dataIndex: 'name',
		key: 'name',
		width: 150,
	},
	{
		title: '电话',
		dataIndex: 'phone',
		key: 'phone',
		width: 150,
	},
	{
		title: '关系',
		dataIndex: 'relationship',
		key: 'relationship',
		width: 120,
	},
	{
		title: '邮箱',
		dataIndex: 'email',
		key: 'email',
		width: 200,
	},
	{
		title: '地址',
		dataIndex: 'address',
		key: 'address',
		width: 200,
	},
	{
		title: '备注',
		dataIndex: 'remarks',
		key: 'remarks',
		width: 150,
	},
	{
		title: '常用',
		dataIndex: 'isFavorite',
		key: 'isFavorite',
		width: 80,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 150,
	},
]);

export interface ContactsUserInfo {
	id?: number;
	name?: string;
	phone?: string;
	relationship?: string;
	email?: string;
	address?: string;
	remarks?: string;
	isFavorite?: number;
	keyword?: string;
	createTime?: string;
	updateTime?: string;
}

// 表单布局配置
export const labelCol = ref({ span: 5 });
// 表单布局配置
export const wrapperCol = ref({ span: 19 });

// 表单标签映射
export const labelMap = ref<Record<string, { name: string; label: string }>>({
	name: { name: 'name', label: '姓名' },
	phone: { name: 'phone', label: '电话' },
	relationship: { name: 'relationship', label: '关系' },
	email: { name: 'email', label: '邮箱' },
	address: { name: 'address', label: '地址' },
	remarks: { name: 'remarks', label: '备注' },
	isFavorite: { name: 'isFavorite', label: '常用' },
});

// 关系类型选项
export const relationshipOptions = [
	{ value: 'friend', label: '朋友' },
	{ value: 'family', label: '家人' },
	{ value: 'colleague', label: '同事' },
	{ value: 'other', label: '其他' },
];
