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

test('category empty state distinguishes no products from no filter results', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');
  const categoryPageUtils = readSource('src/pages/categoryPageUtils.js');

  assert.match(categoryPage, /baseProducts/);
  assert.match(categoryPage, /getCategoryEmptyState/);
  assert.match(categoryPageUtils, /hasBaseProducts/);
  assert.match(categoryPageUtils, /当前筛选暂无结果/);
  assert.match(categoryPageUtils, /暂无在售商品，请稍后再来/);
  assert.match(categoryPageUtils, /分类暂无在售商品/);
});

test('category page accepts path category id before query category id', () => {
  const router = readSource('src/router.jsx');
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  assert.match(router, /path:\s*'category\/:categoryId'/);
  assert.match(router, /path:\s*'category'/);
  assert.match(categoryPage, /useParams/);
  assert.match(categoryPage, /params\.categoryId\s*\|\|\s*searchParams\.get\('cat'\)\s*\|\|\s*'all'/);
});

test('category empty state only offers clear filters for filtered-out results', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  const emptySnippet = categoryPage.match(/<Empty description=\{emptyDescription\}>[\s\S]*?<\/Empty>/)?.[0] || '';

  assert.match(emptySnippet, /\{canClearFilters && \(/);
  assert.match(emptySnippet, /清除筛选/);
  assert.match(emptySnippet, /返回首页/);
});

test('lazy route fallback uses a storefront page skeleton instead of a plain spinner', () => {
  const router = readSource('src/router.jsx');
  const pageSkeleton = readSource('src/components/shop/PageSkeleton.jsx');

  assert.match(router, /PageSkeleton/);
  assert.match(router, /const PageLoader\s*=\s*<PageSkeleton\s*\/>/);
  assert.doesNotMatch(router, /Spin/);
  assert.match(pageSkeleton, /page-skeleton/);
  assert.match(pageSkeleton, /page-skeleton-hero/);
  assert.match(pageSkeleton, /page-skeleton-card/);
});

test('standalone admin route fallback uses the shared page skeleton instead of a plain spinner', () => {
  const adminRouter = readSource('src/admin-router.jsx');

  assert.match(adminRouter, /PageSkeleton/);
  assert.match(adminRouter, /const AdminLoader\s*=\s*<PageSkeleton\s*\/>/);
  assert.doesNotMatch(adminRouter, /Spin/);
  assert.match(adminRouter, /fallback=\{AdminLoader\}/);
});

test('home page exposes a discounted flash sale section with floating seckill labels', () => {
  const homePage = readSource('src/pages/HomePage.jsx');
  const themeCss = readSource('src/theme/theme.css');

  assert.match(homePage, /flashSaleProducts/);
  assert.match(homePage, /originalPrice\s*>\s*product\.price/);
  assert.match(homePage, /flash-sale-section/);
  assert.match(homePage, /秒杀价/);
  assert.match(themeCss, /@keyframes\s+seckillFloat[\s\S]*translateY\(-?\d+px\)[\s\S]*translateY\(-?\d+px\)/);
  assert.match(themeCss, /\.flash-price-badge[\s\S]*animation:\s*seckillFloat/);
});

test('theme switch buttons have a stable transform animation class in shop and admin layouts', () => {
  const shopLayout = readSource('src/layouts/ShopLayout.jsx');
  const adminLayout = readSource('src/layouts/AdminLayout.jsx');
  const themeCss = readSource('src/theme/theme.css');

  assert.match(shopLayout, /className="theme-toggle-btn"/);
  assert.match(adminLayout, /className="theme-toggle-btn"/);
  assert.match(themeCss, /\.theme-toggle-btn[\s\S]*transition:[^;]*transform/);
  assert.match(themeCss, /\.theme-toggle-btn:hover[\s\S]*transform:/);
  assert.match(themeCss, /\.theme-toggle-btn:active[\s\S]*transform:/);
  assert.match(themeCss, /body[\s\S]*transition:[^;]*background[^;]*color/);
});
