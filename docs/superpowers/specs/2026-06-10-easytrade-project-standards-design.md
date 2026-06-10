# EasyTrade 项目规范化设计

日期：2026-06-10

## 背景

EasyTrade 是 Vite + React 的课程商城项目，已经具备 ESLint、Node 内置测试、课程打包脚本、自检脚本、`.gitignore` 和 `.gitattributes`。现有规范主要散落在 README、测试和工具脚本中，缺少统一入口说明，也缺少对协作流程、目录职责、环境变量和变更记录的稳定约定。

## 目标

- 补齐课程提交所需的项目规范文件，让打包产物包含必要治理材料。
- 补齐工程协作规范，让后续开发者知道如何安装、开发、测试、提交和检查。
- 用现有 Node 测试验证规范文件存在与关键内容，不引入新的依赖。
- 保持改动轻量，不改变业务运行逻辑，不引入 Git hooks 或 CI 平台绑定。

## 推荐方案

采用“文档 + 轻量校验”方案：

- 新增 `.editorconfig` 统一编辑器层面的缩进、换行和字符集。
- 新增 `CONTRIBUTING.md` 说明开发流程、提交前检查和协作约定。
- 新增 `CHANGELOG.md` 记录项目演进，便于课程答辩和维护。
- 新增 `docs/PROJECT_STANDARDS.md` 集中说明目录职责、代码风格、服务层边界、测试和提交规范。
- 新增 `docs/ENVIRONMENT.md` 解释 `.env.example` 中的环境变量，强调不提交真实密钥。
- 更新 `README.md` 增加项目规范入口，避免规范文件变成孤立文档。
- 更新 `tests/project-standards.test.js` 校验规范文件和关键内容。
- 更新 `tool/pack.cjs` 将规范文件纳入课程打包清单。

## 不做事项

- 不新增 Prettier、Husky、Commitlint、GitHub Actions 等依赖或平台配置。
- 不改变现有 ESLint 规则、业务代码、页面样式或路由行为。
- 不把 `.env.local` 或任何真实密钥加入仓库。
- 不新增 `.github` 模板，避免课程项目在非 GitHub 场景下出现多余材料。

## 测试计划

- 先扩展 `tests/project-standards.test.js`，让它校验规范文件存在、README 入口、打包清单和环境变量说明。
- 运行 `npm test` 确认新测试在补文件前失败。
- 补齐规范文件和打包清单。
- 运行 `npm test`、`npm run lint`、`npm run build` 和 `npm run check` 验证项目仍可通过。
