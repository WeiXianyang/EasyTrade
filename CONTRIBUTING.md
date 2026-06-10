# EasyTrade 协作指南

本项目是课程商城系统，协作目标是保持演示链路稳定、代码边界清晰、提交材料可复现。改动前请先阅读 `README.md`、`docs/PROJECT_STANDARDS.md` 和 `docs/ENVIRONMENT.md`。

## 开发准备

```bash
npm install
```

本地开发常用脚本：

```bash
npm run dev
npm run dev:shop
npm run dev:admin
```

- `npm run dev` 和 `npm run dev:shop` 默认启动商城端。
- `npm run dev:admin` 启动后台端并打开 `admin.html`。
- 本地环境变量从 `.env.example` 复制到 `.env.local`，真实密钥只放本地文件。

## 提交前检查

每次提交前至少运行：

```bash
npm test
npm run lint
npm run build
npm run check
```

- `npm test` 覆盖服务、路由、页面静态结构和项目规范。
- `npm run lint` 使用项目已有 ESLint 配置检查源码。
- `npm run build` 验证商城端和后台端入口都能构建。
- `npm run check` 验证课程元数据、报告占位符、忽略规则和生产构建。

## 协作约定

- 优先保持小步提交，单次改动围绕一个明确目标。
- 修改页面时同步检查移动端和桌面端布局，不把演示入口藏进不稳定交互里。
- 修改 `src/services` 时同步补或更新测试，确保 localStorage 数据结构可迁移、可复现。
- 不提交 `.env.local`、日志、构建产物、压缩包、`node_modules` 或课程平台生成文件。
- 课程打包前使用 `node tool/pack.cjs`，不要手工压缩未知目录。

## 提交信息建议

提交信息建议使用简短英文前缀：

- `feat:` 新功能或页面能力。
- `fix:` 缺陷修复。
- `docs:` 文档和规范。
- `test:` 测试补充或调整。
- `chore:` 构建、工具、配置维护。
