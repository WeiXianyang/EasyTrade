# 第四次作业报告

**姓名：** 魏贤炀  
**学号：** 23301078  
**作业名称：** React 商城系统 EasyTrade

---

## 1. 组员分工

| 姓名 | 学号 | 分工与产出 | 贡献占比 |
|------|------|-----------|---------|
| 魏贤炀（组长） | 23301078 | 架构设计、路由规划、数据服务整合、最终联调 | 20% |
| 高林冉 | 23301063 | 前台首页、分类页、商品卡片 UI 与响应式适配 | 16% |
| 王炳澈 | 23301075 | 登录注册、购物车、下单、支付、订单链路 | 16% |
| 韦雪 | 23301079 | 后台商品管理、分类管理、表单校验 | 16% |
| 杨雅涵 | 23301083 | 后台权限管理、订单管理、发货流程 | 16% |
| 李雨晨 | 22301124 | 单元测试、README、Report、PPT 与答辩材料 | 16% |

---

## 2. 项目结构

```text
App
├── ShopLayout
│   ├── HomePage
│   ├── CategoryPage
│   ├── ProductDetailPage
│   ├── LoginPage
│   ├── CartPage
│   ├── CheckoutPage
│   ├── PayPage
│   ├── OrderListPage
│   ├── OrderDetailPage
│   └── MePage
└── AdminLayout
    ├── AdminDashboardPage
    ├── AdminProductsPage
    ├── AdminCategoriesPage
    ├── AdminOrdersPage
    └── AdminRolesPage
```

| 页面/组件 | 职责 |
|-----------|------|
| App | 根路由出口 |
| ShopLayout | 前台品牌区、底部固定导航栏、悬浮购物车入口、登录状态、页脚 |
| AdminLayout | 后台侧边栏、账号区、角色化菜单 |
| ProductCard | 商品展示、价格、标签、加入购物车入口 |
| RouteGuards | 前台登录守卫与后台权限守卫 |
| AppProvider | 当前用户、后台用户、购物车数量与刷新状态 |

## 3. 前台功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 商城主页面（搜索框/轮播图/热门商品） | 使用 Ant Design Carousel、Input.Search、Card、Statistic，展示热卖商品和商城运营信息；后台入口放在底部固定导航栏，不依赖轮播广告 |
| 分类页 | 使用 Segmented 切换分类，按 categoryId 筛选在售商品 |
| 商品详情页 | 展示商品图片、价格、库存、标签、说明，支持加入购物车和立即购买 |
| 购物车 | 右下角悬浮按钮打开 Drawer 抽屉预览，购物车页使用 Table 与 rowSelection 实现选择结算、数量修改和删除商品 |
| 创建订单 | CheckoutPage 确认地址和商品清单，调用 orderService 生成订单 |
| 支付页面 | 使用 Steps、Progress、Result 模拟支付倒计时和支付成功 |
| 订单列表 | 展示当前用户订单、金额、状态和详情入口 |
| 订单详情 | 展示订单状态步骤、商品信息、收货地址和物流信息 |
| 用户登录/注册 | Ant Design Form 表单验证，登录态写入 localStorage；刷新页面时校验缓存用户仍存在并恢复登录 |

## 4. 后台管理端功能实现说明

| 功能模块 | 实现方式 |
|----------|----------|
| 后台登录 | 独立 `/admin/login` 页面，admin/operator 两类账号 |
| 权限管理 | 使用 permissionService 持久化角色可访问模块，管理员可通过开关配置权限，菜单与 RequireAdmin 路由守卫同步生效 |
| 商品管理 | 完整实现商品新增、编辑、删除、上下架、搜索筛选；前台读取同一份商品数据 |
| 分类管理 | 完整实现分类新增、编辑、删除；删除分类前检查是否仍有关联商品 |
| 订单管理 | 后台查看订单，管理员可录入物流单号发货，运营账号只能查看 |

## 5. 路由设计

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { Component: ShopLayout, children: [
        { index: true, Component: HomePage },
        { path: 'category', Component: CategoryPage },
        { path: 'detail/:productId', Component: ProductDetailPage },
        { path: 'cart', element: <RequireUser><CartPage /></RequireUser> },
        { path: 'checkout', element: <RequireUser><CheckoutPage /></RequireUser> },
        { path: 'pay/:orderId', element: <RequireUser><PayPage /></RequireUser> },
      ] },
      { path: 'admin/login', Component: AdminLoginPage },
      { path: 'admin', element: <RequireAdmin><AdminLayout /></RequireAdmin>, children: [
        { index: true, Component: AdminDashboardPage },
        { path: 'products', element: <RequireAdmin moduleName="products"><AdminProductsPage /></RequireAdmin> },
        { path: 'categories', element: <RequireAdmin moduleName="categories"><AdminCategoriesPage /></RequireAdmin> },
        { path: 'orders', element: <RequireAdmin moduleName="orders"><AdminOrdersPage /></RequireAdmin> },
        { path: 'roles', element: <RequireAdmin moduleName="roles"><AdminRolesPage /></RequireAdmin> },
      ] },
    ],
  },
]);
```

## 6. 状态管理与数据存储

- **全局状态管理方式：** Context + Service 模式。Context 只保存登录态、后台登录态、购物车数量和刷新标识。
- **登录态缓存方式：** authService 将脱敏后的前台用户和后台用户写入 localStorage，页面刷新后重新校验用户表并恢复有效登录状态；若缓存用户已失效则自动清理。
- **数据存储方式：** localStorage，初始数据集中定义在 `src/mock/seedData.js`。
- **前后台数据联动方式：** 前台商品页和后台商品管理共用 `productService` 读写 `easytrade.products`，分类读取 `categoryService`，角色权限读取 `permissionService`，后台修改后前台和菜单权限立即体现。

## 7. UI 设计与工程规范

- 使用成熟 UI 套件 Ant Design，统一通过 `ConfigProvider` 注入 `easyTradeTheme`。
- 将默认企业蓝覆写为商城主色 `#f04f3e`，搭配墨绿、金色和中性灰，前台偏促销商城风格，后台偏管理台风格。
- 页面、布局、组件、服务、mock 数据分层拆分，避免页面直接操作 localStorage。
- 前台移动端使用底部固定导航，购物车单独作为右下角悬浮抽屉入口，避免导航项过长出现省略号。
- 后台复杂表格统一设置固定列宽、横向滚动和文本省略，避免窄屏下出现一行一个字的问题。
- 使用 `npm test` 覆盖商品上下架、分类 CRUD、购物车金额、订单支付发货、后台权限配置等核心行为。

## 8. 加分项完成情况

- [x] **数据持久化**：登录态缓存、购物车、订单、商品上下架状态、分类和角色权限配置写入 localStorage。
- [x] **表单验证**：用户登录注册、后台登录、商品编辑、收货地址均有校验。
- [x] **分页/无限滚动**：订单列表和后台商品/分类/订单表格使用分页或横向滚动。
- [x] **支付模拟优化**：支付倒计时、步骤条和支付成功结果页。
- [x] **响应式布局**：前台商品网格、底部导航、悬浮购物车和后台菜单适配移动端。
- [x] **单元测试**：服务层核心行为使用 Node 内置 test runner 验证。
- [ ] **后端联动**：未接入真实后端，按课程允许使用 localStorage mock 数据。
- [ ] **部署上线**：未部署，提交时以课程平台 zip 和 Gerrit 为准。

## 9. 遇到的问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| 前后台数据需要联动但不强制后端 | 抽象 service 层，统一读写 localStorage key，避免页面各自维护状态 |
| 后台不同角色访问权限不同 | 使用 permissionService 持久化权限配置，并由菜单和 RequireAdmin 路由守卫统一读取 |
| 后台页面进入后缺少回前台出口 | 在后台顶部栏和后台登录页增加“返回商城”按钮，并整理后台嵌套路由 |
| 后台入口放在轮播广告上导致切换后不稳定 | 将后台入口移到底部固定导航栏，轮播广告只保留前台购买引导 |
| 移动端导航项过多导致省略号 | 将购物车从导航项拆出，改为右下角悬浮按钮和 Drawer 抽屉 |
| 移动端登录按钮另起一行 | 顶部品牌区保持单行 flex 布局，登录按钮固定在右上角 |
| 刷新后登录状态需要缓存 | authService 读写 localStorage 登录快照，并在恢复时校验用户仍存在 |
| 后台表格在窄屏下挤压成一行一个字 | 为表格设置固定列宽、tableLayout 和横向滚动，长文本使用省略展示 |
| Ant Design 默认风格偏企业后台 | 使用 ConfigProvider Design Token 覆写主色、圆角、卡片、菜单、表格等基础配置 |
| 模板自检要求 Report 不能留空 | 报告中完整说明功能、路由、状态管理、加分项和分工，并由 check 脚本检查占位信息 |
