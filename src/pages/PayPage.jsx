import { App, Button, Card, Progress, Result, Space, Steps, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import mockApiService from '../services/mockApiService.js';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';

export default function PayPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, refresh } = useApp();
  const [seconds, setSeconds] = useState(60);
  const [paid, setPaid] = useState(false);
  const order = orderService.getOrderById(orderId);

  useEffect(() => {
    if (!order || order.status !== 'pending-payment') {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [order]);

  if (!order) {
    return (
      <Result
        status="404"
        title="订单不存在"
        extra={<Button onClick={() => navigate('/orders')}>返回订单列表</Button>}
      />
    );
  }

  const handlePay = () => {
    try {
      mockApiService.request({
        method: 'PATCH',
        path: `/orders/${order.id}/pay`,
        actor: currentUser,
        moduleName: '前台支付',
        action: '模拟支付',
        target: order.orderNo,
        handler: () => orderService.payOrder(order.id),
      });
      setPaid(true);
      refresh();
      message.success('支付成功');
    } catch (error) {
      message.error(error.message);
    }
  };

  if (paid || order.status !== 'pending-payment') {
    return (
      <Result
        status="success"
        title="支付成功"
        subTitle={`订单 ${order.orderNo} 当前状态：${formatOrderStatus(orderService.getOrderById(order.id).status)}`}
        extra={[
          <Button type="primary" key="detail" onClick={() => navigate(`/orders/${order.id}`)}>
            查看订单详情
          </Button>,
          <Button key="home" onClick={() => navigate('/')}>
            回到首页
          </Button>,
        ]}
      />
    );
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card>
        <Steps
          current={1}
          items={[
            { title: '提交订单' },
            { title: '模拟支付' },
            { title: '支付完成' },
          ]}
        />
      </Card>
      <Card>
        <Space orientation="vertical" size={18} style={{ width: '100%' }}>
          <Button onClick={() => navigate('/orders')}>返回订单列表</Button>
          <Typography.Title level={2}>模拟支付</Typography.Title>
          <Typography.Text className="muted">订单号：{order.orderNo}</Typography.Text>
          <Typography.Title level={3}>{formatCurrency(order.totalAmount)}</Typography.Title>
          <Progress percent={Math.round((seconds / 60) * 100)} status={seconds === 0 ? 'exception' : 'active'} />
          <Typography.Text>{seconds === 0 ? '支付倒计时结束，可重新发起模拟支付。' : `请在 ${seconds} 秒内完成支付`}</Typography.Text>
          <Button type="primary" size="large" onClick={handlePay}>
            模拟支付成功
          </Button>
        </Space>
      </Card>
    </Space>
  );
}
