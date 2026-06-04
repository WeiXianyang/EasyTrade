import storageService from './storageService.js';

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    originalPrice: Number(product.originalPrice || product.price),
    stock: Number(product.stock || 0),
    sold: Number(product.sold || 0),
    status: product.status || 'on',
    tags: Array.isArray(product.tags) ? product.tags : [],
  };
}

/**
 * Stores catalog data used by both the storefront and the admin console.
 *
 * The public storefront intentionally reads through `getVisibleProducts`, while
 * admin pages use `getAdminProducts` to include off-shelf and out-of-stock
 * items. Keeping that split here prevents UI pages from duplicating visibility
 * rules.
 */
export function createProductService(storage = storageService) {
  function getProducts() {
    return storage.read(storage.keys.products, []);
  }

  function saveProducts(products) {
    return storage.write(storage.keys.products, products.map(normalizeProduct));
  }

  return {
    getAdminProducts() {
      return getProducts();
    },
    getVisibleProducts(filters = {}) {
      const keyword = (filters.keyword || '').trim().toLowerCase();
      return getProducts().filter((product) => {
        const matchesStatus = product.status === 'on' && product.stock > 0;
        const matchesCategory = !filters.categoryId || product.categoryId === filters.categoryId;
        const matchesKeyword =
          !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          (product.subtitle || '').toLowerCase().includes(keyword);
        return matchesStatus && matchesCategory && matchesKeyword;
      });
    },
    getHotProducts(limit = 4) {
      return this.getVisibleProducts()
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);
    },
    getProductById(productId) {
      return getProducts().find((product) => product.id === productId);
    },
    addProduct(product) {
      const products = getProducts();
      const nextProduct = normalizeProduct({
        id: product.id || createId('p'),
        sold: 0,
        status: 'on',
        tags: [],
        ...product,
      });
      saveProducts([nextProduct, ...products]);
      return nextProduct;
    },
    updateProduct(product) {
      const products = getProducts();
      const nextProduct = normalizeProduct(product);
      const nextProducts = products.map((item) => (item.id === nextProduct.id ? nextProduct : item));
      saveProducts(nextProducts);
      return nextProduct;
    },
    deleteProduct(productId) {
      saveProducts(getProducts().filter((product) => product.id !== productId));
    },
    toggleStatus(productId, status) {
      const product = this.getProductById(productId);
      if (!product) {
        throw new Error('商品不存在');
      }
      return this.updateProduct({ ...product, status });
    },
  };
}

const productService = createProductService();
export default productService;
