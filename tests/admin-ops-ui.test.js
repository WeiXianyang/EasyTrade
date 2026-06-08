import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('admin layout exposes request log, audit log, and demo reset tools', () => {
  const adminLayout = readSource('src/layouts/AdminLayout.jsx');
  const opsTools = readSource('src/components/admin/AdminOpsTools.jsx');

  assert.match(adminLayout, /AdminOpsTools/);
  assert.match(opsTools, /请求日志/);
  assert.match(opsTools, /操作审计/);
  assert.match(opsTools, /重置演示/);
  assert.match(opsTools, /requestLogService/);
  assert.match(opsTools, /auditLogService/);
  assert.match(opsTools, /demoService/);
});

test('admin dashboard highlights the repeatable defense walkthrough', () => {
  const dashboard = readSource('src/pages/admin/AdminDashboardPage.jsx');

  assert.match(dashboard, /答辩演示助手/);
  assert.match(dashboard, /demoService/);
  assert.match(dashboard, /getScenarioSteps/);
  assert.match(dashboard, /最近操作审计/);
});

test('core admin pages route mutations through the mock api layer', () => {
  const pages = [
    readSource('src/pages/admin/AdminProductsPage.jsx'),
    readSource('src/pages/admin/AdminCategoriesPage.jsx'),
    readSource('src/pages/admin/AdminOrdersPage.jsx'),
    readSource('src/pages/admin/AdminRolesPage.jsx'),
  ].join('\n');

  assert.match(pages, /mockApiService/);
  assert.match(pages, /\/admin\/products/);
  assert.match(pages, /\/admin\/categories/);
  assert.match(pages, /\/admin\/orders/);
  assert.match(pages, /\/admin\/roles/);
});
