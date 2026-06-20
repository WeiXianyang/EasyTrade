import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Pagination, Select, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import easytradeApi from '../api/easytradeApi.js';
import ProductCard from '../components/shop/ProductCard.jsx';
import { useAddToCart } from '../hooks/useAddToCart.js';
import {
  filterAndSortCategoryProducts,
  getCategoryEmptyState,
  getCategoryPath,
} from './categoryPageUtils.js';

const categoryPageSize = 4;

export default function CategoryPage() {
  const navigate = useNavigate();
  const handleAddCart = useAddToCart();
  const [categories, setCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const params = useParams();
  const [searchParams] = useSearchParams();
  const routeCategoryId = params.categoryId || searchParams.get('cat') || 'all';
  const isUnknownCategory =
    routeCategoryId !== 'all' && !categories.some((category) => category.id === routeCategoryId);
  const categoryId = routeCategoryId;
  const [sortMode, setSortMode] = useState('default');
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [paginationState, setPaginationState] = useState({ key: '', page: 1 });
  useEffect(() => {
    let active = true;
    easytradeApi.catalog.categories()
      .then((items) => {
        if (active) setCategories(items || []);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (isUnknownCategory) {
      queueMicrotask(() => {
        if (active) setBaseProducts([]);
      });
      return () => {
        active = false;
      };
    }

    easytradeApi.catalog.products({
      categoryId: categoryId === 'all' ? undefined : categoryId,
    })
      .then((items) => {
        if (active) setBaseProducts(items || []);
      })
      .catch(() => {
        if (active) setBaseProducts([]);
      });
    return () => {
      active = false;
    };
  }, [categoryId, isUnknownCategory]);
  const products = useMemo(
    () => filterAndSortCategoryProducts(baseProducts, { sortMode, onlyDiscount, inStockOnly }),
    [baseProducts, inStockOnly, onlyDiscount, sortMode],
  );
  const paginationKey = `${categoryId}:${sortMode}:${onlyDiscount}:${inStockOnly}`;
  const currentPage = paginationState.key === paginationKey ? paginationState.page : 1;
  const effectivePage = Math.min(currentPage, Math.max(1, Math.ceil(products.length / categoryPageSize)));
  const paginatedProducts = useMemo(() => {
    const startIndex = (effectivePage - 1) * categoryPageSize;
    return products.slice(startIndex, startIndex + categoryPageSize);
  }, [effectivePage, products]);
  const setCurrentPage = (page) => {
    setPaginationState({ key: paginationKey, page });
  };

  const currentCategory = categoryId === 'all' ? null : categories.find((c) => c.id === categoryId);
  const categoryTitle = isUnknownCategory ? '未知分类' : currentCategory ? currentCategory.name : '全部商品';
  const { description: emptyDescription, canClearFilters } = getCategoryEmptyState({
    hasBaseProducts: baseProducts.length > 0,
    isUnknownCategory,
    categoryId,
    currentCategoryName: currentCategory?.name,
  });

  return (
    <Space orientation='vertical' size={24} style={{ width: '100%' }}>
      {/* 横向滑动分类标签栏 */}
      <div className = 'category-tabs-wrap'>
        <div className = 'category-tabs'>
          <button
            type="button"
            className={`category-tab${categoryId === 'all' ? ' active' : ''}`}
            onClick={() => {
              setCurrentPage(1);
              navigate(getCategoryPath('all'));
            }}
          >
            所有商品
          </button>
          {categories.map((cat)=>(
            <button
              type="button"
              key={cat.id}
              className={`category-tab${categoryId === cat.id ? ' active' : ''}`}
              onClick={() => {
                setCurrentPage(1);
                navigate(getCategoryPath(cat.id));
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 当前分类信息 */}
      <div className="category-info">
        <Space>
          <span className="category-info-title">
            {categoryTitle}
          </span>
          <span className="category-info-count">
            共 {products.length} 件
          </span>
        </Space>
        <Space wrap className="category-filter-tools">
          <FilterOutlined />
          <Select
            size="small"
            value={sortMode}
            onChange={(nextSortMode) => {
              setCurrentPage(1);
              setSortMode(nextSortMode);
            }}
            style={{ width: 120 }}
            options={[
              { label: '默认排序', value: 'default' },
              { label: '价格升序', value: 'price-asc' },
              { label: '价格降序', value: 'price-desc' },
              { label: '销量优先', value: 'sold-desc' },
              { label: '折扣优先', value: 'discount-desc' },
            ]}
          />
          <Checkbox checked={onlyDiscount} onChange={(event) => {
            setCurrentPage(1);
            setOnlyDiscount(event.target.checked);
          }}>
            仅优惠
          </Checkbox>
          <Checkbox checked={inStockOnly} onChange={(event) => {
            setCurrentPage(1);
            setInStockOnly(event.target.checked);
          }}>
            库存充足
          </Checkbox>
        </Space>
      </div>
      
      {/* 商品列表 / 空状态 */}
      {products.length === 0 ? (
        <div className="category-empty">
          <Empty description={emptyDescription}>
            <Space>
              <Button onClick={() => navigate('/')}>返回首页</Button>
              {canClearFilters && (
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    setSortMode('default');
                    setOnlyDiscount(false);
                    setInStockOnly(false);
                  }}
                >
                  清除筛选
                </Button>
              )}
            </Space>
          </Empty>
        </div>
      ) : (
        <>
          <div className="category-product-grid">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="category-product-item">
                <ProductCard product={product} onAddCart={handleAddCart} />
              </div>
            ))}
          </div>
          {products.length > categoryPageSize && (
            <div className="category-pagination">
              <Pagination
                current={effectivePage}
                pageSize={categoryPageSize}
                total={products.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                responsive
              />
            </div>
          )}
        </>
      )}

    </Space>
  );
}
