import { App, Button, Empty, Image, InputNumber, Popconfirm, Space, Table, Typography } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PriceText from '../components/shop/PriceText.jsx';
import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import { formatCurrency } from '../utils/format.js';

export default function CartPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser } = useApp();

  const [items, setItems] = useState(() => cartService.getCart(currentUser.id));
  const [summary, setSummary] = useState(() => cartService.getSelectedSummary(currentUser.id));

  const reload = useCallback(() => {
    const newItems = cartService.getCart(currentUser.id);
    setItems(newItems);
    setSummary(cartService.getSelectedSummary(currentUser.id));
    return newItems;
  }, [currentUser.id]);

  const columns = [
    {
      title: '商品',
      dataIndex: 'product',
      render: (product) => (
        <Space>
          <Image width={72} height={54} src={product.image} alt={product.name} style={{ objectFit: 'cover', borderRadius: 8 }} />
          <div>
            <Typography.Text strong>{product.name}</Typography.Text>
            <div className="muted">{product.subtitle}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '单价',
      width: 130,
      render: (_, record) => <PriceText price={record.product.price} originalPrice={record.product.originalPrice} />,
    },
    {
      title: '数量',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={record.quantity}
          onChange={(value) => {
            cartService.updateQuantity(currentUser.id, record.productId, value);
            reload();
          }}
        />
      ),
    },
    {
      title: '小计',
      width: 100,
      render: (_, record) => <Typography.Text strong>{formatCurrency(record.subtotal)}</Typography.Text>,
    },
    {
      title: '操作',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="删除该商品？"
          onConfirm={() => {
            cartService.removeItem(currentUser.id, record.productId);
            reload();
          }}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (items.length === 0) {
    return (
      <Empty description="购物车还是空的">
        <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/category')}>
          继续逛逛
        </Button>
      </Empty>
    );
  }

  const selectedRowKeys = items.filter((item) => item.selected).map((item) => item.productId);

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>购物车</Typography.Title>
          <Typography.Text className="muted">支持数量修改、删除、选择结算，刷新后购物车不丢失。</Typography.Text>
        </div>
        <Button onClick={() => navigate('/category')}>继续购物</Button>
      </div>
      <Table
        rowKey="productId"
        columns={columns}
        dataSource={items}
        pagination={false}
        scroll={{ x: 760 }}
        tableLayout="fixed"
        rowSelection={{
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => {
            items.forEach((item) => {
              cartService.setSelected(currentUser.id, item.productId, newSelectedRowKeys.includes(item.productId));
            });
            reload();
          },
        }}
      />
      <div className="page-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <Space>
          <Button
            onClick={() => {
              cartService.setAllSelected(currentUser.id, true);
              reload();
            }}
          >
            全选
          </Button>
          <Button
            onClick={() => {
              cartService.setAllSelected(currentUser.id, false);
              reload();
            }}
          >
            取消选择
          </Button>
        </Space>
        <Space>
          <Typography.Text>已选 {summary.count} 件</Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {formatCurrency(summary.total)}
          </Typography.Title>
          <Button
            type="primary"
            disabled={summary.count === 0}
            onClick={() => {
              if (summary.count === 0) {
                message.warning('请选择需要结算的商品');
                return;
              }
              navigate('/checkout');
            }}
          >
            去结算
          </Button>
        </Space>
      </div>
    </Space>
  );
}
