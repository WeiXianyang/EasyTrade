# EasyTrade React 商城系统

EasyTrade 是第四次大作业的 React 商城系统，使用 Vite、React Router、Ant Design 和 localStorage 实现前台产品端与后台管理端的数据联动。

## 技术栈

- React 19 + Vite
- React Router
- Ant Design + @ant-design/icons
- localStorage mock 数据
- Node 内置 test runner

## 功能清单

### 前台产品端

- 商城首页：搜索框、轮播图、热门商品、运营数据概览
- 前台导航：品牌区与登录状态在顶部，主导航固定在屏幕底部，后台入口独立于轮播广告
- 分类页：商品分类索引与分类商品列表
- 商品详情：商品图片、价格、库存、标签、加入购物车、立即购买
- 用户登录/注册：表单验证与登录态缓存，刷新后自动恢复有效登录状态
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
- Mock API 日志：前台购物、订单支付和后台管理操作均记录请求方法、路径、状态和耗时
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
├── services/         localStorage、Mock API、审计、演示和权限服务
├── theme/            Ant Design 主题覆写与全局样式
└── utils/            格式化工具
```

## 开发与验证

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm run check
node tool/pack.cjs
```

## 提交前注意

- 使用模板打包工具生成 zip。
- 按课程要求将代码上传 Gerrit，并单独发送 PPT。
- 截止时间为 2026 年 6 月 15 日北京时间 19:00。
