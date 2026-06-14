# EasyTrade 商城系统

EasyTrade 是独立部署的 React + Spring Boot 商城系统，前台产品端、后台管理端和订单/购物车/权限/日志数据均通过真实后端 API 联动。生产环境发布在 `/easytrade` 子路径，后端 API 通过 `/easytrade/api` 反向代理。

## 技术栈

- React 19 + Vite
- React Router
- Ant Design + @ant-design/icons
- Axios API 客户端
- Spring Boot 3 + Spring Security + Spring Data JPA
- PostgreSQL
- JWT 登录态
- 阿里云 Dysmsapi 短信验证码登录
- Node 内置 test runner + JUnit 5

## 功能清单

### 前台产品端

- 商城首页：搜索框、轮播图、热门商品、运营数据概览
- 前台导航：品牌区与登录状态在顶部，主导航固定在屏幕底部，后台入口独立于轮播广告
- 分类页：商品分类索引与分类商品列表
- 商品详情：商品图片、价格、库存、标签、加入购物车、立即购买
- 用户登录/注册：密码登录、短信验证码登录、JWT 登录态缓存
- 购物车：右下角悬浮入口、抽屉预览、数量修改、删除、选择结算、金额汇总
- 创建订单：收货地址确认、商品清单、订单生成
- 支付页面：支付倒计时、模拟支付、支付结果
- 我的页面：个人信息、最近订单、订单列表入口
- 订单详情：订单状态、商品信息、收货地址、物流信息

### 后台管理端

- 后台登录：独立后台入口
- 权限管理：admin 与 operator 两种角色，支持后台模块权限开关配置
- 商品管理：商品新增、编辑、删除、上下架、搜索筛选
- 分类管理：分类新增、编辑、删除，删除前校验关联商品
- 订单管理：订单查看，管理员可发货，运营仅可查看
- 后端请求日志：前台购物、订单支付和后台管理操作均记录请求方法、路径、状态和耗时
- 操作审计：后台商品、分类、订单、权限和演示数据操作可追踪到角色与操作人
- 答辩演示助手：一键重置固定演示场景，便于稳定展示购买、支付、发货和日志回放链路

## 演示账号

- 前台用户：`buyer@example.com` / `123456`
- 后台管理员：`admin` / `admin123`
- 后台运营：`operator` / `operator123`

## 路由规划

### 前台

- `/` 首页
- `/category` 分类页
- `/detail/:productId` 商品详情
- `/login` 用户登录/注册
- `/cart` 购物车
- `/checkout` 创建订单
- `/pay/:orderId` 支付页面
- `/orders` 订单列表
- `/orders/:orderId` 订单详情
- `/me` 我的页面

### 后台

- `/admin/login` 后台登录
- `/admin` 后台概览
- `/admin/products` 商品管理
- `/admin/categories` 分类管理
- `/admin/orders` 订单管理
- `/admin/roles` 权限管理

## 项目结构

```text
src/
├── components/       公共组件、路由守卫、商品卡片、后台提示
├── contexts/         AppProvider 与 useApp 全局上下文
├── layouts/          前台布局与后台布局
├── mock/             初始商品、分类、用户、订单数据
├── pages/            前台页面
├── pages/admin/      后台页面
├── services/         本地兼容服务、演示文案、权限模块定义
├── theme/            Ant Design 主题覆写与全局样式
└── utils/            格式化工具

backend/
├── src/main/java/com/easytrade
│   ├── config/       JWT、安全、短信、请求日志、种子数据
│   ├── controller/   REST API
│   ├── entity/       JPA 实体
│   ├── repository/   Spring Data 仓库
│   └── service/      认证、商品、购物车、订单、后台运营服务
└── src/test/java     后端服务测试
```

## 项目规范

- [协作指南](CONTRIBUTING.md)：开发流程、提交前检查和协作约定。
- [项目规范](docs/PROJECT_STANDARDS.md)：目录职责、代码风格、服务边界、测试和课程提交要求。
- [环境变量说明](docs/ENVIRONMENT.md)：`.env.example` 配置项和本地密钥处理。
- [变更记录](CHANGELOG.md)：项目主要演进记录。

## 开发与验证

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
mvn -f backend/pom.xml test
mvn -f backend/pom.xml package -DskipTests
npm run check
node tool/pack.cjs
```

## 生产部署

前端生产构建默认使用：

- `VITE_APP_BASE_PATH=/easytrade`
- `VITE_API_BASE_URL=/easytrade/api`

后端运行时通过服务器环境文件配置：

- `EASYTRADE_SERVER_PORT`
- `EASYTRADE_DB_URL`
- `EASYTRADE_DB_USERNAME`
- `EASYTRADE_DB_PASSWORD`
- `EASYTRADE_JWT_SECRET`
- `ALIBABA_CLOUD_ACCESS_KEY_ID`
- `ALIBABA_CLOUD_ACCESS_KEY_SECRET`
- `EASYTRADE_SMS_SIGN_NAME`
- `EASYTRADE_SMS_TEMPLATE_CODE`
- `EASYTRADE_SMS_REGION`

## 提交前注意

- 使用模板打包工具生成 zip。
- 按课程要求将代码上传 Gerrit，并单独发送 PPT。
- 截止时间为 2026 年 6 月 15 日北京时间 19:00。
