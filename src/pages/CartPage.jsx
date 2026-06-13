import { App, Button, Checkbox, Empty, Image, InputNumber, Popconfirm, Space, Table, Typography } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import { formatCurrency } from '../utils/format.js';

function hasQuantityDraft(quantityDrafts, productId) {
  return Object.prototype.hasOwnProperty.call(quantityDrafts, productId);
}

function isCommitableQuantity(quantity) {
  return quantity !== null && quantity !== undefined && quantity !== '';
}

export default function CartPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser } = useApp();

  const [items, setItems] = useState(() => cartService.getCart(currentUser.id));
  const [summary, setSummary] = useState(() => cartService.getSelectedSummary(currentUser.id));
  const [quantityDrafts, setQuantityDrafts] = useState({});

  const reload = useCallback(() => {
    const newItems = cartService.getCart(currentUser.id);
    setItems(newItems);
    setSummary(cartService.getSelectedSummary(currentUser.id));
    return newItems;
  }, [currentUser.id]);

  const resetQuantityDraft = useCallback((productId) => {
    setQuantityDrafts((previous) => {
      if (!hasQuantityDraft(previous, productId)) return previous;
      const next = { ...previous };
      delete next[productId];
      return next;
    });
  }, []);

  const commitQuantity = useCallback((productId, quantity) => {
    if (!isCommitableQuantity(quantity)) return;
    cartService.updateQuantity(currentUser.id, productId, quantity);
    resetQuantityDraft(productId);
    reload();
  }, [currentUser.id, reload, resetQuantityDraft]);

  const updateQuantity = useCallback((productId, quantity) => {
    setQuantityDrafts((previous) => ({ ...previous, [productId]: quantity }));
    commitQuantity(productId, quantity);
  }, [commitQuantity]);

  const getQuantityValue = useCallback((item) => (
    hasQuantityDraft(quantityDrafts, item.productId) ? quantityDrafts[item.productId] : item.quantity
  ), [quantityDrafts]);

  const setItemSelected = useCallback((productId, checked) => {
    cartService.setSelected(currentUser.id, productId, checked);
    reload();
  }, [currentUser.id, reload]);

  const removeItem = useCallback((productId) => {
    resetQuantityDraft(productId);
    cartService.removeItem(currentUser.id, productId);
    reload();
  }, [currentUser.id, reload, resetQuantityDraft]);

  // 用 useMemo 缓存 columns 定义，避免每次渲染重新创建对象数组
  const columns = useMemo(() => [
    {
      title: '商品',
      dataIndex: 'product',
      render: (product) => (
        <Space className="cart-table-product">
          <Image width={72} height={54} src={product.image} alt={product.name} style={{ objectFit: 'cover', borderRadius: 8 }} />
          <div>
            <Typography.Text strong className="cart-table-product-name">{product.name}</Typography.Text>
            <div className="cart-table-product-subtitle">{product.subtitle}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '单价',
      width: 130,
      render: (_, record) => <Typography.Text className="price">{formatCurrency(record.product.price)}</Typography.Text>,
    },
    {
      title: '数量',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={getQuantityValue(record)}
          onChange={(value) => updateQuantity(record.productId, value)}
          onBlur={() => resetQuantityDraft(record.productId)}
        />
      ),
    },
    {
      title: '小计',
      width: 100,
      render: (_, record) => <Typography.Text strong className="cart-table-subtotal">{formatCurrency(record.subtotal)}</Typography.Text>,
    },
    {
      title: '操作',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="删除该商品？"
          onConfirm={() => removeItem(record.productId)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ], [getQuantityValue, removeItem, resetQuantityDraft, updateQuantity]);

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
    <Space className="cart-page" orientation="vertical" size={18} style={{ width: '100%' }}>
      <div className="section-head cart-page-head">
        <div>
          <Typography.Title level={2}>购物车</Typography.Title>
          <Typography.Text className="muted">勾选需要购买的商品，可全选、部分选择或取消全选。</Typography.Text>
        </div>
        <Button onClick={() => navigate('/category')}>继续购物</Button>
      </div>
      <Table
        className="cart-desktop-table"
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
      <div className="cart-mobile-list">
        {items.map((item) => (
          <article key={item.productId} className={`cart-mobile-item${item.selected ? ' selected' : ''}`}>
            <Checkbox
              className="cart-mobile-check"
              aria-label={`选择 ${item.product.name}`}
              checked={item.selected}
              onChange={(event) => setItemSelected(item.productId, event.target.checked)}
            />
            <Image
              width={86}
              height={86}
              src={item.product.image}
              alt={item.product.name}
              preview={false}
              style={{ objectFit: 'cover', borderRadius: 8 }}
            />
            <div className="cart-mobile-info">
              <Typography.Text strong className="cart-mobile-name">{item.product.name}</Typography.Text>
              <Typography.Text className="cart-mobile-subtitle">{item.product.subtitle}</Typography.Text>
              <div className="cart-mobile-meta">
                <Typography.Text className="price">{formatCurrency(item.product.price)}</Typography.Text>
                <Typography.Text className="cart-mobile-subtotal">小计 {formatCurrency(item.subtotal)}</Typography.Text>
              </div>
              <div className="cart-mobile-actions">
                <InputNumber
                  className="cart-mobile-qty"
                  size="small"
                  min={1}
                  max={item.product.stock}
                  value={getQuantityValue(item)}
                  onChange={(value) => updateQuantity(item.productId, value)}
                  onBlur={() => resetQuantityDraft(item.productId)}
                />
                <Popconfirm title="删除该商品？" onConfirm={() => removeItem(item.productId)}>
                  <Button danger size="small" type="text" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="cart-page-footer page-card">
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
            取消全选
          </Button>
        </Space>
        <Space>
          <Typography.Text className="cart-summary-text">已选 {summary.count} 件</Typography.Text>
          <Typography.Title level={4} className="cart-total-price">
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
