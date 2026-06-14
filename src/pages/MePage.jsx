import { Button, Card, Col, Empty, Image, Row, Space, Tag, Typography } from 'antd';
import { EyeOutlined, HeartOutlined, ShoppingOutlined, TagsOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import easytradeApi from '../api/easytradeApi.js';
import { useApp } from '../contexts/useApp.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';
import './MePage.css';

export default function MePage() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useApp();
  const [orders, setOrders] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [followedCategories, setFollowedCategories] = useState([]);
  const [footprintProducts, setFootprintProducts] = useState([]);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [activityCounts, setActivityCounts] = useState({ favorites: 0, follows: 0, footprints: 0 });

  const loadActivity = useCallback(async () => {
    const [nextOrders, favorites, footprints, followedCategoryIds, products, categories] = await Promise.all([
      easytradeApi.orders.list(),
      easytradeApi.activity.favorites(20),
      easytradeApi.activity.footprints(20),
      easytradeApi.activity.followedCategoryIds(),
      easytradeApi.catalog.products(),
      easytradeApi.catalog.categories(),
    ]);
    const productById = new Map((products || []).map((product) => [product.id, product]));
    const categoryById = new Map((categories || []).map((category) => [category.id, category]));
    const followedSet = new Set(followedCategoryIds || []);

    setOrders(nextOrders || []);
    setFavoriteProducts((favorites || []).slice(0, 3).map((item) => productById.get(item.productId)).filter(Boolean));
    setFootprintProducts((footprints || []).slice(0, 3).map((item) => productById.get(item.productId)).filter(Boolean));
    setFollowedCategories([...followedSet].slice(0, 3).map((categoryId) => categoryById.get(categoryId)).filter(Boolean));
    setSuggestedCategories((categories || []).filter((category) => !followedSet.has(category.id)).slice(0, 3));
    setActivityCounts({
      favorites: (favorites || []).length,
      follows: followedSet.size,
      footprints: (footprints || []).length,
    });
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      easytradeApi.orders.list(),
      easytradeApi.activity.favorites(20),
      easytradeApi.activity.footprints(20),
      easytradeApi.activity.followedCategoryIds(),
      easytradeApi.catalog.products(),
      easytradeApi.catalog.categories(),
    ])
      .then(([nextOrders, favorites, footprints, followedCategoryIds, products, categories]) => {
        if (!active) return;
        const productById = new Map((products || []).map((product) => [product.id, product]));
        const categoryById = new Map((categories || []).map((category) => [category.id, category]));
        const followedSet = new Set(followedCategoryIds || []);

        setOrders(nextOrders || []);
        setFavoriteProducts((favorites || []).slice(0, 3).map((item) => productById.get(item.productId)).filter(Boolean));
        setFootprintProducts((footprints || []).slice(0, 3).map((item) => productById.get(item.productId)).filter(Boolean));
        setFollowedCategories([...followedSet].slice(0, 3).map((categoryId) => categoryById.get(categoryId)).filter(Boolean));
        setSuggestedCategories((categories || []).filter((category) => !followedSet.has(category.id)).slice(0, 3));
        setActivityCounts({
          favorites: (favorites || []).length,
          follows: followedSet.size,
          footprints: (footprints || []).length,
        });
      })
      .catch(() => {
        if (!active) return;
        setOrders([]);
        setFavoriteProducts([]);
        setFootprintProducts([]);
        setFollowedCategories([]);
        setSuggestedCategories([]);
        setActivityCounts({ favorites: 0, follows: 0, footprints: 0 });
      });
    return () => {
      active = false;
    };
  }, [loadActivity]);

  const avatarLetter = currentUser.name?.charAt(0) || 'U';
  const followCategory = async (category) => {
    await easytradeApi.activity.toggleFollow(category.id);
    await loadActivity();
  };

  const renderProductItem = (product) => (
    <article key={product.id} className="activity-list-item">
      <Image width={48} height={36} src={product.image} alt={product.name} preview={false} className="activity-thumb" />
      <div className="activity-list-main">
        <Typography.Text className="activity-list-title">{product.name}</Typography.Text>
        <Typography.Text className="activity-list-description">{formatCurrency(product.price)}</Typography.Text>
      </div>
      <Button type="link" onClick={() => navigate(`/detail/${product.id}`)}>
        查看
      </Button>
    </article>
  );

  const renderActivityEmpty = (text, path = '/category') => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text}>
      <Button size="small" onClick={() => navigate(path)}>
        去逛逛
      </Button>
    </Empty>
  );

  return (
    <Row gutter={[18, 18]} className="me-page">
      {/* 左侧：翻转卡片 */}
      <Col xs={24} lg={7}>
        <div className="flip-card">
          <div className="flip-card-inner">

            {/* 正面：头像 + 姓名 + 角色 */}
            <div className="flip-card-front">
              <div className="flip-card-avatar">
                {avatarLetter}
              </div>
              <p className="flip-card-name">{currentUser.name}</p>
              <p className="flip-card-role">{currentUser.email || currentUser.phone}</p>
              <p className="flip-hint">悬停查看详细信息</p>
            </div>

            {/* 背面：个人信息 + 查看全部订单 */}
            <div className="flip-card-back">
              <p className="flip-card-back-title">个人信息</p>
              <div className="flip-card-info">
                <div className="flip-card-info-row">
                  <span className="flip-card-info-label">用户名</span>
                  <span className="flip-card-info-value">{currentUser.username}</span>
                </div>
                <div className="flip-card-info-row">
                  <span className="flip-card-info-label">角色</span>
                  <span className="flip-card-info-value">前台用户</span>
                </div>
                <div className="flip-card-info-row">
                  <span className="flip-card-info-label">电话</span>
                  <span className="flip-card-info-value">{currentUser.address?.phone || currentUser.phone}</span>
                </div>
                <div className="flip-card-info-row">
                  <span className="flip-card-info-label">地址</span>
                  <span className="flip-card-info-value">{currentUser.address?.detail || '暂无'}</span>
                </div>
              </div>
              <a className="flip-card-orders-link" onClick={() => navigate('/orders')}>
                查看全部订单 →
              </a>
              <Button size="small" danger onClick={logoutUser}>
                退出登录
              </Button>
            </div>

          </div>
        </div>
      </Col>

      {/* 右侧：最近订单 */}
      <Col xs={24} lg={17}>
        <Card
          className="me-orders-card"
          title="最近订单"
          extra={<Button type="link" onClick={() => navigate('/orders')} style={{ color: '#f04f3e' }}>全部</Button>}
        >
          {orders.length > 0 ? (
            <div className="me-order-list">
              {orders.slice(0, 3).map((order) => (
                <article key={order.id} className="me-order-item">
                  <ShoppingOutlined className="me-order-icon" />
                  <div className="me-order-main">
                    <Typography.Text className="me-order-title">{order.orderNo}</Typography.Text>
                    <Typography.Text className="me-order-description">
                      {order.items.map((item) => item.name).join('、')}
                    </Typography.Text>
                  </div>
                  <Space orientation="vertical" align="end" className="me-order-meta">
                    <Tag color="blue">{formatOrderStatus(order.status)}</Tag>
                    <Typography.Text strong>{formatCurrency(order.totalAmount)}</Typography.Text>
                  </Space>
                  <Button type="link" style={{ color: '#f04f3e' }} onClick={() => navigate(`/orders/${order.id}`)}>
                    详情
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无订单" />
          )}
        </Card>
      </Col>

      <Col xs={24}>
        <Row gutter={[16, 16]} className="activity-grid">
          <Col xs={24} md={8}>
            <Card
              className="activity-card"
              title={<Space><HeartOutlined />我的收藏</Space>}
              extra={<span className="activity-count">{activityCounts.favorites}</span>}
            >
              {favoriteProducts.length > 0 ? (
                <div className="activity-list">{favoriteProducts.map(renderProductItem)}</div>
              ) : (
                renderActivityEmpty('暂无收藏')
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="activity-card"
              title={<Space><TagsOutlined />我的关注</Space>}
              extra={<span className="activity-count">{activityCounts.follows}</span>}
            >
              {followedCategories.length > 0 ? (
                <div className="activity-list">
                  {followedCategories.map((category) => (
                    <article key={category.id} className="activity-list-item">
                      <div className="activity-list-main">
                        <Typography.Text className="activity-list-title">{category.name}</Typography.Text>
                        <Typography.Text className="activity-list-description">{category.description}</Typography.Text>
                      </div>
                      <Button type="link" onClick={() => navigate(`/category/${category.id}`)}>
                        进入
                      </Button>
                    </article>
                  ))}
                </div>
              ) : (
                renderActivityEmpty('暂无关注分类')
              )}
              {suggestedCategories.length > 0 && (
                <div className="follow-suggestions">
                  {suggestedCategories.map((category) => (
                    <Button key={category.id} size="small" onClick={() => followCategory(category)}>
                      关注 {category.name}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="activity-card"
              title={<Space><EyeOutlined />浏览足迹</Space>}
              extra={<span className="activity-count">{activityCounts.footprints}</span>}
            >
              {footprintProducts.length > 0 ? (
                <div className="activity-list">{footprintProducts.map(renderProductItem)}</div>
              ) : (
                renderActivityEmpty('暂无浏览足迹')
              )}
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
