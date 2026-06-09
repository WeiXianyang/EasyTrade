import { Button, Card, Descriptions, Empty, Flex, Space, Steps, Tag, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import PriceText from '../components/shop/PriceText.jsx';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';

const statusStep = {
  'pending-payment': 0,
  paid: 1,
  shipped: 2,
  finished: 3,
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = orderService.getOrderById(orderId);

  if (!order) {
    return (
      <Empty description="订单不存在">
        <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
      </Empty>
    );
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
      <Card>
        <Steps
          current={statusStep[order.status] || 0}
          items={[
            { title: '待支付' },
            { title: '已支付' },
            { title: '已发货' },
            { title: '已完成' },
          ]}
        />
      </Card>
      <Card
        title="订单详情"
        extra={
          order.status === 'pending-payment' ? (
            <Button type="primary" onClick={() => navigate(`/pay/${order.id}`)}>
              去支付
            </Button>
          ) : null
        }
      >
        <Descriptions bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="blue">{formatOrderStatus(order.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{order.createTime}</Descriptions.Item>
          <Descriptions.Item label="支付时间">{order.payTime || '未支付'}</Descriptions.Item>
          <Descriptions.Item label="收货人">{order.address.name}</Descriptions.Item>
          <Descriptions.Item label="手机号">{order.address.phone}</Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {order.address.detail}
          </Descriptions.Item>
          <Descriptions.Item label="订单金额">{formatCurrency(order.totalAmount)}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="商品信息">
        <Flex vertical gap={12}>
          {order.items.map((item) => (
            <Flex key={item.productId} align="center" justify="space-between" gap={12}>
              <Flex align="center" gap={12} flex={1}>
                <img src={item.image} alt={item.name} width={72} height={54} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <Typography.Text strong>{item.name}</Typography.Text>
                  <br />
                  <Typography.Text className="muted">数量 x {item.quantity}</Typography.Text>
                </div>
              </Flex>
              <PriceText price={item.price * item.quantity} />
            </Flex>
          ))}
        </Flex>
      </Card>
      <Card title="物流信息">
        <Typography.Text>承运方：{order.logistics.company}</Typography.Text>
        <div className="muted">物流单号：{order.logistics.trackingNo || '待发货'}</div>
        <Flex vertical gap={4}>
          {order.logistics.traces.map((trace, idx) => (
            <Typography.Text key={idx}>{trace}</Typography.Text>
          ))}
        </Flex>
      </Card>
    </Space>
  );
}
