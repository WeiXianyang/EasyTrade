import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('add-to-cart actions open the cart drawer after persisting the item', () => {
  const appProvider = readSource('src/contexts/AppProvider.jsx');
  const shopLayout = readSource('src/layouts/ShopLayout.jsx');
  const pages = [
    readSource('src/pages/HomePage.jsx'),
    readSource('src/pages/CategoryPage.jsx'),
    readSource('src/pages/ProductDetailPage.jsx'),
  ].join('\n');

  assert.match(appProvider, /cartDrawerOpen/);
  assert.match(appProvider, /openCart/);
  assert.match(appProvider, /closeCart/);
  assert.match(shopLayout, /open=\{cartDrawerOpen\}/);
  assert.match(shopLayout, /onClose=\{closeCart\}/);
  assert.match(pages, /openCart\(\)/);
});

test('deep shopping pages expose explicit return navigation', () => {
  const pages = [
    readSource('src/pages/CartPage.jsx'),
    readSource('src/pages/CheckoutPage.jsx'),
    readSource('src/pages/PayPage.jsx'),
    readSource('src/pages/OrderListPage.jsx'),
    readSource('src/pages/OrderDetailPage.jsx'),
    readSource('src/pages/ProductDetailPage.jsx'),
  ];

  for (const source of pages) {
    assert.match(source, /返回|继续/);
  }
});

test('shopping flow mutations are visible in mock api logs', () => {
  const pages = [
    readSource('src/pages/HomePage.jsx'),
    readSource('src/pages/CategoryPage.jsx'),
    readSource('src/pages/ProductDetailPage.jsx'),
    readSource('src/pages/CheckoutPage.jsx'),
    readSource('src/pages/PayPage.jsx'),
  ].join('\n');

  assert.match(pages, /mockApiService/);
  assert.match(pages, /\/cart\/items/);
  assert.match(pages, /\/orders/);
  assert.match(pages, /\/pay/);
});

test('login page lets course demo users choose customer or administrator identity', () => {
  const loginPage = readSource('src/pages/LoginPage.jsx');

  assert.match(loginPage, /用户/);
  assert.match(loginPage, /管理员/);
  assert.match(loginPage, /loginUser/);
  assert.match(loginPage, /loginAdmin/);
  assert.match(loginPage, /admin\/admin123|admin123/);
});

test('admin identity login hands off a password-free session to the admin entry', () => {
  const loginPage = readSource('src/pages/LoginPage.jsx');
  const adminLoginPage = readSource('src/pages/admin/AdminLoginPage.jsx');
  const appProvider = readSource('src/contexts/AppProvider.jsx');

  const handoffSnippet = loginPage.match(/adminHandoff[\s\S]*?window\.location\.href/)?.[0] || '';

  assert.match(loginPage, /#\/login\?handoff=/);
  assert.match(handoffSnippet, /id:\s*admin\.id/);
  assert.match(handoffSnippet, /username:\s*admin\.username/);
  assert.match(handoffSnippet, /role:\s*admin\.role/);
  assert.match(handoffSnippet, /name:\s*admin\.name/);
  assert.doesNotMatch(handoffSnippet, /password/);
  assert.match(adminLoginPage, /useSearchParams/);
  assert.match(adminLoginPage, /handoff/);
  assert.doesNotMatch(adminLoginPage, /decodeURIComponent\(handoff\)/);
  assert.match(adminLoginPage, /acceptAdminHandoff/);
  assert.match(adminLoginPage, /admin|operator/);
  assert.match(appProvider, /acceptAdminHandoff/);
});

test('smart support uses environment config and local product fallback', () => {
  const chatService = readSource('src/services/chatService.js');
  const supportDrawer = readSource('src/components/shop/SupportDrawer.jsx');
  const envExample = readSource('.env.example');

  assert.match(chatService, /VITE_CUSTOM_HOST/);
  assert.match(chatService, /VITE_CUSTOM_KEY/);
  assert.match(chatService, /VITE_CUSTOM_MODEL/);
  assert.match(chatService, /recommendProducts/);
  assert.match(chatService, /createChatService/);
  assert.doesNotMatch(chatService, /__EASYTRADE_CHAT_ENV__/);
  assert.match(supportDrawer, /商品推荐/);
  assert.match(supportDrawer, /\/detail\//);
  assert.match(supportDrawer, /role="log"/);
  assert.match(envExample, /VITE_CUSTOM_HOST=/);
  assert.doesNotMatch(envExample, /sk-/);
});

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
