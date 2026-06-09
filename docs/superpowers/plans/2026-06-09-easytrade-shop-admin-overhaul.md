# EasyTrade Shop Admin Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a course-demo friendly two-end EasyTrade experience: product storefront and admin management end, with cart navigation, role-based login, smart support, filters, visible animations, skeleton loading, and user activity panels.

**Architecture:** Keep one React codebase and one localStorage-backed service graph, but expose separate shop and admin browser entry points for the “front product end / backend management end” requirement. Use small services for chat and user activity, and keep UI changes scoped to existing page/layout components.

**Tech Stack:** Vite 8, React 19, React Router 7, Ant Design 6, Node built-in test runner, localStorage mock services.

---

## Scope Note

The teacher requirement is “系统分为两端：前台产品端以及后台管理端.” Implement this as two front-end entry pages and two dev ports for a clear demo, while reusing existing services, mock data, permissions, and page components. Do not split into separate repositories or duplicate business logic.

## File Structure

- Create `admin.html`: admin entry page loaded on the admin dev port.
- Create `src/admin-main.jsx`: admin React bootstrap.
- Create `src/admin-router.jsx`: admin-only hash router using existing admin pages.
- Modify `src/router.jsx`: keep shop routes and old admin routes only as compatibility; shop nav will not link to admin.
- Modify `src/layouts/ShopLayout.jsx`: add cart nav item, remove admin nav item, replace floating cart with support widget, add drawer selection controls.
- Modify `src/layouts/AdminLayout.jsx`: support both `/admin/...` embedded routes and standalone admin hash routes.
- Modify `src/pages/LoginPage.jsx`: add “用户 / 管理员” identity switch.
- Modify `src/pages/admin/AdminLoginPage.jsx`: accept admin dashboard target path for standalone admin entry.
- Create `src/components/shop/FloatingSupportBtn.jsx` and `src/components/shop/FloatingSupportBtn.css`: support floating entry.
- Create `src/components/shop/SupportDrawer.jsx` and `src/components/shop/SupportDrawer.css`: chat drawer UI.
- Create `src/services/chatService.js`: local product recommendation plus OpenAI-compatible API call.
- Create `.env.example`: document chat API variables without secrets.
- Modify `src/pages/CategoryPage.jsx`: add sort and filters.
- Modify `src/pages/HomePage.jsx`: add flash sale section and skeleton-friendly structure.
- Modify `src/theme/theme.css`: animation, skeleton, category filter, cart drawer, support widget styles.
- Create `src/components/shop/PageSkeleton.jsx`: route loading skeleton.
- Create `src/services/userActivityService.js`: favorites, follows, footprints.
- Modify `src/mock/seedData.js` and `src/services/storageService.js`: add storage keys and seeds for user activity.
- Modify `src/pages/ProductDetailPage.jsx`: record footprint and expose favorite action.
- Modify `src/pages/MePage.jsx` and `src/pages/MePage.css`: add favorites, follows, footprints panels.
- Modify `package.json` and `vite.config.js`: add shop/admin scripts and multi-page build inputs.
- Modify tests under `tests/`: update static expectations and add service coverage.

---

### Task 1: Lock Navigation, Entry, And Login Expectations

**Files:**
- Modify: `tests/layout.test.js`
- Modify: `tests/navigation-ui.test.js`
- Modify: `tests/project-standards.test.js`

- [ ] **Step 1: Write failing layout and navigation tests**

Replace the current first test in `tests/layout.test.js` with:

```js
test('shop layout exposes cart in bottom navigation and support in the floating slot', () => {
  assert.match(shopLayout, /key:\s*['"]\/cart['"]/);
  assert.match(shopLayout, /label:\s*['"]购物车['"]/);
  assert.match(shopLayout, /FloatingSupportBtn/);
  assert.match(shopLayout, /SupportDrawer/);
  assert.doesNotMatch(shopLayout, /label:\s*['"]后台['"]/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*position:\s*fixed/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*bottom:\s*0/);
});
```

Append this test to `tests/navigation-ui.test.js`:

```js
test('login page lets course demo users choose customer or administrator identity', () => {
  const loginPage = readSource('src/pages/LoginPage.jsx');

  assert.match(loginPage, /用户/);
  assert.match(loginPage, /管理员/);
  assert.match(loginPage, /loginUser/);
  assert.match(loginPage, /loginAdmin/);
  assert.match(loginPage, /admin\/admin123|admin123/);
});
```

Append this test to `tests/project-standards.test.js`:

```js
test('project exposes separate shop and admin browser entries for course demo', () => {
  const packageJson = readProjectFile('package.json');
  const viteConfig = readProjectFile('vite.config.js');
  const adminHtml = readProjectFile('admin.html');
  const adminMain = readProjectFile('src/admin-main.jsx');

  assert.match(packageJson, /"dev:shop"/);
  assert.match(packageJson, /"dev:admin"/);
  assert.match(viteConfig, /admin\.html/);
  assert.match(adminHtml, /src\/admin-main\.jsx/);
  assert.match(adminMain, /admin-router/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test
```

Expected: tests fail because `FloatingSupportBtn`, `SupportDrawer`, role selection, `admin.html`, and scripts do not exist yet.

- [ ] **Step 3: Commit only if this task is run independently**

If using one commit per task, do not commit failing tests alone. Keep them staged with Task 2 implementation.

---

### Task 2: Add Admin Entry And Role-Based Login

**Files:**
- Create: `admin.html`
- Create: `src/admin-main.jsx`
- Create: `src/admin-router.jsx`
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `src/layouts/AdminLayout.jsx`
- Modify: `src/pages/admin/AdminLoginPage.jsx`
- Modify: `src/pages/LoginPage.jsx`
- Test: `tests/layout.test.js`
- Test: `tests/navigation-ui.test.js`
- Test: `tests/project-standards.test.js`

- [ ] **Step 1: Create the admin HTML entry**

Create `admin.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EasyTrade 后台管理端</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin-main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create the admin-only router**

Create `src/admin-router.jsx`:

```jsx
/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { createHashRouter, Navigate } from 'react-router-dom';

import App from './App';
import { RequireAdmin } from './components/RouteGuards.jsx';

const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage.jsx'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage.jsx'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage.jsx'));
const AdminRolesPage = lazy(() => import('./pages/admin/AdminRolesPage.jsx'));

const AdminLoader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Spin size="large" description="后台加载中..." />
  </div>
);

const adminRouter = createHashRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'login',
        element: (
          <Suspense fallback={AdminLoader}>
            <AdminLoginPage dashboardPath="/dashboard" shopUrl="/" />
          </Suspense>
        ),
      },
      {
        element: (
          <RequireAdmin>
            <Suspense fallback={AdminLoader}>
              <AdminLayout basePath="" shopUrl="/" />
            </Suspense>
          </RequireAdmin>
        ),
        children: [
          { path: 'dashboard', element: <Suspense fallback={AdminLoader}><AdminDashboardPage /></Suspense> },
          {
            path: 'products',
            element: (
              <RequireAdmin moduleName="products">
                <Suspense fallback={AdminLoader}><AdminProductsPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'categories',
            element: (
              <RequireAdmin moduleName="categories">
                <Suspense fallback={AdminLoader}><AdminCategoriesPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequireAdmin moduleName="orders">
                <Suspense fallback={AdminLoader}><AdminOrdersPage /></Suspense>
              </RequireAdmin>
            ),
          },
          {
            path: 'roles',
            element: (
              <RequireAdmin moduleName="roles">
                <Suspense fallback={AdminLoader}><AdminRolesPage /></Suspense>
              </RequireAdmin>
            ),
          },
        ],
      },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

export default adminRouter;
```

- [ ] **Step 3: Create the admin React bootstrap**

Create `src/admin-main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import 'antd/dist/reset.css';
import './index.css';
import './theme/theme.css';

import adminRouter from './admin-router';
import { AppProvider } from './contexts/AppProvider.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={adminRouter} />
    </AppProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 4: Update scripts and Vite build input**

In `package.json`, set the `scripts` block to include:

```json
"scripts": {
  "dev": "vite --port 5173",
  "dev:shop": "vite --port 5173",
  "dev:admin": "vite --port 5174 --open /admin.html",
  "build": "vite build",
  "lint": "eslint .",
  "test": "node --test tests/*.test.js",
  "preview": "vite preview",
  "check": "node tool/check.cjs",
  "pack": "node tool/pack.cjs"
}
```

In `vite.config.js`, import `resolve` and add multi-page inputs:

```js
import { resolve } from 'node:path'
```

Inside `build.rollupOptions`, add `input` before `output`:

```js
rollupOptions: {
  input: {
    shop: resolve(__dirname, 'index.html'),
    admin: resolve(__dirname, 'admin.html'),
  },
  output: {
    manualChunks(id) {
      if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design')) {
        return 'antd';
      }
      if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
        return 'recharts';
      }
    },
  },
},
```

- [ ] **Step 5: Make AdminLayout work in both route bases**

Change the signature in `src/layouts/AdminLayout.jsx`:

```jsx
export default function AdminLayout({ basePath = '/admin', shopUrl = '/' }) {
```

Replace the hard-coded `allItems` declaration with a function:

```jsx
function adminPath(basePath, path = '') {
  const prefix = basePath || '';
  return `${prefix}${path}` || '/dashboard';
}

function createAdminItems(basePath) {
  return [
    { key: adminPath(basePath, basePath ? '' : '/dashboard'), icon: <DashboardOutlined />, label: '概览', moduleName: 'dashboard' },
    { key: adminPath(basePath, '/products'), icon: <ProductOutlined />, label: '商品管理', moduleName: 'products' },
    { key: adminPath(basePath, '/categories'), icon: <AppstoreOutlined />, label: '分类管理', moduleName: 'categories' },
    { key: adminPath(basePath, '/orders'), icon: <ShoppingOutlined />, label: '订单管理', moduleName: 'orders' },
    { key: adminPath(basePath, '/roles'), icon: <TeamOutlined />, label: '权限管理', moduleName: 'roles' },
  ];
}
```

Inside the component, derive `allItems` and `selectedKey`:

```jsx
const allItems = createAdminItems(basePath);
const selectedKey = [...items].reverse().find((item) => location.pathname === item.key)?.key || allItems[0].key;
```

Change the shop button handler:

```jsx
<Button icon={<ShopOutlined />} onClick={() => {
  window.location.href = shopUrl;
}}>
  返回商城
</Button>
```

Change logout navigation:

```jsx
navigate(basePath ? '/admin/login' : '/login');
```

- [ ] **Step 6: Make AdminLoginPage accept standalone paths**

Change `src/pages/admin/AdminLoginPage.jsx`:

```jsx
export default function AdminLoginPage({ dashboardPath = '/admin', shopUrl = '/' }) {
```

Use `dashboardPath` after successful login:

```jsx
navigate(dashboardPath);
```

Use `shopUrl` for returning to the shop:

```jsx
onClick={() => {
  window.location.href = shopUrl;
}}
```

- [ ] **Step 7: Add identity switch to LoginPage**

In `src/pages/LoginPage.jsx`, import `Segmented`:

```jsx
import { App, Form, Input, Segmented, Tabs } from 'antd';
```

Read `loginAdmin` from context and add role state:

```jsx
const { loginUser, registerUser, loginAdmin } = useApp();
const [identity, setIdentity] = useState('user');
```

Add a helper above `handleLogin`:

```jsx
function getAdminEntryUrl() {
  if (import.meta.env.VITE_ADMIN_ENTRY_URL) {
    return import.meta.env.VITE_ADMIN_ENTRY_URL;
  }
  return import.meta.env.DEV ? 'http://localhost:5174/admin.html#/dashboard' : '/admin.html#/dashboard';
}
```

Update `handleLogin`:

```jsx
const handleLogin = (values) => {
  try {
    if (identity === 'admin') {
      const admin = loginAdmin(values.identifier, values.password);
      message.success(`欢迎进入后台，${admin.name}`);
      window.location.href = getAdminEntryUrl();
      return;
    }
    loginUser(values.identifier, values.password);
    message.success('登录成功');
    redirectAfterAuth();
  } catch (error) {
    message.error(error.message);
  }
};
```

Render the identity switch below the subtitle:

```jsx
<Segmented
  block
  className="login-identity-switch"
  value={identity}
  onChange={setIdentity}
  options={[
    { label: '用户', value: 'user' },
    { label: '管理员', value: 'admin' },
  ]}
/>
```

Before `return`, create `adminAuthPanel` with this exact JSX:

```jsx
const adminAuthPanel = (
  <Form className="login-form" layout="vertical" onFinish={handleLogin}>
    <Form.Item name="identifier" rules={[{ required: true, message: '请输入后台账号' }]}>
      <Input placeholder="后台账号" />
    </Form.Item>
    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
      <Input.Password placeholder="密码" />
    </Form.Item>
    <button className="login-form-btn" type="submit">进入后台</button>
    <p className="login-demo-account">
      管理员：admin/admin123<br />
      运营：operator/operator123
    </p>
  </Form>
);
```

Before `return`, move the current `<Tabs className="login-tabs" ... />` block into `userAuthPanel`. Keep the existing `items` array exactly as it is now, so user login and registration behavior stay unchanged.

Inside the returned container, replace the current inline `<Tabs>` block with:

```jsx
{identity === 'admin' ? adminAuthPanel : userAuthPanel}
```

Add CSS to `src/pages/LoginPage.css`:

```css
.login-identity-switch {
  margin-bottom: 18px;
}

.login-demo-account {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
}
```

- [ ] **Step 8: Run tests**

Run:

```bash
npm test
```

Expected: Task 1 tests pass. Other future-feature tests are not present yet.

- [ ] **Step 9: Commit**

Run:

```bash
git add admin.html src/admin-main.jsx src/admin-router.jsx package.json vite.config.js src/layouts/AdminLayout.jsx src/pages/admin/AdminLoginPage.jsx src/pages/LoginPage.jsx src/pages/LoginPage.css tests/layout.test.js tests/navigation-ui.test.js tests/project-standards.test.js
git commit -m "feat: split shop and admin entries"
```

---

### Task 3: Replace Floating Cart With Smart Support And Move Cart To Nav

**Files:**
- Create: `src/components/shop/FloatingSupportBtn.jsx`
- Create: `src/components/shop/FloatingSupportBtn.css`
- Create: `src/components/shop/SupportDrawer.jsx`
- Create: `src/components/shop/SupportDrawer.css`
- Create: `src/services/chatService.js`
- Create: `.env.example`
- Modify: `src/layouts/ShopLayout.jsx`
- Modify: `src/layouts/ShopBottomNav.css`
- Modify: `src/theme/theme.css`
- Test: `tests/navigation-ui.test.js`

- [ ] **Step 1: Write failing support tests**

Append to `tests/navigation-ui.test.js`:

```js
test('smart support uses environment config and local product fallback', () => {
  const chatService = readSource('src/services/chatService.js');
  const supportDrawer = readSource('src/components/shop/SupportDrawer.jsx');
  const envExample = readSource('.env.example');

  assert.match(chatService, /VITE_CUSTOM_HOST/);
  assert.match(chatService, /VITE_CUSTOM_KEY/);
  assert.match(chatService, /VITE_CUSTOM_MODEL/);
  assert.match(chatService, /recommendProducts/);
  assert.match(supportDrawer, /商品推荐/);
  assert.match(supportDrawer, /\/detail\//);
  assert.match(envExample, /VITE_CUSTOM_HOST=/);
  assert.doesNotMatch(envExample, /sk-/);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test
```

Expected: fail because chat service, support drawer, and env example do not exist.

- [ ] **Step 3: Create environment example without secrets**

Create `.env.example`:

```env
VITE_CUSTOM_HOST=https://example-chat-host/v1
VITE_CUSTOM_KEY=
VITE_CUSTOM_MODEL=gpt-4o-mini
VITE_ADMIN_ENTRY_URL=http://localhost:5174/admin.html#/dashboard
```

- [ ] **Step 4: Implement chatService**

Create `src/services/chatService.js`:

```js
import productService from './productService.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

function normalizeText(text) {
  return String(text || '').trim().toLowerCase();
}

function scoreProduct(product, question) {
  const text = `${product.name} ${product.subtitle} ${product.description} ${(product.tags || []).join(' ')}`.toLowerCase();
  const keywords = normalizeText(question).split(/\s+|，|。|、|,|\?/).filter(Boolean);
  const keywordScore = keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 3 : 0), 0);
  const discountScore = product.originalPrice > product.price ? 2 : 0;
  return keywordScore + discountScore + Math.min(product.sold / 1000, 3);
}

export function recommendProducts(question, limit = 3) {
  return productService
    .getVisibleProducts()
    .map((product) => ({ product, score: scoreProduct(product, question) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

function buildFallbackReply(question, products) {
  const names = products.map((product) => product.name).join('、');
  if (normalizeText(question).includes('面膜')) {
    return `当前演示商品里没有面膜，我先按提亮、热门和优惠为你推荐这些相近好物：${names}。`;
  }
  return `我为你挑了这些更适合现在浏览的商品：${names}。`;
}

export async function askSupport(question) {
  const products = recommendProducts(question);
  const host = import.meta.env.VITE_CUSTOM_HOST;
  const key = import.meta.env.VITE_CUSTOM_KEY;
  const model = import.meta.env.VITE_CUSTOM_MODEL || DEFAULT_MODEL;

  if (!host || !key) {
    return {
      answer: buildFallbackReply(question, products),
      products,
      source: 'local',
    };
  }

  try {
    const response = await fetch(`${host.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是 EasyTrade 商城智能客服。回答要简短，并优先推荐给定商品。' },
          {
            role: 'user',
            content: `用户问题：${question}\n可推荐商品：${products.map((product) => `${product.name}：${product.subtitle}`).join('；')}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('客服接口暂时不可用');
    }

    const data = await response.json();
    return {
      answer: data.choices?.[0]?.message?.content || buildFallbackReply(question, products),
      products,
      source: 'api',
    };
  } catch {
    return {
      answer: buildFallbackReply(question, products),
      products,
      source: 'local',
    };
  }
}

export default {
  askSupport,
  recommendProducts,
};
```

- [ ] **Step 5: Create floating support button**

Create `src/components/shop/FloatingSupportBtn.jsx`:

```jsx
import { CustomerServiceOutlined } from '@ant-design/icons';
import './FloatingSupportBtn.css';

export default function FloatingSupportBtn({ onClick }) {
  return (
    <button className="floating-support-btn" onClick={onClick} aria-label="打开智能客服">
      <span className="support-icon-wrap">
        <CustomerServiceOutlined />
      </span>
      <span className="support-text">智能客服</span>
    </button>
  );
}
```

Create `src/components/shop/FloatingSupportBtn.css`:

```css
.floating-support-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 52px;
  height: 52px;
  overflow: hidden;
  color: #fff;
  cursor: pointer;
  background: #256d5a;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 12px 30px rgba(37, 109, 90, 0.28);
  transition: width 0.3s ease, border-radius 0.3s ease, transform 0.2s ease;
}

.floating-support-btn:hover {
  width: 136px;
  border-radius: 40px;
  transform: translateY(-3px);
}

.support-icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
}

.support-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.support-text {
  width: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease, width 0.2s ease;
}

.floating-support-btn:hover .support-text {
  width: 76px;
  opacity: 1;
}
```

- [ ] **Step 6: Create support drawer**

Create `src/components/shop/SupportDrawer.jsx`:

```jsx
import { App, Button, Drawer, Flex, Input, Space, Tag, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import chatService from '../../services/chatService.js';
import './SupportDrawer.css';

const starter = '我想要能提亮肤色的面膜，可以推荐一款吗？';

export default function SupportDrawer({ open, onClose }) {
  const { message } = App.useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好，我是 EasyTrade 智能客服。你可以告诉我预算、用途或想买的类型。',
      products: [],
    },
  ]);

  const ask = async (text) => {
    const question = text.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: 'user', content: question, products: [] }]);
    setInput('');
    setLoading(true);
    try {
      const result = await chatService.askSupport(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer, products: result.products }]);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer title="智能客服" open={open} onClose={onClose} width={380}>
      <Flex vertical gap={14} className="support-drawer">
        <Button size="small" onClick={() => ask(starter)}>
          {starter}
        </Button>
        <div className="support-message-list">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`support-message ${item.role}`}>
              <Typography.Paragraph>{item.content}</Typography.Paragraph>
              {item.products.length > 0 && (
                <Space direction="vertical" size={6} className="support-products">
                  <Tag color="orange">商品推荐</Tag>
                  {item.products.map((product) => (
                    <Link key={product.id} to={`/detail/${product.id}`} onClick={onClose}>
                      {product.name}
                    </Link>
                  ))}
                </Space>
              )}
            </div>
          ))}
        </div>
        <Input.Search
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onSearch={ask}
          enterButton={<SendOutlined />}
          loading={loading}
          placeholder="问问商品、预算或用途"
        />
      </Flex>
    </Drawer>
  );
}
```

Create `src/components/shop/SupportDrawer.css`:

```css
.support-drawer {
  height: 100%;
}

.support-message-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 300px;
  overflow-y: auto;
}

.support-message {
  max-width: 92%;
  padding: 10px 12px;
  border-radius: 8px;
}

.support-message.user {
  align-self: flex-end;
  color: #fff;
  background: #f04f3e;
}

.support-message.assistant {
  align-self: flex-start;
  color: var(--color-text-primary);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border-light);
}

.support-message .ant-typography {
  margin-bottom: 0;
}

.support-products a {
  color: var(--color-brand-primary);
  font-weight: 700;
}
```

- [ ] **Step 7: Update ShopLayout nav and floating component**

In `src/layouts/ShopLayout.jsx`, replace `DashboardOutlined` import with `ShoppingCartOutlined`, import support components, and add `Checkbox`:

```jsx
import { Badge, Button, Checkbox, Drawer, Empty, Flex, Image, InputNumber, Layout, Space, Tooltip, Typography } from 'antd';
import { AppstoreOutlined, DeleteOutlined, HomeOutlined, LoginOutlined, MoonOutlined, ShoppingCartOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import FloatingSupportBtn from '../components/shop/FloatingSupportBtn.jsx';
import SupportDrawer from '../components/shop/SupportDrawer.jsx';
```

Set nav items:

```jsx
const navItems = [
  { key: '/', to: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/cart', to: '/cart', icon: <ShoppingCartOutlined />, label: '购物车' },
  { key: '/category', to: '/category', icon: <AppstoreOutlined />, label: '分类' },
  { key: '/me', to: '/me', icon: <UserOutlined />, label: '我的' },
];
```

Update `selectedKey`:

```jsx
if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/pay')) return '/cart';
```

Add support state:

```jsx
const [supportOpen, setSupportOpen] = useState(false);
```

Replace floating cart badge:

```jsx
<div className="shop-floating-support">
  <FloatingSupportBtn onClick={() => setSupportOpen(true)} />
</div>
<SupportDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
```

Add drawer selection actions before the cart list:

```jsx
<Flex justify="space-between" align="center" className="cart-drawer-select-bar">
  <Checkbox
    checked={cartItems.length > 0 && cartItems.every((item) => item.selected)}
    indeterminate={cartItems.some((item) => item.selected) && !cartItems.every((item) => item.selected)}
    onChange={(event) => updateCart(() => cartService.setAllSelected(currentUser.id, event.target.checked))}
  >
    全选
  </Checkbox>
  <Button size="small" onClick={() => updateCart(() => cartService.setAllSelected(currentUser.id, false))}>
    取消全选
  </Button>
</Flex>
```

Inside each drawer item, add:

```jsx
<Checkbox
  checked={item.selected}
  onChange={(event) => updateCart(() => cartService.setSelected(currentUser.id, item.productId, event.target.checked))}
/>
```

- [ ] **Step 8: Add support positioning styles**

In `src/theme/theme.css`, replace `.shop-floating-cart-badge` usage with:

```css
.shop-floating-support {
  position: fixed;
  right: 24px;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 45;
  line-height: 1;
}

.cart-drawer-select-bar {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);
}
```

In the mobile media query, replace the old floating cart positioning with:

```css
.shop-floating-support {
  right: 12px;
  bottom: calc(68px + env(safe-area-inset-bottom));
}
```

- [ ] **Step 9: Run tests**

Run:

```bash
npm test
```

Expected: support and navigation tests pass.

- [ ] **Step 10: Commit**

Run:

```bash
git add .env.example src/services/chatService.js src/components/shop/FloatingSupportBtn.jsx src/components/shop/FloatingSupportBtn.css src/components/shop/SupportDrawer.jsx src/components/shop/SupportDrawer.css src/layouts/ShopLayout.jsx src/theme/theme.css tests/navigation-ui.test.js
git commit -m "feat: add smart support entry"
```

---

### Task 4: Strengthen Cart Selection UX

**Files:**
- Modify: `src/pages/CartPage.jsx`
- Modify: `src/layouts/ShopLayout.jsx`
- Modify: `tests/services.test.js`
- Modify: `tests/layout.test.js`

- [ ] **Step 1: Add cart selection service coverage**

Append to `tests/services.test.js`:

```js
test('cart service supports select all, partial selection, and clear selection', () => {
  const { productService, cartService } = createServices();
  const [firstProduct, secondProduct] = productService.getVisibleProducts();

  cartService.addItem('u-demo', firstProduct.id, 1);
  cartService.addItem('u-demo', secondProduct.id, 2);
  cartService.setAllSelected('u-demo', false);

  assert.equal(cartService.getSelectedSummary('u-demo').count, 0);

  cartService.setSelected('u-demo', secondProduct.id, true);
  assert.equal(cartService.getSelectedSummary('u-demo').count, 2);

  cartService.setAllSelected('u-demo', true);
  assert.equal(cartService.getSelectedSummary('u-demo').count, 3);
});
```

Append to `tests/layout.test.js`:

```js
test('cart drawer exposes checkbox selection controls', () => {
  assert.match(shopLayout, /Checkbox/);
  assert.match(shopLayout, /setSelected/);
  assert.match(shopLayout, /setAllSelected/);
  assert.match(shopLayout, /取消全选/);
});
```

- [ ] **Step 2: Run tests to verify failure or coverage**

Run:

```bash
npm test
```

Expected: service test may already pass because `cartService` has selection APIs. Layout test passes after Task 3; if Task 3 is not implemented, it fails for missing drawer controls.

- [ ] **Step 3: Improve CartPage wording and action clarity**

In `src/pages/CartPage.jsx`, update the section subtitle:

```jsx
<Typography.Text className="muted">勾选需要购买的商品，可全选、部分选择或取消全选。</Typography.Text>
```

Change the second footer button text:

```jsx
取消全选
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/pages/CartPage.jsx src/layouts/ShopLayout.jsx tests/services.test.js tests/layout.test.js
git commit -m "feat: clarify cart item selection"
```

---

### Task 5: Add Category Sorting And Filters

**Files:**
- Modify: `src/pages/CategoryPage.jsx`
- Modify: `src/theme/theme.css`
- Modify: `tests/navigation-ui.test.js`

- [ ] **Step 1: Write failing category filter test**

Append to `tests/navigation-ui.test.js`:

```js
test('category page exposes price, sales, discount, and stock filters', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  assert.match(categoryPage, /sortMode/);
  assert.match(categoryPage, /price-asc/);
  assert.match(categoryPage, /price-desc/);
  assert.match(categoryPage, /sold-desc/);
  assert.match(categoryPage, /discount-desc/);
  assert.match(categoryPage, /onlyDiscount/);
  assert.match(categoryPage, /inStockOnly/);
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test
```

Expected: fails because `CategoryPage.jsx` has no filter state.

- [ ] **Step 3: Implement filter controls**

Update imports in `src/pages/CategoryPage.jsx`:

```jsx
import { Button, Checkbox, Col, Empty, Row, Select, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
```

Add state:

```jsx
const [sortMode, setSortMode] = useState('default');
const [onlyDiscount, setOnlyDiscount] = useState(false);
const [inStockOnly, setInStockOnly] = useState(false);
```

Replace the products memo:

```jsx
const products = useMemo(() => {
  const baseProducts = productService.getVisibleProducts({
    categoryId: categoryId === 'all' ? undefined : categoryId,
  });

  const filtered = baseProducts.filter((product) => {
    const discountOk = !onlyDiscount || product.originalPrice > product.price;
    const stockOk = !inStockOnly || product.stock > 10;
    return discountOk && stockOk;
  });

  return [...filtered].sort((a, b) => {
    if (sortMode === 'price-asc') return a.price - b.price;
    if (sortMode === 'price-desc') return b.price - a.price;
    if (sortMode === 'sold-desc') return b.sold - a.sold;
    if (sortMode === 'discount-desc') {
      const discountA = a.originalPrice - a.price;
      const discountB = b.originalPrice - b.price;
      return discountB - discountA;
    }
    return 0;
  });
}, [categoryId, inStockOnly, onlyDiscount, sortMode]);
```

Add controls inside `.category-info`:

```jsx
<Space wrap className="category-filter-tools">
  <FilterOutlined />
  <Select
    size="small"
    value={sortMode}
    onChange={setSortMode}
    style={{ width: 120 }}
    options={[
      { label: '默认排序', value: 'default' },
      { label: '价格升序', value: 'price-asc' },
      { label: '价格降序', value: 'price-desc' },
      { label: '销量优先', value: 'sold-desc' },
      { label: '折扣优先', value: 'discount-desc' },
    ]}
  />
  <Checkbox checked={onlyDiscount} onChange={(event) => setOnlyDiscount(event.target.checked)}>
    仅优惠
  </Checkbox>
  <Checkbox checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)}>
    库存充足
  </Checkbox>
</Space>
```

Update empty state action:

```jsx
<Space>
  <Button onClick={() => navigate('/')}>返回首页</Button>
  <Button onClick={() => {
    setSortMode('default');
    setOnlyDiscount(false);
    setInStockOnly(false);
  }}>
    清除筛选
  </Button>
</Space>
```

- [ ] **Step 4: Add responsive styles**

Add to `src/theme/theme.css`:

```css
.category-filter-tools {
  justify-content: flex-end;
}

.category-filter-tools .ant-checkbox-wrapper {
  color: var(--color-text-muted);
  font-size: 13px;
}
```

Inside `@media (max-width: 760px)`, add:

```css
.category-info {
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
}

.category-filter-tools {
  justify-content: flex-start;
  width: 100%;
}
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/pages/CategoryPage.jsx src/theme/theme.css tests/navigation-ui.test.js
git commit -m "feat: add category filters"
```

---

### Task 6: Add Homepage Skeleton And Flash Sale Motion

**Files:**
- Create: `src/components/shop/PageSkeleton.jsx`
- Modify: `src/router.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/theme/theme.css`
- Modify: `tests/navigation-ui.test.js`

- [ ] **Step 1: Write failing homepage motion test**

Append to `tests/navigation-ui.test.js`:

```js
test('home page includes skeleton loading and flash sale motion hooks', () => {
  const router = readSource('src/router.jsx');
  const homePage = readSource('src/pages/HomePage.jsx');
  const themeCss = readSource('src/theme/theme.css');

  assert.match(router, /PageSkeleton/);
  assert.match(homePage, /flashSaleProducts/);
  assert.match(homePage, /秒杀价/);
  assert.match(themeCss, /@keyframes\s+floatFlash/);
  assert.match(themeCss, /\.theme-toggle-btn/);
  assert.match(themeCss, /transform/);
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm test
```

Expected: fails because skeleton and flash sale hooks do not exist.

- [ ] **Step 3: Create route skeleton**

Create `src/components/shop/PageSkeleton.jsx`:

```jsx
import { Card, Col, Row, Skeleton, Space } from 'antd';

export default function PageSkeleton() {
  return (
    <Space direction="vertical" size={18} className="page-skeleton">
      <Skeleton.Input active block className="page-skeleton-search" />
      <Skeleton.Node active className="page-skeleton-hero" />
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((item) => (
          <Col key={item} xs={24} sm={12} lg={6}>
            <Card>
              <Skeleton.Image active className="page-skeleton-cover" />
              <Skeleton active paragraph={{ rows: 2 }} title />
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
```

- [ ] **Step 4: Use skeleton in router**

In `src/router.jsx`, import:

```jsx
import PageSkeleton from './components/shop/PageSkeleton.jsx';
```

Replace `PageLoader` with:

```jsx
const PageLoader = <PageSkeleton />;
```

- [ ] **Step 5: Add flash sale products**

In `src/pages/HomePage.jsx`, derive discounted products:

```jsx
const flashSaleProducts = useMemo(
  () =>
    productService
      .getVisibleProducts()
      .filter((product) => product.originalPrice > product.price)
      .slice(0, 4),
  [],
);
```

Render this section before hot products when no keyword is active:

```jsx
{!keyword && flashSaleProducts.length > 0 && (
  <section className="flash-sale-section">
    <div className="section-head">
      <div>
        <Typography.Title level={2}>
          <FireOutlined /> 限时促销
        </Typography.Title>
      </div>
      <span className="flash-sale-badge">秒杀价</span>
    </div>
    <Row gutter={[16, 16]}>
      {flashSaleProducts.map((product) => (
        <Col key={product.id} xs={24} sm={12} lg={6}>
          <div className="flash-sale-card">
            <ProductCard product={product} onAddCart={handleAddCart} showSold />
          </div>
        </Col>
      ))}
    </Row>
  </section>
)}
```

- [ ] **Step 6: Add transform and skeleton styles**

Add to `src/theme/theme.css`:

```css
html,
body,
.shop-layout,
.shop-header,
.shop-bottom-nav,
.page-card,
.product-new-card {
  transition: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease, transform 0.25s ease;
}

.theme-toggle-btn {
  transition: transform 0.28s ease, background-color 0.28s ease;
}

.theme-toggle-btn:hover {
  transform: rotate(-12deg) scale(1.08);
}

.hero-panel {
  animation: heroLiftIn 0.55s ease both;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.hero-panel:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 18px 44px rgba(31, 41, 51, 0.18);
}

@keyframes heroLiftIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes floatFlash {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.flash-sale-section {
  margin-top: 24px;
}

.flash-sale-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  color: #fff;
  font-weight: 800;
  background: #f04f3e;
  border-radius: 8px;
  animation: floatFlash 1.6s ease-in-out infinite;
}

.flash-sale-card {
  height: 100%;
  animation: fadeInUp 0.5s ease both;
}

.page-skeleton {
  width: 100%;
}

.page-skeleton-search {
  height: 48px !important;
}

.page-skeleton-hero {
  width: 100% !important;
  height: 260px !important;
  border-radius: 8px;
}

.page-skeleton-cover {
  width: 100% !important;
  height: 160px !important;
}
```

In `ShopLayout`, add `className="theme-toggle-btn"` to both theme buttons.

- [ ] **Step 7: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/shop/PageSkeleton.jsx src/router.jsx src/pages/HomePage.jsx src/layouts/ShopLayout.jsx src/layouts/AdminLayout.jsx src/theme/theme.css tests/navigation-ui.test.js
git commit -m "feat: add storefront motion and skeletons"
```

---

### Task 7: Add User Activity Service And My Page Panels

**Files:**
- Create: `src/services/userActivityService.js`
- Modify: `src/mock/seedData.js`
- Modify: `src/services/storageService.js`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/MePage.jsx`
- Modify: `src/pages/MePage.css`
- Modify: `tests/services.test.js`
- Modify: `tests/navigation-ui.test.js`

- [ ] **Step 1: Write failing activity service tests**

Append to `tests/services.test.js`:

```js
import { createUserActivityService } from '../src/services/userActivityService.js';
```

Add this test:

```js
test('user activity service stores favorites, follows, and footprints per user', () => {
  const storage = createStorageService(createMemoryStorage());
  const productService = createProductService(storage);
  const categoryService = createCategoryService(storage);
  const activityService = createUserActivityService(storage, productService, categoryService);
  const [product] = productService.getVisibleProducts();
  const [category] = categoryService.getCategories();

  activityService.toggleFavorite('u-demo', product.id);
  activityService.toggleFavorite('u-demo', product.id);
  activityService.toggleFavorite('u-demo', product.id);
  activityService.toggleFollow('u-demo', category.id);
  activityService.recordFootprint('u-demo', product.id);
  activityService.recordFootprint('u-demo', product.id);

  assert.equal(activityService.getFavorites('u-demo').length, 1);
  assert.equal(activityService.getFollows('u-demo').length, 1);
  assert.equal(activityService.getFootprints('u-demo').length, 1);
  assert.equal(activityService.isFavorite('u-demo', product.id), true);
});
```

Append to `tests/navigation-ui.test.js`:

```js
test('my page exposes favorites, follows, and footprints panels', () => {
  const mePage = readSource('src/pages/MePage.jsx');
  const detailPage = readSource('src/pages/ProductDetailPage.jsx');

  assert.match(mePage, /收藏/);
  assert.match(mePage, /关注/);
  assert.match(mePage, /足迹/);
  assert.match(mePage, /userActivityService/);
  assert.match(detailPage, /recordFootprint/);
  assert.match(detailPage, /toggleFavorite/);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test
```

Expected: fails because `userActivityService.js` does not exist.

- [ ] **Step 3: Add storage keys and seeds**

In `src/mock/seedData.js`, add keys:

```js
favorites: 'easytrade.favorites',
follows: 'easytrade.follows',
footprints: 'easytrade.footprints',
```

In `src/services/storageService.js`, add seeds:

```js
[STORAGE_KEYS.favorites]: [],
[STORAGE_KEYS.follows]: [],
[STORAGE_KEYS.footprints]: [],
```

- [ ] **Step 4: Create user activity service**

Create `src/services/userActivityService.js`:

```js
import categoryService from './categoryService.js';
import productService from './productService.js';
import storageService from './storageService.js';

function now() {
  return new Date().toLocaleString();
}

function uniqueLatest(items, matcher, nextItem) {
  return [nextItem, ...items.filter((item) => !matcher(item))];
}

export function createUserActivityService(storage = storageService, products = productService, categories = categoryService) {
  function read(key) {
    return storage.read(key, []);
  }

  function write(key, value) {
    return storage.write(key, value);
  }

  return {
    getFavorites(userId) {
      return read(storage.keys.favorites)
        .filter((item) => item.userId === userId)
        .map((item) => ({ ...item, product: products.getProductById(item.productId) }))
        .filter((item) => item.product);
    },
    isFavorite(userId, productId) {
      return read(storage.keys.favorites).some((item) => item.userId === userId && item.productId === productId);
    },
    toggleFavorite(userId, productId) {
      const items = read(storage.keys.favorites);
      const exists = items.some((item) => item.userId === userId && item.productId === productId);
      const nextItems = exists
        ? items.filter((item) => !(item.userId === userId && item.productId === productId))
        : [{ userId, productId, createdAt: now() }, ...items];
      write(storage.keys.favorites, nextItems);
      return this.getFavorites(userId);
    },
    getFollows(userId) {
      return read(storage.keys.follows)
        .filter((item) => item.userId === userId)
        .map((item) => ({ ...item, category: categories.getCategoryById(item.categoryId) }))
        .filter((item) => item.category);
    },
    toggleFollow(userId, categoryId) {
      const items = read(storage.keys.follows);
      const exists = items.some((item) => item.userId === userId && item.categoryId === categoryId);
      const nextItems = exists
        ? items.filter((item) => !(item.userId === userId && item.categoryId === categoryId))
        : [{ userId, categoryId, createdAt: now() }, ...items];
      write(storage.keys.follows, nextItems);
      return this.getFollows(userId);
    },
    getFootprints(userId, limit = 8) {
      return read(storage.keys.footprints)
        .filter((item) => item.userId === userId)
        .map((item) => ({ ...item, product: products.getProductById(item.productId) }))
        .filter((item) => item.product)
        .slice(0, limit);
    },
    recordFootprint(userId, productId) {
      const items = read(storage.keys.footprints);
      const nextItem = { userId, productId, visitedAt: now() };
      const nextItems = uniqueLatest(items, (item) => item.userId === userId && item.productId === productId, nextItem).slice(0, 50);
      write(storage.keys.footprints, nextItems);
      return this.getFootprints(userId);
    },
  };
}

const userActivityService = createUserActivityService();
export default userActivityService;
```

- [ ] **Step 5: Update ProductDetailPage**

In `src/pages/ProductDetailPage.jsx`, import icons and service:

```jsx
import { HeartOutlined, HeartFilled, ShoppingCartOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import userActivityService from '../services/userActivityService.js';
```

Add favorite state:

```jsx
const [favorite, setFavorite] = useState(() => (currentUser && product ? userActivityService.isFavorite(currentUser.id, product.id) : false));
```

Record footprint:

```jsx
useEffect(() => {
  if (currentUser && product) {
    userActivityService.recordFootprint(currentUser.id, product.id);
  }
}, [currentUser, product]);
```

Add favorite handler:

```jsx
const toggleFavorite = useCallback(() => {
  if (!product) return;
  if (!ensureLogin()) return;
  userActivityService.toggleFavorite(currentUser.id, product.id);
  setFavorite(userActivityService.isFavorite(currentUser.id, product.id));
  message.success(favorite ? '已取消收藏' : '已加入收藏');
}, [currentUser, ensureLogin, favorite, message, product]);
```

Render favorite button near purchase buttons:

```jsx
<Button icon={favorite ? <HeartFilled /> : <HeartOutlined />} onClick={toggleFavorite}>
  {favorite ? '已收藏' : '收藏'}
</Button>
```

- [ ] **Step 6: Update MePage panels**

In `src/pages/MePage.jsx`, import service and category service:

```jsx
import categoryService from '../services/categoryService.js';
import userActivityService from '../services/userActivityService.js';
```

Compute data:

```jsx
const favorites = userActivityService.getFavorites(currentUser.id);
const follows = userActivityService.getFollows(currentUser.id);
const footprints = userActivityService.getFootprints(currentUser.id);
const categories = categoryService.getCategories();
```

Add helper:

```jsx
const followCategory = (categoryId) => {
  userActivityService.toggleFollow(currentUser.id, categoryId);
  navigate(0);
};
```

Render below recent orders:

```jsx
<Row gutter={[18, 18]} className="me-activity-row">
  <Col xs={24} lg={8}>
    <Card title="我的收藏">
      <List
        dataSource={favorites.slice(0, 4)}
        locale={{ emptyText: '暂无收藏' }}
        renderItem={(item) => (
          <List.Item onClick={() => navigate(`/detail/${item.productId}`)}>
            <List.Item.Meta title={item.product.name} description={formatCurrency(item.product.price)} />
          </List.Item>
        )}
      />
    </Card>
  </Col>
  <Col xs={24} lg={8}>
    <Card title="我的关注">
      <Space wrap>
        {categories.map((category) => (
          <Tag key={category.id} color={follows.some((item) => item.categoryId === category.id) ? 'orange' : 'default'} onClick={() => followCategory(category.id)}>
            {category.name}
          </Tag>
        ))}
      </Space>
    </Card>
  </Col>
  <Col xs={24} lg={8}>
    <Card title="浏览足迹">
      <List
        dataSource={footprints.slice(0, 4)}
        locale={{ emptyText: '暂无足迹' }}
        renderItem={(item) => (
          <List.Item onClick={() => navigate(`/detail/${item.productId}`)}>
            <List.Item.Meta title={item.product.name} description={item.visitedAt} />
          </List.Item>
        )}
      />
    </Card>
  </Col>
</Row>
```

- [ ] **Step 7: Add My page styles**

Add to `src/pages/MePage.css`:

```css
.me-activity-row {
  margin-top: 18px;
}

.me-activity-row .ant-card {
  height: 100%;
  border-radius: 8px;
}

.me-activity-row .ant-list-item {
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.me-activity-row .ant-list-item:hover {
  background: #fff2ef;
  transform: translateX(3px);
}

.me-activity-row .ant-tag {
  cursor: pointer;
}
```

- [ ] **Step 8: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

Run:

```bash
git add src/services/userActivityService.js src/mock/seedData.js src/services/storageService.js src/pages/ProductDetailPage.jsx src/pages/MePage.jsx src/pages/MePage.css tests/services.test.js tests/navigation-ui.test.js
git commit -m "feat: add user activity panels"
```

---

### Task 8: Final Verification And Demo Commands

**Files:**
- Modify: `README.md`
- Modify: `Report.md`

- [ ] **Step 1: Update README demo instructions**

In `README.md`, update the feature list and development commands:

```md
### 前台产品端

- 前台导航：首页、购物车、分类、我的
- 智能客服：支持商品问答和商品链接推荐
- 购物车：商品勾选、全选、取消全选、选择结算
- 分类页：价格、销量、折扣和库存筛选
- 我的页面：收藏、关注、足迹

### 后台管理端

- 后台管理端可通过独立入口 `admin.html` 和独立开发端口演示

## 开发与验证

```bash
npm install
npm run dev:shop
npm run dev:admin
npm test
npm run lint
npm run build
```
```

- [ ] **Step 2: Update Report.md summary**

Add a short section to `Report.md`:

```md
## 前后台两端说明

系统分为前台产品端和后台管理端。前台产品端面向用户购物，包含首页、分类、购物车、订单、我的和智能客服；后台管理端面向管理员和运营，包含商品、分类、订单、权限、请求日志和审计日志。开发演示时可分别通过 `npm run dev:shop` 和 `npm run dev:admin` 打开两个端口，数据通过 localStorage mock 服务联动。
```

- [ ] **Step 3: Run unit tests**

Run:

```bash
npm test
```

Expected: all tests pass with no failures.

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected: ESLint completes with no errors.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: Vite builds both `index.html` and `admin.html` entries successfully.

- [ ] **Step 6: Run package check**

Run:

```bash
npm run check
```

Expected: project check script completes successfully.

- [ ] **Step 7: Commit docs and final polish**

Run:

```bash
git add README.md Report.md
git commit -m "docs: update two-end demo instructions"
```

---

## Self-Review

- Spec coverage: Task 2 covers two ends and login identity. Task 3 covers cart nav move and smart support. Task 4 covers cart selection. Task 5 covers category filters. Task 6 covers transform motion, flash sale, theme transition, and skeleton loading. Task 7 covers favorites, follows, and footprints. Task 8 covers course-demo documentation and verification.
- Placeholder scan: The plan contains no unfinished markers, no open-ended validation instructions, and no secret values.
- Type consistency: `userActivityService`, `chatService`, `SupportDrawer`, `FloatingSupportBtn`, `PageSkeleton`, `dev:shop`, and `dev:admin` names are consistent across tasks and tests.
