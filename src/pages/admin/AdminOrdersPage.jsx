import { App, Button, Card, Descriptions, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import { useCallback, useState } from 'react';

import { useApp } from '../../contexts/useApp.js';
import orderService from '../../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../../utils/format.js';

export default function AdminOrdersPage() {
  const { message } = App.useApp();
  const { currentAdmin } = useApp();
  const [shippingOrder, setShippingOrder] = useState(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [version, setVersion] = useState(0);
  const isAdmin = currentAdmin.role === 'admin';

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // version 变化驱动重渲染，每次渲染重新读取最新数据
  void version;
  const orders = orderService.getAllOrders();

  const shipOrder = () => {
    if (!trackingNo.trim()) {
      message.warning('请输入物流单号');
      return;
    }
    orderService.shipOrder(shippingOrder.id, trackingNo.trim());
    setShippingOrder(null);
    setTrackingNo('');
    reload();
    message.success('订单已发货');
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>订单管理</Typography.Title>
          <Typography.Text className="muted">运营可查看订单，管理员可执行发货操作。</Typography.Text>
        </div>
      </div>
      <Table
        rowKey="id"
        dataSource={orders}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 1080 }}
        tableLayout="fixed"
        expandable={{
          expandedRowRender: (record) => (
            <Card>
              <Descriptions column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label="收货人">{record.address.name}</Descriptions.Item>
                <Descriptions.Item label="手机号">{record.address.phone}</Descriptions.Item>
                <Descriptions.Item label="地址">{record.address.detail}</Descriptions.Item>
                <Descriptions.Item label="商品">
                  {record.items.map((item) => `${item.name} x ${item.quantity}`).join('、')}
                </Descriptions.Item>
                <Descriptions.Item label="物流单号">{record.logistics.trackingNo || '待发货'}</Descriptions.Item>
              </Descriptions>
            </Card>
          ),
        }}
        columns={[
          { title: '订单号', dataIndex: 'orderNo', width: 190, ellipsis: true },
          { title: '用户', dataIndex: 'userId', width: 120, ellipsis: true },
          { title: '创建时间', dataIndex: 'createTime', width: 180, ellipsis: true },
          {
            title: '金额',
            dataIndex: 'totalAmount',
            width: 120,
            render: formatCurrency,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (status) => <Tag color={status === 'paid' ? 'blue' : 'green'}>{formatOrderStatus(status)}</Tag>,
          },
          {
            title: '操作',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
              <Space>
                <Button
                  disabled={!isAdmin || record.status !== 'paid'}
                  onClick={() => {
                    setShippingOrder(record);
                    setTrackingNo(record.logistics.trackingNo);
                  }}
                >
                  发货
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        title="订单发货"
        open={Boolean(shippingOrder)}
        onOk={shipOrder}
        onCancel={() => setShippingOrder(null)}
        okText="确认发货"
        cancelText="取消"
      >
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Text>订单号：{shippingOrder?.orderNo}</Typography.Text>
          <Input value={trackingNo} onChange={(event) => setTrackingNo(event.target.value)} placeholder="请输入物流单号，例如 SF123456" />
        </Space>
      </Modal>
    </Space>
  );
}
