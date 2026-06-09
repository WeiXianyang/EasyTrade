import { Button, Card, Col, List, Row, Space, Tag, Typography } from 'antd';  // 加上 Col, Row
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';
import './MePage.css';

export default function MePage() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useApp();
  const orders = orderService.getOrdersByUser(currentUser.id);

  const avatarLetter = currentUser.name?.charAt(0) || 'U';

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
    </Row>
  );
}
