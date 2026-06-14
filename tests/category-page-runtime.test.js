import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { getCategoryPath } from '../src/pages/categoryPageUtils.js';

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('category page loads path and query category filters through the backend catalog api', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  assert.match(categoryPage, /easytradeApi\.catalog\.categories\(\)/);
  assert.match(categoryPage, /easytradeApi\.catalog\.products/);
  assert.match(categoryPage, /params\.categoryId\s*\|\|\s*searchParams\.get\('cat'\)\s*\|\|\s*'all'/);
  assert.match(categoryPage, /categoryId === 'all' \? undefined : categoryId/);
});

test('category page keeps unknown category and empty state safeguards', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  assert.match(categoryPage, /未知分类/);
  assert.match(categoryPage, /getCategoryEmptyState/);
  assert.match(categoryPage, /canClearFilters/);
});

test('category tabs are accessible buttons and navigate through category URLs', () => {
  const categoryPage = readSource('src/pages/CategoryPage.jsx');

  assert.match(categoryPage, /type="button"/);
  assert.match(categoryPage, /className=\{`category-tab/);
  assert.equal(getCategoryPath('all'), '/category');
  assert.equal(getCategoryPath('digital'), '/category/digital');
});
