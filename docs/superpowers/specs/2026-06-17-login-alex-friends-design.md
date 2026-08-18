# 登录页 Alex Friends IP 融合设计（Phase 1）

## 目标

保留并强化左侧卡通人物为 **Alex Friends** 品牌 IP，解决文案层与人物层「断层」问题，提升场景融合度与专业完成度。

## Phase 1 范围（已实现）

- 左侧改为 `login-visual-panel` 纵向一体化布局
- 标题 **Meet Alex Friends**，避免与页顶 Alex Platform 重复
- 能力列表与四角色一一映射（Mini/Aleo/Nova/Sunny）
- 温暖 slogan：**让管理更简单**
- 人物舞台：蓝色光晕 + 椭圆地面阴影 + 品牌蓝描边/光晕
- 人物尺寸放大约 20%（宽 145px）
- 入场上浮动画 + `prefers-reduced-motion` 降级
- 眨眼间隔调整为 8–12 秒
- IP 常量抽离至 `src/views/login/config/alexFriends.ts`

## Phase 2（未做）

- 登录成功/失败 mood 表情
- 能力行 hover 与对应角色高亮联动
- 404 / 空状态复用 Alex Friends

## 审批

- 2026-06-17：Subagent-Driven Phase 1 执行
