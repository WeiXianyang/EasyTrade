import { App, Button, Col, Descriptions, Empty, Image, InputNumber, Row, Space, Tag, Typography } from 'antd';
import { HeartFilled, HeartOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import easytradeApi from '../api/easytradeApi.js';
import PriceText from '../components/shop/PriceText.jsx';
import { useApp } from '../contexts/useApp.js';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, openCart, refresh } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const productExists = Boolean(product);
  const canBuy = product ? product.status === 'on' && product.stock > 0 : false;

  useEffect(() => {
    let active = true;
    Promise.all([
      easytradeApi.catalog.product(productId),
      easytradeApi.catalog.categories(),
    ])
      .then(([nextProduct, categories]) => {
        if (!active) return;
        setProduct(nextProduct);
        setCategory(categories?.find((item) => item.id === nextProduct?.categoryId) || null);
      })
      .catch(() => {
        if (!active) return;
        setProduct(null);
        setCategory(null);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!currentUser || !productId || !productExists) return;
    void easytradeApi.activity.recordFootprint(productId);
  }, [currentUser, productId, productExists]);

  useEffect(() => {
    if (!currentUser || !productId || !productExists) return;
    easytradeApi.activity.favorites()
      .then((items) => setIsFavorite(items.some((item) => item.product?.id === productId || item.productId === productId)))
      .catch(() => setIsFavorite(false));
  }, [currentUser, productId, productExists]);

  const ensureLogin = useCallback(() => {
    if (!currentUser) {
      message.warning('请先登录');
      navigate('/login');
      return false;
    }
    return true;
  }, [currentUser, message, navigate]);

  const addCart = useCallback(async () => {
    if (!product) return;
    if (!ensureLogin()) return;
    try {
      await easytradeApi.cart.addItem(product.id, quantity);
      await refresh();
      openCart();
      message.success('已加入购物车');
    } catch (error) {
      message.error(error.message);
    }
  }, [ensureLogin, product, quantity, refresh, openCart, message]);

  const buyNow = useCallback(() => {
    if (!product) return;
    if (!ensureLogin()) return;
    navigate(`/checkout?buyNow=${product.id}&quantity=${quantity}`);
  }, [ensureLogin, navigate, product, quantity]);

  const toggleFavorite = useCallback(async () => {
    if (!product) return;
    if (!ensureLogin()) return;
    try {
      const result = await easytradeApi.activity.toggleFavorite(productId);
      setIsFavorite(result.active);
      message.success(result.active ? '已加入收藏' : '已取消收藏');
    } catch (error) {
      message.error(error.message);
    }
  }, [ensureLogin, message, product, productId]);

  if (!product) {
    return <Empty description="商品不存在" />;
  }

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
              <Button icon={isFavorite ? <HeartFilled /> : <HeartOutlined />} onClick={toggleFavorite}>
                {isFavorite ? '已收藏' : '收藏'}
              </Button>
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
