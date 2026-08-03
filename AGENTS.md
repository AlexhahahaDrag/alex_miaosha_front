## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- Read `GRAPHIFY_PROJECT_NOTES.md` before inferring dependencies from missing import statements in Vue files
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep because these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Terminal
- 在 Windows 环境下执行终端命令时，统一使用 **CMD** 语法 (`cmd.exe /c ...` 或原生 CMD 命令)，不要使用 PowerShell 专用指令。

