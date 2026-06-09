import test from 'node:test';
import assert from 'node:assert/strict';

import { createStorageService } from '../src/services/storageService.js';
import { createProductService } from '../src/services/productService.js';
import { createCartService } from '../src/services/cartService.js';
import { createOrderService } from '../src/services/orderService.js';
import { createAuthService } from '../src/services/authService.js';
import { createCategoryService } from '../src/services/categoryService.js';
import { createPermissionService } from '../src/services/permissionService.js';

/**
 * Minimal localStorage-compatible adapter used to exercise production services
 * in Node without changing their persistence code paths.
 */
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

/**
 * Creates an isolated service graph for each test so localStorage seed data,
 * permissions, carts, and orders cannot leak across assertions.
 */
function createServices() {
  const storage = createStorageService(createMemoryStorage());
  return createServicesWithStorage(storage);
}

function createServicesWithStorage(storage) {
  const productService = createProductService(storage);
  const categoryService = createCategoryService(storage);
  const permissionService = createPermissionService(storage);
  const cartService = createCartService(storage, productService);
  const orderService = createOrderService(storage, productService);
  const authService = createAuthService(storage);
  return { productService, categoryService, permissionService, cartService, orderService, authService };
}

test('product service updates product availability for shop and admin views', () => {
  const { productService } = createServices();

  const visibleBefore = productService.getVisibleProducts();
  assert.ok(visibleBefore.length > 0);

  const firstProduct = visibleBefore[0];
  const updated = productService.updateProduct({
    ...firstProduct,
    status: 'off',
    price: firstProduct.price + 10,
  });

  assert.equal(updated.status, 'off');
  assert.equal(productService.getProductById(firstProduct.id).price, firstProduct.price + 10);
  assert.equal(productService.getVisibleProducts().some((item) => item.id === firstProduct.id), false);
  assert.equal(productService.getAdminProducts().some((item) => item.id === firstProduct.id), true);
});

test('cart service merges quantities, selects items, and calculates totals', () => {
  const { productService, cartService } = createServices();
  const [firstProduct, secondProduct] = productService.getVisibleProducts();

  cartService.addItem('u-demo', firstProduct.id, 1);
  cartService.addItem('u-demo', firstProduct.id, 2);
  cartService.addItem('u-demo', secondProduct.id, 1);
  cartService.setSelected('u-demo', secondProduct.id, false);

  const items = cartService.getCart('u-demo');
  assert.equal(items.find((item) => item.productId === firstProduct.id).quantity, 3);
  assert.equal(items.find((item) => item.productId === secondProduct.id).selected, false);
  assert.equal(cartService.getSelectedSummary('u-demo').total, firstProduct.price * 3);
});

test('cart service supports select all, partial selection, and clear selection', () => {
  const { productService, cartService } = createServices();
  const [firstProduct, secondProduct] = productService.getVisibleProducts();

  cartService.addItem('u-demo', firstProduct.id, 1);
  cartService.addItem('u-demo', secondProduct.id, 2);
  cartService.setAllSelected('u-demo', false);

  assert.equal(cartService.getSelectedSummary('u-demo').count, 0);

  cartService.setSelected('u-demo', secondProduct.id, true);
  assert.equal(cartService.getSelectedSummary('u-demo').count, 2);

  cartService.setAllSelected('u-demo', true);
  assert.equal(cartService.getSelectedSummary('u-demo').count, 3);
});

test('order service creates, pays, and ships an order from cart items', () => {
  const { productService, cartService, orderService } = createServices();
  const [product] = productService.getVisibleProducts();

  cartService.addItem('u-demo', product.id, 2);
  const order = orderService.createOrderFromCart('u-demo', cartService.getSelectedItems('u-demo'), {
    name: '张三',
    phone: '13800000000',
    detail: '北京市海淀区学院路 1 号',
  });

  assert.equal(order.status, 'pending-payment');
  assert.equal(order.totalAmount, product.price * 2);

  const paid = orderService.payOrder(order.id);
  assert.equal(paid.status, 'paid');
  assert.ok(paid.payTime);

  const shipped = orderService.shipOrder(order.id, 'SF123456');
  assert.equal(shipped.status, 'shipped');
  assert.equal(shipped.logistics.trackingNo, 'SF123456');
});

test('auth and permission services enforce frontend and admin roles', () => {
  const { authService, permissionService } = createServices();

  const user = authService.loginUser('buyer@example.com', '123456');
  assert.equal(user.role, 'customer');
  assert.equal(authService.getCurrentUser().id, user.id);

  const admin = authService.loginAdmin('admin', 'admin123');
  assert.equal(admin.role, 'admin');
  assert.equal(permissionService.canAccess(admin.role, 'products'), true);
  assert.equal(permissionService.canAccess('operator', 'products'), false);
  assert.equal(permissionService.canAccess('operator', 'orders'), true);
});

test('auth service accepts password-free admin handoff sessions only for admin roles', () => {
  const storage = createStorageService(createMemoryStorage());
  const { authService } = createServicesWithStorage(storage);
  const adminHandoff = {
    id: 'a-admin',
    username: 'admin',
    role: 'admin',
    name: '系统管理员',
    password: 'should-not-persist',
  };

  assert.equal(typeof authService.setCurrentAdmin, 'function');

  const accepted = authService.setCurrentAdmin(adminHandoff);
  assert.equal(accepted.id, adminHandoff.id);
  assert.equal(accepted.role, 'admin');
  assert.equal('password' in accepted, false);
  assert.deepEqual(storage.read(storage.keys.currentAdmin, null), accepted);
  assert.throws(
    () => authService.setCurrentAdmin({ id: 'u-demo', username: 'buyer', role: 'customer', name: '校园买手' }),
    /无效的后台身份/,
  );
  assert.throws(
    () => authService.setCurrentAdmin({ id: 'forged', username: 'forged', role: 'admin', name: 'Fake' }),
    /无效的后台身份/,
  );
  assert.throws(
    () => authService.setCurrentAdmin({ id: 'a-admin', username: 'operator', role: 'admin', name: 'Fake' }),
    /无效的后台身份/,
  );
  assert.throws(
    () => authService.setCurrentAdmin({ id: 'a-admin', username: 'admin', role: 'operator', name: 'Fake' }),
    /无效的后台身份/,
  );
});

test('auth service reuses valid cached sessions and clears stale cached users', () => {
  const storage = createStorageService(createMemoryStorage());
  const { authService } = createServicesWithStorage(storage);

  const user = authService.loginUser('buyer@example.com', '123456');
  const admin = authService.loginAdmin('admin', 'admin123');
  const reloaded = createServicesWithStorage(storage);

  assert.equal(reloaded.authService.getCurrentUser().id, user.id);
  assert.equal(reloaded.authService.getCurrentAdmin().id, admin.id);

  storage.write(
    storage.keys.users,
    storage.read(storage.keys.users, []).filter((item) => item.id !== user.id),
  );

  assert.equal(reloaded.authService.getCurrentUser(), null);
  assert.equal(storage.read(storage.keys.currentUser, null), null);
});

test('category service creates, updates, and protects categories with products', () => {
  const { categoryService, productService } = createServices();

  const category = categoryService.addCategory({
    name: '校园文具',
    description: '笔记本、书写工具',
  });

  assert.equal(category.name, '校园文具');
  assert.equal(category.id.startsWith('c-'), true);

  const updated = categoryService.updateCategory({
    ...category,
    name: '精选文具',
  });

  assert.equal(updated.name, '精选文具');
  assert.equal(categoryService.getCategoryById(category.id).name, '精选文具');

  productService.addProduct({
    name: '软面笔记本',
    subtitle: '课堂记录',
    categoryId: category.id,
    price: 12,
    originalPrice: 16,
    stock: 20,
    image: 'https://example.com/notebook.jpg',
    description: '适合课堂和实验记录。',
  });

  assert.throws(() => categoryService.deleteCategory(category.id, productService.getAdminProducts()), /分类下仍有关联商品/);
});

test('permission service persists editable role permissions with admin safeguards', () => {
  const { permissionService } = createServices();

  const updated = permissionService.updateRolePermissions('operator', ['dashboard', 'products']);
  assert.deepEqual(updated.operator, ['dashboard', 'products']);
  assert.equal(permissionService.canAccess('operator', 'products'), true);
  assert.equal(permissionService.canAccess('operator', 'orders'), false);

  const safeguarded = permissionService.updateRolePermissions('admin', ['products']);
  assert.equal(safeguarded.admin.includes('dashboard'), true);
  assert.equal(safeguarded.admin.includes('roles'), true);
  assert.equal(permissionService.canAccess('admin', 'roles'), true);
});
