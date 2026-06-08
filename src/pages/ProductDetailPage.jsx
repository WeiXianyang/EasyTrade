import { App, Button, Col, Descriptions, Empty, Image, InputNumber, Row, Space, Tag, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import PriceText from '../components/shop/PriceText.jsx';
import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import categoryService from '../services/categoryService.js';
import mockApiService from '../services/mockApiService.js';
import productService from '../services/productService.js';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, openCart, refresh } = useApp();
  const [quantity, setQuantity] = useState(1);
  const product = productService.getProductById(productId);

  if (!product) {
    return <Empty description="商品不存在" />;
  }

  const category = categoryService.getCategoryById(product.categoryId);
  const canBuy = product.status === 'on' && product.stock > 0;

  const ensureLogin = () => {
    if (!currentUser) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  };

  const addCart = () => {
    if (!ensureLogin()) return;
    mockApiService.request({
      method: 'POST',
      path: '/cart/items',
      actor: currentUser,
      moduleName: '前台购物车',
      action: '加入购物车',
      target: product.name,
      handler: () => cartService.addItem(currentUser.id, product.id, quantity),
    });
    refresh();
    openCart();
    message.success('已加入购物车');
  };

  const buyNow = () => {
    if (!ensureLogin()) return;
    navigate(`/checkout?buyNow=${product.id}&quantity=${quantity}`);
  };

  return (
    <div className="page-card">
      <Button style={{ marginBottom: 16 }} onClick={() => navigate('/category')}>
        返回分类
      </Button>
      <Row gutter={[28, 28]}>
        <Col xs={24} md={11}>
          <Image className="product-cover" src={product.image} alt={product.name} />
        </Col>
        <Col xs={24} md={13}>
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            <Space wrap>
              {product.tags.map((tag) => (
                <Tag key={tag} color="orange">
                  {tag}
                </Tag>
              ))}
              <Tag color={canBuy ? 'green' : 'default'}>{canBuy ? '在售' : '不可购买'}</Tag>
            </Space>
            <div>
              <Typography.Title level={2}>{product.name}</Typography.Title>
              <Typography.Paragraph className="muted">{product.subtitle}</Typography.Paragraph>
            </div>
            <PriceText price={product.price} originalPrice={product.originalPrice} size="large" />
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="分类">{category?.name || product.categoryId}</Descriptions.Item>
              <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
              <Descriptions.Item label="销量">{product.sold} 件</Descriptions.Item>
              <Descriptions.Item label="说明">{product.description}</Descriptions.Item>
            </Descriptions>
            <Space wrap>
              <InputNumber min={1} max={Math.max(1, product.stock)} value={quantity} onChange={(value) => setQuantity(value || 1)} />
              <Button icon={<ShoppingCartOutlined />} disabled={!canBuy} onClick={addCart}>
                加入购物车
              </Button>
              <Button type="primary" disabled={!canBuy} onClick={buyNow}>
                立即购买
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
