import { App, Button, Card, Col, Empty, Row, Segmented, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';

import ProductCard from '../components/shop/ProductCard.jsx';
import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import categoryService from '../services/categoryService.js';
import productService from '../services/productService.js';

export default function CategoryPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, openCart, refresh } = useApp();
  const categories = categoryService.getCategories();
  const [searchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(() => searchParams.get('cat') || 'all');
  const products = useMemo(
    () =>
      productService.getVisibleProducts({
        categoryId: categoryId === 'all' ? undefined : categoryId,
      }),
    [categoryId],
  );

    const currentCategory = categoryId === 'all' ? null : categories.find((c) => c.id === categoryId);


  const handleAddCart = (product) => {
    if (!currentUser) {
      message.warning('请先登录再加入购物车');
      navigate('/login');
      return;
    }
    cartService.addItem(currentUser.id, product.id, 1);
    refresh();
    openCart();
    message.success('已加入购物车');
  };

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
        <span className="category-info-title">
          {currentCategory ? currentCategory.name : '全部商品'}
        </span>
        <span className="category-info-count">
          共 {products.length} 件
        </span>
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
            <Button onClick={() => navigate('/')}>返回首页</Button>
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
