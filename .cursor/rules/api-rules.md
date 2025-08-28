---
description: Cursor MCP 规则 - API 与 Config 文件生成
globs: 
alwaysApply: true
---

# API & Config 文件生成规则

## MCP 使用说明
- 本项目通过 `ma-apifox` MCP 连接 Apifox 平台获取接口信息  
- MCP 配置：
```json
"ma-apifox": {
  "command": "npx",
  "args": ["-y", "apifox-mcp-server@latest", "--site-id=5462824"],
  "disabled": false,
  "autoApprove": [
    "read_project_oas_i3xvqe",
    "read_project_oas_ref_resources_i3xvqe",
    "read_project_oas_udb1sf",
    "read_project_oas_ref_resources_udb1sf"
  ]
}
```
- MCP 仅作为接口描述信息的来源，不直接参与前端 API 调用  

## 生成规则
1. **接口声明文件**
   - 当页面中需要某个接口时，必须通过 MCP 获取接口定义（路径、请求参数、返回结构）
   - 在 **当前目录下的 `api/index.ts`** 中生成接口方法
   - 接口方法必须使用 `@/utils/request/request.ts` 封装的 `request`

2. **数据结构定义**
   - MCP 获取的接口返回结构必须转换为 TypeScript `interface`
   - 类型定义写入 **当前目录下的 `config/index.ts`**
   - 类型必须符合项目约定的 `ResponseBody<T>`

3. **使用约定**
   - 页面组件调用接口时，统一从 `api/index.ts` 导入方法
   - 类型定义从 `config/index.ts` 导入
   - 保证所有 API 都有明确的请求参数类型与返回类型

## 示例

### MCP 返回接口信息
```json
{
  "path": "/user/list",
  "method": "GET",
  "params": { "page": "number", "size": "number" },
  "response": {
    "code": "number",
    "data": {
      "records": [{ "id": "string", "name": "string" }],
      "total": "number"
    }
  }
}
```

### 生成文件

#### `config/index.ts`
```typescript
export interface UserItem {
  id: string;
  name: string;
}

export interface UserListResponse {
  records: UserItem[];
  total: number;
}
```

#### `api/index.ts`
```typescript
import request from "@/utils/request/request";
import type { UserListResponse } from "./config";

export const getUserList = (params: { page: number; size: number }) => {
  return request.get<ResponseBody<UserListResponse>>("/user/list", { params });
};
```
