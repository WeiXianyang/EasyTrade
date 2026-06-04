import { Button, Empty, Space, Table, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import orderService from '../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../utils/format.js';

const statusColor = {
  'pending-payment': 'orange',
  paid: 'blue',
  shipped: 'green',
  finished: 'default',
  cancelled: 'default',
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const orders = orderService.getOrdersByUser(currentUser.id);

  if (orders.length === 0) {
    return (
      <Empty description="暂无订单">
        <Button type="primary" onClick={() => navigate('/category')}>
          去下单
        </Button>
      </Empty>
    );
  }

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>我的订单</Typography.Title>
          <Typography.Text className="muted">订单状态与后台订单管理共享同一份数据。</Typography.Text>
        </div>
        <Button onClick={() => navigate('/me')}>返回我的</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={orders}
        pagination={{ pageSize: 6 }}
        scroll={{ x: 760 }}
        tableLayout="fixed"
        columns={[
          { title: '订单号', dataIndex: 'orderNo', width: 190, ellipsis: true },
          { title: '创建时间', dataIndex: 'createTime', width: 180, ellipsis: true },
          {
            title: '商品',
            width: 220,
            ellipsis: true,
            render: (_, record) => record.items.map((item) => item.name).join('、'),
          },
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
            render: (status) => <Tag color={statusColor[status]}>{formatOrderStatus(status)}</Tag>,
          },
          {
            title: '操作',
            width: 120,
            render: (_, record) => (
              <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
                查看详情
              </Button>
            ),
          },
        ]}
      />
    </Space>
  );
}
