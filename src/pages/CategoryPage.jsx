import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Empty, Row, Select, Space } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductCard from '../components/shop/ProductCard.jsx';
import { useAddToCart } from '../hooks/useAddToCart.js';
import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';

export default function CategoryPage() {
  const navigate = useNavigate();
  const handleAddCart = useAddToCart();
  const categories = categoryService.getCategories();
  const [searchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(() => searchParams.get('cat') || 'all');
  const [sortMode, setSortMode] = useState('default');
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const products = useMemo(() => {
    const baseProducts = productService.getVisibleProducts({
      categoryId: categoryId === 'all' ? undefined : categoryId,
    });

    const filtered = baseProducts.filter((product) => {
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
  }, [categoryId, inStockOnly, onlyDiscount, sortMode]);

  const currentCategory = categoryId === 'all' ? null : categories.find((c) => c.id === categoryId);

  return (
    <Space orientation='vertical' size={24} style={{ width: '100%' }}>
      {/* 横向滑动分类标签栏 */}
      <div className = 'category-tabs-wrap'>
        <div className = 'category-tabs'>
          <div
            className={`category-tab${categoryId === 'all' ? ' active' : ''}`}
            onClick={() => setCategoryId('all')}
          >
            所有商品
          </div>
          {categories.map((cat)=>(
            <div
              key={cat.id}
              className={`category-tab${categoryId === cat.id ? ' active' : ''}`}
              onClick={() => setCategoryId((prev) => (prev === cat.id ? 'all' : cat.id))}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      {/* 当前分类信息 */}
      <div className="category-info">
        <Space>
          <span className="category-info-title">
            {currentCategory ? currentCategory.name : '全部商品'}
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
            onChange={setSortMode}
            style={{ width: 120 }}
            options={[
              { label: '默认排序', value: 'default' },
              { label: '价格升序', value: 'price-asc' },
              { label: '价格降序', value: 'price-desc' },
              { label: '销量优先', value: 'sold-desc' },
              { label: '折扣优先', value: 'discount-desc' },
            ]}
          />
          <Checkbox checked={onlyDiscount} onChange={(event) => setOnlyDiscount(event.target.checked)}>
            仅优惠
          </Checkbox>
          <Checkbox checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)}>
            库存充足
          </Checkbox>
        </Space>
      </div>
      
      {/* 商品列表 / 空状态 */}
      {products.length === 0 ? (
        <div className="category-empty">
          <Empty
            description={
              categoryId === 'all'
                ? '暂无在售商品，请稍后再来'
                : `「${currentCategory?.name}」分类暂无在售商品`
            }
          >
            <Space>
              <Button onClick={() => navigate('/')}>返回首页</Button>
              <Button
                onClick={() => {
                  setSortMode('default');
                  setOnlyDiscount(false);
                  setInStockOnly(false);
                }}
              >
                清除筛选
              </Button>
            </Space>
          </Empty>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col key={product.id} xs={24} sm={12} lg={6}>
              <ProductCard product={product} onAddCart={handleAddCart} />
            </Col>
          ))}
        </Row>
      )}

    </Space>
  );
}
