import request, {
  ADMIN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  clearAuthToken,
  storeAuthToken,
} from './request.js';

function getBrowserStorage() {
  return globalThis.localStorage;
}

function writeJson(key, value) {
  getBrowserStorage()?.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  getBrowserStorage()?.removeItem(key);
}

export function cacheSession(session, key = USER_STORAGE_KEY) {
  if (session?.token) {
    storeAuthToken(session.token);
  }
  if (session?.user) {
    writeJson(key, session.user);
  }
  return session;
}

export function clearSession() {
  clearAuthToken();
  removeKey(TOKEN_STORAGE_KEY);
  removeKey(USER_STORAGE_KEY);
  removeKey(ADMIN_STORAGE_KEY);
}

export const easytradeApi = {
  auth: {
    async login(identifier, password) {
      return cacheSession(await request.post('/auth/login', { identifier, password }), USER_STORAGE_KEY);
    },
    async register(values) {
      return cacheSession(await request.post('/auth/register', values), USER_STORAGE_KEY);
    },
    async sendCode(phone) {
      return request.post('/auth/send-code', { phone });
    },
    async codeLogin(phone, code) {
      return cacheSession(await request.post('/auth/code-login', { phone, code }), USER_STORAGE_KEY);
    },
    async adminLogin(identifier, password) {
      return cacheSession(await request.post('/auth/admin/login', { identifier, password }), ADMIN_STORAGE_KEY);
    },
    async me() {
      return request.get('/auth/me');
    },
    logout() {
      clearSession();
    },
  },
  catalog: {
    categories() {
      return request.get('/categories');
    },
    products(filters = {}) {
      return request.get('/products', { params: filters });
    },
    hotProducts(limit = 4) {
      return request.get('/products/hot', { params: { limit } });
    },
    product(productId) {
      return request.get(`/products/${productId}`);
    },
    adminProducts(filters = {}) {
      return request.get('/admin/products', { params: filters });
    },
    addProduct(product) {
      return request.post('/admin/products', product);
    },
    updateProduct(productId, product) {
      return request.put(`/admin/products/${productId}`, product);
    },
    toggleProductStatus(productId, status) {
      return request.patch(`/admin/products/${productId}/status`, { status });
    },
    deleteProduct(productId) {
      return request.delete(`/admin/products/${productId}`);
    },
    addCategory(category) {
      return request.post('/admin/categories', category);
    },
    updateCategory(categoryId, category) {
      return request.put(`/admin/categories/${categoryId}`, category);
    },
    deleteCategory(categoryId) {
      return request.delete(`/admin/categories/${categoryId}`);
    },
  },
  cart: {
    list() {
      return request.get('/cart');
    },
    summary() {
      return request.get('/cart/summary');
    },
    addItem(productId, quantity = 1) {
      return request.post('/cart/items', { productId, quantity });
    },
    updateQuantity(productId, quantity) {
      return request.patch('/cart/items/quantity', { productId, quantity });
    },
    setSelected(productId, selected) {
      return request.patch('/cart/items/selected', { productId, selected });
    },
    setAllSelected(selected) {
      return request.patch('/cart/items/select-all', { selected });
    },
    removeItem(productId) {
      return request.delete('/cart/items', { data: { productId, quantity: 1 } });
    },
    removeSelected() {
      return request.delete('/cart/items/selected');
    },
  },
  orders: {
    list() {
      return request.get('/orders');
    },
    detail(orderId) {
      return request.get(`/orders/${orderId}`);
    },
    create(address) {
      return request.post('/orders', address);
    },
    buyNow(productId, quantity, address) {
      return request.post('/orders/buy-now', { productId, quantity, address });
    },
    pay(orderId) {
      return request.patch(`/orders/${orderId}/pay`);
    },
    finish(orderId) {
      return request.patch(`/orders/${orderId}/finish`);
    },
    adminList() {
      return request.get('/admin/orders');
    },
    ship(orderId, trackingNo) {
      return request.patch(`/admin/orders/${orderId}/ship`, { trackingNo });
    },
  },
  admin: {
    permissions() {
      return request.get('/admin/permissions');
    },
    updatePermissions(role, modules) {
      return request.patch('/admin/permissions', { role, modules });
    },
    resetPermissions() {
      return request.post('/admin/permissions/reset');
    },
    requestLogs(limit = 80) {
      return request.get('/admin/request-logs', { params: { limit } });
    },
    clearRequestLogs() {
      return request.delete('/admin/request-logs');
    },
    auditLogs(limit = 80) {
      return request.get('/admin/audit-logs', { params: { limit } });
    },
    clearAuditLogs() {
      return request.delete('/admin/audit-logs');
    },
    resetDemo() {
      return request.post('/admin/demo/reset');
    },
  },
  activity: {
    favorites(limit = 20) {
      return request.get('/activity/favorites', { params: { limit } });
    },
    footprints(limit = 20) {
      return request.get('/activity/footprints', { params: { limit } });
    },
    followedCategoryIds() {
      return request.get('/activity/followed-category-ids');
    },
    toggleFavorite(productId) {
      return request.post(`/activity/favorites/${productId}/toggle`);
    },
    toggleFollow(categoryId) {
      return request.post(`/activity/follows/${categoryId}/toggle`);
    },
    recordFootprint(productId) {
      return request.post(`/activity/footprints/${productId}`);
    },
  },
};

export default easytradeApi;
