export function filterAndSortCategoryProducts(products, options = {}) {
  const { sortMode = 'default', onlyDiscount = false, inStockOnly = false } = options;
  const filtered = products.filter((product) => {
    const discountOk = !onlyDiscount || product.originalPrice > product.price;
    const stockOk = !inStockOnly || product.stock > 10;
    return discountOk && stockOk;
  });

  return [...filtered].sort((a, b) => {
    if (sortMode === 'price-asc') return a.price - b.price;
    if (sortMode === 'price-desc') return b.price - a.price;
    if (sortMode === 'sold-desc') return b.sold - a.sold;
    if (sortMode === 'discount-desc') {
      const discountA = a.originalPrice - a.price;
      const discountB = b.originalPrice - b.price;
      return discountB - discountA;
    }
    return 0;
  });
}

export function getCategoryPath(categoryId) {
  if (!categoryId || categoryId === 'all') return '/category';
  return `/category/${categoryId}`;
}

export function getCategoryEmptyState({
  hasBaseProducts,
  isUnknownCategory,
  categoryId,
  currentCategoryName,
}) {
  if (hasBaseProducts) {
    return { description: '当前筛选暂无结果', canClearFilters: true };
  }

  if (isUnknownCategory) {
    return { description: '未找到该分类', canClearFilters: false };
  }

  if (categoryId === 'all') {
    return { description: '暂无在售商品，请稍后再来', canClearFilters: false };
  }

  return {
    description: `「${currentCategoryName}」分类暂无在售商品`,
    canClearFilters: false,
  };
}
