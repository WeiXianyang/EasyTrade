import { App, Button, Card, Col, Flex, Form, Input, Row, Space, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

import PriceText from '../components/shop/PriceText.jsx';
import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import mockApiService from '../services/mockApiService.js';
import orderService from '../services/orderService.js';
import productService from '../services/productService.js';
import { formatCurrency } from '../utils/format.js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { currentUser, refresh } = useApp();
  const buyNowProductId = searchParams.get('buyNow');
  const quantity = Number(searchParams.get('quantity') || 1);

  const checkoutItems = (() => {
    if (buyNowProductId) {
      const product = productService.getProductById(buyNowProductId);
      return product
        ? [
            {
              userId: currentUser.id,
              productId: product.id,
              quantity,
              selected: true,
              product,
              subtotal: product.price * quantity,
            },
          ]
        : [];
    }
    return cartService.getSelectedItems(currentUser.id);
  })();

  const total = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);
  const initialAddress = currentUser.address || {};

  const submitOrder = (values) => {
    try {
      const order = mockApiService.request({
        method: 'POST',
        path: '/orders',
        actor: currentUser,
        moduleName: '前台订单',
        action: '创建订单',
        target: checkoutItems.map((item) => item.product.name).join('、'),
        handler: () => orderService.createOrderFromCart(currentUser.id, checkoutItems, values),
      });
      if (!buyNowProductId) {
        mockApiService.request({
          method: 'DELETE',
          path: '/cart/items/selected',
          actor: currentUser,
          moduleName: '前台购物车',
          action: '清理已结算商品',
          target: '购物车已选商品',
          handler: () => cartService.removeSelected(currentUser.id),
        });
      }
      refresh();
      message.success('订单已创建');
      navigate(`/pay/${order.id}`);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>确认订单</Typography.Title>
          <Typography.Text className="muted">购物车结算和立即购买都进入同一套订单创建流程。</Typography.Text>
        </div>
        <Button onClick={() => navigate(buyNowProductId ? `/detail/${buyNowProductId}` : '/cart')}>
          返回修改
        </Button>
      </div>
      <Row gutter={[18, 18]}>
        <Col xs={24} lg={14}>
          <Card title="收货地址">
            <Form layout="vertical" initialValues={initialAddress} onFinish={submitOrder}>
              <Form.Item name="name" label="收货人" rules={[{ required: true, message: '请输入收货人' }]}>
                <Input placeholder="张三" />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true, pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]}>
                <Input placeholder="13800000000" />
              </Form.Item>
              <Form.Item name="detail" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
                <Input.TextArea rows={3} placeholder="北京市海淀区学院路 1 号" />
              </Form.Item>
              <Button type="primary" htmlType="submit" disabled={checkoutItems.length === 0}>
                提交订单
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="商品清单">
            {checkoutItems.length === 0 ? (
              <Typography.Text className="muted">暂无结算商品</Typography.Text>
            ) : (
              <Flex vertical gap={12}>
                {checkoutItems.map((item) => (
                  <Flex key={item.productId} align="center" justify="space-between" gap={12}>
                    <Flex align="center" gap={12} flex={1}>
                      <img src={item.product.image} alt={item.product.name} width={64} height={48} style={{ objectFit: 'cover', borderRadius: 8 }} />
                      <div>
                        <Typography.Text strong>{item.product.name}</Typography.Text>
                        <br />
                        <Typography.Text className="muted">数量 x {item.quantity}</Typography.Text>
                      </div>
                    </Flex>
                    <PriceText price={item.subtotal} />
                  </Flex>
                ))}
              </Flex>
            )}
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Typography.Text>应付合计</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {formatCurrency(total)}
              </Typography.Title>
            </div>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
