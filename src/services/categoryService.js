import storageService from './storageService.js';

function createId() {
  return `c-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeCategory(category) {
  return {
    ...category,
    id: category.id || createId(),
    name: String(category.name || '').trim(),
    description: String(category.description || '').trim(),
  };
}

/**
 * Manages the category index shared by the shop and admin product forms.
 *
 * Category deletion accepts the current product list as a guard input. That
 * makes the "no dangling product category" rule explicit and keeps this service
 * independent from productService, which is useful for tests and avoids circular
 * imports.
 */
export function createCategoryService(storage = storageService) {
  function getCategories() {
    return storage.read(storage.keys.categories, []);
  }

  function saveCategories(categories) {
    return storage.write(storage.keys.categories, categories.map(normalizeCategory));
  }

  return {
    getCategories() {
      return getCategories();
    },
    getCategoryById(categoryId) {
      return this.getCategories().find((category) => category.id === categoryId);
    },
    addCategory(category) {
      const nextCategory = normalizeCategory(category);
      if (!nextCategory.name) {
        throw new Error('分类名称不能为空');
      }
      if (getCategories().some((item) => item.name === nextCategory.name)) {
        throw new Error('分类名称已存在');
      }
      saveCategories([...getCategories(), nextCategory]);
      return nextCategory;
    },
    updateCategory(category) {
      const nextCategory = normalizeCategory(category);
      if (!nextCategory.name) {
        throw new Error('分类名称不能为空');
      }
      const categories = getCategories();
      if (!categories.some((item) => item.id === nextCategory.id)) {
        throw new Error('分类不存在');
      }
      if (categories.some((item) => item.id !== nextCategory.id && item.name === nextCategory.name)) {
        throw new Error('分类名称已存在');
      }
      const nextCategories = categories.map((item) => (item.id === nextCategory.id ? nextCategory : item));
      saveCategories(nextCategories);
      return nextCategory;
    },
    deleteCategory(categoryId, products = []) {
      if (products.some((product) => product.categoryId === categoryId)) {
        throw new Error('分类下仍有关联商品，不能删除');
      }
      const categories = getCategories();
      if (!categories.some((item) => item.id === categoryId)) {
        throw new Error('分类不存在');
      }
      saveCategories(categories.filter((category) => category.id !== categoryId));
    },
  };
}

const categoryService = createCategoryService();
export default categoryService;
