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
  assert.match(opsTools, /easytradeApi\.admin\.requestLogs/);
  assert.match(opsTools, /easytradeApi\.admin\.auditLogs/);
  assert.match(opsTools, /easytradeApi\.admin\.resetDemo/);
});

test('admin dashboard highlights the repeatable defense walkthrough', () => {
  const dashboard = readSource('src/pages/admin/AdminDashboardPage.jsx');

  assert.match(dashboard, /答辩演示助手/);
  assert.match(dashboard, /demoService/);
  assert.match(dashboard, /getScenarioSteps/);
  assert.match(dashboard, /最近操作审计/);
});

test('core admin pages route mutations through the real backend api layer', () => {
  const pages = [
    readSource('src/pages/admin/AdminProductsPage.jsx'),
    readSource('src/pages/admin/AdminCategoriesPage.jsx'),
    readSource('src/pages/admin/AdminOrdersPage.jsx'),
    readSource('src/pages/admin/AdminRolesPage.jsx'),
  ].join('\n');

  assert.match(pages, /easytradeApi/);
  assert.match(pages, /catalog\.addProduct|catalog\.updateProduct|catalog\.toggleProductStatus/);
  assert.match(pages, /catalog\.addCategory|catalog\.updateCategory|catalog\.deleteCategory/);
  assert.match(pages, /orders\.ship/);
  assert.match(pages, /admin\.updatePermissions/);
});
