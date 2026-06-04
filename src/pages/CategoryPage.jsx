import { App, Button, Card, Col, Empty, Row, Segmented, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [categoryId, setCategoryId] = useState('all');
  const products = useMemo(
    () =>
      productService.getVisibleProducts({
        categoryId: categoryId === 'all' ? undefined : categoryId,
      }),
    [categoryId],
  );

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
    <Space orientation="vertical" size={24} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>商品分类</Typography.Title>
          <Typography.Text className="muted">按分类浏览所有在售商品，后台下架商品不会出现在前台。</Typography.Text>
        </div>
        <Segmented
          value={categoryId}
          onChange={setCategoryId}
          options={[{ label: '全部', value: 'all' }, ...categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))]}
        />
      </div>

      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col key={category.id} xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => setCategoryId(category.id)}>
              <Typography.Title level={4}>{category.name}</Typography.Title>
              <Typography.Text className="muted">{category.description}</Typography.Text>
              <div style={{ marginTop: 16 }}>
                <Button size="small">查看商品</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {products.length === 0 ? (
        <Empty description="当前分类暂无在售商品" />
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
