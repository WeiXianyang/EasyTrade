import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shopLayout = readFileSync(new URL('../src/layouts/ShopLayout.jsx', import.meta.url), 'utf8');
const themeCss = readFileSync(new URL('../src/theme/theme.css', import.meta.url), 'utf8');

test('mobile shop layout uses bottom navigation and keeps cart in a floating drawer', () => {
  assert.match(shopLayout, /Drawer/);
  assert.match(shopLayout, /shop-floating-cart/);
  assert.doesNotMatch(shopLayout, /key:\s*['"]\/cart['"]/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*position:\s*fixed/);
  assert.match(themeCss, /\.shop-bottom-nav[\s\S]*bottom:\s*0/);
});

test('mobile header keeps login controls in the top row', () => {
  const mobileHeaderRule = themeCss.match(/@media \(max-width: 760px\)[\s\S]*?\.shop-header-main\s*{([^}]*)}/)?.[1] || '';

  assert.doesNotMatch(mobileHeaderRule, /flex-direction:\s*column/);
  assert.match(themeCss, /\.shop-header-main[\s\S]*justify-content:\s*space-between/);
});
