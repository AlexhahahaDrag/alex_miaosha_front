## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- Read `GRAPHIFY_PROJECT_NOTES.md` before inferring dependencies from missing import statements in Vue files
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep because these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Knowledge Base (my_alex_brain)
- 本项目在专属全栈知识库 `D:\project\my_alex_brain\01-Front-PC` 中维护了完整的 `01-需求文档/` (PRD) 与 `02-开发文档/` (组件与接口契约)。
- 修改前端页面的业务逻辑、接口请求、组件状态或权限流转后，**必须同步更新 `D:\project\my_alex_brain\01-Front-PC` 对应文档**，确保知识库与代码逻辑保持 100% 实时同步。

