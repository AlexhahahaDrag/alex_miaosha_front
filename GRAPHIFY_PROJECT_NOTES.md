# Graphify Project Notes

This Vite project uses `unplugin-auto-import` and `unplugin-vue-components`.

Implications for code navigation and architecture analysis:

- Many Vue APIs such as `ref`, `computed`, `watch`, `onMounted`, `useRouter`, `useRoute`, and Pinia helpers may be used without explicit `import` statements in source files.
- Many Ant Design Vue components and some project components may be available without explicit local imports because they are resolved by the Vite plugin layer.
- Do not assume "no import statement" means "no dependency". Check [vite.config.mts](f:/workplace/project/myself/frontend/alex_miaosha_front/vite.config.mts) when reasoning about component usage or Vue API availability.
- Template tags such as `<a-table>`, `<a-button>` can represent real component dependencies even when `graphify` cannot derive an AST-level import edge.
- Generated declaration files such as `components.d.ts` and `src/auto-imports.d.ts` are implementation artifacts and are excluded from graphify indexing to reduce noise.
- Icon components prefixed with `<my-i-*>` are resolved by `unplugin-icons` and `IconsResolver` with custom SVG collections from `src/assets/menu`, `src/assets/finance`, and `src/assets/soft`.

Current relevant Vite plugin setup:

- `AutoImport` imports from `vue`, `vue-router`, and `pinia`
- `Components` uses `AntDesignVueResolver({ importStyle: 'less' })`
- `Components` uses `IconsResolver` with prefix `my-i` and custom collections `my-menu-svg`, `my-finance-svg`, `my-soft-svg`
- `Components` scans `src/components` and `src/layout`

Gift management module notes:

- Admin gift pages live under `src/views/finance/gift`.
- Page order is significant and should match route/menu order: `dashboard`, `person`, `event`, `record`, `analysis`.
- `src/views/finance/gift/api` contains API wrappers for person, relation, event, record, statistics, export, and mark-returned flows.
- `src/views/finance/gift/config` contains shared table, filter, enum, form, and statistics configuration.
- Return management is represented inside the record page instead of a standalone `return` page; graph analysis should treat `record` as the owner of return-marker UI.
- Midscene smoke coverage for gift admin pages is declared in `tests/midscene/rbac/cases/smoke.json`.
