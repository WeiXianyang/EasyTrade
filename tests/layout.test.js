import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shopLayout = readFileSync(new URL('../src/layouts/ShopLayout.jsx', import.meta.url), 'utf8');
const themeCss = readFileSync(new URL('../src/theme/theme.css', import.meta.url), 'utf8');

test('shop layout exposes cart in bottom navigation and support in the floating slot', () => {
  assert.match(shopLayout, /key:\s*['"]\/cart['"]/);
  assert.match(shopLayout, /label:\s*['"]购物车['"]/);
  assert.match(shopLayout, /FloatingSupportBtn/);
  assert.match(shopLayout, /SupportDrawer/);
  assert.doesNotMatch(shopLayout, /label:\s*['"]后台['"]/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*position:\s*fixed/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*bottom:\s*0/);
});

test('shop bottom navigation keeps the required course demo order', () => {
  const homeIndex = shopLayout.indexOf("label: '首页'");
  const cartIndex = shopLayout.indexOf("label: '购物车'");
  const categoryIndex = shopLayout.indexOf("label: '分类'");
  const meIndex = shopLayout.indexOf("label: '我的'");

  assert.ok(homeIndex >= 0);
  assert.ok(cartIndex >= 0);
  assert.ok(categoryIndex >= 0);
  assert.ok(meIndex >= 0);
  assert.ok(homeIndex < cartIndex);
  assert.ok(cartIndex < categoryIndex);
  assert.ok(categoryIndex < meIndex);
});

test('mobile header keeps login controls in the top row', () => {
  const mobileHeaderRule = themeCss.match(/@media \(max-width: 760px\)[\s\S]*?\.shop-header-main\s*{([^}]*)}/)?.[1] || '';

  assert.doesNotMatch(mobileHeaderRule, /flex-direction:\s*column/);
  assert.match(themeCss, /\.shop-header-main[\s\S]*justify-content:\s*space-between/);
});
