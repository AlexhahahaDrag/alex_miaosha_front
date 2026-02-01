import type { TableColumnsType } from 'ant-design-vue';
import type { PermissionInfo } from '../../permissionInfo/permissionInfoListTs';

export const columns = ref<TableColumnsType>([
	{
		title: '角色编码',
		dataIndex: 'roleCode',
		key: 'roleCode',
	},
	{
		title: '角色名称',
		dataIndex: 'roleName',
		key: 'roleName',
	},
	{
		title: '描述',
		dataIndex: 'summary',
		key: 'summary',
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
		width: '8',
	},
]);

export const labelMap = ref<Record<string, { name: string; label: string }>>({
	orgId: { name: 'orgId', label: '公司角色id' },
	userId: { name: 'userId', label: '用户id' },
	roleCode: { name: 'roleCode', label: '角色编码' },
	roleName: { name: 'roleName', label: '角色名称' },
	summary: { name: 'summary', label: '描述' },
	status: { name: 'status', label: '状态' },
});

export interface RoleInfoData {
	id?: number;
	roleCode?: string;
	roleName?: string;
	summary?: string;
	status?: string;
	permissionList?: PermissionInfo[];
}

export const rulesRef = reactive({
	roleCode: [
		{
			required: true,
			message: '角色编码不能为空！',
		},
	],
	roleName: [
		{
			required: true,
			message: '角色名称不能为空！',
		},
	],
	summary: [
		{
			required: true,
			message: '描述不能为空！',
		},
	],
	status: [
		{
			required: true,
			message: '状态不能为空！',
		},
	],
});

export const labelCol = ref({ span: 5 });
export const wrapperCol = ref({ span: 19 });
