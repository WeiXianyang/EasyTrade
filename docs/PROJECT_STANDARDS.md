# EasyTrade 项目规范

本文档定义 EasyTrade 的工程约定。README 负责介绍项目功能，本文档负责说明如何保持代码、数据和课程提交材料稳定。

## 目录职责

- `src/components`：可复用组件。组件应暴露清晰 props，不直接修改全局存储。
- `src/components/shop`：前台商城组件，包含商品卡片、客服浮窗、购物车入口等购物体验组件。
- `src/components/admin`：后台管理组件，包含权限提示、日志和演示工具。
- `src/contexts`：全局应用上下文和 Hook，负责登录态、主题、购物车刷新等跨页面状态。
- `src/layouts`：商城端和后台端的页面框架，不承载复杂业务计算。
- `src/mock`：初始演示数据，只放课程演示可复现的种子数据。
- `src/pages`：前台页面，页面负责组合服务和组件。
- `src/pages/admin`：后台页面，后台写操作应走 mock API 和审计链路。
- `src/services`：数据读写、localStorage 封装、mock API、权限和审计服务。业务规则优先放在这里，页面只调用服务。
- `src/theme`：Ant Design 主题和全局样式变量。
- `tests`：Node 内置 test runner 测试，覆盖服务逻辑、页面静态结构、路由约定和项目规范。
- `tool`：课程自检和打包脚本。

## 代码风格

- 使用 React 函数组件和 Hook，不新增 class 组件。
- JSX 文件使用 `.jsx`，纯工具或服务使用 `.js`。
- 缩进使用两个空格，换行使用 LF，编辑器规则见 `.editorconfig`。
- 新增可复用业务逻辑时优先放入 `src/services` 或 `src/utils`，避免在页面里复制同一段数据处理。
- 新增 UI 能力时尽量沿用 Ant Design、现有主题变量和已有组件风格。
- 不在源码中硬编码真实密钥、个人账号或课程平台提交凭据。

## 数据与服务边界

- 本项目使用 localStorage 模拟前后台共享数据，服务层需要负责读写、校验和兜底。
- 后台商品、分类、订单、权限写操作应经过 mock API 或对应 service，便于请求日志和审计日志保持一致。
- 修改 localStorage 数据结构时，需要考虑旧数据为空、缺字段或含无效 ID 的情况。
- 客服接口、后台入口和模型配置通过 Vite 环境变量读取，说明见 `docs/ENVIRONMENT.md`。

## 测试规范

- 运行 `npm test` 执行 Node 内置 test runner。
- 新增 service 行为时优先写真实数据输入输出测试，不只检查字符串是否存在。
- 页面静态测试可用于课程演示约束，例如导航顺序、入口存在、无障碍标签和关键文案。
- 项目治理文件由 `tests/project-standards.test.js` 校验，避免规范文档缺失或打包遗漏。

## 课程提交

- 提交前运行 `npm test`、`npm run lint`、`npm run build` 和 `npm run check`。
- 课程压缩包统一用 `node tool/pack.cjs` 生成，确保代码、测试、工具、README、报告和规范文件一起提交。
- `metadata.json` 和 `Report.md` 必须替换真实姓名、学号和报告内容。
- 不提交 `node_modules/`、`dist/`、`.vite/`、`.env.local`、日志文件或手工生成的临时压缩包。
