// 机构-用户关系数据结构（对应后端 /org-user-info，单用户唯一有效机构模型）
export interface OrgUserInfoData {
	id?: string;
	orgId?: string;
	userId?: string;
	summary?: string;
	status?: string;
}
