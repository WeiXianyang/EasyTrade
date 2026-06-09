import { Button, Card, Col, Empty, Image, List, Row, Space, Tag, Typography } from 'antd';  // 加上 Col, Row
import { EyeOutlined, HeartOutlined, ShoppingOutlined, TagsOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import categoryService from '../services/categoryService.js';
import orderService from '../services/orderService.js';
import productService from '../services/productService.js';
import userActivityService from '../services/userActivityService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';
import './MePage.css';

export default function MePage() {
  const navigate = useNavigate();
  const { currentUser, logoutUser, refresh } = useApp();
  const orders = orderService.getOrdersByUser(currentUser.id);
  const favoriteProducts = userActivityService
    .getFavorites(currentUser.id, 3)
    .map((item) => productService.getProductById(item.productId))
    .filter(Boolean);
  const followedCategories = userActivityService
    .getCategoryFollows(currentUser.id, 3)
    .map((item) => categoryService.getCategoryById(item.categoryId))
    .filter(Boolean);
  const footprintProducts = userActivityService
    .getFootprints(currentUser.id, 3)
    .map((item) => productService.getProductById(item.productId))
    .filter(Boolean);
  const followedCategoryIds = new Set(userActivityService.getFollowedCategoryIds(currentUser.id));
  const suggestedCategories = categoryService
    .getCategories()
    .filter((category) => !followedCategoryIds.has(category.id))
    .slice(0, 3);

  const avatarLetter = currentUser.name?.charAt(0) || 'U';
  const followCategory = (category) => {
    userActivityService.toggleCategoryFollow(currentUser.id, category.id);
    refresh();
  };

  const renderProductItem = (product) => (
    <List.Item
      className="activity-list-item"
      actions={[
        <Button key="detail" type="link" onClick={() => navigate(`/detail/${product.id}`)}>
          查看
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={<Image width={48} height={36} src={product.image} alt={product.name} preview={false} className="activity-thumb" />}
        title={product.name}
        description={formatCurrency(product.price)}
      />
    </List.Item>
  );

  const renderActivityEmpty = (text, path = '/category') => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text}>
      <Button size="small" onClick={() => navigate(path)}>
        去逛逛
      </Button>
    </Empty>
  );

  return (
    <Row gutter={[18, 18]}>
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
          <List
            dataSource={orders.slice(0, 3)}
            locale={{ emptyText: '暂无订单' }}
            renderItem={(order) => (
              <List.Item
                actions={[
                  <Button key="detail" type="link" style={{ color: '#f04f3e' }} onClick={() => navigate(`/orders/${order.id}`)}>
                    详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<ShoppingOutlined style={{ fontSize: 24, color: '#f04f3e' }} />}
                  title={order.orderNo}
                  description={order.items.map((item) => item.name).join('、')}
                />
                <Space orientation="vertical" align="end">
                  <Tag color="blue">{formatOrderStatus(order.status)}</Tag>
                  <Typography.Text strong>{formatCurrency(order.totalAmount)}</Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col xs={24}>
        <Row gutter={[16, 16]} className="activity-grid">
          <Col xs={24} md={8}>
            <Card
              className="activity-card"
              title={<Space><HeartOutlined />我的收藏</Space>}
              extra={<span className="activity-count">{userActivityService.getFavorites(currentUser.id).length}</span>}
            >
              {favoriteProducts.length > 0 ? (
                <List dataSource={favoriteProducts} renderItem={renderProductItem} />
              ) : (
                renderActivityEmpty('暂无收藏')
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              className="activity-card"
              title={<Space><TagsOutlined />我的关注</Space>}
              extra={<span className="activity-count">{userActivityService.getCategoryFollows(currentUser.id).length}</span>}
            >
              {followedCategories.length > 0 ? (
                <List
                  dataSource={followedCategories}
                  renderItem={(category) => (
                    <List.Item
                      className="activity-list-item"
                      actions={[
                        <Button key="category" type="link" onClick={() => navigate(`/category/${category.id}`)}>
                          进入
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta title={category.name} description={category.description} />
                    </List.Item>
                  )}
                />
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
              extra={<span className="activity-count">{userActivityService.getFootprints(currentUser.id).length}</span>}
            >
              {footprintProducts.length > 0 ? (
                <List dataSource={footprintProducts} renderItem={renderProductItem} />
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
