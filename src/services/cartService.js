import productService from './productService.js';
import storageService from './storageService.js';

function normalizeQuantity(quantity) {
  return Math.max(1, Number(quantity || 1));
}

/**
 * Manages per-user carts and enriches persisted rows with live product data.
 *
 * Cart rows store only user/product/quantity state. Price and stock are read
 * from productService at display and checkout time so admin catalog changes are
 * reflected before an order is created.
 */
export function createCartService(storage = storageService, products = productService) {
  function getItems() {
    return storage.read(storage.keys.carts, []);
  }

  function saveItems(items) {
    return storage.write(storage.keys.carts, items);
  }

  function enrich(item) {
    const product = products.getProductById(item.productId);
    return {
      ...item,
      product,
      subtotal: product ? product.price * item.quantity : 0,
    };
  }

  return {
    getCart(userId) {
      return getItems().filter((item) => item.userId === userId).map(enrich);
    },
    addItem(userId, productId, quantity = 1) {
      const product = products.getProductById(productId);
      if (!product || product.status !== 'on' || product.stock < 1) {
        throw new Error('商品不可购买');
      }

      const items = getItems();
      const existing = items.find((item) => item.userId === userId && item.productId === productId);
      if (existing) {
        existing.quantity = Math.min(product.stock, existing.quantity + normalizeQuantity(quantity));
        existing.selected = true;
      } else {
        items.push({
          userId,
          productId,
          quantity: Math.min(product.stock, normalizeQuantity(quantity)),
          selected: true,
          addedAt: new Date().toLocaleString(),
        });
      }
      saveItems(items);
      return this.getCart(userId);
    },
    updateQuantity(userId, productId, quantity) {
      const product = products.getProductById(productId);
      const nextQuantity = Math.min(product?.stock || 1, normalizeQuantity(quantity));
      const items = getItems().map((item) =>
        item.userId === userId && item.productId === productId ? { ...item, quantity: nextQuantity } : item,
      );
      saveItems(items);
      return this.getCart(userId);
    },
    setSelected(userId, productId, selected) {
      const items = getItems().map((item) =>
        item.userId === userId && item.productId === productId ? { ...item, selected } : item,
      );
      saveItems(items);
      return this.getCart(userId);
    },
    setAllSelected(userId, selected) {
      const items = getItems().map((item) => (item.userId === userId ? { ...item, selected } : item));
      saveItems(items);
      return this.getCart(userId);
    },
    removeItem(userId, productId) {
      saveItems(getItems().filter((item) => !(item.userId === userId && item.productId === productId)));
      return this.getCart(userId);
    },
    removeSelected(userId) {
      saveItems(getItems().filter((item) => !(item.userId === userId && item.selected)));
      return this.getCart(userId);
    },
    getSelectedItems(userId) {
      return this.getCart(userId).filter((item) => item.selected && item.product);
    },
    getSelectedSummary(userId) {
      const selectedItems = this.getSelectedItems(userId);
      return {
        count: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
      };
    },
  };
}

const cartService = createCartService();
export default cartService;
