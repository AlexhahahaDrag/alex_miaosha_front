import type { TableColumnsType } from 'ant-design-vue';
import { ref } from 'vue';

export const columns = ref<TableColumnsType>([
	{
		title: '关系分类',
		dataIndex: 'relationshipTag',
		key: 'relationshipTag',
		width: 150,
	},
	{
		title: '重要程度',
		dataIndex: 'importance',
		key: 'importance',
		width: 100,
	},
	{
		title: '描述',
		dataIndex: 'description',
		key: 'description',
		width: 200,
	},
	{
		title: '备注',
		dataIndex: 'remarks',
		key: 'remarks',
		width: 150,
	},
	{
		title: '是否启用',
		dataIndex: 'isEnabled',
		key: 'isEnabled',
		width: 100,
	},
	{
		title: '操作',
		key: 'operation',
		fixed: 'right',
		width: 150,
	},
]);

export interface ContactsUserRelationInfo {
	id?: number;
	userId?: number;
	relationshipTag?: string;
	importance?: number;
	description?: string;
	remarks?: string;
	isEnabled?: number;
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
	relationshipTag: { name: 'relationshipTag', label: '关系分类' },
	importance: { name: 'importance', label: '重要程度' },
	description: { name: 'description', label: '描述' },
	remarks: { name: 'remarks', label: '备注' },
	isEnabled: { name: 'isEnabled', label: '是否启用' },
});

// 重要程度选项
export const importanceOptions = [
	{ value: 1, label: '普通' },
	{ value: 2, label: '重要' },
	{ value: 3, label: '非常重要' },
];

// 启用状态选项
export const enabledOptions = [
	{ value: 0, label: '禁用' },
	{ value: 1, label: '启用' },
];
