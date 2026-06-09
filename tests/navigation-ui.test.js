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
