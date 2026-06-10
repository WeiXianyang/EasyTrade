import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { getCategoryPath } from '../src/pages/categoryPageUtils.js';

function createMemoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

let server;
let AppProvider;
let CategoryPage;
let storageService;

function h(type, props, ...children) {
  return React.createElement(type, props, ...children);
}

function renderCategoryPage(initialEntry) {
  storageService.reset();

  return renderToString(
    h(
      AppProvider,
      null,
      h(
        MemoryRouter,
        { initialEntries: [initialEntry] },
        h(
          Routes,
          null,
          h(Route, { path: '/category', element: h(CategoryPage) }),
          h(Route, { path: '/category/:categoryId', element: h(CategoryPage) }),
        ),
      ),
    ),
  );
}

before(async () => {
  globalThis.localStorage = createMemoryStorage();
  server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true } });

  const appProviderModule = await server.ssrLoadModule('/src/contexts/AppProvider.jsx');
  const categoryPageModule = await server.ssrLoadModule('/src/pages/CategoryPage.jsx');
  const storageModule = await server.ssrLoadModule('/src/services/storageService.js');

  AppProvider = appProviderModule.AppProvider;
  CategoryPage = categoryPageModule.default;
  storageService = storageModule.default;
});

beforeEach(() => {
  globalThis.localStorage.clear();
});

after(async () => {
  await server?.close();
});

test('category page renders path category id and query category id filters at runtime', () => {
  const digitalHtml = renderCategoryPage('/category/digital');
  const foodHtml = renderCategoryPage('/category?cat=food');

  assert.match(digitalHtml, /数码潮品/);
  assert.match(digitalHtml, /Aurora X1 智能手机/);
  assert.doesNotMatch(digitalHtml, /晨光冷萃咖啡套装/);

  assert.match(foodHtml, /精选食品/);
  assert.match(foodHtml, /晨光冷萃咖啡套装/);
  assert.doesNotMatch(foodHtml, /Aurora X1 智能手机/);
});

test('category page falls back safely for unknown category ids at runtime', () => {
  const html = renderCategoryPage('/category/not-exist');

  assert.match(html, /未知分类/);
  assert.match(html, /未找到该分类/);
  assert.doesNotMatch(html, /全部商品/);
  assert.doesNotMatch(html, /undefined/);
  assert.doesNotMatch(html, /清除筛选/);
});

test('category tabs are accessible buttons and navigate through category URLs', () => {
  const html = renderCategoryPage('/category');

  assert.match(html, /<button[^>]+type="button"[^>]+class="category-tab active"/);
  assert.equal(getCategoryPath('all'), '/category');
  assert.equal(getCategoryPath('digital'), '/category/digital');
});
