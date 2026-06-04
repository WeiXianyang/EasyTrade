import { Avatar, Button, Card, Col, Descriptions, List, Row, Space, Tag, Typography } from 'antd';
import { ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';

export default function MePage() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useApp();
  const orders = orderService.getOrdersByUser(currentUser.id);

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card>
        <Space align="center" size={18}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {currentUser.name}
            </Typography.Title>
            <Typography.Text className="muted">{currentUser.email || currentUser.phone}</Typography.Text>
          </div>
        </Space>
      </Card>
      <Row gutter={[18, 18]}>
        <Col xs={24} lg={12}>
          <Card title="个人信息">
            <Descriptions column={1}>
              <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
              <Descriptions.Item label="角色">前台用户</Descriptions.Item>
              <Descriptions.Item label="默认电话">{currentUser.address?.phone || currentUser.phone}</Descriptions.Item>
              <Descriptions.Item label="默认地址">{currentUser.address?.detail || '暂无'}</Descriptions.Item>
            </Descriptions>
            <Space>
              <Button onClick={() => navigate('/orders')}>查看全部订单</Button>
              <Button danger onClick={logoutUser}>
                退出登录
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近订单" extra={<Button type="link" onClick={() => navigate('/orders')}>全部</Button>}>
            <List
              dataSource={orders.slice(0, 3)}
              locale={{ emptyText: '暂无订单' }}
              renderItem={(order) => (
                <List.Item actions={[<Button key="detail" type="link" onClick={() => navigate(`/orders/${order.id}`)}>详情</Button>]}>
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
    </Space>
  );
}
