import test from 'node:test';
import assert from 'node:assert/strict';

import {
  filterAndSortCategoryProducts,
  getCategoryEmptyState,
  getCategoryPath,
} from '../src/pages/categoryPageUtils.js';

const products = [
  { id: 'cheap', price: 20, originalPrice: 20, sold: 10, stock: 15 },
  { id: 'premium', price: 100, originalPrice: 150, sold: 4, stock: 6 },
  { id: 'popular', price: 60, originalPrice: 80, sold: 200, stock: 30 },
  { id: 'clearance', price: 50, originalPrice: 120, sold: 30, stock: 0 },
];

function ids(items) {
  return items.map((item) => item.id);
}

test('category product helper sorts by price, sales, and discount using real output order', () => {
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { sortMode: 'price-asc' })), [
    'cheap',
    'clearance',
    'popular',
    'premium',
  ]);
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { sortMode: 'price-desc' })), [
    'premium',
    'popular',
    'clearance',
    'cheap',
  ]);
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { sortMode: 'sold-desc' })), [
    'popular',
    'clearance',
    'cheap',
    'premium',
  ]);
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { sortMode: 'discount-desc' })), [
    'clearance',
    'premium',
    'popular',
    'cheap',
  ]);
});

test('category product helper filters discount and sufficient stock products', () => {
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { onlyDiscount: true })), [
    'premium',
    'popular',
    'clearance',
  ]);
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { inStockOnly: true })), [
    'cheap',
    'popular',
  ]);
  assert.deepEqual(ids(filterAndSortCategoryProducts(products, { onlyDiscount: true, inStockOnly: true })), [
    'popular',
  ]);
});

test('category path helper maps all and category ids to stable URLs', () => {
  assert.equal(getCategoryPath('all'), '/category');
  assert.equal(getCategoryPath(undefined), '/category');
  assert.equal(getCategoryPath('digital'), '/category/digital');
});

test('category empty state helper only clears filters when filtering hides base products', () => {
  assert.deepEqual(
    getCategoryEmptyState({
      hasBaseProducts: true,
      isUnknownCategory: false,
      categoryId: 'digital',
      currentCategoryName: '数码潮品',
    }),
    { description: '当前筛选暂无结果', canClearFilters: true },
  );
  assert.deepEqual(
    getCategoryEmptyState({
      hasBaseProducts: false,
      isUnknownCategory: false,
      categoryId: 'digital',
      currentCategoryName: '数码潮品',
    }),
    { description: '「数码潮品」分类暂无在售商品', canClearFilters: false },
  );
  assert.deepEqual(
    getCategoryEmptyState({
      hasBaseProducts: false,
      isUnknownCategory: true,
      categoryId: 'missing',
    }),
    { description: '未找到该分类', canClearFilters: false },
  );
});
