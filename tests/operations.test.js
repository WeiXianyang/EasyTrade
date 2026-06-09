import test from 'node:test';
import assert from 'node:assert/strict';

import { createStorageService } from '../src/services/storageService.js';
import { createProductService } from '../src/services/productService.js';
import { createRequestLogService } from '../src/services/requestLogService.js';
import { createAuditLogService } from '../src/services/auditLogService.js';
import { createMockApiService } from '../src/services/mockApiService.js';
import { createDemoService } from '../src/services/demoService.js';

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
  };
}

function createOperationsGraph() {
  const storage = createStorageService(createMemoryStorage());
  const requestLogs = createRequestLogService(storage);
  const auditLogs = createAuditLogService(storage);
  const mockApi = createMockApiService(requestLogs, auditLogs);
  const demoService = createDemoService(storage, mockApi);
  const productService = createProductService(storage);
  const actor = { id: 'a-admin', name: '系统管理员', role: 'admin' };
  return { actor, auditLogs, demoService, mockApi, productService, requestLogs, storage };
}

test('mock api records request and audit logs around admin mutations', () => {
  const { actor, auditLogs, mockApi, productService, requestLogs } = createOperationsGraph();

  const product = mockApi.request({
    method: 'POST',
    path: '/admin/products',
    actor,
    moduleName: '商品管理',
    action: '新增商品',
    target: '演示马克杯',
    successStatus: 201,
    handler: () =>
      productService.addProduct({
        name: '演示马克杯',
        subtitle: '答辩演示专用',
        categoryId: 'home',
        price: 39,
        originalPrice: 49,
        stock: 20,
        image: 'https://example.com/cup.jpg',
        description: '用于展示 mock API 与审计日志的商品。',
      }),
  });

  assert.equal(product.name, '演示马克杯');

  const [requestLog] = requestLogs.getRequestLogs();
  assert.equal(requestLog.method, 'POST');
  assert.equal(requestLog.path, '/admin/products');
  assert.equal(requestLog.status, 201);
  assert.equal(requestLog.actorName, '系统管理员');
  assert.equal(requestLog.moduleName, '商品管理');
  assert.equal(typeof requestLog.durationMs, 'number');

  const [auditLog] = auditLogs.getAuditLogs();
  assert.equal(auditLog.action, '新增商品');
  assert.equal(auditLog.target, '演示马克杯');
  assert.equal(auditLog.status, 'success');
  assert.equal(auditLog.actorRole, 'admin');
});

test('mock api records failed operations without swallowing domain errors', () => {
  const { actor, auditLogs, mockApi, productService, requestLogs } = createOperationsGraph();

  assert.throws(
    () =>
      mockApi.request({
        method: 'PATCH',
        path: '/admin/products/missing/status',
        actor,
        moduleName: '商品管理',
        action: '上下架商品',
        target: 'missing',
        handler: () => productService.toggleStatus('missing', 'off'),
      }),
    /商品不存在/,
  );

  const [requestLog] = requestLogs.getRequestLogs();
  assert.equal(requestLog.status, 500);
  assert.equal(requestLog.errorMessage, '商品不存在');

  const [auditLog] = auditLogs.getAuditLogs();
  assert.equal(auditLog.status, 'failed');
  assert.equal(auditLog.detail.includes('商品不存在'), true);
});

test('demo service resets a repeatable walkthrough while preserving admin session', () => {
  const { actor, auditLogs, demoService, productService, requestLogs, storage } = createOperationsGraph();
  storage.write(storage.keys.currentAdmin, actor);
  productService.toggleStatus('p-phone', 'off');

  const result = demoService.resetDemoData(actor);

  assert.equal(productService.getProductById('p-phone').status, 'on');
  assert.equal(storage.read(storage.keys.currentAdmin, null).id, actor.id);
  assert.equal(storage.read(storage.keys.carts, []).some((item) => item.userId === 'u-demo'), true);
  assert.equal(result.steps.length >= 5, true);
  assert.equal(requestLogs.getRequestLogs()[0].path, '/demo/reset');
  assert.equal(auditLogs.getAuditLogs()[0].action, '重置演示数据');
});
