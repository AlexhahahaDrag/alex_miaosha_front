// 角色-用户关系数据结构（对应后端 /role-user-info）
export interface RoleUserInfoData {
	id?: string;
	roleId?: string;
	userId?: string;
	summary?: string;
	status?: string;
}
