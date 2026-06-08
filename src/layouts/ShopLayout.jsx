import { Badge, Button, Drawer, Empty, Image, InputNumber, Layout, List, Space, Typography } from 'antd';
import {useEffect, useState} from 'react';
import {
  AppstoreOutlined,
  DashboardOutlined,
  DeleteOutlined,
  HomeOutlined,
  LoginOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import { formatCurrency } from '../utils/format.js';

const navItems = [
  { key: '/', to: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/category', to: '/category', icon: <AppstoreOutlined />, label: '分类' },
  { key: '/me', to: '/me', icon: <UserOutlined />, label: '我的' },
  { key: '/admin/login', to: '/admin/login', icon: <DashboardOutlined />, label: '后台' },
];

function selectedKey(pathname) {
  if (pathname.startsWith('/admin')) return '/admin/login';
  if (pathname.startsWith('/category')) return '/category';
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/pay')) return '';
  if (pathname.startsWith('/me') || pathname.startsWith('/orders')) return '/me';
  return '/';
}

export default function ShopLayout() {
  const location = useLocation();

  const [headerHidden, setHeaderHidden] = useState(false);
  useEffect(()=>{
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if(currentScrollY > 100 && lastScrollY < currentScrollY) {
        setHeaderHidden(true);
      }
      else{
        setHeaderHidden(false);
      }
    };
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
    
  }, []);
  const navigate = useNavigate();
  const { cartCount, cartDrawerOpen, closeCart, currentUser, logoutUser, openCart: openCartDrawer, refresh } = useApp();
  const activeKey = selectedKey(location.pathname);

  const cartItems = currentUser ? cartService.getCart(currentUser.id) : [];
  const cartSummary = currentUser ? cartService.getSelectedSummary(currentUser.id) : { count: 0, total: 0 };

  const updateCart = (action) => {
    action();
    refresh();
  };

  const goCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Layout className="shop-layout">
      <Layout.Header className={`shop-header${headerHidden ? ' hidden' : ''}`}>
        <div className="shop-header-inner">
          <div className="shop-header-main">
            <Link className="brand" to="/">
              <span className="brand-mark">ET</span>
              <span>EasyTrade</span>
            </Link>
            <Space>
              {currentUser ? (
                <>
                  <span className="muted">{currentUser.name}</span>
                  <Button size="small" onClick={logoutUser}>
                    退出
                  </Button>
                </>
              ) : (
                <Button icon={<LoginOutlined />} type="primary" onClick={() => navigate('/login')}>
                  登录
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Layout.Header>
      <Layout.Content className="shop-content">
        <Outlet />
      </Layout.Content>
      <Layout.Footer className="shop-footer">
        EasyTrade React 商城系统 · localStorage 前后台联动 · Ant Design 主题覆写
      </Layout.Footer>
      <nav className="shop-bottom-nav" aria-label="主导航">
        {navItems.map((item) => (
          <Link key={item.key} className={`shop-bottom-nav-item${activeKey === item.key ? ' active' : ''}`} to={item.to}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <Badge count={cartCount} size="small" className="shop-floating-cart-badge">
        <Button
          aria-label="打开购物车"
          className="shop-floating-cart"
          type="primary"
          shape="circle"
          icon={<ShoppingCartOutlined />}
          onClick={openCartDrawer}
        />
      </Badge>
      <Drawer
        title="购物车"
        open={cartDrawerOpen}
        onClose={closeCart}
        width={380}
        footer={
          currentUser && cartItems.length > 0 ? (
            <div className="cart-drawer-footer">
              <div>
                <Typography.Text className="muted">已选 {cartSummary.count} 件</Typography.Text>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {formatCurrency(cartSummary.total)}
                </Typography.Title>
              </div>
              <Space>
                <Button onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}>
                  购物车页
                </Button>
                <Button type="primary" disabled={cartSummary.count === 0} onClick={goCheckout}>
                  去结算
                </Button>
              </Space>
            </div>
          ) : null
        }
      >
        {!currentUser ? (
          <Empty description="登录后查看购物车">
            <Button type="primary" onClick={() => {
              closeCart();
              navigate('/login');
            }}>
              去登录
            </Button>
          </Empty>
        ) : cartItems.length === 0 ? (
          <Empty description="购物车还是空的">
            <Button type="primary" onClick={() => {
              closeCart();
              navigate('/category');
            }}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <List
            className="cart-drawer-list"
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => updateCart(() => cartService.removeItem(currentUser.id, item.productId))}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Image width={56} height={42} src={item.product.image} alt={item.product.name} style={{ objectFit: 'cover', borderRadius: 8 }} />}
                  title={<Typography.Text ellipsis>{item.product.name}</Typography.Text>}
                  description={
                    <Space direction="vertical" size={4}>
                      <Typography.Text className="price">{formatCurrency(item.product.price)}</Typography.Text>
                      <InputNumber
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(value) => updateCart(() => cartService.updateQuantity(currentUser.id, item.productId, value))}
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </Layout>
  );
}
